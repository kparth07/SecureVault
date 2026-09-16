import { describe, it, expect, vi } from 'vitest';
import { encryptFile, decryptFile } from './engine';

// Mock deriveKey to avoid argon2 WASM loading issues in Vitest/Node environment
vi.mock('./kdf', () => ({
  deriveKey: vi.fn(async (password: string, salt?: Uint8Array, params?: any) => {
    // Generate a deterministic key for the mock, or just a dummy 32-byte key
    const dummyKey = new Uint8Array(32);
    dummyKey.fill(password.length); // simple dummy key based on password length
    const dummySalt = salt || new Uint8Array(16);
    return {
      key: dummyKey,
      salt: dummySalt,
      params: params || { mem: 65536, time: 3, parallelism: 1 }
    };
  })
}));

describe('Cryptography Engine', () => {
  it('should encrypt and decrypt a file successfully', async () => {
    // 1. Create a dummy file
    const content = "Hello SecureVault! This is highly sensitive data.";
    const file = new File([content], "secret.txt", { type: "text/plain", lastModified: 1234567890 });
    const password = "SuperStrongPassword123!";

    // 2. Encrypt
    const encryptedBlob = await encryptFile(file, password);
    
    // Ensure the encrypted blob is larger than the original due to metadata & auth tag
    expect(encryptedBlob.size).toBeGreaterThan(file.size);

    // 3. Decrypt
    const decryptedFile = await decryptFile(encryptedBlob, password);
    
    // 4. Verify contents
    const decryptedText = await decryptedFile.text();
    expect(decryptedText).toBe(content);
    expect(decryptedFile.name).toBe("secret.txt");
    expect(decryptedFile.type).toBe("text/plain");
  });

  it('should fail decryption with incorrect password', async () => {
    const file = new File(["test data"], "test.txt", { type: "text/plain" });
    const encryptedBlob = await encryptFile(file, "CorrectPassword");
    
    await expect(decryptFile(encryptedBlob, "WrongPassword"))
      .rejects.toThrow(/Decryption failed/);
  });

  it('should fail decryption if ciphertext is tampered', async () => {
    const file = new File(["test data"], "test.txt", { type: "text/plain" });
    const encryptedBlob = await encryptFile(file, "Password");
    
    // Tamper with the last byte
    const buffer = await encryptedBlob.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    uint8[uint8.length - 1] ^= 0xFF; // flip bits
    
    const tamperedBlob = new Blob([buffer]);
    
    await expect(decryptFile(tamperedBlob, "Password"))
      .rejects.toThrow(/Decryption failed/);
  });
  
  it('should fail decryption if metadata (AAD) is tampered', async () => {
    const file = new File(["test data"], "test.txt", { type: "text/plain" });
    const encryptedBlob = await encryptFile(file, "Password");
    
    // Tamper with the format version byte (offset 6)
    const buffer = await encryptedBlob.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    uint8[6] = 2; // change version to 2
    
    const tamperedBlob = new Blob([buffer]);
    
    await expect(decryptFile(tamperedBlob, "Password"))
      .rejects.toThrow(/Decryption failed|unsupported version/i);
  });
});
