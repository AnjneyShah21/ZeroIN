/**
 * Client-Side Web Crypto API Module for SecureShare
 * Implements AES-256-GCM encryption/decryption + PBKDF2 key derivation.
 * The raw key is NEVER sent to the server.
 */

// Helper to convert ArrayBuffer to Base64URL
export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper to convert Base64URL to Uint8Array / ArrayBuffer
export function base64UrlToArrayBuffer(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface EncryptedPayload {
  ciphertext: string; // Base64URL encoded
  iv: string;         // Base64URL encoded (12 bytes)
  salt?: string;       // Base64URL encoded (16 bytes, if password protected)
  rawKeyBase64: string; // Base64URL string of the selected AES key
  algorithm: 'AES-GCM';
  keyLength: EncryptionStrength;
}

export type EncryptionStrength = 128 | 192 | 256;
export const DEFAULT_ENCRYPTION_STRENGTH: EncryptionStrength = 256;

/**
 * Generate a random AES-GCM CryptoKey at the selected strength.
 */
export async function generateAesKey(keyLength: EncryptionStrength): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: keyLength },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive an AES-GCM key from a user password using PBKDF2.
 */
export async function deriveKeyFromPassword(password: string, saltBytes: Uint8Array, keyLength: EncryptionStrength): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: keyLength },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext (string or ArrayBuffer) using AES-GCM.
 * If password is supplied, derives key with PBKDF2.
 */
export async function encryptData(
  data: string | ArrayBuffer,
  password?: string,
  keyLength: EncryptionStrength = DEFAULT_ENCRYPTION_STRENGTH
): Promise<EncryptedPayload> {
  const ivBytes = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  let cryptoKey: CryptoKey;
  let saltBase64: string | undefined;

  if (password && password.trim().length > 0) {
    const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    saltBase64 = arrayBufferToBase64Url(saltBytes.buffer as ArrayBuffer);
    cryptoKey = await deriveKeyFromPassword(password, saltBytes, keyLength);
  } else {
    cryptoKey = await generateAesKey(keyLength);
  }

  // Convert string input to ArrayBuffer if necessary
  const dataBuffer = typeof data === 'string' 
    ? (new TextEncoder().encode(data).buffer as ArrayBuffer)
    : data;

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBytes.buffer as BufferSource },
    cryptoKey,
    dataBuffer
  );

  // Export key to raw bytes if not password protected (for URL fragment)
  let rawKeyBase64 = '';
  if (!password) {
    const exportedRaw = await window.crypto.subtle.exportKey('raw', cryptoKey);
    rawKeyBase64 = arrayBufferToBase64Url(exportedRaw);
  }

  return {
    ciphertext: arrayBufferToBase64Url(encryptedBuffer),
    iv: arrayBufferToBase64Url(ivBytes.buffer as ArrayBuffer),
    salt: saltBase64,
    rawKeyBase64,
    algorithm: 'AES-GCM',
    keyLength,
  };
}

/**
 * Decrypt ciphertext using key base64 URL or user password
 */
export async function decryptData(
  ciphertextBase64: string,
  ivBase64: string,
  rawKeyBase64?: string,
  password?: string,
  saltBase64?: string,
  keyLength: EncryptionStrength = DEFAULT_ENCRYPTION_STRENGTH
): Promise<ArrayBuffer> {
  const ciphertextBytes = base64UrlToArrayBuffer(ciphertextBase64);
  const ivBytes = base64UrlToArrayBuffer(ivBase64);

  let cryptoKey: CryptoKey;

  if (password && saltBase64) {
    const saltBytes = base64UrlToArrayBuffer(saltBase64);
    cryptoKey = await deriveKeyFromPassword(password, saltBytes, keyLength);
  } else if (rawKeyBase64) {
    const rawKeyBytes = base64UrlToArrayBuffer(rawKeyBase64);
    cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      rawKeyBytes.buffer as BufferSource,
      { name: 'AES-GCM', length: keyLength },
      false,
      ['decrypt']
    );
  } else {
    throw new Error('Neither decryption key fragment nor password provided.');
  }

  return window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes.buffer as BufferSource },
    cryptoKey,
    ciphertextBytes.buffer as BufferSource
  );
}

/**
 * Generate a high-entropy random string for panic deletion
 */
export function generateRandomSecret(length = 24): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return arrayBufferToBase64Url(array.buffer as ArrayBuffer);
}

/**
 * Hash secret with SHA-256 for sending to server as verification hash
 */
export async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
