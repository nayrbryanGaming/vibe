import { Keypair } from '@solana/web3.js';

const hexSeed = '3ed7524b66da7ebedb2618692bdbf46ca3342b0aa931a1f79f7758ab651ecb41';
const seed = Uint8Array.from(Buffer.from(hexSeed, 'hex'));

// 1. Check fromSeed
const kp1 = Keypair.fromSeed(seed);
console.log('Derived via fromSeed(32 bytes):', kp1.publicKey.toBase58());

// 2. Check fromSecretKey (if it was a 64-byte key but only first 32 provided?)
// Unlikely, usually it's either 64 bytes or 32 bytes seed.

// 3. Check if it's a hex representation of the 64-byte secret key (seed + pubkey)
// hexSeed is 64 characters = 32 bytes. So it's a seed or a very short secret key.
try {
    const kp2 = Keypair.fromSecretKey(seed);
    console.log('Derived via fromSecretKey(32 bytes - unlikely):', kp2.publicKey.toBase58());
} catch (e) { }
