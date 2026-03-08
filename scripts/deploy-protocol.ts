import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
    createTree,
    mplBubblegum
} from '@metaplex-foundation/mpl-bubblegum';
import {
    createNft,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';
import {
    createSignerFromKeypair,
    keypairIdentity,
    generateSigner,
    percentAmount,
    publicKey,
    sol
} from '@metaplex-foundation/umi';
import { Keypair as Web3Keypair } from '@solana/web3.js';
import * as fs from 'fs';

/**
 * VIBE Protocol Deployment Script
 */

async function deploy() {
    const RPC_ENDPOINT = 'https://api.devnet.solana.com';
    const umi = createUmi(RPC_ENDPOINT)
        .use(mplBubblegum())
        .use(mplTokenMetadata());

    // 1. Setup Signer using provided Private Key
    // User provided a 32-byte hex seed
    const hexSeed = '3ed7524b66da7ebedb2618692bdbf46ca3342b0aa931a1f79f7758ab651ecb41';
    const seed = Uint8Array.from(Buffer.from(hexSeed, 'hex'));

    // Derive Keypair from seed
    const web3Keypair = Web3Keypair.fromSeed(seed);
    const protocolAuthority = createSignerFromKeypair(umi, {
        publicKey: publicKey(web3Keypair.publicKey.toBytes()),
        secretKey: web3Keypair.secretKey,
    });

    umi.use(keypairIdentity(protocolAuthority));

    console.log('[VIBE Deploy] Protocol Authority:', protocolAuthority.publicKey.toString());
    console.log('[VIBE Deploy] Initializing deployment on Testnet...');

    // 1.5. Request Airdrop with robust retries
    try {
        let balance = await umi.rpc.getBalance(protocolAuthority.publicKey);
        if (balance.basisPoints === BigInt(0)) {
            console.log('[VIBE Deploy] Balance is 0. Attempting airdrop series...');
            const airdropAmounts = [sol(0.1), sol(0.05), sol(0.01)];
            let success = false;

            for (const amount of airdropAmounts) {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        console.log(`[VIBE Deploy] Requesting airdrop of ${amount.basisPoints} lamports (Attempt ${attempt})...`);
                        const sig = await umi.rpc.airdrop(protocolAuthority.publicKey, amount);
                        console.log('[VIBE Deploy] Airdrop signature:', sig);
                        success = true;
                        break;
                    } catch (e) {
                        const waitTime = attempt * 10000;
                        console.warn(`[VIBE Deploy] Airdrop attempt ${attempt} failed. Waiting ${waitTime / 1000}s...`);
                        await new Promise(r => setTimeout(r, waitTime));
                    }
                }
                if (success) break;
            }

            if (!success) {
                console.warn('[VIBE Deploy] All airdrop attempts failed. Faucet is heavily throttled.');
                console.log('[VIBE Deploy] PRO TIP: Manually send 0.1 SOL to', protocolAuthority.publicKey.toString(), 'on Devnet.');
            } else {
                await new Promise(r => setTimeout(r, 15000)); // Wait for commitment
            }
        }
    } catch (airdropError) {
        console.warn('[VIBE Deploy] Unexpected airdrop error:', airdropError);
    }

    try {
        // 2. Create the Collection Mint for PoC tokens
        const collectionMint = generateSigner(umi);
        console.log('[VIBE Deploy] Creating Collection Mint:', collectionMint.publicKey.toString());

        const nftBuilder = await createNft(umi, {
            mint: collectionMint,
            name: 'VIBE Protocol Collection',
            uri: 'https://vibe.social/metadata/collection.json',
            sellerFeeBasisPoints: percentAmount(0),
            isCollection: true,
        });
        await nftBuilder.sendAndConfirm(umi);

        // 3. Create the Merkle Tree for Compressed NFTs
        const merkleTree = generateSigner(umi);
        console.log('[VIBE Deploy] Creating Merkle Tree:', merkleTree.publicKey.toString());

        const treeBuilder = await createTree(umi, {
            merkleTree,
            maxDepth: 14,
            maxBufferSize: 64,
            public: true, // Allow anyone to mint (constrained by our app logic)
        });
        await treeBuilder.sendAndConfirm(umi);

        // 4. Output configuration
        const config = {
            BUBBLEGUM_TREE_ADDRESS: merkleTree.publicKey.toString(),
            COLLECTION_MINT: collectionMint.publicKey.toString(),
            PROTOCOL_AUTHORITY: protocolAuthority.publicKey.toString(),
            CLUSTER: 'testnet'
        };

        fs.writeFileSync('vibe-protocol-config.json', JSON.stringify(config, null, 2));

        console.log('\n[VIBE Deploy] DEPLOYMENT SUCCESSFUL!');
        console.log('-----------------------------------');
        console.log('MERKLE TREE:', config.BUBBLEGUM_TREE_ADDRESS);
        console.log('COLLECTION MINT:', config.COLLECTION_MINT);
        console.log('-----------------------------------');
        console.log('Update e:/000VSCODE PROJECT MULAI DARI DESEMBER 2025/VIBE/mobile/src/blockchain/bubblegum.ts with these addresses.');

    } catch (error) {
        console.error('[VIBE Deploy] Deployment failed:', error);
    }
}

deploy();
