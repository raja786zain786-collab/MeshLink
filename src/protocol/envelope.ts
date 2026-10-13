import { MeshEnvelopePayload, MessageType } from '../types/mesh';

export function createEnvelope(params: {
  messageId?: string;
  senderId: string;
  senderPublicKey: string;
  recipientId: string;
  messageType?: MessageType;
  encryptedPayload: string;
  iv: string;
  hopLimit?: number;
  hopCount?: number;
  ttlHours?: number;
  ackMessageId?: string;
}): MeshEnvelopePayload {
  const now = Date.now();
  const ttl = (params.ttlHours ?? 24) * 60 * 60 * 1000;
  return {
    version: 1,
    messageId: params.messageId || crypto.randomUUID(),
    senderId: params.senderId,
    senderPublicKey: params.senderPublicKey,
    recipientId: params.recipientId,
    createdAt: now,
    expiresAt: now + ttl,
    hopLimit: params.hopLimit ?? 5,
    hopCount: params.hopCount ?? 0,
    messageType: params.messageType ?? 'TEXT',
    encryptedPayload: params.encryptedPayload,
    iv: params.iv,
    ackMessageId: params.ackMessageId,
  };
}

export function serializeEnvelope(envelope: MeshEnvelopePayload): string {
  return JSON.stringify(envelope);
}

export function deserializeEnvelope(raw: string): MeshEnvelopePayload {
  const parsed = JSON.parse(raw);
  if (!parsed.messageId || !parsed.senderId || !parsed.recipientId) {
    throw new Error('Malformed envelope: missing required fields');
  }
  return parsed as MeshEnvelopePayload;
}

export function isEnvelopeExpired(envelope: MeshEnvelopePayload): boolean {
  return Date.now() > envelope.expiresAt;
}

export function isHopLimitReached(envelope: MeshEnvelopePayload): boolean {
  return envelope.hopCount >= envelope.hopLimit;
}

export function createForwardCopy(envelope: MeshEnvelopePayload): MeshEnvelopePayload {
  return {
    ...envelope,
    hopCount: envelope.hopCount + 1,
  };
}
