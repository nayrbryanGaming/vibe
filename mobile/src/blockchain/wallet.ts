import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

/**
 * Get a connection instance to the Solana cluster.
 */
export const getSolanaConnection = (cluster: 'mainnet-beta' | 'devnet' = 'devnet') => {
    return new Connection(clusterApiUrl(cluster), 'confirmed');
};

/**
 * Validate if a string is a valid Solana public key.
 */
export const isValidPublicKey = (key: string) => {
    try {
        new PublicKey(key);
        return true;
    } catch (e) {
        return false;
    }
};
