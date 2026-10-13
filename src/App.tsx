/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useTransition } from 'react';
import {
  PeerIdentity,
  MeshMessage,
  RelayQueueItem,
  DiagnosticLog,
  DeviceSettings,
  BleCapabilities,
} from './types/mesh';
import {
  generateIdentityKeyPair,
  encryptPayload,
  decryptPayload,
  computeSafetyNumber,
} from './security/crypto';
import {
  createEnvelope,
  createForwardCopy,
  isEnvelopeExpired,
  isHopLimitReached,
} from './protocol/envelope';
import { LocalStorageManager, defaultSettings } from './storage/db';
import { meshSimulator } from './mesh/meshEngine';

// Components
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav, MainTab } from './components/AndroidBottomNav';
import { LiveMeshVisualizer } from './components/LiveMeshVisualizer';
import { TestRunnerModal } from './components/TestRunnerModal';
import { SourceCodeModal } from './components/SourceCodeModal';
import { PhysicalTestPlanModal } from './components/PhysicalTestPlanModal';
import { InstallAppModal } from './components/InstallAppModal';
import { WordPressModal } from './components/WordPressModal';
import { OfflineIndicator } from './components/OfflineIndicator';

// Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { ConversationsScreen } from './screens/ConversationsScreen';
import { ChatScreen } from './screens/ChatScreen';
import { DiscoveryScreen } from './screens/DiscoveryScreen';
import { ConnectionsScreen } from './screens/ConnectionsScreen';
import { RelayScreen } from './screens/RelayScreen';
import { ContactsScreen } from './screens/ContactsScreen';
import { VoiceCallScreen } from './screens/VoiceCallScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';

export default function App() {
  const [, startTransition] = useTransition();

  // Navigation State (WhatsApp starts directly on Chats)
  const [currentTab, setCurrentTab] = useState<MainTab>('conversations');
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [activeChatPeer, setActiveChatPeer] = useState<PeerIdentity | null>(null);

  // Modals
  const [showMeshSimModal, setShowMeshSimModal] = useState(false);
  const [showTestRunnerModal, setShowTestRunnerModal] = useState(false);
  const [showSourceCodeModal, setShowSourceCodeModal] = useState(false);
  const [showPhysicalTestPlan, setShowPhysicalTestPlan] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showWordPressModal, setShowWordPressModal] = useState(false);

  // App State
  const [localIdentity, setLocalIdentity] = useState<PeerIdentity | null>(null);
  const [contacts, setContacts] = useState<PeerIdentity[]>([]);
  const [messages, setMessages] = useState<MeshMessage[]>([]);
  const [relayQueue, setRelayQueue] = useState<RelayQueueItem[]>([]);
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLog[]>([]);
  const [settings, setSettings] = useState<DeviceSettings>(defaultSettings);

  // Radio status
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(true);

  // Boot initialization
  useEffect(() => {
    async function init() {
      // 1. Initialize local keypair
      const keyPair = await generateIdentityKeyPair();
      const identity: PeerIdentity = {
        id: keyPair.identityId,
        displayName: 'Phone A (Alice)',
        publicKeyBase64: keyPair.publicKeyBase64,
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        safetyNumber: '000000 000000',
        isVerified: true,
        lastSeen: Date.now(),
        isConnected: true,
      };
      setLocalIdentity(identity);

      // 2. Initialize mesh simulator with default nodes
      await meshSimulator.initializeDefaultThreeNodes();

      // 3. Load or initialize contacts
      const storedContacts = LocalStorageManager.loadContacts();
      if (storedContacts.length > 0) {
        setContacts(storedContacts);
      } else {
        // Populate default contacts from simulator nodes
        const nodeB = meshSimulator.nodes.get('node_b');
        const nodeC = meshSimulator.nodes.get('node_c');
        const initialContacts: PeerIdentity[] = [];

        if (nodeB) {
          const safetyB = await computeSafetyNumber(
            keyPair.publicKeyBase64,
            nodeB.identity.publicKeyBase64
          );
          initialContacts.push({
            ...nodeB.identity,
            safetyNumber: safetyB,
          });
        }
        if (nodeC) {
          const safetyC = await computeSafetyNumber(
            keyPair.publicKeyBase64,
            nodeC.identity.publicKeyBase64
          );
          initialContacts.push({
            ...nodeC.identity,
            safetyNumber: safetyC,
          });
        }
        setContacts(initialContacts);
        LocalStorageManager.saveContacts(initialContacts);
      }

      // 4. Load messages, queue, logs, settings
      setMessages(LocalStorageManager.loadMessages());
      setRelayQueue(LocalStorageManager.loadRelayQueue());
      setDiagnosticLogs(LocalStorageManager.loadLogs());
      setSettings(LocalStorageManager.loadSettings());
    }

    init();
  }, []);

  // Listen to simulator events
  useEffect(() => {
    const unsub = meshSimulator.subscribe(() => {
      setDiagnosticLogs([...meshSimulator.diagnosticLogs]);

      const nodeA = meshSimulator.nodes.get('node_a');
      if (nodeA && nodeA.messages.length > 0) {
        setMessages([...nodeA.messages]);
        LocalStorageManager.saveMessages([...nodeA.messages]);
      }
    });
    return unsub;
  }, []);

  const addLog = (level: 'INFO' | 'WARN' | 'ERROR', tag: string, message: string) => {
    meshSimulator.logDiagnostic(level, tag, message);
    const updated = [
      ...diagnosticLogs,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        level,
        tag,
        message,
      },
    ];
    setDiagnosticLogs(updated);
    LocalStorageManager.saveLogs(updated);
  };

  const handleSendMessage = async (text: string) => {
    if (!localIdentity || !activeChatPeer) return;

    addLog('INFO', 'OUTBOX', `Sending message to ${activeChatPeer.displayName}`);
    await meshSimulator.sendMessage('node_a', 'node_c', text);

    const nodeA = meshSimulator.nodes.get('node_a');
    if (nodeA) {
      setMessages([...nodeA.messages]);
      LocalStorageManager.saveMessages([...nodeA.messages]);
    }
  };

  const activeConnectedPeers = contacts.filter((c) => c.isConnected);

  const capabilities: BleCapabilities = {
    hasBluetooth: true,
    isEnabled: true,
    supportsBle: true,
    supportsAdvertising: isAdvertising,
    supportsMultipleAdv: true,
    webBluetoothAvailable: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  };

  if (!localIdentity) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b141a] text-[#e9edef]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#8696a0]">Initializing MeshLink Keystore & BLE Radios...</p>
        </div>
      </div>
    );
  }

  // Determine current active view
  const renderCurrentView = () => {
    if (activeSubScreen === 'welcome') {
      return <WelcomeScreen onProceed={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === 'profile') {
      return (
        <ProfileSetupScreen
          localIdentity={localIdentity}
          onUpdateDisplayName={(name) => {
            setLocalIdentity({ ...localIdentity, displayName: name });
            addLog('INFO', 'PROFILE', `Updated display name to "${name}"`);
          }}
          onRegenerateKeys={async () => {
            const kp = await generateIdentityKeyPair();
            setLocalIdentity({
              ...localIdentity,
              id: kp.identityId,
              publicKeyBase64: kp.publicKeyBase64,
              privateKey: kp.privateKey,
              publicKey: kp.publicKey,
            });
            addLog('WARN', 'SECURITY', 'Regenerated fresh NIST P-256 identity keypair');
          }}
          onDone={() => setActiveSubScreen(null)}
        />
      );
    }
    if (activeSubScreen === 'chat' && activeChatPeer) {
      return (
        <ChatScreen
          peer={activeChatPeer}
          messages={messages.filter(
            (m) =>
              m.conversationPeerId === activeChatPeer.id ||
              m.recipientId === activeChatPeer.id ||
              m.senderId === activeChatPeer.id
          )}
          onSendMessage={handleSendMessage}
          onClearConversation={() => {
            const remaining = messages.filter(
              (m) =>
                m.conversationPeerId !== activeChatPeer.id &&
                m.recipientId !== activeChatPeer.id &&
                m.senderId !== activeChatPeer.id
            );
            setMessages(remaining);
            LocalStorageManager.saveMessages(remaining);
          }}
          onBack={() => {
            setActiveSubScreen(null);
            setActiveChatPeer(null);
          }}
        />
      );
    }
    if (activeSubScreen === 'connections') {
      return (
        <ConnectionsScreen
          activePeers={activeConnectedPeers}
          onDisconnectPeer={(peerId) => {
            const updated = contacts.map((c) =>
              c.id === peerId ? { ...c, isConnected: false } : c
            );
            setContacts(updated);
            LocalStorageManager.saveContacts(updated);
            addLog('WARN', 'BLE', `Disconnected peer ${peerId.slice(0, 8)}`);
          }}
          onBack={() => setActiveSubScreen(null)}
        />
      );
    }
    if (activeSubScreen === 'contacts') {
      return (
        <ContactsScreen
          contacts={contacts}
          onToggleVerification={(peerId) => {
            const updated = contacts.map((c) =>
              c.id === peerId ? { ...c, isVerified: !c.isVerified } : c
            );
            setContacts(updated);
            LocalStorageManager.saveContacts(updated);
          }}
          onOpenChat={(peer) => {
            setActiveChatPeer(peer);
            setActiveSubScreen('chat');
          }}
        />
      );
    }
    if (activeSubScreen === 'diagnostics') {
      return (
        <DiagnosticsScreen
          logs={diagnosticLogs}
          capabilities={capabilities}
          onClearLogs={() => {
            setDiagnosticLogs([]);
            meshSimulator.diagnosticLogs = [];
            LocalStorageManager.saveLogs([]);
          }}
          onBack={() => setActiveSubScreen(null)}
        />
      );
    }

    // Main 5 Tabs
    switch (currentTab) {
      case 'conversations':
        return (
          <ConversationsScreen
            contacts={contacts}
            messages={messages}
            onSelectPeer={(peer) => {
              setActiveChatPeer(peer);
              setActiveSubScreen('chat');
            }}
            onOpenDiscovery={() => setCurrentTab('discovery')}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenDownloadCenter={() => setShowWordPressModal(true)}
            activeConnectionsCount={activeConnectedPeers.length}
          />
        );
      case 'discovery':
        return (
          <DiscoveryScreen
            discoveredPeers={contacts}
            isScanning={isScanning}
            isAdvertising={isAdvertising}
            onToggleScan={() => {
              setIsScanning(!isScanning);
              addLog('INFO', 'BLE', !isScanning ? 'BLE scanner started' : 'BLE scanner stopped');
            }}
            onToggleAdvertise={() => {
              setIsAdvertising(!isAdvertising);
              addLog('INFO', 'BLE', !isAdvertising ? 'BLE advertising enabled' : 'BLE advertising disabled');
            }}
            onConnectPeer={(peer) => {
              const updated = contacts.map((c) =>
                c.id === peer.id ? { ...c, isConnected: !c.isConnected } : c
              );
              setContacts(updated);
              LocalStorageManager.saveContacts(updated);
              addLog('INFO', 'BLE', `Toggled connection state for ${peer.displayName}`);
            }}
            onOpenConnections={() => setActiveSubScreen('connections')}
          />
        );
      case 'relay':
        return (
          <RelayScreen
            relayOptIn={settings.relayOptIn}
            onToggleRelayOptIn={() => {
              const next = !settings.relayOptIn;
              setSettings({ ...settings, relayOptIn: next });
              LocalStorageManager.saveSettings({ ...settings, relayOptIn: next });
              meshSimulator.nodes.get('node_a')!.isRelayEnabled = next;
              addLog('INFO', 'RELAY', `Relay store-and-forward opt-in set to ${next}`);
            }}
            maxHops={settings.maxHops}
            relayQueue={relayQueue}
            forwardedCount={14}
            duplicatesSuppressedCount={8}
            onClearQueue={() => {
              setRelayQueue([]);
              LocalStorageManager.saveRelayQueue([]);
              addLog('INFO', 'STORAGE', 'Purged all queued relay envelopes');
            }}
            onPurgeExpired={() => {
              const now = Date.now();
              const valid = relayQueue.filter((q) => q.expiresAt > now);
              setRelayQueue(valid);
              LocalStorageManager.saveRelayQueue(valid);
              addLog('INFO', 'STORAGE', 'Purged expired envelopes from outbox');
            }}
          />
        );
      case 'calls':
        return <VoiceCallScreen onBack={() => setCurrentTab('conversations')} />;
      case 'settings':
        return (
          <SettingsScreen
            localIdentity={localIdentity}
            settings={settings}
            onUpdateSettings={(newVals) => {
              const updated = { ...settings, ...newVals };
              setSettings(updated);
              LocalStorageManager.saveSettings(updated);
            }}
            onClearAllData={() => {
              LocalStorageManager.clearAllData();
              setMessages([]);
              setRelayQueue([]);
              setDiagnosticLogs([]);
              addLog('WARN', 'STORAGE', 'Cleared all local storage, messages, and queues');
            }}
            onShowPrivacy={() => setActiveSubScreen('welcome')}
            onOpenProfile={() => setActiveSubScreen('profile')}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenWordPressModal={() => setShowWordPressModal(true)}
            onOpenDiagnostics={() => setActiveSubScreen('diagnostics')}
          />
        );
    }
  };

  const isChatActive = activeSubScreen === 'chat' && activeChatPeer !== null;

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <AndroidHeader
        title={isChatActive ? activeChatPeer!.displayName : 'MeshLink'}
        subtitle={isChatActive ? 'Offline BLE · End-to-end encrypted' : undefined}
        activeConnectionsCount={activeConnectedPeers.length}
        onOpenDiagnostics={() => setActiveSubScreen('diagnostics')}
        onOpenMeshSimulator={() => setShowMeshSimModal(true)}
        onOpenTestRunner={() => setShowTestRunnerModal(true)}
        onOpenSourceCode={() => setShowSourceCodeModal(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenWordPressModal={() => setShowWordPressModal(true)}
        onBack={activeSubScreen ? () => setActiveSubScreen(null) : undefined}
        isChatScreen={isChatActive}
        peerAvatar={isChatActive ? activeChatPeer!.displayName.charAt(0).toUpperCase() : undefined}
        onCallPeer={() => setActiveSubScreen('call')}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-2xl mx-auto overflow-x-hidden bg-[#111b21]">
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation (Only visible when not in a subscreen like active chat) */}
      {!activeSubScreen && (
        <AndroidBottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            startTransition(() => {
              setCurrentTab(tab);
            });
          }}
          unreadCount={0}
        />
      )}

      {/* Interactive Modals */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      <LiveMeshVisualizer
        isOpen={showMeshSimModal}
        onClose={() => setShowMeshSimModal(false)}
      />

      <TestRunnerModal
        isOpen={showTestRunnerModal}
        onClose={() => setShowTestRunnerModal(false)}
      />

      <SourceCodeModal
        isOpen={showSourceCodeModal}
        onClose={() => setShowSourceCodeModal(false)}
      />

      <PhysicalTestPlanModal
        isOpen={showPhysicalTestPlan}
        onClose={() => setShowPhysicalTestPlan(false)}
      />

      <WordPressModal
        isOpen={showWordPressModal}
        onClose={() => setShowWordPressModal(false)}
      />

      <OfflineIndicator />
    </div>
  );
}
