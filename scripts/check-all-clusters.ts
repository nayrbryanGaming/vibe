import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

async function check() {
    const address = new PublicKey('C3otspAauyPNbAx9NA4wkH7P8hxhxhb1dyfqzhSmzaj9');
    const clusters = ['mainnet-beta', 'testnet', 'devnet'];

    for (const cluster of clusters) {
        try {
            const conn = new Connection(clusterApiUrl(cluster as any));
            const bal = await conn.getBalance(address);
            console.log(`Balance on ${cluster}:`, bal / 1e9, 'SOL');
        } catch (e) {
            console.log(`Error checking ${cluster}`);
        }
    }
}

check();
