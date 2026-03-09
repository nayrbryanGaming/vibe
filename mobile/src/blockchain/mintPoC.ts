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
 *
 * SIGNATURE BUG FIX: MWA signAndSendTransactions returns Uint8Array[] (raw signature bytes).
 * We convert these to a base64 string so they can safely be stored in AsyncStorage (JSON)
 * and displayed as text in the Connections screen without crashing .slice().
 */
export async function mintPoC(metadata: PoCMetadata): Promise<{ success: boolean; signature: string; data: PoCMetadata; isDemo?: boolean }> {
    const umi = getUmi();

    // HACKATHON FAIL-SAFE: If the address is a placeholder, return a mock success.
    if (BUBBLEGUM_TREE_ADDRESS.toString().startsWith('vibeT5XW')) {
        console.log('[mintPoC] Detected placeholder address — entering Demo Mode.');
        await new Promise<void>(resolve => setTimeout(resolve, 2000));
        return {
            success: true,
            signature: 'DEMO_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            data: metadata,
            isDemo: true,
        };
    }

    console.log('[mintPoC] Starting REAL mint for:', metadata.walletA, '↔', metadata.walletB);

    try {
        // Build the Bubblegum cNFT mint transaction via Umi.
        const txBuilder = mintToCollectionV1(umi, {
            leafOwner: publicKey(metadata.walletA),
            merkleTree: BUBBLEGUM_TREE_ADDRESS,
            collectionMint: COLLECTION_MINT,
            metadata: {
                name: 'VIBE Connection',
                symbol: 'VIBE',
                // URI should point to a server endpoint that serves dynamic JSON with walletB embedded.
                uri: `https://vibe.social/metadata/poc.json?b=${encodeURIComponent(metadata.walletB)}&ts=${metadata.timestamp}`,
                sellerFeeBasisPoints: 0,
                collection: { key: COLLECTION_MINT, verified: false },
                creators: [
                    { address: publicKey(metadata.walletA), verified: false, share: 100 },
                ],
            },
        });

        const signature = await transact(async (wallet: any) => {
            // Authorise once per transact session.
            await wallet.authorize({
                cluster: 'devnet',
                identity: { name: 'VIBE', uri: 'https://vibe.social' },
            });

            // Attach a fresh blockhash to prevent replay attacks.
            const { blockhash } = await umi.rpc.getLatestBlockhash({ commitment: 'confirmed' });

            const umiTx = txBuilder.setBlockhash(blockhash).build(umi);
            const web3jsTx = toWeb3JsTransaction(umiTx);

            // MWA signs and sends. Returns Uint8Array[] where each element is the
            // 64-byte Ed25519 signature corresponding to the transaction signature.
            const signatureBytes: readonly Uint8Array[] = await wallet.signAndSendTransactions({
                transactions: [web3jsTx],
            });

            // Convert raw signature bytes → base64 string for safe JSON serialisation.
            // base64 is used (over bs58) because Buffer is always available in RN.
            const sigBytes = signatureBytes[0];
            return Buffer.from(sigBytes).toString('base64');
        });

        console.log('[mintPoC] Successfully minted. Signature (base64):', signature);

        return { success: true, signature, data: metadata };
    } catch (error: any) {
        console.error('[mintPoC] Transaction failed:', error);
        throw error;
    }
}
