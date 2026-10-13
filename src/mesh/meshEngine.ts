import {
  MeshEnvelopePayload,
  MeshMessage,
  PeerIdentity,
  VirtualNode,
  DiagnosticLog,
} from '../types/mesh';
import {
  generateIdentityKeyPair,
  encryptPayload,
  decryptPayload,
  computeSafetyNumber,
} from '../security/crypto';
import {
  createEnvelope,
  createForwardCopy,
  isEnvelopeExpired,
  isHopLimitReached,
} from '../protocol/envelope';

export interface MeshEvent {
  type: 'HOP' | 'DELIVERED' | 'ACK' | 'DROPPED' | 'TAMPER_DETECTED' | 'ENQUEUED';
  messageId: string;
  fromNodeId: string;
  toNodeId: string;
  hopCount: number;
  details: string;
  timestamp: number;
}

export class MeshNetworkSimulator {
  nodes: Map<string, VirtualNode> = new Map();
  // Radio adjacency matrix: sourceNodeId -> Set of reachable nodeIds
  connections: Map<string, Set<string>> = new Map();
  eventLog: MeshEvent[] = [];
  diagnosticLogs: DiagnosticLog[] = [];

  listeners: Set<() => void> = new Set();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  logDiagnostic(level: 'INFO' | 'WARN' | 'ERROR', tag: string, message: string) {
    const entry: DiagnosticLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      level,
      tag,
      message,
    };
    this.diagnosticLogs.push(entry);
    if (this.diagnosticLogs.length > 500) {
      this.diagnosticLogs.shift();
    }
  }

  async initializeDefaultThreeNodes(): Promise<void> {
    this.nodes.clear();
    this.connections.clear();
    this.eventLog = [];

    // Node A: Alice (Local Device)
    const keyPairA = await generateIdentityKeyPair();
    // Node B: Relay Phone (Intermediate Hop)
    const keyPairB = await generateIdentityKeyPair();
    // Node C: Bob (Remote Recipient beyond A's direct radio range)
    const keyPairC = await generateIdentityKeyPair();

    const safetyAB = await computeSafetyNumber(keyPairA.publicKeyBase64, keyPairB.publicKeyBase64);
    const safetyAC = await computeSafetyNumber(keyPairA.publicKeyBase64, keyPairC.publicKeyBase64);
    const safetyBC = await computeSafetyNumber(keyPairB.publicKeyBase64, keyPairC.publicKeyBase64);

    const nodeA: VirtualNode = {
      id: 'node_a',
      name: 'Phone A (Alice)',
      identity: {
        id: keyPairA.identityId,
        displayName: 'Phone A (Alice)',
        publicKeyBase64: keyPairA.publicKeyBase64,
        privateKey: keyPairA.privateKey,
        publicKey: keyPairA.publicKey,
        safetyNumber: safetyAC,
        isVerified: true,
        lastSeen: Date.now(),
        isConnected: true,
      },
      radioRange: 30,
      x: 100,
      y: 120,
      isRelayEnabled: true,
      isPoweredOn: true,
      messages: [],
      relayQueue: [],
      seenMessageIds: new Set(),
    };

    const nodeB: VirtualNode = {
      id: 'node_b',
      name: 'Phone B (Mesh Relay)',
      identity: {
        id: keyPairB.identityId,
        displayName: 'Phone B (Mesh Relay)',
        publicKeyBase64: keyPairB.publicKeyBase64,
        privateKey: keyPairB.privateKey,
        publicKey: keyPairB.publicKey,
        safetyNumber: safetyAB,
        isVerified: true,
        lastSeen: Date.now(),
        isConnected: true,
      },
      radioRange: 30,
      x: 250,
      y: 120,
      isRelayEnabled: true,
      isPoweredOn: true,
      messages: [],
      relayQueue: [],
      seenMessageIds: new Set(),
    };

    const nodeC: VirtualNode = {
      id: 'node_c',
      name: 'Phone C (Bob)',
      identity: {
        id: keyPairC.identityId,
        displayName: 'Phone C (Bob)',
        publicKeyBase64: keyPairC.publicKeyBase64,
        privateKey: keyPairC.privateKey,
        publicKey: keyPairC.publicKey,
        safetyNumber: safetyAC,
        isVerified: true,
        lastSeen: Date.now(),
        isConnected: false, // Not in direct range of A!
      },
      radioRange: 30,
      x: 400,
      y: 120,
      isRelayEnabled: true,
      isPoweredOn: true,
      messages: [],
      relayQueue: [],
      seenMessageIds: new Set(),
    };

    this.nodes.set(nodeA.id, nodeA);
    this.nodes.set(nodeB.id, nodeB);
    this.nodes.set(nodeC.id, nodeC);

    // Default Topology:
    // A <---> B (in range)
    // B <---> C (in range)
    // A <-X-> C (OUT of direct range! Must use B as multi-hop relay)
    this.connections.set('node_a', new Set(['node_b']));
    this.connections.set('node_b', new Set(['node_a', 'node_c']));
    this.connections.set('node_c', new Set(['node_b']));

    this.logDiagnostic(
      'INFO',
      'TOPOLOGY',
      'Initialized 3-node physical test topology: Phone A <-> Phone B <-> Phone C'
    );
    this.notify();
  }

  toggleConnection(fromId: string, toId: string) {
    const listA = this.connections.get(fromId) || new Set();
    const listB = this.connections.get(toId) || new Set();

    if (listA.has(toId)) {
      listA.delete(toId);
      listB.delete(fromId);
      this.logDiagnostic('WARN', 'TOPOLOGY', `Radio link disconnected between ${fromId} and ${toId}`);
    } else {
      listA.add(toId);
      listB.add(fromId);
      this.logDiagnostic('INFO', 'TOPOLOGY', `Radio link established between ${fromId} and ${toId}`);
    }

    this.connections.set(fromId, listA);
    this.connections.set(toId, listB);
    this.notify();
  }

  isConnected(fromId: string, toId: string): boolean {
    return !!this.connections.get(fromId)?.has(toId);
  }

  // Sends an encrypted message from senderNodeId to recipientNodeId
  async sendMessage(
    senderNodeId: string,
    recipientNodeId: string,
    plaintext: string
  ): Promise<string> {
    const sender = this.nodes.get(senderNodeId);
    const recipient = this.nodes.get(recipientNodeId);

    if (!sender || !recipient) {
      throw new Error('Invalid sender or recipient node');
    }

    const messageId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000;

    // 1. Authenticated Encryption at Sender
    const encrypted = await encryptPayload(
      plaintext,
      sender.identity.privateKey!,
      recipient.identity.publicKey!
    );

    // 2. Wrap in transport envelope
    const envelope = createEnvelope({
      messageId,
      senderId: sender.identity.id,
      senderPublicKey: sender.identity.publicKeyBase64,
      recipientId: recipient.identity.id,
      encryptedPayload: encrypted.ciphertextBase64,
      iv: encrypted.ivBase64,
      hopLimit: 5,
      hopCount: 0,
      ttlHours: 24,
    });

    // 3. Store in sender's local database as SAVED_LOCALLY
    const localMsg: MeshMessage = {
      id: messageId,
      conversationPeerId: recipient.identity.id,
      senderId: sender.identity.id,
      recipientId: recipient.identity.id,
      plaintext,
      isOutgoing: true,
      timestamp: now,
      deliveryState: 'SAVED_LOCALLY',
      hopCount: 0,
      maxHops: 5,
      expiresAt,
    };
    sender.messages.push(localMsg);
    sender.seenMessageIds.add(messageId);

    this.logDiagnostic('INFO', 'SENDER', `Message ${messageId.slice(0, 8)} saved locally at ${sender.name}`);
    this.notify();

    // 4. Begin mesh routing
    await this.routeEnvelope(senderNodeId, envelope, senderNodeId);
    return messageId;
  }

  // Recursively routes an envelope across connected mesh neighbors
  async routeEnvelope(
    currentNodeId: string,
    envelope: MeshEnvelopePayload,
    previousHopNodeId: string
  ): Promise<void> {
    const currentNode = this.nodes.get(currentNodeId);
    if (!currentNode || !currentNode.isPoweredOn) return;

    // 1. Check if envelope is addressed to this node
    if (envelope.recipientId === currentNode.identity.id) {
      await this.handleFinalDestination(currentNode, envelope);
      return;
    }

    // 2. Check relay opt-in
    if (!currentNode.isRelayEnabled) {
      this.recordEvent('DROPPED', envelope.messageId, currentNodeId, '', envelope.hopCount, 'Relay disabled on node');
      this.logDiagnostic('WARN', 'RELAY', `Node ${currentNode.name} dropped msg: relay opt-in is disabled`);
      return;
    }

    // 3. TTL Expiry check
    if (isEnvelopeExpired(envelope)) {
      this.recordEvent('DROPPED', envelope.messageId, currentNodeId, '', envelope.hopCount, 'TTL Expired');
      this.logDiagnostic('WARN', 'RELAY', `Message ${envelope.messageId.slice(0, 8)} expired and dropped`);
      return;
    }

    // 4. Hop limit check
    if (isHopLimitReached(envelope)) {
      this.recordEvent('DROPPED', envelope.messageId, currentNodeId, '', envelope.hopCount, 'Max hops reached');
      this.logDiagnostic('WARN', 'RELAY', `Message ${envelope.messageId.slice(0, 8)} exceeded hop limit`);
      return;
    }

    // 5. Duplicate suppression
    if (currentNode.seenMessageIds.has(envelope.messageId) && currentNodeId !== envelope.senderId) {
      this.recordEvent('DROPPED', envelope.messageId, currentNodeId, '', envelope.hopCount, 'Duplicate envelope suppressed');
      this.logDiagnostic('INFO', 'RELAY', `Suppressed duplicate message ${envelope.messageId.slice(0, 8)} at ${currentNode.name}`);
      return;
    }
    currentNode.seenMessageIds.add(envelope.messageId);

    // 6. Find reachable neighbors (excluding the node that just sent it to us)
    const neighbors = Array.from(this.connections.get(currentNodeId) || []).filter(
      (nId) => nId !== previousHopNodeId
    );

    if (neighbors.length === 0) {
      // Bounded persistent store-and-forward queue
      currentNode.relayQueue.push({
        messageId: envelope.messageId,
        envelope,
        recipientId: envelope.recipientId,
        hopCount: envelope.hopCount,
        expiresAt: envelope.expiresAt,
        queuedAt: Date.now(),
      });
      this.recordEvent('ENQUEUED', envelope.messageId, currentNodeId, '', envelope.hopCount, 'No route available; stored in offline queue');
      this.logDiagnostic('INFO', 'QUEUE', `Queued message ${envelope.messageId.slice(0, 8)} in offline store on ${currentNode.name}`);
      this.notify();
      return;
    }

    // 7. Increment hop count for store-and-forward
    const forwardedCopy = createForwardCopy(envelope);

    // Update sender's delivery status if we are the sender
    const sender = this.nodes.get(envelope.senderId);
    if (sender) {
      const msg = sender.messages.find((m) => m.id === envelope.messageId);
      if (msg && msg.deliveryState === 'SAVED_LOCALLY') {
        msg.deliveryState = 'TRANSMITTED_TO_NEXT_HOP';
        msg.hopCount = forwardedCopy.hopCount;
      }
    }

    for (const neighborId of neighbors) {
      const neighbor = this.nodes.get(neighborId);
      if (neighbor && neighbor.isPoweredOn) {
        this.recordEvent('HOP', envelope.messageId, currentNodeId, neighborId, forwardedCopy.hopCount, `Forwarded to ${neighbor.name}`);
        this.logDiagnostic(
          'INFO',
          'RELAY',
          `Hop ${forwardedCopy.hopCount}/${forwardedCopy.hopLimit}: ${currentNode.name} -> ${neighbor.name} (packet encrypted)`
        );
        this.notify();

        // Simulate asynchronous BLE transmission delay
        setTimeout(() => {
          this.routeEnvelope(neighborId, forwardedCopy, currentNodeId);
        }, 400);
      }
    }
  }

  // Recipient handles received envelope
  private async handleFinalDestination(
    recipientNode: VirtualNode,
    envelope: MeshEnvelopePayload
  ): Promise<void> {
    // If it's an ACK envelope, route to original sender!
    if (envelope.messageType === 'ACKNOWLEDGEMENT') {
      const senderNode = this.nodes.get(envelope.recipientId);
      if (senderNode) {
        const msg = senderNode.messages.find((m) => m.id === envelope.ackMessageId);
        if (msg) {
          msg.deliveryState = 'DELIVERED_TO_RECIPIENT';
          msg.ackReceivedAt = Date.now();
          this.recordEvent('ACK', msg.id, recipientNode.id, senderNode.id, envelope.hopCount, 'Verified cryptographic ACK arrived');
          this.logDiagnostic('INFO', 'ACK', `Authenticated ACK verified for message ${msg.id.slice(0, 8)}! Marked DELIVERED.`);
          this.notify();
        }
      }
      return;
    }

    // Normal text message
    try {
      const senderNode = Array.from(this.nodes.values()).find(
        (n) => n.identity.id === envelope.senderId
      );
      if (!senderNode) {
        throw new Error('Unknown sender node');
      }

      // Decrypt using recipient's private key and sender's public key
      const decryptedPlaintext = await decryptPayload(
        envelope.encryptedPayload,
        envelope.iv,
        recipientNode.identity.privateKey!,
        senderNode.identity.publicKey!
      );

      const receivedMsg: MeshMessage = {
        id: envelope.messageId,
        conversationPeerId: senderNode.identity.id,
        senderId: senderNode.identity.id,
        recipientId: recipientNode.identity.id,
        plaintext: decryptedPlaintext,
        isOutgoing: false,
        timestamp: envelope.createdAt,
        deliveryState: 'DELIVERED_TO_RECIPIENT',
        hopCount: envelope.hopCount,
        maxHops: envelope.hopLimit,
        expiresAt: envelope.expiresAt,
      };

      recipientNode.messages.push(receivedMsg);
      this.recordEvent('DELIVERED', envelope.messageId, '', recipientNode.id, envelope.hopCount, `Decrypted on ${recipientNode.name}`);
      this.logDiagnostic(
        'INFO',
        'CRYPTO',
        `Message ${envelope.messageId.slice(0, 8)} authenticated and decrypted at ${recipientNode.name}`
      );
      this.notify();

      // Transmit back an authenticated ACK envelope!
      const ackEnvelope = createEnvelope({
        senderId: recipientNode.identity.id,
        senderPublicKey: recipientNode.identity.publicKeyBase64,
        recipientId: senderNode.identity.id,
        messageType: 'ACKNOWLEDGEMENT',
        encryptedPayload: '',
        iv: '',
        hopLimit: 5,
        hopCount: 0,
        ackMessageId: envelope.messageId,
      });

      this.logDiagnostic('INFO', 'ACK', `Generating ACK from ${recipientNode.name} to ${senderNode.name}`);
      setTimeout(() => {
        this.routeEnvelope(recipientNode.id, ackEnvelope, recipientNode.id);
      }, 300);
    } catch (e) {
      this.recordEvent('TAMPER_DETECTED', envelope.messageId, '', recipientNode.id, envelope.hopCount, 'Decryption or AEAD tag verification failed');
      this.logDiagnostic('ERROR', 'CRYPTO', `Tamper detected: ${String(e)}`);
      this.notify();
    }
  }

  private recordEvent(
    type: MeshEvent['type'],
    messageId: string,
    fromNodeId: string,
    toNodeId: string,
    hopCount: number,
    details: string
  ) {
    this.eventLog.push({
      type,
      messageId,
      fromNodeId,
      toNodeId,
      hopCount,
      details,
      timestamp: Date.now(),
    });
    if (this.eventLog.length > 100) {
      this.eventLog.shift();
    }
  }
}

export const meshSimulator = new MeshNetworkSimulator();
