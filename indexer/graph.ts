/**
 * VIBE Social Graph Logic
 * 
 * Handles traversals and relationship queries for the decentralized 
 * human connection network.
 */

export interface ConnectionNode {
    wallet: string;
    connections: Set<string>;
    metadata: any[];
}

export class SocialGraph {
    private nodes: Map<string, ConnectionNode> = new Map();

    addConnection(walletA: string, walletB: string, metadata: any) {
        if (!this.nodes.has(walletA)) {
            this.nodes.set(walletA, { wallet: walletA, connections: new Set(), metadata: [] });
        }
        if (!this.nodes.has(walletB)) {
            this.nodes.set(walletB, { wallet: walletB, connections: new Set(), metadata: [] });
        }

        // DEDUPLICATION: Since we always add both directions (A→B and B→A),
        // checking one direction is sufficient to detect any duplicate attempt.
        if (this.nodes.get(walletA)!.connections.has(walletB)) {
            return; // Connection already exists — do not re-add or double-count heatmap data.
        }

        this.nodes.get(walletA)!.connections.add(walletB);
        this.nodes.get(walletB)!.connections.add(walletA);
        // Metadata (including GPS coordinates) is stored once on walletA to avoid heatmap duplication.
        this.nodes.get(walletA)!.metadata.push(metadata);
    }

    getConnections(wallet: string): string[] {
        return Array.from(this.nodes.get(wallet)?.connections || []);
    }

    /**
     * BFS implementation to find degrees of separation between two people.
     */
    getDegreesOfSeparation(startWallet: string, targetWallet: string): number {
        if (startWallet === targetWallet) return 0;
        if (!this.nodes.has(startWallet) || !this.nodes.has(targetWallet)) return -1;

        const queue: [string, number][] = [[startWallet, 0]];
        const visited = new Set<string>([startWallet]);

        while (queue.length > 0) {
            const [currentPath, distance] = queue.shift()!;

            if (currentPath === targetWallet) return distance;

            const neighbors = this.nodes.get(currentPath)?.connections || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, distance + 1]);
                }
            }
        }

        return -1; // No connection found
    }

    getHeatmapData(): { latitude: number, longitude: number, timestamp: number }[] {
        const heatmap: { latitude: number, longitude: number, timestamp: number }[] = [];
        for (const node of this.nodes.values()) {
            for (const meta of node.metadata) {
                if (meta.latitude && meta.longitude) {
                    heatmap.push({
                        latitude: meta.latitude,
                        longitude: meta.longitude,
                        timestamp: meta.timestamp
                    });
                }
            }
        }
        return heatmap;
    }

    getGlobalStats() {
        return {
            totalUsers: this.nodes.size,
            totalConnections: Array.from(this.nodes.values()).reduce((acc, node) => acc + node.connections.size, 0) / 2
        };
    }
}

export const globalGraph = new SocialGraph();
