# SecureShare Security Architecture & Threat Model

## Core Philosophy: Zero-Knowledge End-to-End Encryption

**SecureShare** operates on a zero-knowledge architecture. The server stores **only encrypted payload data (ciphertext)**, initialization vectors (IV), and expiration metadata. The cryptographic master key resides **exclusively inside the URL hash fragment (`#key=...`)**, which standard web browsers never transmit to the server in HTTP requests.

---

## Cryptographic Flow Step-by-Step

### 1. Paste Encryption (Client-Side)
1. **Raw Key Generation**: When a user creates a paste, the browser calls `window.crypto.subtle.generateKey` to generate an ephemeral 256-bit AES-GCM encryption key.
2. **Optional Password Layer**: If the user sets a password:
   - A random 16-byte salt is generated.
   - PBKDF2 (100,000 iterations of SHA-256) derives an intermediate key from the user password.
   - The primary AES-GCM key is wrapped/encrypted with this password-derived key.
3. **Payload Construction**: The text paste (and any optional binary file attachment) is encoded into UTF-8 / ArrayBuffer.
4. **AES-GCM Encryption**: `crypto.subtle.encrypt` encrypts the payload using AES-256-GCM with a freshly generated 96-bit IV.
5. **Base64URL Export**: The raw key is exported as raw bytes and converted into a Base64URL string.
6. **Transmission**: The browser posts ONLY `{ ciphertext, iv, salt, expiry, maxViews, panicDeleteHash }` to `/api/pastes`. The key is **NEVER** sent over the wire.
7. **URL Assembly**: The shareable URL is assembled as `https://secureshare.app/p/:id#key=<base64url_key>`.

---

### 2. Paste Decryption (Client-Side)
1. **URL Hash Extraction**: When a recipient visits `https://secureshare.app/p/:id#key=<base64url_key>`, JavaScript reads `window.location.hash` to extract `key`.
2. **Payload Fetch**: The client sends a GET request to `/api/pastes/:id` to receive `{ ciphertext, iv, salt, isPasswordProtected }`.
3. **Password Input (if enabled)**: If `isPasswordProtected` is true, the user enters the password. PBKDF2 derives the password key using the stored `salt` to unwrap the main AES key.
4. **AES-GCM Decryption**: `crypto.subtle.decrypt` uses the key and `iv` to decrypt `ciphertext` back to plaintext UTF-8 or file binary.
5. **Rendering**: The plaintext is rendered in the UI with syntax highlighting or markdown preview without ever hitting a server-side storage or log.

---

## Threat Model & Risk Mitigations

| Threat Vector | Mitigation Strategy |
| --- | --- |
| **Server Database Compromise** | Attacker only gets random ciphertext and IVs. Without the client URL key, content cannot be decrypted. |
| **Network Eavesdropping (MitM)** | Standard HTTPS protects transport; E2EE guarantees that even if TLS is terminated at a proxy, data remains encrypted. |
| **Server Log Inspection** | URL fragments (`#key=...`) are stripped by browsers before HTTP GET requests are generated. Server access logs never see keys. |
| **Forced Deletion / Malicious Erase** | Panic delete URLs require a secret token whose SHA-256 hash is verified server-side. |
| **Automated Denial of Service (DoS)** | Express rate limiting (100 reqs / 15 mins) and strict payload size limits (10MB max). |

---

## Technical Specifications
- **Symmetric Encryption**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Key Derivation**: PBKDF2 with SHA-256 (100,000 iterations, 16-byte random salt)
- **Key Location**: Browser `window.location.hash` (`#key=...`)
- **Key Storage**: Never persisted to LocalStorage, SessionStorage, or Cookies.
