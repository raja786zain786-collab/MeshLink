package com.meshlink.app

import android.app.Application
import androidx.room.Room
import com.meshlink.app.bluetooth.BleManager
import com.meshlink.app.data.AppDatabase
import com.meshlink.app.data.MeshRepository
import com.meshlink.app.diagnostics.DiagnosticsManager
import com.meshlink.app.relay.RelayEngine
import com.meshlink.app.security.CryptoManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MeshLinkApp : Application() {

    lateinit var database: AppDatabase
        private set
    lateinit var cryptoManager: CryptoManager
        private set
    lateinit var bleManager: BleManager
        private set
    lateinit var relayEngine: RelayEngine
        private set
    lateinit var diagnosticsManager: DiagnosticsManager
        private set
    lateinit var meshRepository: MeshRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        diagnosticsManager = DiagnosticsManager()
        diagnosticsManager.log("INFO", "APP", "Initializing MeshLink offline peer-to-peer runtime")

        database = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "meshlink_local.db"
        ).fallbackToDestructiveMigration().build()

        cryptoManager = CryptoManager(applicationContext)

        val localIdentityId = cryptoManager.getLocalIdentityId()

        bleManager = BleManager(
            context = applicationContext,
            localIdentityId = localIdentityId,
            onEnvelopeReceived = { envelope ->
                CoroutineScope(Dispatchers.IO).launch {
                    val isForUs = relayEngine.processIncomingEnvelope(envelope)
                    if (isForUs) {
                        meshRepository.handleReceivedEnvelope(envelope)
                    }
                }
            },
            onLog = { level, tag, msg -> diagnosticsManager.log(level, tag, msg) }
        )

        relayEngine = RelayEngine(
            db = database,
            localIdentityId = localIdentityId,
            onTransmitRelay = { env ->
                // Transmits to active connected BLE peers
                var anySent = false
                for ((addr, _) in bleManager.discoveredPeers.value) {
                    val ok = bleManager.transmitEnvelope(env, addr)
                    if (ok) anySent = true
                }
                anySent
            },
            onLog = { level, tag, msg -> diagnosticsManager.log(level, tag, msg) }
        )

        meshRepository = MeshRepository(
            db = database,
            crypto = cryptoManager,
            ble = bleManager,
            relay = relayEngine
        )
    }

    companion object {
        lateinit var instance: MeshLinkApp
            private set
    }
}
