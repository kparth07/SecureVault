# SecureVault Security Architecture & Threat Model

SecureVault is built on the principle of **Zero-Knowledge Architecture**. The application does not trust the host environment (beyond the client's local browser runtime), the network, or the backend API with plaintext data or encryption keys.

> **Note**: While SecureVault is designed with defense-in-depth and verifiable security, no application is absolutely "unhackable." We rely on standard, well-audited cryptographic primitives (AES-256-GCM, Argon2id) and modern browser isolation guarantees.

---

## 1. Threat Model & Mitigations

### 1.1 Data Privacy Boundary (Zero-Knowledge)
- **Constraint**: Plaintext, encryption passwords, and derived cryptographic keys must NEVER leave the browser memory.
- **Mitigation**: All file and text processing occurs locally within the browser using the Web Crypto API and WebAssembly. If a backend API is ever attached, it will only ever receive the `.svault` binary output which is fully encrypted and authenticated.
- **Verification**: The test suite includes automated **Network Leakage Tests** that mock all outbound browser connections and assert that sensitive strings never traverse the network.

### 1.2 Cryptographic Integrity & Tampering
- **Constraint**: Any modification to the encrypted file (ciphertext, salt, nonce, version, KDF parameters, or metadata) must be rejected safely.
- **Mitigation**: We utilize `AES-256-GCM`. Every chunk of the `.svault` file binds the *entire* parsed file header (including salt, iterations, chunk sizes, and JSON metadata) as Additional Authenticated Data (AAD). If a single bit is modified anywhere in the file, GCM authentication fails immediately.
- **Format Validation**: The `.svault` parser enforces strict limits on KDF parameters (max 1GB memory cost, max 1000 iterations) and metadata bounds (max 1MB) to prevent Denial of Service or Memory Exhaustion attacks via maliciously crafted headers.

### 1.3 Cross-Site Scripting (XSS)
- **Constraint**: An attacker must not be able to execute arbitrary JavaScript.
- **Mitigation**: 
  - We exclusively rely on React's automatic escaping for DOM rendering.
  - `dangerouslySetInnerHTML` is explicitly prohibited across the application.
  - File metadata (like filenames) is strictly parsed as JSON and rendered as raw text.

### 1.4 Supply Chain & Dependency Compromise
- **Constraint**: A compromised third-party package must not be able to exfiltrate keys.
- **Mitigation**: 
  - **Dependency Pinning**: Cryptographic libraries (`argon2-browser`) are pinned to specific versions.
  - **Strict Content Security Policy (CSP)**: The application deploys with a highly restrictive CSP (`default-src 'self'`). It blocks all unapproved network destinations (`connect-src 'self'`). It explicitly blocks inline scripts (`unsafe-inline`) and `unsafe-eval`.
  - WebAssembly compilation is strictly controlled via `'wasm-unsafe-eval'`.

### 1.5 Local Storage Hygiene
- **Constraint**: Passwords and decrypted files must not persist on the device.
- **Mitigation**: The Password Generator prevents duplicates by keeping a ledger in `localStorage`. However, to maintain Zero-Knowledge, it strictly stores the **SHA-256 hash** of generated passwords. The plaintext is never saved.

---

## 2. Cryptographic Implementation Details

### Encryption Protocol
1. **Password KDF**: Argon2id (via WebAssembly) derives a 32-byte key from the user's password and a unique 16-byte cryptographically secure random salt.
2. **Cipher**: AES-256-GCM (Web Crypto API).
3. **Chunking**: Data is encrypted in discrete chunks (default 1MB).
4. **Nonces**: A 12-byte base nonce is securely generated for the file. Each chunk's unique nonce is derived securely from this base nonce + the chunk index.
5. **AAD Binding**: The complete `.svault` file header structure (magic bytes, versions, parameters, and metadata) is bound to every chunk via GCM AAD.

### `.svault` Format Structure
- `[0-5]`: Magic Header (`SVAULT`)
- `[6]`: Format Version
- `[7]`: Algorithm ID (1 = AES-256-GCM)
- `[8]`: KDF ID (1 = Argon2id)
- `[9-25]`: KDF Params (Memory, Time, Parallelism)
- `[26-41]`: KDF Salt
- `[42-53]`: Base Nonce
- `[54-61]`: Chunk Info (Size, Total Chunks)
- `[62-65]`: Metadata JSON Length
- `[66-...]`: Metadata JSON (File name, type, size)
- `[...]`: Chunk Ciphertexts (Streamed)

---

## 3. Incident Response & Bug Bounties
If you discover a vulnerability that breaks the Zero-Knowledge guarantee or allows cryptographic bypass, please report it immediately. 

*SecureVault does not log IPs, files, or telemetry, minimizing blast radius by design.*
