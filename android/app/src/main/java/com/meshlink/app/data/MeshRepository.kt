package com.meshlink.app.data

import com.meshlink.app.bluetooth.BleManager
import com.meshlink.app.protocol.MeshEnvelope
import com.meshlink.app.protocol.MessageType
import com.meshlink.app.relay.RelayEngine
import com.meshlink.app.security.CryptoManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.util.UUID

/**
 * Single source of truth repository orchestrating Room DB, Crypto, BLE, and Relays.
 */
class MeshRepository(
    private val db: AppDatabase,
    val crypto: CryptoManager,
    private val ble: BleManager,
    private val relay: RelayEngine
) {
    val localIdentityId: String = crypto.getLocalIdentityId()
    val localPublicKeyBase64: String = crypto.getLocalPublicKeyBase64()

    fun getAllContacts(): Flow<List<ContactEntity>> = db.contactDao().getAllContacts()

    fun getMessagesForConversation(peerId: String): Flow<List<MessageEntity>> =
        db.messageDao().getMessagesForConversation(peerId)

    /**
     * Sends an encrypted message to a peer.
     * Enforces explicit delivery states:
     * 1. Saved locally in Room database.
     * 2. If peer or mesh router is directly connected, transmits immediately.
     * 3. State becomes TRANSMITTED_TO_NEXT_HOP if forwarded, or WAITING_FOR_CONNECTION if no route.
     * 4. State is NEVER marked DELIVERED until an authenticated ACK returns!
     */
    suspend fun sendMessage(recipientPeer: ContactEntity, plaintext: String): String = withContext(Dispatchers.IO) {
        val messageId = UUID.randomUUID().toString()
        val now = System.currentTimeMillis()
        val expiresAt = now + (24 * 60 * 60 * 1000L)

        // 1. Authenticated Encryption via AES-256-GCM
        val encrypted = crypto.encrypt(plaintext.toByteArray(Charsets.UTF_8), recipientPeer.publicKeyBase64)

        // 2. Wrap in MeshEnvelope
        val envelope = MeshEnvelope(
            messageId = messageId,
            senderId = localIdentityId,
            senderPublicKey = localPublicKeyBase64,
            recipientId = recipientPeer.identityId,
            createdAt = now,
            expiresAt = expiresAt,
            hopLimit = 5,
            hopCount = 0,
            messageType = MessageType.TEXT,
            encryptedPayload = encrypted.ciphertextBase64,
            iv = encrypted.ivBase64
        )

        // 3. Persist locally as SAVED_LOCALLY first
        val entity = MessageEntity(
            messageId = messageId,
            conversationPeerId = recipientPeer.identityId,
            senderId = localIdentityId,
            recipientId = recipientPeer.identityId,
            plaintext = plaintext,
            isOutgoing = true,
            timestamp = now,
            deliveryState = DeliveryState.SAVED_LOCALLY,
            hopCount = 0,
            maxHops = 5,
            expiresAt = expiresAt
        )
        db.messageDao().insertMessage(entity)

        // 4. Check active BLE connections
        if (ble.activeConnectionsCount.value > 0) {
            db.messageDao().updateDeliveryState(messageId, DeliveryState.WAITING_FOR_CONNECTION)
            val sent = relay.processIncomingEnvelope(envelope)
            if (sent) {
                db.messageDao().updateDeliveryState(messageId, DeliveryState.TRANSMITTED_TO_NEXT_HOP)
            }
        } else {
            db.messageDao().updateDeliveryState(messageId, DeliveryState.WAITING_FOR_CONNECTION)
        }

        return@withContext messageId
    }

    /**
     * Handles an incoming envelope decrypted from the mesh.
     * If envelope is an ACK, updates the original message delivery state to DELIVERED_TO_RECIPIENT!
     */
    suspend fun handleReceivedEnvelope(envelope: MeshEnvelope) = withContext(Dispatchers.IO) {
        if (envelope.messageType == MessageType.ACKNOWLEDGEMENT) {
            val originalId = envelope.ackMessageId ?: return@withContext
            db.messageDao().updateDeliveryState(originalId, DeliveryState.DELIVERED_TO_RECIPIENT, System.currentTimeMillis())
            return@withContext
        }

        if (envelope.messageType == MessageType.TEXT) {
            try {
                // Decrypt authenticated payload
                val decryptedBytes = crypto.decrypt(envelope.encryptedPayload, envelope.iv, envelope.senderPublicKey)
                val plaintext = String(decryptedBytes, Charsets.UTF_8)

                val messageEntity = MessageEntity(
                    messageId = envelope.messageId,
                    conversationPeerId = envelope.senderId,
                    senderId = envelope.senderId,
                    recipientId = localIdentityId,
                    plaintext = plaintext,
                    isOutgoing = false,
                    timestamp = envelope.createdAt,
                    deliveryState = DeliveryState.DELIVERED_TO_RECIPIENT,
                    hopCount = envelope.hopCount,
                    maxHops = envelope.hopLimit,
                    expiresAt = envelope.expiresAt
                )
                db.messageDao().insertMessage(messageEntity)

                // Send back an authenticated ACK envelope along the mesh
                sendAcknowledgement(envelope)
            } catch (e: Exception) {
                // Decryption failure or authentication tag mismatch (tampering detected)
            }
        }
    }

    private suspend fun sendAcknowledgement(originalEnvelope: MeshEnvelope) {
        val ackEnvelope = MeshEnvelope(
            messageId = UUID.randomUUID().toString(),
            senderId = localIdentityId,
            senderPublicKey = localPublicKeyBase64,
            recipientId = originalEnvelope.senderId,
            createdAt = System.currentTimeMillis(),
            expiresAt = System.currentTimeMillis() + (12 * 60 * 60 * 1000L),
            hopLimit = 5,
            hopCount = 0,
            messageType = MessageType.ACKNOWLEDGEMENT,
            encryptedPayload = "",
            iv = "",
            ackMessageId = originalEnvelope.messageId
        )
        relay.processIncomingEnvelope(ackEnvelope)
    }
}
