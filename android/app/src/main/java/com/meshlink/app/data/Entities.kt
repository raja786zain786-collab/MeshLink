package com.meshlink.app.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

/**
 * Explicit delivery states strictly enforced by the MeshLink protocol.
 * Delivered state is only reached when an authenticated cryptographic ACK is verified.
 */
enum class DeliveryState {
    SAVED_LOCALLY,
    WAITING_FOR_CONNECTION,
    TRANSMITTED_TO_NEXT_HOP,
    DELIVERED_TO_RECIPIENT,
    EXPIRED,
    FAILED
}

@Entity(tableName = "contacts")
data class ContactEntity(
    @PrimaryKey val identityId: String,
    val displayName: String,
    val publicKeyBase64: String,
    val safetyNumber: String,
    val isVerified: Boolean = false,
    val lastSeenTimestamp: Long = 0L,
    val keyChangeWarning: Boolean = false
)

@Entity(tableName = "messages", indices = [Index("recipientId"), Index("deliveryState")])
data class MessageEntity(
    @PrimaryKey val messageId: String,
    val conversationPeerId: String,
    val senderId: String,
    val recipientId: String,
    val plaintext: String,
    val isOutgoing: Boolean,
    val timestamp: Long,
    val deliveryState: DeliveryState,
    val hopCount: Int = 0,
    val maxHops: Int = 5,
    val expiresAt: Long,
    val ackReceivedAt: Long? = null
)

@Entity(tableName = "relay_queue", indices = [Index("expiresAt")])
data class RelayQueueEntity(
    @PrimaryKey val messageId: String,
    val envelopeBytes: ByteArray,
    val recipientId: String,
    val hopCount: Int,
    val expiresAt: Long,
    val queuedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "diagnostic_logs")
data class DiagnosticLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val level: String, // "INFO", "WARN", "ERROR", "FRAME"
    val tag: String,
    val message: String
)

@Dao
interface ContactDao {
    @Query("SELECT * FROM contacts ORDER BY lastSeenTimestamp DESC")
    fun getAllContacts(): Flow<List<ContactEntity>>

    @Query("SELECT * FROM contacts WHERE identityId = :id LIMIT 1")
    suspend fun getContactById(id: String): ContactEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertContact(contact: ContactEntity)

    @Update
    suspend fun updateContact(contact: ContactEntity)

    @Delete
    suspend fun deleteContact(contact: ContactEntity)
}

@Dao
interface MessageDao {
    @Query("SELECT * FROM messages WHERE conversationPeerId = :peerId ORDER BY timestamp ASC")
    fun getMessagesForConversation(peerId: String): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE deliveryState = 'WAITING_FOR_CONNECTION' OR deliveryState = 'SAVED_LOCALLY'")
    suspend fun getPendingOutbox(): List<MessageEntity>

    @Query("SELECT * FROM messages WHERE messageId = :id LIMIT 1")
    suspend fun getMessageById(id: String): MessageEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity)

    @Update
    suspend fun updateMessage(message: MessageEntity)

    @Query("UPDATE messages SET deliveryState = :state, ackReceivedAt = :ackTime WHERE messageId = :id")
    suspend fun updateDeliveryState(id: String, state: DeliveryState, ackTime: Long? = null)

    @Query("DELETE FROM messages WHERE conversationPeerId = :peerId")
    suspend fun deleteConversation(peerId: String)

    @Query("DELETE FROM messages")
    suspend fun clearAllMessages()
}

@Dao
interface RelayQueueDao {
    @Query("SELECT * FROM relay_queue ORDER BY queuedAt ASC")
    fun getAllQueued(): Flow<List<RelayQueueEntity>>

    @Query("SELECT * FROM relay_queue ORDER BY queuedAt ASC")
    suspend fun getQueueSnapshot(): List<RelayQueueEntity>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun enqueue(item: RelayQueueEntity)

    @Query("DELETE FROM relay_queue WHERE messageId = :id")
    suspend fun dequeue(id: String)

    @Query("DELETE FROM relay_queue WHERE expiresAt < :now")
    suspend fun purgeExpired(now: Long = System.currentTimeMillis()): Int

    @Query("DELETE FROM relay_queue")
    suspend fun clearQueue()

    @Query("SELECT COUNT(*) FROM relay_queue")
    suspend fun getQueueSize(): Int
}

@Dao
interface DiagnosticLogDao {
    @Query("SELECT * FROM diagnostic_logs ORDER BY timestamp DESC LIMIT 200")
    fun getRecentLogs(): Flow<List<DiagnosticLogEntity>>

    @Insert
    suspend fun insertLog(log: DiagnosticLogEntity)

    @Query("DELETE FROM diagnostic_logs")
    suspend fun clearLogs()
}

@Database(
    entities = [
        ContactEntity::class,
        MessageEntity::class,
        RelayQueueEntity::class,
        DiagnosticLogEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun contactDao(): ContactDao
    abstract fun messageDao(): MessageDao
    abstract fun relayQueueDao(): RelayQueueDao
    abstract fun diagnosticLogDao(): DiagnosticLogDao
}
