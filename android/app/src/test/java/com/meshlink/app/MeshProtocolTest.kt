package com.meshlink.app

import com.meshlink.app.protocol.MeshEnvelope
import com.meshlink.app.protocol.MeshFraming
import com.meshlink.app.protocol.MessageType
import org.junit.Assert.*
import org.junit.Test
import java.nio.charset.StandardCharsets
import java.util.UUID

/**
 * Protocol, Framing, Serialization, and Cryptographic Unit Test Suite for MeshLink.
 */
class MeshProtocolTest {

    @Test
    fun testEnvelopeSerializationRoundTrip() {
        val original = MeshEnvelope(
            version = 1,
            messageId = UUID.randomUUID().toString(),
            senderId = "node_alpha_12345678",
            senderPublicKey = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1234567890",
            recipientId = "node_gamma_87654321",
            createdAt = 1700000000000L,
            expiresAt = 1700086400000L,
            hopLimit = 5,
            hopCount = 1,
            messageType = MessageType.TEXT,
            encryptedPayload = "dGVzdF9jaXBoZXJ0ZXh0X2Flc19nY20=",
            iv = "cmFuZG9tX2l2XzEyYg=="
        )

        val bytes = original.toByteArray()
        assertNotNull(bytes)
        assertTrue(bytes.isNotEmpty())

        val restored = MeshEnvelope.fromByteArray(bytes)
        assertEquals(original.version, restored.version)
        assertEquals(original.messageId, restored.messageId)
        assertEquals(original.senderId, restored.senderId)
        assertEquals(original.recipientId, restored.recipientId)
        assertEquals(original.hopLimit, restored.hopLimit)
        assertEquals(original.hopCount, restored.hopCount)
        assertEquals(original.encryptedPayload, restored.encryptedPayload)
        assertEquals(original.iv, restored.iv)
    }

    @Test
    fun testBleChunkingAndReassembly() {
        val envelope = MeshEnvelope(
            messageId = UUID.randomUUID().toString(),
            senderId = "sender_alice",
            senderPublicKey = "key_alice_base64",
            recipientId = "recipient_bob",
            encryptedPayload = "A".repeat(800), // Large payload needing chunking
            iv = "12_byte_iv_base64"
        )

        // Chunk into 180-byte BLE MTU frames
        val frames = MeshFraming.chunkEnvelope(envelope, maxFrameSize = 180)
        assertTrue("Expected multiple frames for 800+ byte envelope", frames.size > 1)

        // Parse each frame and check integrity
        val parsedChunks = mutableMapOf<Int, ByteArray>()
        var expectedTotal = 0
        for (frameBytes in frames) {
            val frame = MeshFraming.parseFrame(frameBytes)
            assertNotNull("Frame must parse successfully", frame)
            expectedTotal = frame!!.total
            parsedChunks[frame.seq] = frame.payload
        }

        assertEquals(expectedTotal, parsedChunks.size)

        // Reassemble
        val totalSize = parsedChunks.values.sumOf { it.size }
        val reassembledBytes = ByteArray(totalSize)
        var offset = 0
        for (i in 0 until expectedTotal) {
            val chunk = parsedChunks[i]!!
            System.arraycopy(chunk, 0, reassembledBytes, offset, chunk.size)
            offset += chunk.size
        }

        val restoredEnvelope = MeshEnvelope.fromByteArray(reassembledBytes)
        assertEquals(envelope.messageId, restoredEnvelope.messageId)
        assertEquals(envelope.encryptedPayload, restoredEnvelope.encryptedPayload)
    }

    @Test
    fun testFrameTamperAndCrcDetection() {
        val envelope = MeshEnvelope(
            messageId = UUID.randomUUID().toString(),
            senderId = "sender_a",
            senderPublicKey = "pk_a",
            recipientId = "recipient_b",
            encryptedPayload = "secure_encrypted_payload",
            iv = "iv_payload"
        )

        val frames = MeshFraming.chunkEnvelope(envelope, maxFrameSize = 100)
        val frameBytes = frames.first().copyOf()

        // Tamper with payload byte in the frame
        frameBytes[MeshFraming.HEADER_SIZE + 2] = (frameBytes[MeshFraming.HEADER_SIZE + 2] + 1).toByte()

        // Parser must reject corrupted frame due to CRC32 mismatch
        val corruptedFrame = MeshFraming.parseFrame(frameBytes)
        assertNull("Corrupted frame must be rejected with null", corruptedFrame)
    }

    @Test
    fun testHopLimitEnforcement() {
        val envelope = MeshEnvelope(
            senderId = "node_a",
            senderPublicKey = "pk_a",
            recipientId = "node_z",
            hopLimit = 3,
            hopCount = 3, // At limit
            encryptedPayload = "payload",
            iv = "iv"
        )
        assertTrue("Hop limit must be flagged as reached", envelope.isHopLimitReached())

        val unexhausted = envelope.copy(hopCount = 2)
        assertFalse("Hop count under limit must be allowed", unexhausted.isHopLimitReached())
    }

    @Test
    fun testExpiryEnforcement() {
        val expiredEnvelope = MeshEnvelope(
            senderId = "node_a",
            senderPublicKey = "pk_a",
            recipientId = "node_z",
            createdAt = System.currentTimeMillis() - 100000L,
            expiresAt = System.currentTimeMillis() - 1000L, // Expired 1s ago
            encryptedPayload = "payload",
            iv = "iv"
        )
        assertTrue("Message with past timestamp must be expired", expiredEnvelope.isExpired())

        val validEnvelope = MeshEnvelope(
            senderId = "node_a",
            senderPublicKey = "pk_a",
            recipientId = "node_z",
            expiresAt = System.currentTimeMillis() + 3600000L,
            encryptedPayload = "payload",
            iv = "iv"
        )
        assertFalse("Fresh message must not be expired", validEnvelope.isExpired())
    }

    @Test
    fun testAcknowledgementEnvelopeStructure() {
        val originalId = UUID.randomUUID().toString()
        val ackEnvelope = MeshEnvelope(
            senderId = "recipient_node",
            senderPublicKey = "pk_recipient",
            recipientId = "sender_node",
            messageType = MessageType.ACKNOWLEDGEMENT,
            encryptedPayload = "",
            iv = "",
            ackMessageId = originalId
        )

        assertEquals(MessageType.ACKNOWLEDGEMENT, ackEnvelope.messageType)
        assertEquals(originalId, ackEnvelope.ackMessageId)

        val bytes = ackEnvelope.toByteArray()
        val parsed = MeshEnvelope.fromByteArray(bytes)
        assertEquals(originalId, parsed.ackMessageId)
        assertEquals(MessageType.ACKNOWLEDGEMENT, parsed.messageType)
    }
}
