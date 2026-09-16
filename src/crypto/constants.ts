export const SVAULT_MAGIC = new TextEncoder().encode("SVAULT");
export const FORMAT_VERSION = 1;

export const ALGORITHM_ID = {
  AES_256_GCM: 1,
};

export const KDF_ID = {
  ARGON2ID: 1,
};

// Default parameters for Argon2id (as per PRD)
export const DEFAULT_ARGON2_PARAMS = {
  time: 3,                 // Iterations
  mem: 65536,              // 64 MiB
  hashLen: 32,             // 256-bit AES key
  parallelism: 1,          // 1 thread
  type: 2,                 // Argon2id
};

export const FALLBACK_ARGON2_PARAMS = {
  ...DEFAULT_ARGON2_PARAMS,
  mem: 19456,              // 19 MiB for low memory devices
};

// AES-GCM specifics
export const AES_GCM_TAG_LENGTH = 16; // 128 bits
export const AES_GCM_NONCE_LENGTH = 12; // 96 bits

// File chunking
export const DEFAULT_CHUNK_SIZE = 16 * 1024 * 1024; // 16 MB

// Metadata block offsets (excluding dynamic JSON and ciphertext)
export const METADATA_FIXED_SIZE = 
  6 + // Magic Header
  1 + // Format Version
  1 + // Algorithm ID
  1 + // KDF ID
  4 + // Argon2 Memory Cost (Uint32)
  4 + // Argon2 Iterations (Uint32)
  1 + // Argon2 Parallelism (Uint8)
  16 + // Argon2 Salt (16 bytes)
  12 + // Base Nonce (12 bytes)
  4 + // Chunk Size (Uint32)
  4;  // Total Chunks (Uint32)
