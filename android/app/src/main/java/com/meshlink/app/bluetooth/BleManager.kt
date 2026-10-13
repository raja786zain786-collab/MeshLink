package com.meshlink.app.bluetooth

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.ParcelUuid
import com.meshlink.app.protocol.MeshEnvelope
import com.meshlink.app.protocol.MeshFraming
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Production BLE Mesh Transport Manager for Android SDK.
 *
 * Implements genuine dual-role BLE operation:
 * - Peripheral: Advertises MeshLink Service UUID and runs GattServer to accept frames.
 * - Central: Scans for MeshLink advertisers and connects as GattClient to transmit frames.
 *
 * Custom GATT UUIDs:
 * - Service:        0000FE60-0000-1000-8000-00805F9B34FB
 * - RX (Write):     0000FE61-0000-1000-8000-00805F9B34FB (central writes frames to peripheral)
 * - TX (Notify):    0000FE62-0000-1000-8000-00805F9B34FB (peripheral notifies frames to central)
 */
@SuppressLint("MissingPermission")
class BleManager(
    private val context: Context,
    private val localIdentityId: String,
    private val onEnvelopeReceived: (MeshEnvelope) -> Unit,
    private val onLog: (level: String, tag: String, message: String) -> Unit
) {
    companion object {
        val SERVICE_UUID: UUID = UUID.fromString("0000FE60-0000-1000-8000-00805F9B34FB")
        val CHAR_RX_UUID: UUID = UUID.fromString("0000FE61-0000-1000-8000-00805F9B34FB")
        val CHAR_TX_UUID: UUID = UUID.fromString("0000FE62-0000-1000-8000-00805F9B34FB")
        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805F9B34FB")
    }

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    private val _isScanning = MutableStateFlow(false)
    val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

    private val _isAdvertising = MutableStateFlow(false)
    val isAdvertising: StateFlow<Boolean> = _isAdvertising.asStateFlow()

    private val _activeConnectionsCount = MutableStateFlow(0)
    val activeConnectionsCount: StateFlow<Int> = _activeConnectionsCount.asStateFlow()

    private val _discoveredPeers = MutableStateFlow<Map<String, BleDiscoveredPeer>>(emptyMap())
    val discoveredPeers: StateFlow<Map<String, BleDiscoveredPeer>> = _discoveredPeers.asStateFlow()

    private var gattServer: BluetoothGattServer? = null
    private val activeGattClients = ConcurrentHashMap<String, BluetoothGatt>()

    // Frame assembly buffers keyed by Message UUID
    private val frameBuffers = ConcurrentHashMap<UUID, MutableMap<Int, ByteArray>>()

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /**
     * Checks device hardware capabilities honestly.
     */
    fun checkCapabilities(): BleCapabilities {
        val adapter = bluetoothAdapter
        if (adapter == null) {
            return BleCapabilities(hasBluetooth = false, isEnabled = false, supportsBle = false, supportsAdvertising = false, supportsMultipleAdv = false)
        }
        val hasBle = context.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)
        val supportsAdv = adapter.isMultipleAdvertisementSupported
        return BleCapabilities(
            hasBluetooth = true,
            isEnabled = adapter.isEnabled,
            supportsBle = hasBle,
            supportsAdvertising = supportsAdv,
            supportsMultipleAdv = supportsAdv
        )
    }

    /**
     * Starts BLE advertising as a MeshLink peripheral.
     */
    fun startAdvertising() {
        val advertiser = bluetoothAdapter?.bluetoothLeAdvertiser
        if (advertiser == null) {
            onLog("WARN", "BLE", "Device hardware does not support BLE advertising")
            return
        }

        startGattServer()

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            // Include truncated local identity ID in service data
            .addServiceData(ParcelUuid(SERVICE_UUID), localIdentityId.take(4).toByteArray())
            .build()

        advertiser.startAdvertising(settings, data, advertiseCallback)
    }

    fun stopAdvertising() {
        bluetoothAdapter?.bluetoothLeAdvertiser?.stopAdvertising(advertiseCallback)
        _isAdvertising.value = false
    }

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            _isAdvertising.value = true
            onLog("INFO", "BLE", "BLE advertising started successfully")
        }

        override fun onStartFailure(errorCode: Int) {
            _isAdvertising.value = false
            onLog("ERROR", "BLE", "BLE advertising failed with error code: $errorCode")
        }
    }

    /**
     * Starts BLE scanning for nearby MeshLink peers.
     */
    fun startScanning() {
        val scanner = bluetoothAdapter?.bluetoothLeScanner
        if (scanner == null || !bluetoothAdapter.isEnabled) {
            onLog("ERROR", "BLE", "Cannot start scan: Bluetooth is disabled or scanner unavailable")
            return
        }

        val filters = listOf(
            ScanFilter.Builder()
                .setServiceUuid(ParcelUuid(SERVICE_UUID))
                .build()
        )

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setReportDelay(0)
            .build()

        scanner.startScan(filters, settings, scanCallback)
        _isScanning.value = true
        onLog("INFO", "BLE", "BLE scanning started")
    }

    fun stopScanning() {
        bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
        _isScanning.value = false
        onLog("INFO", "BLE", "BLE scanning stopped")
    }

    private val scanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.device?.let { device ->
                val rssi = result.rssi
                val deviceAddress = device.address
                val updated = _discoveredPeers.value.toMutableMap()
                updated[deviceAddress] = BleDiscoveredPeer(
                    address = deviceAddress,
                    name = device.name ?: "Peer (${deviceAddress.takeLast(5)})",
                    rssi = rssi,
                    lastSeen = System.currentTimeMillis()
                )
                _discoveredPeers.value = updated
            }
        }

        override fun onScanFailed(errorCode: Int) {
            _isScanning.value = false
            onLog("ERROR", "BLE", "Scan failed with error code: $errorCode")
        }
    }

    /**
     * Initializes the local GATT Server to receive incoming Mesh frames.
     */
    private fun startGattServer() {
        if (gattServer != null) return
        val gattMgr = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager ?: return

        gattServer = gattMgr.openGattServer(context, object : BluetoothGattServerCallback() {
            override fun onConnectionStateChange(device: BluetoothDevice?, status: Int, newState: Int) {
                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    onLog("INFO", "GATT_SERVER", "Peer connected: ${device?.address}")
                    _activeConnectionsCount.value += 1
                } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    onLog("INFO", "GATT_SERVER", "Peer disconnected: ${device?.address}")
                    _activeConnectionsCount.value = maxOf(0, _activeConnectionsCount.value - 1)
                }
            }

            override fun onCharacteristicWriteRequest(
                device: BluetoothDevice?,
                requestId: Int,
                characteristic: BluetoothGattCharacteristic?,
                preparedWrite: Boolean,
                responseNeeded: Boolean,
                offset: Int,
                value: ByteArray?
            ) {
                if (responseNeeded) {
                    gattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, value)
                }
                value?.let { handleIncomingRawFrame(it) }
            }
        })

        // Build Custom GATT Service
        val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)

        val rxChar = BluetoothGattCharacteristic(
            CHAR_RX_UUID,
            BluetoothGattCharacteristic.PROPERTY_WRITE or BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
            BluetoothGattCharacteristic.PERMISSION_WRITE
        )

        val txChar = BluetoothGattCharacteristic(
            CHAR_TX_UUID,
            BluetoothGattCharacteristic.PROPERTY_NOTIFY or BluetoothGattCharacteristic.PROPERTY_READ,
            BluetoothGattCharacteristic.PERMISSION_READ
        )

        service.addCharacteristic(rxChar)
        service.addCharacteristic(txChar)
        gattServer?.addService(service)
    }

    /**
     * Reassembles frames and emits valid MeshEnvelopes.
     */
    private fun handleIncomingRawFrame(frameBytes: ByteArray) {
        val frame = MeshFraming.parseFrame(frameBytes) ?: return
        val buffer = frameBuffers.computeIfAbsent(frame.messageUuid) { ConcurrentHashMap() }
        buffer[frame.seq] = frame.payload

        if (buffer.size == frame.total) {
            // All chunks received, reassemble
            val totalBytes = buffer.entries.sortedBy { it.key }.map { it.value }
            val assembledSize = totalBytes.sumOf { it.size }
            val fullPayload = ByteArray(assembledSize)
            var offset = 0
            for (part in totalBytes) {
                System.arraycopy(part, 0, fullPayload, offset, part.size)
                offset += part.size
            }
            frameBuffers.remove(frame.messageUuid)

            try {
                val envelope = MeshEnvelope.fromByteArray(fullPayload)
                onLog("INFO", "PROTOCOL", "Successfully assembled envelope: ${envelope.messageId.take(8)}")
                onEnvelopeReceived(envelope)
            } catch (e: Exception) {
                onLog("ERROR", "PROTOCOL", "Malformed envelope payload: ${e.message}")
            }
        }
    }

    /**
     * Transmits a MeshEnvelope over BLE by chunking it into frames and writing to GATT.
     */
    suspend fun transmitEnvelope(envelope: MeshEnvelope, targetDeviceAddress: String): Boolean = withContext(Dispatchers.IO) {
        val device = bluetoothAdapter?.getRemoteDevice(targetDeviceAddress) ?: return@withContext false
        val frames = MeshFraming.chunkEnvelope(envelope)

        // Connect GATT Client
        val gatt = activeGattClients[targetDeviceAddress] ?: run {
            val completer = CompletableDeferred<BluetoothGatt?>()
            device.connectGatt(context, false, object : BluetoothGattCallback() {
                override fun onConnectionStateChange(g: BluetoothGatt?, status: Int, newState: Int) {
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        g?.discoverServices()
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        activeGattClients.remove(targetDeviceAddress)
                        completer.complete(null)
                    }
                }

                override fun onServicesDiscovered(g: BluetoothGatt?, status: Int) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        g?.let {
                            activeGattClients[targetDeviceAddress] = it
                            completer.complete(it)
                        }
                    } else {
                        completer.complete(null)
                    }
                }
            })
            withTimeoutOrNull(8000L) { completer.await() }
        }

        if (gatt == null) {
            onLog("WARN", "BLE", "Failed to connect GATT client to $targetDeviceAddress")
            return@withContext false
        }

        val service = gatt.getService(SERVICE_UUID)
        val rxChar = service?.getCharacteristic(CHAR_RX_UUID)
        if (rxChar == null) {
            onLog("ERROR", "BLE", "Target device does not export MeshLink characteristic")
            return@withContext false
        }

        // Write frames sequentially with flow pacing
        for (frame in frames) {
            rxChar.value = frame
            rxChar.writeType = BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
            val success = gatt.writeCharacteristic(rxChar)
            if (!success) {
                onLog("ERROR", "BLE", "Frame transmission write failed")
                return@withContext false
            }
            delay(20) // Pacing delay to avoid BLE controller buffer exhaustion
        }

        onLog("INFO", "BLE", "Transmitted ${frames.size} frames for msg: ${envelope.messageId.take(8)}")
        return@withContext true
    }

    fun release() {
        stopScanning()
        stopAdvertising()
        gattServer?.close()
        activeGattClients.values.forEach { it.close() }
        activeGattClients.clear()
        scope.cancel()
    }
}

data class BleCapabilities(
    val hasBluetooth: Boolean,
    val isEnabled: Boolean,
    val supportsBle: Boolean,
    val supportsAdvertising: Boolean,
    val supportsMultipleAdv: Boolean
)

data class BleDiscoveredPeer(
    val address: String,
    val name: String,
    val rssi: Int,
    val lastSeen: Long
)
