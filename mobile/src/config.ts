import { Platform } from 'react-native';

/**
 * VIBE Configuration
 */
export const CONFIG = {
    // For Android Emulator, use 10.0.2.2 to access the host's localhost.
    // For iOS Simulator or physical devices on the same network, use the host's IP.
    API_BASE_URL: Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000',

    // Solana Cluster
    CLUSTER: 'devnet',

    // Protocol Identity
    APP_IDENTITY: {
        name: 'VIBE',
        uri: 'https://vibe.social',
    }
};
