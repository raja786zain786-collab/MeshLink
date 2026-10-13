export type DeliveryState =
  | 'SAVED_LOCALLY'
  | 'WAITING_FOR_CONNECTION'
  | 'TRANSMITTED_TO_NEXT_HOP'
  | 'DELIVERED_TO_RECIPIENT'
  | 'EXPIRED'
  | 'FAILED';

export type MessageType =
  | 'TEXT'
  | 'ACKNOWLEDGEMENT'
  | 'ROUTE_PROBE'
  | 'VOICE_SIGNAL';

export interface PeerIdentity {
  id: string; // 32-hex derived from public key
  displayName: string;
  publicKeyBase64: string;
  privateKey?: CryptoKey; // only for local identity
  publicKey?: CryptoKey;
  safetyNumber: string;
  isVerified: boolean;
  lastSeen: number;
  rssi?: number;
  isConnected: boolean;
  deviceAddress?: string;
}

export interface MeshMessage {
  id: string;
  conversationPeerId: string;
  senderId: string;
  recipientId: string;
  plaintext: string;
  isOutgoing: boolean;
  timestamp: number;
  deliveryState: DeliveryState;
  hopCount: number;
  maxHops: number;
  expiresAt: number;
  ackReceivedAt?: number;
  envelopeSize?: number;
}

export interface MeshEnvelopePayload {
  version: number;
  messageId: string;
  senderId: string;
  senderPublicKey: string;
  recipientId: string;
  createdAt: number;
  expiresAt: number;
  hopLimit: number;
  hopCount: number;
  messageType: MessageType;
  encryptedPayload: string; // Base64 ciphertext with authentication tag
  iv: string;               // Base64 12-byte initialization vector
  ackMessageId?: string;
}

export interface RelayQueueItem {
  messageId: string;
  envelope: MeshEnvelopePayload;
  recipientId: string;
  hopCount: number;
  expiresAt: number;
  queuedAt: number;
}

export interface DiagnosticLog {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  tag: string;
  message: string;
}

export interface BleCapabilities {
  hasBluetooth: boolean;
  isEnabled: boolean;
  supportsBle: boolean;
  supportsAdvertising: boolean;
  supportsMultipleAdv: boolean;
  webBluetoothAvailable: boolean;
}

export interface DeviceSettings {
  relayOptIn: boolean;
  maxHops: number;
  maxQueueSize: number;
  ttlHours: number;
  batterySaver: boolean;
  enableVibration: boolean;
}

export interface VirtualNode {
  id: string;
  name: string;
  identity: PeerIdentity;
  radioRange: number; // in meters (for spatial simulator)
  x: number;
  y: number;
  isRelayEnabled: boolean;
  isPoweredOn: boolean;
  messages: MeshMessage[];
  relayQueue: RelayQueueItem[];
  seenMessageIds: Set<string>;
}
