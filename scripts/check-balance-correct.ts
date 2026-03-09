import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

async function check() {
    const address = new PublicKey('C3otspAauyPNbAx9NA4wkH7P8hxhxhb1dyfqzhSmzaj9');
    const devnet = new Connection(clusterApiUrl('devnet'));

    try {
        const balD = await devnet.getBalance(address);
        console.log('Balance on Devnet (Smzaj9):', balD / 1e9, 'SOL');
    } catch (e) {
        console.log('Error checking Devnet');
    }
}

check();
