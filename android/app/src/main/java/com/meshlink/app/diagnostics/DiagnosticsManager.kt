package com.meshlink.app.diagnostics

import com.meshlink.app.bluetooth.BleCapabilities
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.ConcurrentLinkedQueue

data class DiagnosticEntry(
    val timestamp: Long = System.currentTimeMillis(),
    val level: String, // "INFO", "WARN", "ERROR"
    val tag: String,
    val sanitizedMessage: String
)

/**
 * Diagnostics & Hardware Capability Manager.
 * Ensures zero plaintext message content leaks into diagnostic buffers.
 */
class DiagnosticsManager {

    private val logQueue = ConcurrentLinkedQueue<DiagnosticEntry>()
    private val maxLogBufferSize = 500

    private val _recentLogs = MutableStateFlow<List<DiagnosticEntry>>(emptyList())
    val recentLogs: StateFlow<List<DiagnosticEntry>> = _recentLogs.asStateFlow()

    // Metrics counters
    val framesSent = MutableStateFlow(0L)
    val framesReceived = MutableStateFlow(0L)
    val framesCorrupted = MutableStateFlow(0L)
    val messagesDecrypted = MutableStateFlow(0L)
    val replayAttacksBlocked = MutableStateFlow(0L)

    fun log(level: String, tag: String, message: String) {
        // Enforce privacy: Never log sensitive message text
        val sanitized = message.replace(Regex("plaintext=.*"), "plaintext=[REDACTED]")
        val entry = DiagnosticEntry(level = level, tag = tag, sanitizedMessage = sanitized)
        logQueue.add(entry)
        while (logQueue.size > maxLogBufferSize) {
            logQueue.poll()
        }
        _recentLogs.value = logQueue.toList().reversed()
    }

    fun exportDiagnosticsText(capabilities: BleCapabilities): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.US)
        val sb = StringBuilder()
        sb.appendLine("=== MESHLINK DIAGNOSTICS DUMP ===")
        sb.appendLine("Generated: ${dateFormat.format(Date())}")
        sb.appendLine("Hardware Capabilities:")
        sb.appendLine("  Bluetooth Present: ${capabilities.hasBluetooth}")
        sb.appendLine("  Bluetooth Enabled: ${capabilities.isEnabled}")
        sb.appendLine("  BLE Supported: ${capabilities.supportsBle}")
        sb.appendLine("  Advertising Supported: ${capabilities.supportsAdvertising}")
        sb.appendLine("  Multiple Advertisement: ${capabilities.supportsMultipleAdv}")
        sb.appendLine("Traffic Metrics:")
        sb.appendLine("  Frames Sent: ${framesSent.value}")
        sb.appendLine("  Frames Received: ${framesReceived.value}")
        sb.appendLine("  Frames Corrupted (CRC Drop): ${framesCorrupted.value}")
        sb.appendLine("  Messages Decrypted: ${messagesDecrypted.value}")
        sb.appendLine("  Replays Blocked: ${replayAttacksBlocked.value}")
        sb.appendLine("Log History (Last ${logQueue.size} entries):")
        for (log in logQueue) {
            sb.appendLine("[${dateFormat.format(Date(log.timestamp))}] [${log.level}] [${log.tag}]: ${log.sanitizedMessage}")
        }
        return sb.toString()
    }

    fun clearLogs() {
        logQueue.clear()
        _recentLogs.value = emptyList()
    }
}
