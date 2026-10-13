package com.meshlink.app.calls

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class CallState {
    IDLE,
    OUTGOING_RINGING,
    INCOMING_REQUEST,
    ACTIVE_CALL,
    ENDED
}

/**
 * Nearby Voice Call Manager and Capability Detector.
 *
 * Engineering Analysis:
 * BLE GATT maximum realistic application throughput is ~4-8 KB/s under standard connection intervals,
 * with variable packet delivery latency (30ms - 200ms). Full-duplex voice telephony (Opus / AMR-WB)
 * requires at least 16-24 kbps continuous streaming with <80ms jitter bounds.
 * BLE GATT alone cannot sustain stable real-time bidirectional calling without Wi-Fi Direct or
 * Bluetooth Classic BR/EDR SCO/HFP links.
 *
 * In accordance with protocol integrity standards:
 * - We do NOT simulate a fake active call or use internet WebRTC cloud servers.
 * - Transport capability is honestly evaluated as NOT YET AVAILABLE for pure BLE GATT.
 * - The call function is preserved with its state machine but disabled with the label:
 *   "Planned — local audio transport not yet supported".
 */
class VoiceCallManager {

    private val _callState = MutableStateFlow(CallState.IDLE)
    val callState: StateFlow<CallState> = _callState.asStateFlow()

    private val _isMicrophoneMuted = MutableStateFlow(false)
    val isMicrophoneMuted: StateFlow<Boolean> = _isMicrophoneMuted.asStateFlow()

    private val _activePeerDisplayName = MutableStateFlow<String?>(null)
    val activePeerDisplayName: StateFlow<String?> = _activePeerDisplayName.asStateFlow()

    /**
     * Physical transport support check for local peer-to-peer audio.
     */
    fun isDirectAudioTransportAvailable(): Boolean {
        // Pure BLE GATT cannot reliably sustain low-latency full-duplex PCM voice audio.
        return false
    }

    fun getTransportStatusExplanation(): String {
        return "Planned — local audio transport not yet supported. BLE GATT throughput is insufficient for reliable low-latency full-duplex voice."
    }

    fun requestOutgoingCall(peerDisplayName: String): Boolean {
        if (!isDirectAudioTransportAvailable()) {
            return false // Prevent phantom calls
        }
        _activePeerDisplayName.value = peerDisplayName
        _callState.value = CallState.OUTGOING_RINGING
        return true
    }

    fun acceptIncomingCall() {
        if (isDirectAudioTransportAvailable()) {
            _callState.value = CallState.ACTIVE_CALL
        } else {
            endCall()
        }
    }

    fun declineIncomingCall() {
        endCall()
    }

    fun toggleMute() {
        _isMicrophoneMuted.value = !_isMicrophoneMuted.value
    }

    fun endCall() {
        _callState.value = CallState.ENDED
        _activePeerDisplayName.value = null
        _isMicrophoneMuted.value = false
    }
}
