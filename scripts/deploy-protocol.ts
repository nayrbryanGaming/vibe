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
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * VIBE Protocol Deployment Script
 */

async function deploy() {
    console.log('[VIBE Deploy] Starting deployment script...');
    const RPC_ENDPOINT = 'https://api.devnet.solana.com';
    const umi = createUmi(RPC_ENDPOINT)
        .use(mplBubblegum())
        .use(mplTokenMetadata());

    console.log('[VIBE Deploy] RPC Endpoint:', RPC_ENDPOINT);

    // 1. Setup Signer — reads secret from environment variable (never hardcoded)
    const hexSeed = process.env.DEPLOY_AUTHORITY_HEX_SEED;
    if (!hexSeed || !/^[0-9a-fA-F]{64}$/.test(hexSeed)) {
        throw new Error(
            '[VIBE Deploy] DEPLOY_AUTHORITY_HEX_SEED is missing or invalid.\n' +
            'Create a .env file at the project root with:\n' +
            '  DEPLOY_AUTHORITY_HEX_SEED=<your 32-byte hex seed>'
        );
    }
    const seed = Uint8Array.from(Buffer.from(hexSeed, 'hex'));

    console.log('[VIBE Deploy] Deriving keypair...');
    // Derive Keypair from seed
    const web3Keypair = Web3Keypair.fromSeed(seed);
    const protocolAuthority = createSignerFromKeypair(umi, {
        publicKey: publicKey(web3Keypair.publicKey.toBytes()),
        secretKey: web3Keypair.secretKey,
    });

    umi.use(keypairIdentity(protocolAuthority));

    console.log('[VIBE Deploy] Protocol Authority:', protocolAuthority.publicKey.toString());
    console.log('[VIBE Deploy] Initializing deployment on DEVNET...');

    // 1.5. Check balance and notify
    try {
        let balance = await umi.rpc.getBalance(protocolAuthority.publicKey);
        console.log(`[VIBE Deploy] Current Balance: ${balance.basisPoints} lamports`);

        if (balance.basisPoints < BigInt(50000000)) {
            console.log('[VIBE Deploy] Low balance. Attempting airdrop as fallback...');
            try {
                await umi.rpc.airdrop(protocolAuthority.publicKey, sol(1));
                console.log('[VIBE Deploy] Airdrop requested.');
                await new Promise(r => setTimeout(r, 10000));
                balance = await umi.rpc.getBalance(protocolAuthority.publicKey);
            } catch (e) {
                console.warn('[VIBE Deploy] Airdrop failed. Using existing balance.');
            }
        }
    } catch (e) {
        console.warn('[VIBE Deploy] Balance check error:', e);
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
            public: true,
        });
        await treeBuilder.sendAndConfirm(umi);

        // 4. Output configuration
        const config = {
            BUBBLEGUM_TREE_ADDRESS: merkleTree.publicKey.toString(),
            COLLECTION_MINT: collectionMint.publicKey.toString(),
            PROTOCOL_AUTHORITY: protocolAuthority.publicKey.toString(),
            CLUSTER: 'devnet'
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
