package com.meshlink.app.protocol

import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
import java.util.UUID
import java.util.zip.CRC32
import org.json.JSONObject

/**
 * Message Types supported by the MeshLink Protocol.
 */
enum class MessageType {
    TEXT,
    ACKNOWLEDGEMENT,
    ROUTE_PROBE,
    VOICE_SIGNAL
}

/**
 * MeshEnvelope: Encrypted transport envelope designed for internet-free peer forwarding.
 *
 * Intermediate relay nodes inspect only the routing header (messageId, recipientId, hopCount,
 * hopLimit, expiresAt) and CANNOT read the encrypted payload or tamper with authentication tags.
 */
data class MeshEnvelope(
    val version: Int = 1,
    val messageId: String = UUID.randomUUID().toString(),
    val senderId: String,
    val senderPublicKey: String,
    val recipientId: String,
    val createdAt: Long = System.currentTimeMillis(),
    val expiresAt: Long = System.currentTimeMillis() + (24 * 60 * 60 * 1000L), // 24h default TTL
    val hopLimit: Int = 5,
    val hopCount: Int = 0,
    val messageType: MessageType = MessageType.TEXT,
    val encryptedPayload: String, // Base64 AES-GCM ciphertext + tag
    val iv: String,               // Base64 12-byte GCM IV
    val ackMessageId: String? = null // For ACK messages: referencing the original messageId
) {
    /**
     * Checks if the envelope has reached its maximum forwarding hops or expired.
     */
    fun isExpired(): Boolean = System.currentTimeMillis() > expiresAt
    fun isHopLimitReached(): Boolean = hopCount >= hopLimit

    /**
     * Creates a new envelope incrementing the hop count for store-and-forward relay.
     */
    fun createRelayCopy(): MeshEnvelope {
        return this.copy(hopCount = this.hopCount + 1)
    }

    /**
     * Serializes this envelope to a canonical JSON byte array.
     */
    fun toByteArray(): ByteArray {
        val json = JSONObject().apply {
            put("v", version)
            put("id", messageId)
            put("s", senderId)
            put("spk", senderPublicKey)
            put("r", recipientId)
            put("ca", createdAt)
            put("ea", expiresAt)
            put("hl", hopLimit)
            put("hc", hopCount)
            put("mt", messageType.name)
            put("ep", encryptedPayload)
            put("iv", iv)
            if (ackMessageId != null) put("ack", ackMessageId)
        }
        return json.toString().toByteArray(StandardCharsets.UTF_8)
    }

    companion object {
        fun fromByteArray(bytes: ByteArray): MeshEnvelope {
            val jsonStr = String(bytes, StandardCharsets.UTF_8)
            val json = JSONObject(jsonStr)
            return MeshEnvelope(
                version = json.getInt("v"),
                messageId = json.getString("id"),
                senderId = json.getString("s"),
                senderPublicKey = json.getString("spk"),
                recipientId = json.getString("r"),
                createdAt = json.getLong("ca"),
                expiresAt = json.getLong("ea"),
                hopLimit = json.getInt("hl"),
                hopCount = json.getInt("hc"),
                messageType = MessageType.valueOf(json.getString("mt")),
                encryptedPayload = json.getString("ep"),
                iv = json.getString("iv"),
                ackMessageId = if (json.has("ack")) json.getString("ack") else null
            )
        }
    }
}

/**
 * Low-level BLE Packet Framing:
 * Splits large serialized MeshEnvelope payloads into MTU-sized frames with CRC32 integrity checks.
 *
 * Binary Frame Format:
 * [Magic (2B: 0x4D 0x4C)]
 * [MessageUUID_MSB (8B)]
 * [MessageUUID_LSB (8B)]
 * [FrameSeq (2B)]
 * [TotalFrames (2B)]
 * [PayloadLen (2B)]
 * [CRC32 (4B)]
 * [Payload (0..N bytes)]
 */
object MeshFraming {
    private const val FRAME_MAGIC_0 = 0x4D.toByte() // 'M'
    private const val FRAME_MAGIC_1 = 0x4C.toByte() // 'L'
    const val HEADER_SIZE = 28 // 2 + 8 + 8 + 2 + 2 + 2 + 4

    data class Frame(
        val messageUuid: UUID,
        val seq: Int,
        val total: Int,
        val crc32: Long,
        val payload: ByteArray
    )

    fun chunkEnvelope(envelope: MeshEnvelope, maxFrameSize: Int = 240): List<ByteArray> {
        val payloadBytes = envelope.toByteArray()
        val uuid = UUID.fromString(envelope.messageId)
        val payloadChunkSize = maxOf(16, maxFrameSize - HEADER_SIZE)
        val totalFrames = (payloadBytes.size + payloadChunkSize - 1) / payloadChunkSize

        val frames = mutableListOf<ByteArray>()
        for (seq in 0 until totalFrames) {
            val offset = seq * payloadChunkSize
            val length = minOf(payloadChunkSize, payloadBytes.size - offset)
            val chunk = ByteArray(length)
            System.arraycopy(payloadBytes, offset, chunk, 0, length)

            val crc = CRC32().apply { update(chunk) }.value

            val buffer = ByteBuffer.allocate(HEADER_SIZE + length)
            buffer.put(FRAME_MAGIC_0)
            buffer.put(FRAME_MAGIC_1)
            buffer.putLong(uuid.mostSignificantBits)
            buffer.putLong(uuid.leastSignificantBits)
            buffer.putShort(seq.toShort())
            buffer.putShort(totalFrames.toShort())
            buffer.putShort(length.toShort())
            buffer.putInt(crc.toInt())
            buffer.put(chunk)

            frames.add(buffer.array())
        }
        return frames
    }

    fun parseFrame(frameBytes: ByteArray): Frame? {
        if (frameBytes.size < HEADER_SIZE) return null
        val buffer = ByteBuffer.wrap(frameBytes)
        val m0 = buffer.get()
        val m1 = buffer.get()
        if (m0 != FRAME_MAGIC_0 || m1 != FRAME_MAGIC_1) return null

        val msb = buffer.long
        val lsb = buffer.long
        val uuid = UUID(msb, lsb)
        val seq = buffer.short.toInt() and 0xFFFF
        val total = buffer.short.toInt() and 0xFFFF
        val payloadLen = buffer.short.toInt() and 0xFFFF
        val expectedCrc = buffer.int.toLong() and 0xFFFFFFFFL

        if (buffer.remaining() < payloadLen) return null
        val payload = ByteArray(payloadLen)
        buffer.get(payload)

        // Verify CRC32
        val calculatedCrc = CRC32().apply { update(payload) }.value
        if (calculatedCrc != expectedCrc) {
            return null // Corrupted frame detected, drop silently
        }

        return Frame(uuid, seq, total, expectedCrc, payload)
    }
}
