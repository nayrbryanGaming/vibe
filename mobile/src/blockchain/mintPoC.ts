import { getUmi, BUBBLEGUM_TREE_ADDRESS, COLLECTION_MINT } from './bubblegum';
import { mintToCollectionV1 } from '@metaplex-foundation/mpl-bubblegum';
import { publicKey } from '@metaplex-foundation/umi';
import { toWeb3JsTransaction } from '@metaplex-foundation/umi-web3js-adapters';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

export interface PoCMetadata {
    walletA: string;
    walletB: string;
    timestamp: number;
    latitude: number;
    longitude: number;
    eventId?: string;
}

/**
 * Mints a Proof-of-Connection token using Metaplex Bubblegum.
 * This function handles the bridge between Umi and Web3.js for MWA support.
 */
export async function mintPoC(metadata: PoCMetadata) {
    const umi = getUmi();

    // HACKATHON FAIL-SAFE: If the address is a placeholder, return a mock success
    if (BUBBLEGUM_TREE_ADDRESS.toString().startsWith('vibeT5XW')) {
        console.log('[mintPoC] Detected placeholder address, entering Demo Mode.');
        await new Promise<void>(resolve => setTimeout(resolve, 2000)); // Simulate chain latency
        return {
            success: true,
            signature: 'DEMO_' + Math.random().toString(36).substring(7),
            data: metadata,
            isDemo: true
        };
    }

    console.log('[mintPoC] Starting REAL mint process for:', metadata.walletA, 'and', metadata.walletB);

    try {
        // 1. Build the transaction using Bubblegum SDK (Umi implementation)
        const txBuilder = mintToCollectionV1(umi, {
            leafOwner: publicKey(metadata.walletA),
            merkleTree: BUBBLEGUM_TREE_ADDRESS,
            collectionMint: COLLECTION_MINT,
            metadata: {
                name: `VIBE Connection`,
                symbol: 'VIBE',
                uri: 'https://vibe.social/metadata/poc.json',
                sellerFeeBasisPoints: 0,
                collection: { key: COLLECTION_MINT, verified: false },
                creators: [
                    { address: publicKey(metadata.walletA), verified: false, share: 100 },
                ],
            },
        });

        // 2. Perform transaction through Mobile Wallet Adapter
        const signature = await transact(async (wallet: any) => {
            // Re-authorize to ensure we have the correct accounts
            await wallet.authorize({
                cluster: 'devnet',
                identity: { name: 'VIBE', uri: 'https://vibe.social' }
            });

            // 3. Ensure transaction has a fresh blockhash
            const { blockhash } = await umi.rpc.getLatestBlockhash({ commitment: 'confirmed' });

            // 4. Build unsigned Umi transaction and convert to Web3.js format
            const umiTx = txBuilder.setBlockhash(blockhash).build(umi);
            const web3jsTx = toWeb3JsTransaction(umiTx);

            // 5. MWA signs and sends the transaction
            const signedTransactions = await wallet.signAndSendTransactions({
                transactions: [web3jsTx],
            });

            return signedTransactions[0];
        });

        console.log('[mintPoC] Successfully minted. Signature:', signature);

        return {
            success: true,
            signature,
            data: metadata
        };
    } catch (error: any) {
        console.error('[mintPoC] Transaction failed:', error);
        throw error;
    }
}
