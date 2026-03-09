# VIBE

**Real-World Social Graph on Solana**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat-square&logo=solana)](https://solana.com)
[![React Native](https://img.shields.io/badge/React_Native-0.72-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-14F195?style=flat-square)](LICENSE)

VIBE is a mobile application that transforms real-world human interactions into verifiable on-chain connections on Solana.

When two people meet, they scan a QR code or tap phones via NFC to create a **Proof of Connection**. The app mints a compressed NFT (cNFT) representing that real-world meeting. Each token stores both wallet addresses, a timestamp, and optional GPS coordinates — forming the edges of a decentralized real-world social graph.

---

## The Problem

Online social platforms are dominated by bots, fake accounts, and synthetic identity. There is currently no reliable way to verify that two people have actually met in real life.

VIBE solves this by anchoring social relationships in physical presence. Every connection requires both parties to be physically present and approve the transaction from their own wallet.

---

## Demo Flow

```
User A  →  Open VIBE  →  Tap "Show My VIBE"  →  QR code displayed

User B  →  Open VIBE  →  Tap "Scan VIBE"  →  Scan QR (or tap phones via NFC)

Both users confirm the connection in the Solana Mobile Wallet Adapter popup

A Proof of Connection cNFT is minted on Solana Devnet

The new connection appears in both users' connection history
```

---

## MVP Features

- **Wallet connection** via Solana Mobile Wallet Adapter (MWA v2)
- **QR handshake** — display and scan wallet identity
- **NFC tap handshake** — Android NFC P2P (API 14 and below) with QR fallback for Android 14+
- **Proof of Connection minting** — compressed NFT via Metaplex Bubblegum
- **Connection history** — local storage backed by AsyncStorage
- **Offline queue** — handshakes queued locally, synced to chain when back online
- **Social graph API** — query connections and degrees of separation between wallets
- **Global heatmap** — GPS-tagged connections visualized on a map

---

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native 0.72 |
| Language | TypeScript |
| Wallet integration | Solana Mobile Wallet Adapter v2 |
| Blockchain | Solana (Devnet) |
| NFT minting | Metaplex Bubblegum (compressed NFT) |
| Umi client | `@metaplex-foundation/umi-bundle-defaults` |
| Hardware | Android NFC, device camera (QR) |
| Local storage | AsyncStorage |
| API server | Express.js + PostgreSQL |
| Deployment | Vercel |

---

## Architecture

```
mobile/
├── src/
│   ├── blockchain/
│   │   ├── bubblegum.ts      # Umi instance + Merkle tree config
│   │   ├── mintPoC.ts        # Proof of Connection minting via MWA
│   │   ├── NFCService.ts     # NFC read / broadcast
│   │   ├── StorageService.ts # AsyncStorage persistence
│   │   ├── SyncService.ts    # Offline queue sync
│   │   └── wallet.ts         # Solana connection helpers
│   ├── components/
│   │   ├── WalletConnect.tsx  # MWA authorize / disconnect
│   │   ├── NFCHandshake.tsx   # NFC flow UI
│   │   └── QRCodeDisplay.tsx  # QR generation
│   └── screens/
│       ├── Home.tsx           # Entry point
│       ├── Scan.tsx           # QR scanner
│       ├── ShowQR.tsx         # QR display
│       ├── ConfirmConnection.tsx
│       ├── Connections.tsx    # Connection history
│       └── Map.tsx            # Heatmap view

server/
├── api.ts           # Express REST API
├── persistence.ts   # PostgreSQL layer
└── db.ts            # pg pool

indexer/
├── graph.ts         # In-memory BFS graph
└── indexer.ts       # Seeder + graph hydration
```

**Data flow:**

1. Mobile client builds a `mintToCollectionV1` transaction via Umi
2. Transaction is passed to MWA — user approves in their wallet app
3. MWA signs and sends to Solana RPC
4. On success, the API server records the connection in PostgreSQL
5. The in-memory graph is updated for real-time BFS queries

---

## Proof of Connection

A Proof of Connection (PoC) is a compressed NFT minted via Metaplex Bubblegum with the following metadata:

```json
{
  "name": "VIBE Connection",
  "symbol": "VIBE",
  "walletA": "<initiator pubkey>",
  "walletB": "<peer pubkey>",
  "timestamp": 1741478400000,
  "latitude": -6.175,
  "longitude": 106.827,
  "eventId": "optional"
}
```

Using compressed NFTs keeps the cost per connection under **$0.0005** and allows the protocol to scale to millions of connections.

---

## Development Setup

### Prerequisites

- Node.js 18+
- Android Studio (with Android SDK 33+, NDK)
- React Native CLI
- A physical Android device with NFC (recommended) or Android emulator
- A Solana devnet wallet (Phantom, Solflare, or any MWA-compatible wallet)

### Install

```bash
git clone https://github.com/nayrbryanGaming/vibe.git

# Mobile client
cd vibe/mobile
npm install --legacy-peer-deps

# API server
cd ../
npm install
```

### Run the API server (local)

```bash
# Requires DATABASE_URL env var pointing to a PostgreSQL instance
npx ts-node server/api.ts
# Server starts at http://localhost:3000
```

### Run the mobile app

```bash
cd mobile

# Start Metro bundler
npm run start

# Build and install on Android device
npm run android
```

### Deploy Merkle Tree + Collection (required for real minting)

```bash
# Creates a Bubblegum Merkle tree and NFT collection on Devnet
npx ts-node scripts/deploy-protocol.ts

# Copy the output addresses into mobile/src/blockchain/bubblegum.ts
# BUBBLEGUM_TREE_ADDRESS and COLLECTION_MINT
```

> Without running `deploy-protocol.ts`, the app operates in **Demo Mode** — handshakes work but minting returns a mock signature instead of a real on-chain transaction.

---

## API Reference

All endpoints are live at the Vercel deployment.

```
GET  /api/health                          → server status + graph stats
GET  /api/connections/:wallet             → list of connected wallets
GET  /api/separation/:walletA/:walletB    → degrees of separation (BFS)
GET  /api/heatmap                         → GPS coordinates of all connections
POST /api/connections                     → record a new Proof of Connection
```

Example:

```bash
curl https://your-vercel-url.vercel.app/api/health
```

---

## Security

- All connections require **dual wallet authorization** — both parties must approve via MWA
- **Self-connection guard** — `walletA !== walletB` enforced server-side
- **Duplicate prevention** — idempotent `ON CONFLICT DO NOTHING` on PostgreSQL primary key
- **Input validation** — base58 regex on all wallet addresses before processing
- **No PII on-chain** — connections are wallet-to-wallet only, no names or emails

---

## Offline Mode

If a connection is made without internet access:

1. The handshake data is saved locally via AsyncStorage
2. On reconnection, `SyncService` detects pending items
3. Each pending connection triggers an MWA popup to approve the transaction
4. On success, the connection is recorded on-chain and sent to the API

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | QR + NFC handshake, PoC minting | ✅ Done |
| 2 | Social graph API, heatmap | ✅ Done |
| 3 | BLE passive proximity discovery | Planned |
| 4 | Mainnet deployment, SDK for third-party apps | Planned |

---

## Hackathon Context

VIBE was built for the **MONOLITH Hackathon** — Solana Mobile track.

The project demonstrates how the Solana Mobile Stack (Mobile Wallet Adapter + compressed NFTs) can enable a new class of real-world social infrastructure that is bot-resistant by design.

---

## Contributing

Open source under MIT. Contributions welcome — especially around the NFC layer, BLE discovery, and graph visualization.

---

## License

MIT

---

*Building the real-world social graph, one connection at a time.*
