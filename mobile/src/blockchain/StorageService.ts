import AsyncStorage from '@react-native-async-storage/async-storage';
import { PoCMetadata } from './mintPoC';

/**
 * StorageService
 * 
 * Manages local persistence for the VIBE Social Graph.
 * Supports both verified on-chain connections and pending offline handshakes.
 */

const STORAGE_KEY = '@vibe_connections';
const PENDING_KEY = '@vibe_pending_sync';

export interface SavedConnection extends PoCMetadata {
    signature: string;
    verified: boolean;
}

export class StorageService {
    /**
     * Saves a verified connection to local storage.
     *
     * DEDUPLICATION: A walletA+walletB pair (order-independent) is only stored once.
     * This prevents the connection list from showing duplicates if the user confirms
     * twice or if a sync retry fires after the entry was already saved.
     */
    static async saveConnection(connection: PoCMetadata & { signature: string }) {
        try {
            const existing = await this.getConnections();

            // Order-independent duplicate check: sort both wallet addresses to normalise the key.
            const newKey = [connection.walletA, connection.walletB].sort().join(':');
            const isDuplicate = existing.some(
                (c) => [c.walletA, c.walletB].sort().join(':') === newKey
            );
            if (isDuplicate) {
                console.log('[StorageService] Duplicate connection ignored:', newKey);
                return;
            }

            const updated: SavedConnection[] = [{ ...connection, verified: true }, ...existing];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[StorageService] Failed to save connection:', error);
        }
    }

    /**
     * Saves a pending connection (offline handshake) for future synchronization.
     */
    static async savePendingSync(metadata: PoCMetadata) {
        try {
            const existing = await this.getPendingSync();
            const updated = [metadata, ...existing];
            await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[StorageService] Failed to save pending sync:', error);
        }
    }

    /**
     * Retrieves all verified connections.
     */
    static async getConnections(): Promise<SavedConnection[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[StorageService] Failed to get connections:', error);
            return [];
        }
    }

    /**
     * Retrieves all pending connections awaiting on-chain minting.
     */
    static async getPendingSync(): Promise<PoCMetadata[]> {
        try {
            const data = await AsyncStorage.getItem(PENDING_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[StorageService] Failed to get pending sync:', error);
            return [];
        }
    }

    /**
     * Clears all pending connections after successful sync.
     */
    static async clearPending() {
        await AsyncStorage.removeItem(PENDING_KEY);
    }

    /**
     * Clears all data (Factory Reset).
     */
    static async clearAll() {
        await Promise.all([
            AsyncStorage.removeItem(STORAGE_KEY),
            AsyncStorage.removeItem(PENDING_KEY)
        ]);
    }
}
