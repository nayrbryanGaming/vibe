import { StorageService } from './StorageService';
import { mintPoC } from './mintPoC';
import { CONFIG } from '../config';

/**
 * SyncService
 * 
 * Handles background synchronization of pending (offline) connections.
 * Attempts to mint cNFTs for handshakes that occurred while the user was offline.
 */
export class SyncService {
    private static isSyncing = false;

    /**
     * Attempts to synchronize all pending connections.
     */
    static async syncPendingConnections() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            const pending = await StorageService.getPendingSync();
            if (pending.length === 0) return;

            console.log(`[SyncService] ${pending.length} pending items found.`);
            const successfulIndices: number[] = [];

            for (let i = 0; i < pending.length; i++) {
                const item = pending[i];
                try {
                    // MWA requires user presence/interaction. 
                    // This will trigger a popup on the mobile device.
                    const res = await mintPoC(item);

                    if (res.success) {
                        const verifiedData = { ...res.data, signature: res.signature };
                        await StorageService.saveConnection(verifiedData);

                        await fetch(`${CONFIG.API_BASE_URL}/api/connections`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(verifiedData),
                        });

                        successfulIndices.push(i);
                    }
                } catch (err) {
                    // If user cancels or wallet is not found, we stop the loop to avoid spam
                    console.warn('[SyncService] Sync interrupted or failed for item:', item.walletB);
                    break;
                }
            }

            // Remove only the successful ones
            if (successfulIndices.length > 0) {
                const updatedPending = pending.filter((_, idx) => !successfulIndices.includes(idx));
                await StorageService.clearPending();
                for (const remaining of updatedPending) {
                    await StorageService.savePendingSync(remaining);
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Starts a periodic sync check but only runs when app is in active use.
     */
    static startAutoSync() {
        // Reduced frequency to avoid user annoyance
        setInterval(() => this.syncPendingConnections(), 300000); // 5 minutes
    }
}
