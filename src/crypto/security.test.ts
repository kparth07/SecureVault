import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { encryptFile, decryptFile } from './engine';
import { generateSecurePassword } from './password';

vi.mock('./kdf', () => ({
  deriveKey: vi.fn(async (password: string, salt?: Uint8Array, params?: any) => {
    const dummyKey = new Uint8Array(32);
    dummyKey.fill(password.length);
    const dummySalt = salt || new Uint8Array(16);
    return {
      key: dummyKey,
      salt: dummySalt,
      params: params || { mem: 65536, time: 3, parallelism: 1 }
    };
  })
}));

describe('Network Leakage & Security Bounds Test', () => {
    const interceptedRequests: { url: string; body: any }[] = [];
  
  beforeAll(() => {
    const originalFetch = globalThis.fetch;
    // Intercept fetch
    vi.stubGlobal('fetch', async (url: string, options: any) => {
      // Allow WASM loading for argon2 to avoid abort
      if (typeof url === 'string' && (url.endsWith('.wasm') || url.includes('argon2'))) {
        return originalFetch(url, options);
      }
      interceptedRequests.push({ url, body: options?.body });
      return new Response();
    });
    
    // Intercept XMLHttpRequest
    const mockXHR = {
      open: vi.fn((_, url) => interceptedRequests.push({ url, body: null })),
      send: vi.fn((body) => {
        if (interceptedRequests.length > 0) {
          interceptedRequests[interceptedRequests.length - 1].body = body;
        }
      }),
      setRequestHeader: vi.fn(),
      readyState: 4,
      status: 200,
      responseText: '',
    };
    vi.stubGlobal('XMLHttpRequest', vi.fn(() => mockXHR));
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('verifies that no plaintext, passwords, or keys leak via network requests', async () => {
    // 1. Known sensitive string / password
    const SENSITIVE_PASSWORD = "VerySecretPassword123!@#";
    const SENSITIVE_PLAINTEXT = "TOP_SECRET_CLASSIFIED_INFORMATION_DO_NOT_LEAK";
    
    // 2. Generate a known password
    const generatedPassword = await generateSecurePassword({ length: 32, uppercase: true, lowercase: true, numbers: true, symbols: true });
    
    // 4. Encrypt a known sensitive file
    const file = new File([SENSITIVE_PLAINTEXT], "secret.txt", { type: "text/plain", lastModified: Date.now() });
    const encryptedBlob = await encryptFile(file, SENSITIVE_PASSWORD);
    
    // 5. Decrypt a .svault file
    const decryptedBlob = await decryptFile(encryptedBlob, SENSITIVE_PASSWORD);
    const decryptedText = await decryptedBlob.text();
    
    expect(decryptedText).toBe(SENSITIVE_PLAINTEXT);
    
    // 6. Inspect all outbound requests
    // Our client-side app should ideally make 0 outbound requests during core crypto logic
    // Even if it made requests (e.g., telemetry), we must ensure no sensitive data is in them.
    for (const req of interceptedRequests) {
      const requestData = JSON.stringify(req);
      expect(requestData).not.toContain(SENSITIVE_PASSWORD);
      expect(requestData).not.toContain(SENSITIVE_PLAINTEXT);
      expect(requestData).not.toContain(generatedPassword);
    }
    
    // In our architecture, the crypto engine must make absolutely zero network requests.
    expect(interceptedRequests.length).toBe(0);
  });
});




