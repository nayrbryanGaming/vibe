# VIBE | Technical Architecture
## The human-layer infrastructure for Solana

VIBE is a decentralized real-world social graph built on the **SOLTAG Protocol**. This document outlines the technical design, data structures, and cryptographic processes that power the network.

---

## 1. Protocol Overview: SOLTAG
The SOLTAG Protocol converts physical proximity into digital trust. It utilizes a multi-layered verification stack to ensure that every connection record (Proof-of-Connection) represents a legitimate real-world interaction.

### 1.1 Proof-of-Connection (PoC)
A PoC is a unique, non-fungible asset (cNFT) that encodes the cryptographic handshake between two decentralized identities (wallets).

---

## 2. Core Components

### 2.1 The Mobile Client (VIBE App)
- **Identity Engine**: Integrates **Solana Mobile Wallet Adapter (MWA)** for non-custodial authorization.
- **Hardware Handshake Layer**: 
  - **NFC (Primary)**: Utilizes NDEF records for instant wallet address exchange via proximity.
  - **Vision (Secondary)**: Real-time QR generation and scanning using `react-native-vision-camera`.
- **Relay & Persistence**: An offline-first storage engine using `AsyncStorage` with a prioritized synchronization queue for delayed on-chain minting.

### 2.2 The On-Chain Layer (Solana)
- **Metaplex Bubblegum**: The core compression engine. connections are stored in a Merkle Tree, significantly reducing storage costs while maintaining full L1 security.
- **Tree Configuration**: Optimized for high-frequency interaction with a depth that supports millions of concurrent nodes.

### 2.3 The Indexing Layer
- **VIBE Indexer**: A high-performance Rust/Node.js worker that monitors the Merkle Tree for `Mint` events.
- **GraphDB**: A Neo4j or DGraph instance that stores the adjacency list of wallet connections, enabling real-time traversals of the human connection graph.

---

## 3. Handshake Workflow (Cryptographic Sequence)

1. **Assertion**: User A broadcasts their Public Key via NFC or QR.
2. **Attestation**: User B captures the Public Key and initiates a Connection Request.
3. **Mutual Confirmation**: Both users authorize the interaction via their respective MWA providers.
4. **Transaction Construction**: A `MintToCollectionV1` instruction is built, encoding the following state:
    - **Wallet A**: Creator/Verifier 1
    - **Wallet B**: Creator/Verifier 2
    - **Geospatial Hash**: Salted GPS coordinates.
    - **Timestamp**: Network-validated time.
5. **On-Chain commitment**: The transaction is submitted to Solana.
6. **Graph Sync**: The Indexer updates the global social graph.

---

## 4. Scalability Logic

VIBE solves the "Cost of Connection" problem:
- **Standard NFT Mint**: ~0.01 SOL ($1.00+)
- **SOLTAG cNFT Mint**: ~0.000002 SOL ($0.0002)

This 5000x cost reduction is what makes global social infrastructure on-chain viable for the first time.

---

## 5. Security & Privacy

- **No Off-Chain PII**: No email, phone number, or name is required. Identity is purely cryptographic.
- **Location Privacy**: Coordinates are stored as low-precision or hashed values to prevent tracking while maintaining proximity proof.
- **Signature requirement**: Every connection requires valid signatures from both parties to prevent "ghost" connections.
