import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import process from 'process';
import { TextEncoder, TextDecoder } from 'text-encoding';

global.Buffer = Buffer;
global.process = process;
global.process.env = {
    NODE_ENV: 'development',
};

// Metaplex Umi and @solana/web3.js require TextEncoder/Decoder and Crypto
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// polyfill crypto for @solana/web3.js and Metaplex
if (typeof global.crypto === 'undefined') {
    global.crypto = require('react-native-get-random-values');
}
