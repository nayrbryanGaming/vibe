import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

// Convert hex private key to secret key array
const hexKey = '3ed7524b66da7ebedb2618692bdbf46ca3342b0aa931a1f79f7758ab651ecb41';
const secretKey = Uint8Array.from(Buffer.from(hexKey, 'hex'));
const keypair = Keypair.fromSecretKey(secretKey);

fs.writeFileSync('deployer-key.json', JSON.stringify(Array.from(secretKey)));
console.log('Deployer public key:', keypair.publicKey.toBase58());
