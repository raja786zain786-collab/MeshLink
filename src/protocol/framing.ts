/**
 * BLE Packet Framing & CRC32 Integrity Checks.
 * Chunks serialized payloads into BLE MTU sized frames (e.g. 180 bytes)
 * and verifies integrity against byte corruptions and channel noise.
 */

// Simple CRC32 table implementation
const crcTable: number[] = (() => {
  const table = new Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface BleFrame {
  messageId: string;
  seq: number;
  total: number;
  crc: number;
  payloadText: string;
}

export function chunkPayload(
  messageId: string,
  rawPayload: string,
  chunkSize: number = 180
): BleFrame[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(rawPayload);
  const total = Math.ceil(bytes.length / chunkSize) || 1;
  const frames: BleFrame[] = [];

  for (let seq = 0; seq < total; seq++) {
    const start = seq * chunkSize;
    const end = Math.min(bytes.length, start + chunkSize);
    const chunkBytes = bytes.slice(start, end);
    const chunkCrc = crc32(chunkBytes);
    const decoder = new TextDecoder();
    const payloadText = decoder.decode(chunkBytes);

    frames.push({
      messageId,
      seq,
      total,
      crc: chunkCrc,
      payloadText,
    });
  }

  return frames;
}

export function verifyAndAssembleFrames(frames: BleFrame[]): string | null {
  if (frames.length === 0) return null;
  const total = frames[0].total;
  if (frames.length !== total) return null;

  // Sort frames by sequence
  const sorted = [...frames].sort((a, b) => a.seq - b.seq);
  const encoder = new TextEncoder();

  let assembled = '';
  for (let i = 0; i < total; i++) {
    if (sorted[i].seq !== i) return null; // Missing frame
    const chunkBytes = encoder.encode(sorted[i].payloadText);
    const checkCrc = crc32(chunkBytes);
    if (checkCrc !== sorted[i].crc) {
      return null; // CRC failure (tampering or channel distortion)
    }
    assembled += sorted[i].payloadText;
  }

  return assembled;
}
