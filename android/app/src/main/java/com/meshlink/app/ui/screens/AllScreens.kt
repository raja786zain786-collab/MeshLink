package com.meshlink.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meshlink.app.MeshLinkApp
import com.meshlink.app.data.DeliveryState
import kotlinx.coroutines.launch

/**
 * Main Jetpack Compose Navigation Container with 12 distinct screens:
 * 1. Welcome & Privacy
 * 2. Local Profile Setup
 * 3. Home Dashboard
 * 4. Conversations List
 * 5. Chat Screen
 * 6. Nearby Discovery
 * 7. Active Connections
 * 8. Relay Controls
 * 9. Contacts & Verification
 * 10. Voice Calling Screen
 * 11. Battery & Storage Settings
 * 12. Diagnostics & Troubleshooting
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeshLinkMainNavigation(app: MeshLinkApp) {
    var currentScreen by remember { mutableStateOf("home") }
    var selectedPeerId by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    val activeConnections by app.bleManager.activeConnectionsCount.collectAsState()
    val isRelaying by app.relayEngine.isRelayActive.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = when (currentScreen) {
                                "welcome" -> "Privacy Architecture"
                                "profile" -> "Local Identity"
                                "home" -> "MeshLink"
                                "conversations" -> "Conversations"
                                "chat" -> "Secure Direct Chat"
                                "discovery" -> "Nearby Peer Discovery"
                                "connections" -> "Active Connections"
                                "relay" -> "Mesh Relay Controls"
                                "contacts" -> "Verified Contacts"
                                "call" -> "Nearby Voice Call"
                                "settings" -> "Battery & Storage"
                                "diagnostics" -> "Diagnostics"
                                else -> "MeshLink"
                            },
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                        )
                        Text(
                            text = "Offline BLE · $activeConnections connected",
                            style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.primary)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { currentScreen = "diagnostics" }) {
                        Icon(Icons.Default.Terminal, contentDescription = "Diagnostics")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = currentScreen == "home",
                    onClick = { currentScreen = "home" },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = currentScreen == "conversations" || currentScreen == "chat",
                    onClick = { currentScreen = "conversations" },
                    icon = { Icon(Icons.Default.Chat, contentDescription = "Chat") },
                    label = { Text("Chats") }
                )
                NavigationBarItem(
                    selected = currentScreen == "discovery" || currentScreen == "connections",
                    onClick = { currentScreen = "discovery" },
                    icon = { Icon(Icons.Default.Bluetooth, contentDescription = "Bluetooth") },
                    label = { Text("Nearby") }
                )
                NavigationBarItem(
                    selected = currentScreen == "relay",
                    onClick = { currentScreen = "relay" },
                    icon = { Icon(Icons.Default.Share, contentDescription = "Relay") },
                    label = { Text("Relay") }
                )
                NavigationBarItem(
                    selected = currentScreen == "settings",
                    onClick = { currentScreen = "settings" },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings") }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (currentScreen) {
                "welcome" -> WelcomePrivacyScreen(onProceed = { currentScreen = "home" })
                "profile" -> ProfileSetupScreen(app = app, onBack = { currentScreen = "home" })
                "home" -> HomeDashboardScreen(
                    app = app,
                    onNavigate = { currentScreen = it },
                    onOpenChat = { peerId ->
                        selectedPeerId = peerId
                        currentScreen = "chat"
                    }
                )
                "conversations" -> ConversationsListScreen(
                    app = app,
                    onSelectConversation = { peerId ->
                        selectedPeerId = peerId
                        currentScreen = "chat"
                    }
                )
                "chat" -> ChatScreen(
                    app = app,
                    peerId = selectedPeerId ?: "",
                    onBack = { currentScreen = "conversations" }
                )
                "discovery" -> NearbyDiscoveryScreen(app = app, onGoConnections = { currentScreen = "connections" })
                "connections" -> ActiveConnectionsScreen(app = app, onBack = { currentScreen = "discovery" })
                "relay" -> RelayControlsScreen(app = app)
                "contacts" -> ContactsVerificationScreen(app = app)
                "call" -> VoiceCallingScreen(app = app, peerName = "Nearby Peer")
                "settings" -> BatteryStorageScreen(app = app, onShowPrivacy = { currentScreen = "welcome" })
                "diagnostics" -> DiagnosticsScreen(app = app)
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 1: Welcome & Privacy Explanation
// -------------------------------------------------------------
@Composable
fun WelcomePrivacyScreen(onProceed: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Text("MeshLink Architecture", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold))
            Spacer(modifier = Modifier.height(8.dp))
            Text("Zero Cloud · Zero Tracking · Pure Offline Bluetooth", color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(24.dp))

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("1. No Internet Dependency", fontWeight = FontWeight.SemiBold)
                    Text("MeshLink does not request the INTERNET permission. Messages cannot leak to remote servers.", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(12.dp))

                    Text("2. Multi-Hop Store-and-Forward", fontWeight = FontWeight.SemiBold)
                    Text("Intermediate phones relay encrypted packets without ever reading their contents.", style = MaterialTheme.typography.bodySmall)
                    Spacer(modifier = Modifier.height(12.dp))

                    Text("3. Hardware Keystore Encryption", fontWeight = FontWeight.SemiBold)
                    Text("NIST P-256 ECDH and AES-256-GCM authenticated encryption keep your communications safe.", style = MaterialTheme.typography.bodySmall)
                }
            }
        }

        Button(
            onClick = onProceed,
            modifier = Modifier.fillMaxWidth().height(50.dp)
        ) {
            Text("Acknowledge & Continue")
        }
    }
}

// -------------------------------------------------------------
// Screen 2: Local Profile Setup
// -------------------------------------------------------------
@Composable
fun ProfileSetupScreen(app: MeshLinkApp, onBack: () -> Unit) {
    val identityId = app.cryptoManager.getLocalIdentityId()
    val pubKey = app.cryptoManager.getLocalPublicKeyBase64()

    Column(modifier = Modifier.fillMaxSize().padding(20.dp)) {
        Text("Local Cryptographic Identity", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))

        Text("Device Identity ID:", fontWeight = FontWeight.SemiBold)
        Text(identityId, fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(16.dp))

        Text("Public Key (Base64):", fontWeight = FontWeight.SemiBold)
        Card(modifier = Modifier.fillMaxWidth()) {
            Text(pubKey.take(64) + "...", modifier = Modifier.padding(12.dp), fontFamily = FontFamily.Monospace, fontSize = 11.sp)
        }
        Spacer(modifier = Modifier.height(24.dp))

        Button(onClick = onBack, modifier = Modifier.fillMaxWidth()) {
            Text("Done")
        }
    }
}

// -------------------------------------------------------------
// Screen 3: Home Dashboard
// -------------------------------------------------------------
@Composable
fun HomeDashboardScreen(
    app: MeshLinkApp,
    onNavigate: (String) -> Unit,
    onOpenChat: (String) -> Unit
) {
    val activeConnections by app.bleManager.activeConnectionsCount.collectAsState()
    val isScanning by app.bleManager.isScanning.collectAsState()
    val isAdvertising by app.bleManager.isAdvertising.collectAsState()
    val isRelaying by app.relayEngine.isRelayActive.collectAsState()

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Mesh Status Overview", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Active Connections:")
                        Text("$activeConnections verified", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("BLE Scanning:")
                        Text(if (isScanning) "Active" else "Idle")
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("BLE Advertising:")
                        Text(if (isAdvertising) "Broadcasting" else "Idle")
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Relay Store-and-Forward:")
                        Text(if (isRelaying) "Enabled" else "Off")
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        item {
            Text("Quick Actions", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { onNavigate("discovery") },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Scan BLE")
                }
                OutlinedButton(
                    onClick = { onNavigate("call") },
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Voice Call")
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        item {
            Text("Network Architecture", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth().clickable { onNavigate("relay") }
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Share, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text("Multi-Hop Store-and-Forward", fontWeight = FontWeight.Bold)
                        Text("Relay encrypted packets across phones out of direct radio range.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxWidth().clickable { onNavigate("contacts") }
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text("Identity & Safety Numbers", fontWeight = FontWeight.Bold)
                        Text("Cryptographically verify contacts with 12-digit safety numbers.", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 4: Conversations List
// -------------------------------------------------------------
@Composable
fun ConversationsListScreen(app: MeshLinkApp, onSelectConversation: (String) -> Unit) {
    val contacts by app.meshRepository.getAllContacts().collectAsState(initial = emptyList())

    if (contacts.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.ChatBubbleOutline, contentDescription = null, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(8.dp))
                Text("No conversations yet")
                Text("Discover nearby BLE peers to start chatting.", style = MaterialTheme.typography.bodySmall)
            }
        }
    } else {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(contacts) { contact ->
                ListItem(
                    headlineContent = { Text(contact.displayName, fontWeight = FontWeight.Bold) },
                    supportingContent = { Text("ID: ${contact.identityId.take(8)} · Safety: ${contact.safetyNumber}") },
                    trailingContent = {
                        if (contact.isVerified) {
                            Icon(Icons.Default.CheckCircle, contentDescription = "Verified", tint = Color(0xFF10B981))
                        }
                    },
                    modifier = Modifier.clickable { onSelectConversation(contact.identityId) }
                )
                Divider()
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 5: Chat Screen with Delivery States
// -------------------------------------------------------------
@Composable
fun ChatScreen(app: MeshLinkApp, peerId: String, onBack: () -> Unit) {
    val messages by app.meshRepository.getMessagesForConversation(peerId).collectAsState(initial = emptyList())
    var inputText by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    Column(modifier = Modifier.fillMaxSize()) {
        // Chat Header
        Row(
            modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface).padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Column {
                Text("Peer: ${peerId.take(8)}...", fontWeight = FontWeight.Bold)
                Text("End-to-End Encrypted (AES-GCM-256)", style = MaterialTheme.typography.bodySmall, color = Color(0xFF10B981))
            }
        }

        // Messages list
        LazyColumn(
            modifier = Modifier.weight(1f).padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages) { msg ->
                val isOut = msg.isOutgoing
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isOut) Alignment.End else Alignment.Start
                ) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = if (isOut) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surface
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(msg.plaintext)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = when (msg.deliveryState) {
                                        DeliveryState.SAVED_LOCALLY -> "Saved locally"
                                        DeliveryState.WAITING_FOR_CONNECTION -> "Waiting for connection"
                                        DeliveryState.TRANSMITTED_TO_NEXT_HOP -> "Transmitted (Hop ${msg.hopCount}/${msg.maxHops})"
                                        DeliveryState.DELIVERED_TO_RECIPIENT -> "Delivered (ACK verified)"
                                        DeliveryState.EXPIRED -> "Expired"
                                        DeliveryState.FAILED -> "Failed"
                                    },
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                                    color = when (msg.deliveryState) {
                                        DeliveryState.DELIVERED_TO_RECIPIENT -> Color(0xFF10B981)
                                        DeliveryState.FAILED, DeliveryState.EXPIRED -> MaterialTheme.colorScheme.error
                                        else -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }

        // Input bar
        Row(modifier = Modifier.fillMaxWidth().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Encrypted mesh message...") }
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        scope.launch {
                            val contact = app.database.contactDao().getContactById(peerId)
                            if (contact != null) {
                                app.meshRepository.sendMessage(contact, inputText)
                                inputText = ""
                            }
                        }
                    }
                }
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send")
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 6: Nearby Device Discovery
// -------------------------------------------------------------
@Composable
fun NearbyDiscoveryScreen(app: MeshLinkApp, onGoConnections: () -> Unit) {
    val isScanning by app.bleManager.isScanning.collectAsState()
    val isAdvertising by app.bleManager.isAdvertising.collectAsState()
    val discoveredPeers by app.bleManager.discoveredPeers.collectAsState()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Bluetooth Low Energy Radios", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    if (isScanning) app.bleManager.stopScanning() else app.bleManager.startScanning()
                },
                modifier = Modifier.weight(1f)
            ) {
                Text(if (isScanning) "Stop Scanning" else "Start Scan")
            }
            Button(
                onClick = {
                    if (isAdvertising) app.bleManager.stopAdvertising() else app.bleManager.startAdvertising()
                },
                modifier = Modifier.weight(1f)
            ) {
                Text(if (isAdvertising) "Stop Advertising" else "Advertise BLE")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Discovered Peers (${discoveredPeers.size})", style = MaterialTheme.typography.titleSmall)
        Spacer(modifier = Modifier.height(8.dp))

        if (discoveredPeers.isEmpty()) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text("No nearby BLE peers discovered in current radio range.")
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(discoveredPeers.values.toList()) { peer ->
                    ListItem(
                        headlineContent = { Text(peer.name) },
                        supportingContent = { Text("Address: ${peer.address} · RSSI: ${peer.rssi} dBm") },
                        trailingContent = {
                            Button(onClick = onGoConnections) {
                                Text("Inspect")
                            }
                        }
                    )
                    Divider()
                }
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 7: Active Connections
// -------------------------------------------------------------
@Composable
fun ActiveConnectionsScreen(app: MeshLinkApp, onBack: () -> Unit) {
    val activeCount by app.bleManager.activeConnectionsCount.collectAsState()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Back") }
            Text("Active Connections Status", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
        }
        Spacer(modifier = Modifier.height(16.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Verified Connected Peers", fontWeight = FontWeight.Bold)
                Text(
                    text = "$activeCount active physical GATT connection(s)",
                    style = MaterialTheme.typography.headlineMedium.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "MeshLink reports real GATT connections. Phantom connection counts or fabricated ranges are never shown.",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 8: Relay Controls
// -------------------------------------------------------------
@Composable
fun RelayControlsScreen(app: MeshLinkApp) {
    val isRelaying by app.relayEngine.isRelayActive.collectAsState()
    val forwardedCount by app.relayEngine.forwardedCount.collectAsState()
    val suppressedCount by app.relayEngine.suppressedDuplicatesCount.collectAsState()
    val queuedItems by app.database.relayQueueDao().getAllQueued().collectAsState(initial = emptyList())

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text("Multi-Hop Relay Engine", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
            Spacer(modifier = Modifier.height(12.dp))

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Relay Opt-In", fontWeight = FontWeight.Bold)
                            Text("Forward encrypted envelopes for nearby phones", style = MaterialTheme.typography.bodySmall)
                        }
                        Switch(
                            checked = isRelaying,
                            onCheckedChange = { app.relayEngine.setRelayActive(it) }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Relay Queue & Performance", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("• Forwarded Envelopes: $forwardedCount")
                    Text("• Duplicates Suppressed: $suppressedCount")
                    Text("• Pending Outbox / Relay Queue: ${queuedItems.size} envelopes")
                    Text("• Max Hop Limit: 5 hops")
                    Text("• Queue Storage Cap: 500 envelopes")
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text("Queued Envelopes in Local Store", style = MaterialTheme.typography.titleSmall)
            Spacer(modifier = Modifier.height(8.dp))
        }

        items(queuedItems) { q ->
            ListItem(
                headlineContent = { Text("Msg ID: ${q.messageId.take(8)}...") },
                supportingContent = { Text("Recipient: ${q.recipientId.take(8)} · Hop: ${q.hopCount} · Expires: ${q.expiresAt}") }
            )
            Divider()
        }
    }
}

// -------------------------------------------------------------
// Screen 9: Contacts and Verification
// -------------------------------------------------------------
@Composable
fun ContactsVerificationScreen(app: MeshLinkApp) {
    val contacts by app.meshRepository.getAllContacts().collectAsState(initial = emptyList())

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Contacts & Verification", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
        Text("Verify safety numbers to guard against man-in-the-middle attacks.", style = MaterialTheme.typography.bodySmall)
        Spacer(modifier = Modifier.height(16.dp))

        if (contacts.isEmpty()) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text("No saved contacts. Pair with peers over BLE to generate safety numbers.")
            }
        } else {
            LazyColumn(modifier = Modifier.weight(1f)) {
                items(contacts) { contact ->
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(contact.displayName, fontWeight = FontWeight.Bold)
                                if (contact.isVerified) {
                                    Text("Verified", color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                                } else {
                                    Text("Unverified", color = MaterialTheme.colorScheme.error)
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("12-Digit Safety Number:", style = MaterialTheme.typography.bodySmall)
                            Text(contact.safetyNumber, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                            if (contact.keyChangeWarning) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("WARNING: Public key changed! Verify peer identity.", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 10: Voice Calling Screen
// -------------------------------------------------------------
@Composable
fun VoiceCallingScreen(app: MeshLinkApp, peerName: String) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Direct Nearby Voice", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
            Spacer(modifier = Modifier.height(8.dp))
            Text("Calling $peerName", style = MaterialTheme.typography.bodyMedium)

            Spacer(modifier = Modifier.height(32.dp))

            Box(
                modifier = Modifier.size(100.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surface),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.primary)
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Non-negotiable technical disclosure card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Transport Status:", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "Planned — local audio transport not yet supported.",
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        "BLE GATT throughput is insufficient for reliable low-latency full-duplex voice without Wi-Fi Direct or classic Bluetooth audio profiles. MeshLink will not simulate fake audio connections or rely on internet cloud WebRTC.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }

        // Disabled call triggers
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            Button(
                onClick = {},
                enabled = false, // Honestly disabled
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
            ) {
                Text("End Call")
            }
            Button(
                onClick = {},
                enabled = false // Honestly disabled
            ) {
                Text("Call Peer")
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 11: Battery and Storage Settings
// -------------------------------------------------------------
@Composable
fun BatteryStorageScreen(app: MeshLinkApp, onShowPrivacy: () -> Unit) {
    val coroutineScope = rememberCoroutineScope()

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text("Battery & Storage Governance", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
            Spacer(modifier = Modifier.height(16.dp))

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Battery Optimization Rationale", fontWeight = FontWeight.Bold)
                    Text(
                        "Continuous BLE scanning consumes significant battery power. MeshLink uses adaptive scanning intervals and bounded reconnection backoffs to preserve battery life.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Storage Quota & Retention", fontWeight = FontWeight.Bold)
                    Text("• Maximum relay queue size: 500 envelopes")
                    Text("• Message time-to-live: 24 hours")
                    Text("• Diagnostic log buffer: 500 lines circular buffer")
                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = {
                            coroutineScope.launch {
                                app.database.relayQueueDao().clearQueue()
                                app.database.messageDao().clearAllMessages()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("Clear All Local Data")
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedButton(onClick = onShowPrivacy, modifier = Modifier.fillMaxWidth()) {
                Text("View Privacy Architecture")
            }
        }
    }
}

// -------------------------------------------------------------
// Screen 12: Diagnostics and Troubleshooting
// -------------------------------------------------------------
@Composable
fun DiagnosticsScreen(app: MeshLinkApp) {
    val logs by app.diagnosticsManager.recentLogs.collectAsState()
    val capabilities = remember { app.bleManager.checkCapabilities() }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Hardware & Transport Diagnostics", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold))
        Spacer(modifier = Modifier.height(8.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Radio Capabilities:", fontWeight = FontWeight.Bold)
                Text("• Bluetooth Present: ${capabilities.hasBluetooth}")
                Text("• Bluetooth Enabled: ${capabilities.isEnabled}")
                Text("• BLE Supported: ${capabilities.supportsBle}")
                Text("• Peripheral Advertising: ${capabilities.supportsAdvertising}")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Sanitized Transport Logs (${logs.size})", style = MaterialTheme.typography.titleSmall)
            TextButton(onClick = { app.diagnosticsManager.clearLogs() }) {
                Text("Clear")
            }
        }

        LazyColumn(
            modifier = Modifier.weight(1f).background(Color(0xFF020617)).padding(8.dp)
        ) {
            items(logs) { log ->
                Text(
                    text = "[${log.level}] [${log.tag}]: ${log.sanitizedMessage}",
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    color = when (log.level) {
                        "ERROR" -> Color(0xFFF87171)
                        "WARN" -> Color(0xFFFBBF24)
                        else -> Color(0xFF94A3B8)
                    }
                )
            }
        }
    }
}
