import { globalGraph } from './graph';

/**
 * VIBE PoC Indexer
 * 
 * This module is responsible for listening to the Metaplex Bubblegum tree
 * and indexing new Proof-of-Connection tokens.
 */

export const startIndexer = () => {
    console.log('VIBE Indexer: Subscribing to SOLTAG Protocol events...');

    // Simulation: High-density population of social graph for hackathon brilliance
    const seedWallets = Array.from({ length: 50 }, (_, i) => `vibe...user${i}`);

    // Generate a interconnected mesh
    seedWallets.forEach((w, i) => {
        const neighbors = [(i + 1) % 50, (i + 5) % 50, (i + 13) % 50];
        neighbors.forEach(nIdx => {
            globalGraph.addConnection(w, seedWallets[nIdx], {
                timestamp: Date.now() - Math.random() * 86400000,
                latitude: -6.1751 + (Math.random() - 0.5) * 2, // Distributed around Jakarta
                longitude: 106.8272 + (Math.random() - 0.5) * 2
            });
        });
    });

    console.log('VIBE Indexer: Social Graph Initialized with', globalGraph.getGlobalStats().totalUsers, 'nodes and global heatmap data.');
    console.log('VIBE Indexer: [DEMO MODE ACTIVE] Accepting simulated on-chain signatures.');
};

export const syncOfflineConnections = async (localConnections: any[]) => {
    console.log('VIBE Indexer: Syncing', localConnections.length, 'offline connections...');
    for (const conn of localConnections) {
        globalGraph.addConnection(conn.walletA, conn.walletB, conn);
    }
};

// Start if executed directly
startIndexer();
