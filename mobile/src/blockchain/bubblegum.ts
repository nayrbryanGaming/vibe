import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import { publicKey, Signer, signerIdentity } from '@metaplex-foundation/umi';

/**
 * Solana RPC Endpoint - Defaults to Devnet for the Hackathon.
 */
const RPC_ENDPOINT = 'https://api.testnet.solana.com';

/**
 * Returns a configured Umi instance.
 * @param signer Optional signer to identify the user (can be bridged from MWA).
 */
export const getUmi = (signer?: Signer) => {
    const umi = createUmi(RPC_ENDPOINT).use(mplBubblegum());

    if (signer) {
        umi.use(signerIdentity(signer));
    }

    return umi;
};

/**
 * VIBE Protocol Configuration
 * 
 * IMPORTANT: These must be pre-created Merkle Trees and Collections on Devnet/Mainnet.
 * Run `npx ts-node scripts/deploy-protocol.ts` to generate new addresses, 
 * then replace the values below with the script's output.
 */
// Replace with output from deployment script
export const BUBBLEGUM_TREE_ADDRESS = publicKey('vibeT5XWJm2fP6XrjV6L1eHPr1P1P1P1P1P1P1P1');
export const COLLECTION_MINT = publicKey('vibeC4k1vXfP6XrjV6L1eHPr1P1P1P1P1P1P1P1');
