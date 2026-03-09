import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

async function airdrop() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const pk = new PublicKey('C3otspAauyPNbAx9NA4wkH7P8hxhxhb1dyfqzhSmzaj9');

    console.log('[Airdrop] Wallet:', pk.toBase58());

    // Check current balance
    const balBefore = await connection.getBalance(pk);
    console.log('[Airdrop] Balance before:', balBefore / LAMPORTS_PER_SOL, 'SOL');

    if (balBefore >= 1 * LAMPORTS_PER_SOL) {
        console.log('[Airdrop] Already funded — skipping.');
        return;
    }

    // Try up to 3 times (devnet rate limits)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`[Airdrop] Attempt ${attempt}/3...`);
            const sig = await connection.requestAirdrop(pk, 2 * LAMPORTS_PER_SOL);
            console.log('[Airdrop] Signature:', sig);
            await connection.confirmTransaction(sig, 'confirmed');
            const balAfter = await connection.getBalance(pk);
            console.log('[Airdrop] Balance after:', balAfter / LAMPORTS_PER_SOL, 'SOL');
            console.log('[Airdrop] ✅ Success!');
            return;
        } catch (e: any) {
            console.warn(`[Airdrop] Attempt ${attempt} failed:`, e.message);
            if (attempt < 3) {
                console.log('[Airdrop] Waiting 5s before retry...');
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }

    console.error('[Airdrop] All attempts failed.');
    console.log('[Airdrop] Manual option: go to https://faucet.solana.com and enter:');
    console.log('  C3otspAauyPNbAx9NA4wkH7P8hxhxhb1dyfqzhSmzaj9');
}

airdrop().catch(console.error);
