<?php
/**
 * The main template file for MeshLink WordPress Theme
 */
get_header(); ?>

<div class="meshlink-app-wrapper">
    <!-- Top WhatsApp Header -->
    <header class="meshlink-header">
        <div class="header-left">
            <button id="meshlink-back-btn" class="icon-btn hidden" aria-label="Back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div id="meshlink-chat-avatar" class="peer-avatar-circle hidden">P</div>
            <div class="header-titles">
                <h1 id="meshlink-title">MeshLink <span class="badge-mesh">BLE</span></h1>
                <p id="meshlink-subtitle">Offline Bluetooth Mesh · End-to-end Encrypted</p>
            </div>
        </div>
        <div class="header-actions">
            <button id="btn-install-app" class="btn-install-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Install</span>
            </button>
            <button id="btn-mesh-sim" class="icon-btn" title="Multi-Hop Mesh Simulator">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <button id="btn-menu" class="icon-btn" title="Menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
        </div>
    </header>

    <!-- Main Content Views -->
    <main class="meshlink-main">
        <!-- View 1: Chats Feed (Default) -->
        <section id="view-chats" class="app-view active">
            <div class="search-bar-wrap">
                <div class="search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8696a0" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="chat-search-input" placeholder="Search or start new offline chat" />
                </div>
            </div>

            <div class="banner-install">
                <div class="banner-text">
                    <strong>Install MeshLink on Your Phone</strong>
                    <p>Run full-screen offline native app on Android & iOS</p>
                </div>
                <button class="btn-action-sm" onclick="meshlinkApp.openInstallModal()">Guide</button>
            </div>

            <div id="chats-list" class="chats-list">
                <!-- Dynamically rendered contacts -->
            </div>

            <!-- WhatsApp Floating Action Button (FAB) -->
            <button id="fab-new-chat" class="whatsapp-fab" title="New Chat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
        </section>

        <!-- View 2: Direct Chat Conversation -->
        <section id="view-chat-detail" class="app-view hidden">
            <div class="chat-wallpaper"></div>
            <div id="chat-messages-stream" class="chat-messages">
                <div class="security-pill">
                    <span>🔒 Messages are end-to-end encrypted. No internet or servers are used.</span>
                </div>
                <div class="date-pill">TODAY</div>
                <div id="messages-container" class="messages-container"></div>
            </div>

            <!-- Input Bar -->
            <div class="chat-input-bar">
                <div class="input-bubble">
                    <button id="btn-emoji" class="input-icon-btn">😊</button>
                    <input type="text" id="chat-input" placeholder="Message" />
                    <button id="btn-attach" class="input-icon-btn">📎</button>
                </div>
                <button id="btn-send-message" class="btn-send-circle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </div>
        </section>

        <!-- View 3: Nearby Peer Discovery -->
        <section id="view-nearby" class="app-view hidden">
            <div class="nearby-controls">
                <button id="btn-toggle-scan" class="control-card">
                    <span class="control-badge" id="badge-scan">IDLE</span>
                    <strong>BLE Scanner</strong>
                    <small>Scan for nearby mesh beacons</small>
                </button>
                <button id="btn-toggle-adv" class="control-card">
                    <span class="control-badge active" id="badge-adv">BROADCASTING</span>
                    <strong>Beacon Broadcast</strong>
                    <small>MeshLink GATT Service</small>
                </button>
            </div>
            <div class="nearby-list-wrap">
                <h3 class="section-title">Discovered Nearby Phones</h3>
                <div id="nearby-peers-list" class="peers-list"></div>
            </div>
        </section>

        <!-- View 4: Store & Forward Relay -->
        <section id="view-relay" class="app-view hidden">
            <div class="relay-card">
                <div class="relay-toggle-row">
                    <div>
                        <strong>Multi-Hop Store-and-Forward</strong>
                        <p>Allow phone to relay encrypted packets blind</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="switch-relay" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="relay-metrics-grid">
                    <div class="metric-box">
                        <small>FORWARDED</small>
                        <span id="metric-forwarded">14</span>
                    </div>
                    <div class="metric-box">
                        <small>BLOCKED DUPLICATES</small>
                        <span id="metric-duplicates">8</span>
                    </div>
                </div>
            </div>
            <div class="queue-list-wrap">
                <h3 class="section-title">Transit Outbox Queue</h3>
                <div id="relay-queue-list" class="queue-list"></div>
            </div>
        </section>

        <!-- View 5: Settings -->
        <section id="view-settings" class="app-view hidden">
            <div class="profile-card-wp" id="profile-card">
                <div class="avatar-large">A</div>
                <div>
                    <strong>Phone A (Alice)</strong>
                    <p>Hey there! I am using MeshLink offline.</p>
                    <small id="local-identity-id">ID: 8fa73c21...</small>
                </div>
            </div>
            <div class="settings-list">
                <div class="settings-item highlight" onclick="meshlinkApp.openInstallModal()">
                    <strong>Install on Phone</strong>
                    <small>Add to Android / iPhone Home Screen</small>
                </div>
                <div class="settings-item" onclick="meshlinkApp.openSimModal()">
                    <strong>3-Device Mesh Simulator</strong>
                    <small>Test Phone A → Phone B → Phone C</small>
                </div>
                <div class="settings-item" onclick="meshlinkApp.openTestsModal()">
                    <strong>Run 11 Protocol Tests</strong>
                    <small>Verify AES-GCM, Hop limits, Framing</small>
                </div>
                <div class="settings-item danger" onclick="meshlinkApp.clearAllData()">
                    <strong>Clear All Local Storage</strong>
                    <small>Wipe messages, queues, and contacts</small>
                </div>
            </div>
        </section>
    </main>

    <!-- WhatsApp Bottom Navigation Bar -->
    <nav class="meshlink-bottom-nav">
        <button class="nav-item active" data-tab="chats">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Chats</span>
        </button>
        <button class="nav-item" data-tab="nearby">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/></svg>
            <span>Nearby</span>
        </button>
        <button class="nav-item" data-tab="relay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <span>Relay</span>
        </button>
        <button class="nav-item" data-tab="settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
        </button>
    </nav>
</div>

<?php get_footer(); ?>
