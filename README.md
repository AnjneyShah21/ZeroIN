# ZeroIN

> Modern Zero-Knowledge Encrypted Paste & Text Sharing Platform

ZeroIN is a privacy-first, zero-knowledge paste sharing application inspired by PrivateBin, re-imagined with a cyberpunk hacker terminal UI/UX, client-side AES-256-GCM encryption via the Web Crypto API, automatic expiration, panic deletion, QR code sharing, and zero server-side plaintext persistence.

---

## Key Features

- Zero-Knowledge Architecture: All text and attachments are encrypted client-side in the browser using AES-256-GCM. Plaintext never leaves your browser.
- Hash Fragment Key Storage: Decryption keys reside purely in the URL fragment (`#key=...`). Browsers never transmit fragments to web servers in HTTP requests.
- Flexible Auto-Expiry: Set paste lifetimes — Burn-after-reading, 5 minutes, 1 hour, 1 day, 1 week, or max view limits.
- Password Protection: Optional double-layer encryption using PBKDF2 (100,000 iterations) to encrypt master keys with a user password.
- Panic Delete: Every paste creator receives a secret management token to instantly destroy their paste at any time.
- QR Code Sharing: Instant mobile scanning via client-side rendered QR codes containing full decryption link.
- Syntax Highlighting and Markdown: Built-in syntax highlighting for code snippets and live Markdown rendering preview.
- Encrypted Attachments: Securely encrypt and attach images/files (up to 10MB).
- Self-Hosting Ready: Single command execution via Docker and docker-compose.

---

## Comparison with PrivateBin

| Feature | PrivateBin | ZeroIN |
| --- | --- | --- |
| Cryptography | SJCL (Legacy Crypto JS library) | Web Crypto API (AES-256-GCM native standard) |
| Tech Stack | PHP / Plain JS | Next.js 14 (React, TypeScript, Tailwind) + Express API |
| Storage Engine | File system / SQLite | Redis with in-memory fallback and automatic TTL expiry |
| UI / UX | Traditional pastebin | Cyberpunk hacker terminal with Matrix rain background |
| Panic Delete | Deletion token required | One-click Panic Delete URL and Instant API purge |
| QR Code Sharing | Plugin dependency | Native client-side QR generation for cross-device transfer |

---

## Quick Start (Docker)

```bash
docker-compose up --build
```

Access the frontend at: http://localhost:3000
Backend API at: http://localhost:4000

---

## Local Development

### Start Backend API
```bash
cd server
npm install
npm run dev
```

### Start Next.js Frontend
```bash
cd client
npm install
npm run dev
```

---

## Documentation

See SECURITY.md for full cryptographic details, threat model, and step-by-step encryption flow.
