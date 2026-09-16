export function checkCryptoSupport(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'Not running in a browser environment.' };
  }

  // 1. Check Web Crypto API
  if (!window.crypto || !window.crypto.subtle) {
    return { 
      supported: false, 
      reason: 'The Web Crypto API is unavailable. Ensure you are using a modern browser and the application is served over HTTPS.' 
    };
  }

  // 2. Check WebAssembly support (required for argon2-browser)
  if (typeof WebAssembly !== 'object' || typeof WebAssembly.instantiate !== 'function') {
    return {
      supported: false,
      reason: 'WebAssembly is required for Argon2id key derivation but is not supported in your browser.'
    };
  }

  // 3. Check File/Blob APIs
  if (typeof Blob === 'undefined' || typeof File === 'undefined') {
    return {
      supported: false,
      reason: 'The required File processing APIs are not fully supported in your browser.'
    };
  }

  // 4. Check TextEncoder/TextDecoder
  if (typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    return {
      supported: false,
      reason: 'Text Encoding APIs are missing in your browser.'
    };
  }

  return { supported: true };
}
