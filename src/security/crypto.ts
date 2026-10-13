/**
 * Authenticated Cryptography Implementation using WebCrypto API
 * Mirroring Android Keystore EC P-256 + ECDH + AES-256-GCM.
 */

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Computes SHA-256 digest
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const digest = await window.crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  return new Uint8Array(digest);
}

// Generates EC P-256 keypair
export async function generateIdentityKeyPair(): Promise<{
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeyBase64: string;
  identityId: string;
}> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, // extractable
    ['deriveKey', 'deriveBits']
  );

  const exportedPub = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = bufferToBase64(exportedPub);

  const pubHash = await sha256(new Uint8Array(exportedPub));
  let identityId = '';
  for (let i = 0; i < 16; i++) {
    identityId += pubHash[i].toString(16).padStart(2, '0');
  }

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyBase64,
    identityId,
  };
}

// Imports public key from Base64 SPKI
export async function importPublicKey(base64: string): Promise<CryptoKey> {
  const buf = base64ToBuffer(base64);
  return await window.crypto.subtle.importKey(
    'spki',
    buf as unknown as BufferSource,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

// Computes a 12-digit safety number fingerprint from two public keys
export async function computeSafetyNumber(
  localPubBase64: string,
  remotePubBase64: string
): Promise<string> {
  const a = base64ToBuffer(localPubBase64);
  const b = base64ToBuffer(remotePubBase64);

  // Sort lexicographically to ensure order independence
  let first = a;
  let second = b;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] < b[i]) {
      first = a;
      second = b;
      break;
    } else if (a[i] > b[i]) {
      first = b;
      second = a;
      break;
    }
  }

  const combined = new Uint8Array(first.length + second.length);
  combined.set(first, 0);
  combined.set(second, first.length);

  const digest = await sha256(combined);
  const part1 =
    (((digest[0] << 16) | (digest[1] << 8) | digest[2]) >>> 0) % 1000000;
  const part2 =
    (((digest[3] << 16) | (digest[4] << 8) | digest[5]) >>> 0) % 1000000;

  return `${part1.toString().padStart(6, '0')} ${part2.toString().padStart(6, '0')}`;
}

// Derives AES-256-GCM symmetric key via ECDH
export async function deriveSharedSecret(
  localPrivateKey: CryptoKey,
  remotePublicKey: CryptoKey
): Promise<CryptoKey> {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: remotePublicKey,
    },
    localPrivateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypts plaintext with AES-256-GCM
export async function encryptPayload(
  plaintext: string,
  localPrivateKey: CryptoKey,
  remotePublicKey: CryptoKey
): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  const sharedKey = await deriveSharedSecret(localPrivateKey, remotePublicKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit GCM IV
  const encoded = new TextEncoder().encode(plaintext);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    sharedKey,
    encoded
  );

  return {
    ciphertextBase64: bufferToBase64(encryptedBuffer),
    ivBase64: bufferToBase64(iv),
  };
}

// Decrypts ciphertext with AES-256-GCM (fails if authentication tag is tampered)
export async function decryptPayload(
  ciphertextBase64: string,
  ivBase64: string,
  localPrivateKey: CryptoKey,
  remotePublicKey: CryptoKey
): Promise<string> {
  const sharedKey = await deriveSharedSecret(localPrivateKey, remotePublicKey);
  const iv = base64ToBuffer(ivBase64);
  const ciphertext = base64ToBuffer(ciphertextBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128,
    },
    sharedKey,
    ciphertext as unknown as BufferSource
  );

  return new TextDecoder().decode(decryptedBuffer);
}
