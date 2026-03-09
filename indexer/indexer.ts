import { globalGraph } from './graph';
import { saveConnection } from '../server/persistence';

/**
 * VIBE PoC Indexer
 *
 * This module is responsible for listening to the Metaplex Bubblegum tree
 * and indexing new Proof-of-Connection tokens.
 */

/**
 * Seeds demo data into PostgreSQL and the in-memory graph.
 * Called only when the connections table is empty (first boot).
 */
export const startIndexer = async (): Promise<void> => {
    console.log('VIBE Indexer: Subscribing to SOLTAG Protocol events...');

    // Simulation: 50 fake users arranged in an interconnected mesh around Jakarta
    const seedWallets = Array.from({ length: 50 }, (_, i) => `vibe...user${i}`);

    for (let i = 0; i < seedWallets.length; i++) {
        const w = seedWallets[i];
        const neighbors = [(i + 1) % 50, (i + 5) % 50, (i + 13) % 50];
        for (const nIdx of neighbors) {
            const meta = {
                timestamp: Date.now() - Math.random() * 86400000,
                latitude: -6.1751 + (Math.random() - 0.5) * 2,
                longitude: 106.8272 + (Math.random() - 0.5) * 2,
            };
            const saved = await saveConnection({
                walletA: w,
                walletB: seedWallets[nIdx],
                ...meta,
                signature: null,
                eventId: 'demo-seed',
            });
            if (saved) {
                globalGraph.addConnection(w, seedWallets[nIdx], meta);
            }
        }
    }

    console.log('VIBE Indexer: Social Graph Initialized with', globalGraph.getGlobalStats().totalUsers, 'nodes and global heatmap data.');
    console.log('VIBE Indexer: [DEMO MODE ACTIVE] Accepting simulated on-chain signatures.');
};

export const syncOfflineConnections = async (localConnections: any[]): Promise<void> => {
    console.log('VIBE Indexer: Syncing', localConnections.length, 'offline connections...');
    for (const conn of localConnections) {
        if (conn.walletA && conn.walletB) {
            await saveConnection(conn);
            globalGraph.addConnection(conn.walletA, conn.walletB, conn);
        }
    }
};

// Only auto-execute when run directly as a process, not when imported as a module.
if (require.main === module) {
    startIndexer().catch(console.error);
}
