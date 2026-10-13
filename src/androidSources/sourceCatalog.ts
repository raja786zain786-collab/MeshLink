export interface AndroidSourceFile {
  path: string;
  category: 'manifest' | 'gradle' | 'security' | 'bluetooth' | 'protocol' | 'relay' | 'calls' | 'ui' | 'test';
  title: string;
  code: string;
  description: string;
}

export const ANDROID_SOURCE_CATALOG: AndroidSourceFile[] = [
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    category: 'manifest',
    title: 'AndroidManifest.xml',
    description: 'Declares BLE permissions, foreground service, and explicitly excludes INTERNET permission.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Zero Internet permission: Guaranteed 100% offline peer-to-peer -->
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <application android:name=".MeshLinkApp" ...>
        <activity android:name=".MainActivity" ... />
        <service android:name=".relay.RelayService" android:foregroundServiceType="connectedDevice" />
    </application>
</manifest>`
  },
  {
    path: 'android/app/src/main/java/com/meshlink/app/security/CryptoManager.kt',
    category: 'security',
    title: 'CryptoManager.kt',
    description: 'Android Keystore hardware keypair generation, ECDH key agreement, and AES-256-GCM authenticated encryption.',
    code: `package com.meshlink.app.security

import android.security.keystore.*
import java.security.*
import javax.crypto.*
import javax.crypto.spec.GCMParameterSpec

class CryptoManager(context: Context) {
    // Android Keystore NIST P-256 (secp256r1)
    fun ensureIdentityKeyPairExists() { ... }
    fun getLocalPublicKeyBase64(): String { ... }
    fun computeSafetyNumber(peerKey: String): String { ... }
    fun deriveSharedSecret(peerKey: String): SecretKey { ... }
    fun encrypt(plaintext: ByteArray, peerKey: String): EncryptedPayload { ... }
    fun decrypt(ciphertext: String, iv: String, peerKey: String): ByteArray { ... }
}`
  },
  {
    path: 'android/app/src/main/java/com/meshlink/app/bluetooth/BleManager.kt',
    category: 'bluetooth',
    title: 'BleManager.kt',
    description: 'Real BluetoothLeScanner, BluetoothLeAdvertiser, GattServer, and GattClient connection engine with dual peripheral/central support.',
    code: `package com.meshlink.app.bluetooth

import android.bluetooth.*
import android.bluetooth.le.*

class BleManager(...) {
    val SERVICE_UUID = UUID.fromString("0000FE60-0000-1000-8000-00805F9B34FB")
    val CHAR_RX_UUID = UUID.fromString("0000FE61-0000-1000-8000-00805F9B34FB")
    val CHAR_TX_UUID = UUID.fromString("0000FE62-0000-1000-8000-00805F9B34FB")

    fun startAdvertising() { ... }
    fun startScanning() { ... }
    suspend fun transmitEnvelope(env: MeshEnvelope, targetAddr: String): Boolean { ... }
}`
  },
  {
    path: 'android/app/src/main/java/com/meshlink/app/protocol/MeshEnvelope.kt',
    category: 'protocol',
    title: 'MeshEnvelope.kt',
    description: 'Encrypted message envelope, hop counting, CRC32 chunk framing, and transport serialization.',
    code: `package com.meshlink.app.protocol

data class MeshEnvelope(
    val version: Int = 1,
    val messageId: String,
    val senderId: String,
    val senderPublicKey: String,
    val recipientId: String,
    val createdAt: Long,
    val expiresAt: Long,
    val hopLimit: Int = 5,
    val hopCount: Int = 0,
    val messageType: MessageType,
    val encryptedPayload: String,
    val iv: String,
    val ackMessageId: String? = null
) {
    fun isExpired(): Boolean = System.currentTimeMillis() > expiresAt
    fun isHopLimitReached(): Boolean = hopCount >= hopLimit
    fun createRelayCopy(): MeshEnvelope = this.copy(hopCount = this.hopCount + 1)
}`
  },
  {
    path: 'android/app/src/main/java/com/meshlink/app/relay/RelayEngine.kt',
    category: 'relay',
    title: 'RelayEngine.kt',
    description: 'Multi-hop store-and-forward engine, duplicate suppression, loop prevention, and bounded Room persistent queue.',
    code: `package com.meshlink.app.relay

class RelayEngine(private val db: AppDatabase, ...) {
    suspend fun processIncomingEnvelope(envelope: MeshEnvelope): Boolean {
        // 1. Loop and duplicate suppression
        // 2. Check recipient ID match
        // 3. User opt-in check
        // 4. Expiry & Hop limit check
        // 5. Enqueue in persistent Room queue & forward
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/meshlink/app/calls/VoiceCallManager.kt',
    category: 'calls',
    title: 'VoiceCallManager.kt',
    description: 'Evaluates direct local audio transport and honestly marks calling as Planned — local audio transport not yet supported.',
    code: `package com.meshlink.app.calls

class VoiceCallManager {
    fun isDirectAudioTransportAvailable(): Boolean = false
    fun getTransportStatusExplanation(): String =
        "Planned — local audio transport not yet supported. BLE GATT throughput is insufficient for reliable low-latency full-duplex voice."
}`
  },
  {
    path: 'android/app/src/main/java/com/meshlink/app/ui/screens/AllScreens.kt',
    category: 'ui',
    title: 'AllScreens.kt (Jetpack Compose)',
    description: 'Full Jetpack Compose & Material 3 implementation of all 12 modules.',
    code: `package com.meshlink.app.ui.screens

@Composable
fun MeshLinkMainNavigation(app: MeshLinkApp) {
    // Renders:
    // 1. WelcomePrivacyScreen
    // 2. ProfileSetupScreen
    // 3. HomeDashboardScreen
    // 4. ConversationsListScreen
    // 5. ChatScreen (with delivery states)
    // 6. NearbyDiscoveryScreen
    // 7. ActiveConnectionsScreen
    // 8. RelayControlsScreen
    // 9. ContactsVerificationScreen
    // 10. VoiceCallingScreen
    // 11. BatteryStorageScreen
    // 12. DiagnosticsScreen
}`
  },
  {
    path: 'android/app/src/test/java/com/meshlink/app/MeshProtocolTest.kt',
    category: 'test',
    title: 'MeshProtocolTest.kt',
    description: 'JUnit test suite verifying serialization, framing, CRC32, hop limits, and ACK bindings.',
    code: `package com.meshlink.app

class MeshProtocolTest {
    @Test fun testEnvelopeSerializationRoundTrip() { ... }
    @Test fun testBleChunkingAndReassembly() { ... }
    @Test fun testFrameTamperAndCrcDetection() { ... }
    @Test fun testHopLimitEnforcement() { ... }
    @Test fun testExpiryEnforcement() { ... }
    @Test fun testAcknowledgementEnvelopeStructure() { ... }
}`
  }
];
