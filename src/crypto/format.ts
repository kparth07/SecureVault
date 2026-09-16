import {
  SVAULT_MAGIC,
  FORMAT_VERSION,
  ALGORITHM_ID,
  KDF_ID,
  AES_GCM_NONCE_LENGTH,
} from './constants';

export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export interface SvaultHeader {
  version: number;
  algoId: number;
  kdfId: number;
  kdfMem: number;
  kdfTime: number;
  kdfParallelism: number;
  salt: Uint8Array;
  baseNonce: Uint8Array;
  chunkSize: number;
  totalChunks: number;
  fileMetadata: FileMetadata;
}

/**
 * Builds the binary AAD (Additional Authenticated Data) header buffer.
 */
export function buildHeaderAAD(
  params: Omit<SvaultHeader, 'version' | 'algoId' | 'kdfId' | 'fileMetadata'> & { fileMetadataBytes: Uint8Array }
): Uint8Array {
  // Calculate size
  // 6 (magic) + 1 (version) + 1 (algo) + 1 (kdf) + 4 (mem) + 4 (time) + 1 (parallelism)
  // + 16 (salt) + 12 (nonce) + 4 (chunkSize) + 4 (totalChunks) + 4 (json length)
  const fixedSize = 6 + 1 + 1 + 1 + 4 + 4 + 1 + 16 + 12 + 4 + 4 + 4;
  const totalSize = fixedSize + params.fileMetadataBytes.length;
  
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  
  let offset = 0;
  
  // 1. Magic
  uint8.set(SVAULT_MAGIC, offset);
  offset += SVAULT_MAGIC.length;
  
  // 2. Format Version
  view.setUint8(offset, FORMAT_VERSION);
  offset += 1;
  
  // 3. Algorithm ID
  view.setUint8(offset, ALGORITHM_ID.AES_256_GCM);
  offset += 1;
  
  // 4. KDF ID
  view.setUint8(offset, KDF_ID.ARGON2ID);
  offset += 1;
  
  // 5. KDF Params
  view.setUint32(offset, params.kdfMem, true); // Little Endian
  offset += 4;
  view.setUint32(offset, params.kdfTime, true);
  offset += 4;
  view.setUint8(offset, params.kdfParallelism);
  offset += 1;
  
  // 6. Salt (16 bytes)
  if (params.salt.length !== 16) throw new Error("Salt must be 16 bytes");
  uint8.set(params.salt, offset);
  offset += 16;
  
  // 7. Base Nonce (12 bytes)
  if (params.baseNonce.length !== AES_GCM_NONCE_LENGTH) throw new Error(`Nonce must be ${AES_GCM_NONCE_LENGTH} bytes`);
  uint8.set(params.baseNonce, offset);
  offset += 12;
  
  // 8. Chunk info
  view.setUint32(offset, params.chunkSize, true);
  offset += 4;
  view.setUint32(offset, params.totalChunks, true);
  offset += 4;
  
  // 9. JSON Length & JSON Bytes
  view.setUint32(offset, params.fileMetadataBytes.length, true);
  offset += 4;
  uint8.set(params.fileMetadataBytes, offset);
  
  return uint8;
}

/**
 * Parses a binary AAD header buffer to extract the metadata.
 */
export function parseHeaderAAD(buffer: ArrayBuffer | Uint8Array): {
  header: SvaultHeader;
  headerLength: number;
} {
  const actualBuffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer;
  const byteOffset = buffer instanceof ArrayBuffer ? 0 : buffer.byteOffset;
  const view = new DataView(actualBuffer, byteOffset);
  const uint8 = new Uint8Array(actualBuffer, byteOffset);
  
  if (uint8.byteLength < 58) {
    throw new Error("Invalid SecureVault file: file too small to contain header");
  }

  let offset = 0;
  
  // 1. Magic
  const magic = uint8.slice(offset, offset + 6);
  for (let i = 0; i < 6; i++) {
    if (magic[i] !== SVAULT_MAGIC[i]) {
      throw new Error("Invalid SecureVault file: Magic header mismatch");
    }
  }
  offset += 6;
  
  // 2. Version
  const version = view.getUint8(offset);
  if (version > FORMAT_VERSION) {
    throw new Error("This file was created with a newer/unsupported version of SecureVault.");
  }
  offset += 1;
  
  // 3. Algorithm
  const algoId = view.getUint8(offset);
  if (algoId !== ALGORITHM_ID.AES_256_GCM) {
    throw new Error("Unsupported algorithm");
  }
  offset += 1;
  
  // 4. KDF
  const kdfId = view.getUint8(offset);
  if (kdfId !== KDF_ID.ARGON2ID) {
    throw new Error("Unsupported KDF");
  }
  offset += 1;
  
  // 5. KDF Params
  const kdfMem = view.getUint32(offset, true);
  if (kdfMem > 1024 * 1024) throw new Error("KDF memory cost exceeds safe limits (max 1GB)");
  offset += 4;
  
  const kdfTime = view.getUint32(offset, true);
  if (kdfTime > 1000) throw new Error("KDF time cost exceeds safe limits (max 1000)");
  offset += 4;
  
  const kdfParallelism = view.getUint8(offset);
  offset += 1;
  
  // 6. Salt
  const salt = uint8.slice(offset, offset + 16);
  offset += 16;
  
  // 7. Base Nonce
  const baseNonce = uint8.slice(offset, offset + 12);
  offset += 12;
  
  // 8. Chunk info
  const chunkSize = view.getUint32(offset, true);
  if (chunkSize === 0 || chunkSize > 1024 * 1024 * 100) throw new Error("Chunk size out of bounds (max 100MB)");
  offset += 4;
  
  const totalChunks = view.getUint32(offset, true);
  offset += 4;
  
  // 9. JSON Length & Bytes
  const jsonLength = view.getUint32(offset, true);
  if (jsonLength > 1024 * 1024) throw new Error("Metadata exceeds safe limits (max 1MB)");
  offset += 4;
  
  if (offset + jsonLength > uint8.byteLength) {
    throw new Error("Invalid SecureVault file: truncated metadata");
  }
  
  const jsonBytes = uint8.slice(offset, offset + jsonLength);
  offset += jsonLength;
  
  const jsonStr = new TextDecoder().decode(jsonBytes);
  let fileMetadata: FileMetadata;
  try {
    fileMetadata = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error("Invalid SecureVault file: corrupted metadata");
  }
  
  // Basic validation of parsed metadata
  if (!fileMetadata || typeof fileMetadata !== 'object') {
    throw new Error("Invalid SecureVault file: malformed metadata object");
  }
  
  return {
    header: {
      version,
      algoId,
      kdfId,
      kdfMem,
      kdfTime,
      kdfParallelism,
      salt,
      baseNonce,
      chunkSize,
      totalChunks,
      fileMetadata
    },
    headerLength: offset // This is exactly where the ciphertext chunks begin
  };
}
