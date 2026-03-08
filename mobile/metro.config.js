const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
    resolver: {
        extraNodeModules: require('node-libs-browser'),
        // Explicitly handle node-libs-browser for Solana/Metaplex
        alias: {
            'crypto': path.resolve(__dirname, 'node_modules/react-native-crypto'),
            'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
            'buffer': path.resolve(__dirname, 'node_modules/buffer'),
            'vm': path.resolve(__dirname, 'node_modules/vm-browserify'),
        }
    },
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
