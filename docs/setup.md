# VIBE | Engineering Setup Guide

Follow these instructions to establish a production-grade development environment for the VIBE Mobile Application and the SOLTAG Protocol.

---

## 1. Environment Prerequisites

### 1.1 Core Tooling
- **Node.js**: v18.17.0 or higher (LTS recommended)
- **NPM**: v9.x or higher
- **Java Development Kit (JDK)**: v17 (Required for Android build)
- **Android Studio**: Arctic Fox or newer (for Android SDK, Build Tools, and Emulator)
- **Xcode**: 15.0+ (Only required for iOS development)

### 1.2 Solana Tooling
- **Solana Mobile Stack (SMS)**: Follow the [Official SMS Guide](https://docs.solanamobile.com/getting-started/overview) to set up the Android environment.
- **Physical Device**: A DevKit or Saga phone is recommended for NFC testing. Alternatively, use an Android Emulator with `adb` NFC simulation enabled.

---

## 2. Installation Sequence

### 2.1 Repository Setup
```bash
git clone https://github.com/nayrbryanGaming/vibe.git
cd vibe/mobile
```

### 2.2 Frontend Hydration
Navigate to the mobile directory and install dependencies:
```bash
cd mobile
npm install --legacy-peer-deps
```

### 2.3 Standalone Backend Setup
Navigate to the root directory and install backend dependencies:
```bash
cd ..
npm install
```
This ensures the Express API and Graph Indexer are ready to run concurrently.

---

## 3. Configuration

### 3.1 Network Selection
By default, VIBE is configured for **Solana Testnet** (for final hackathon deployment). To modify the RPC endpoint, update `src/blockchain/bubblegum.ts`:

```typescript
const RPC_ENDPOINT = 'https://api.testnet.solana.com';
```

### 3.2 Wallet Provider
Install a Solana-compatible mobile wallet (e.g., **Phantom** or **Solflare**) on your test device to enable the Mobile Wallet Adapter (MWA) handshake. Ensure the wallet is set to the same network (Testnet/Devnet).

---

## 4. Execution

### 4.1 Backend Services
Start the Global API and Indexer from the project root:
```bash
npm run dev
```

### 4.2 Mobile Metro Bundler
In a new terminal, navigate back to `mobile/`:
```bash
cd mobile
npm run start
```

### 4.3 Build & Run Mobile
In a third terminal:

**Android Emulator/Device:**
```bash
npm run android
```

**iOS Simulator:**
```bash
npm run ios
```

---

## 5. Build Troubleshooting

### 5.1 Common Issues
- **Missing Polyfills**: VIBE requires `text-encoding` and `buffer` polyfills for Web3 compatibility. These are automatically integrated in `index.js`.
- **MWA Connection Refused**: Ensure the wallet app is open and set to the correct network (Devnet).
- **NFC Permissions**: AndroidManifest.xml must include `android.permission.NFC`. This project ships with these permissions pre-configured.

---

## 6. Testing Protocol

Run the following regression suite before submission:
```bash
npm test # Execute unit tests for blockchain logic
npx tsc --noEmit # Verify type integrity
```

Validated for **Solana Monolith Hackathon 2024**.
