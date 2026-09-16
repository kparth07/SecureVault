import { AES_GCM_NONCE_LENGTH } from './constants';

/**
 * Imports a raw 32-byte array into a Web Crypto API CryptoKey for AES-GCM.
 */
export async function importAESKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Derives a per-chunk nonce by adding the chunk index to the base nonce.
 * We treat the last 4 bytes of the 12-byte base nonce as a 32-bit big-endian integer.
 */
export function getChunkNonce(baseNonce: Uint8Array, chunkIndex: number): Uint8Array {
  if (baseNonce.length !== AES_GCM_NONCE_LENGTH) {
    throw new Error(`Base nonce must be ${AES_GCM_NONCE_LENGTH} bytes`);
  }
  
  const chunkNonce = new Uint8Array(baseNonce);
  const view = new DataView(chunkNonce.buffer, chunkNonce.byteOffset, chunkNonce.byteLength);
  
  // Read the last 4 bytes as an integer, add the chunk index, and write it back.
  // Using DataView for Big-Endian operations.
  const counter = view.getUint32(8, false);
  view.setUint32(8, counter + chunkIndex, false);
  
  return chunkNonce;
}

/**
 * Encrypts a single chunk of data.
 * @param key The AES-GCM CryptoKey
 * @param chunkNonce The unique 12-byte nonce for this chunk
 * @param data The plaintext data (buffer)
 * @param aad The Additional Authenticated Data (buffer)
 * @returns The ciphertext + authentication tag (appended automatically by Web Crypto)
 */
export async function encryptChunk(
  key: CryptoKey,
  chunkNonce: Uint8Array,
  data: ArrayBuffer | ArrayBufferView,
  aad: ArrayBuffer | ArrayBufferView
): Promise<ArrayBuffer> {
  return await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: chunkNonce as BufferSource,
      additionalData: aad as BufferSource,
    },
    key,
    data as BufferSource
  );
}

/**
 * Decrypts a single chunk of data.
 * @param key The AES-GCM CryptoKey
 * @param chunkNonce The unique 12-byte nonce for this chunk
 * @param ciphertext The ciphertext + auth tag data
 * @param aad The Additional Authenticated Data (must exactly match what was used for encryption)
 * @returns The plaintext data
 * @throws Will throw if authentication fails (wrong key, modified ciphertext, or modified AAD)
 */
export async function decryptChunk(
  key: CryptoKey,
  chunkNonce: Uint8Array,
  ciphertext: ArrayBuffer | ArrayBufferView,
  aad: ArrayBuffer | ArrayBufferView
): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: chunkNonce as BufferSource,
      additionalData: aad as BufferSource,
    },
    key,
    ciphertext as BufferSource
  );
}
