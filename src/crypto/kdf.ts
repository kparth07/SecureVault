import argon2 from 'argon2-browser';
import { DEFAULT_ARGON2_PARAMS } from './constants';

export interface KeyDerivationResult {
  key: Uint8Array;
  salt: Uint8Array;
  params: {
    mem: number;
    time: number;
    parallelism: number;
  };
}

/**
 * Derives an AES-256 key from a password using Argon2id.
 * If no salt is provided, a random 16-byte salt is generated.
 * Returns the key, salt, and parameters used.
 */
export async function deriveKey(
  password: string,
  salt?: Uint8Array,
  params = DEFAULT_ARGON2_PARAMS
): Promise<KeyDerivationResult> {
  const actualSalt = salt || crypto.getRandomValues(new Uint8Array(16));

  try {
    const result = await argon2.hash({
      pass: password,
      salt: actualSalt,
      time: params.time,
      mem: params.mem,
      hashLen: params.hashLen,
      parallelism: params.parallelism,
      type: argon2.ArgonType.Argon2id,
    });

    return {
      key: result.hash,
      salt: actualSalt,
      params: {
        mem: params.mem,
        time: params.time,
        parallelism: params.parallelism,
      }
    };
  } catch (error) {
    // DO NOT SILENTLY DOWNGRADE KDF.
    // As per security requirements, if Argon2id WASM crashes (e.g. OOM), fail closed.
    throw new Error("Key derivation failed. Your browser or device may not support the required memory allocation for Argon2id, or WASM initialization failed.");
  }
}

