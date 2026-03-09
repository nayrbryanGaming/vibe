import { Platform } from 'react-native';

/**
 * VIBE Configuration
 */
// ⚠️  Physical device: update DEV_MACHINE_IP to match your laptop's local IP
//     Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
//     Emulator uses 10.0.2.2 (Android) / localhost (iOS Simulator).
const DEV_MACHINE_IP = '192.168.18.15';

export const CONFIG = {
    API_BASE_URL: Platform.OS === 'android'
        ? `http://${DEV_MACHINE_IP}:3000`   // physical Android device + emulator
        : `http://${DEV_MACHINE_IP}:3000`,  // physical iOS device (change to localhost for Simulator)

    // Solana Cluster
    CLUSTER: 'devnet',

    // Protocol Identity
    APP_IDENTITY: {
        name: 'VIBE',
        uri: 'https://vibe.social',
    }
};
