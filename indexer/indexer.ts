import { globalGraph } from './graph';

/**
 * VIBE PoC Indexer
 * 
 * This module is responsible for listening to the Metaplex Bubblegum tree
 * and indexing new Proof-of-Connection tokens.
 */

export const startIndexer = () => {
    console.log('VIBE Indexer: Subscribing to SOLTAG Protocol events...');

    // Simulation: Population of social graph with seed data
    const seedWallets = [
        'vibe...alice',
        'vibe...bob',
        'vibe...charlie',
        'vibe...david'
    ];

    globalGraph.addConnection(seedWallets[0], seedWallets[1], { timestamp: Date.now() });
    globalGraph.addConnection(seedWallets[1], seedWallets[2], { timestamp: Date.now() });
    globalGraph.addConnection(seedWallets[2], seedWallets[3], { timestamp: Date.now() });

    console.log('VIBE Indexer: Social Graph Initialized with', globalGraph.getGlobalStats().totalUsers, 'nodes.');
};

export const syncOfflineConnections = async (localConnections: any[]) => {
    console.log('VIBE Indexer: Syncing', localConnections.length, 'offline connections...');
    for (const conn of localConnections) {
        globalGraph.addConnection(conn.walletA, conn.walletB, conn);
    }
};

// Start if executed directly
startIndexer();
