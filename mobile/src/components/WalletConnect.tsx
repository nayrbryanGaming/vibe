import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey } from '@solana/web3.js';

const APP_IDENTITY = {
    name: 'VIBE',
    uri: 'https://vibe.social',
    icon: 'favicon.ico', // Reference to icon in public/assets or remote
};

const WalletConnect = ({ onConnect }: { onConnect: (address: string | null) => void }) => {
    const [address, setAddress] = useState<string | null>(null);

    const connectWallet = useCallback(async () => {
        try {
            const result = await transact(async (wallet: any) => {
                const authorizationResult = await wallet.authorize({
                    cluster: 'devnet',
                    identity: APP_IDENTITY,
                });

                return authorizationResult;
            });

            // MWA v2 returns Base64EncodedAddress (raw bytes in base64), NOT base58.
            // Convert: base64 bytes → PublicKey → base58 Solana address.
            const rawAddress = result.accounts[0].address;
            const solanaAddress = new PublicKey(Buffer.from(rawAddress, 'base64')).toBase58();
            setAddress(solanaAddress);
            onConnect(solanaAddress);
            Alert.alert('Success', `Connected to ${solanaAddress.slice(0, 8)}...`);
        } catch (error: any) {
            console.error('Wallet connection failed:', error);
            Alert.alert('Error', error?.message || 'Failed to connect wallet');
        }
    }, [onConnect]);

    const disconnect = useCallback(() => {
        setAddress(null);
        onConnect(null);
    }, [onConnect]);

    return (
        <View style={styles.container}>
            {address ? (
                <View style={styles.connectedBox}>
                    <Text style={styles.addressText}>
                        Connected: {address.slice(0, 4)}...{address.slice(-4)}
                    </Text>
                    <TouchableOpacity
                        style={styles.buttonSecondary}
                        onPress={disconnect}
                    >
                        <Text style={styles.buttonText}>Disconnect</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.buttonPrimary} onPress={connectWallet}>
                    <Text style={styles.buttonText}>Connect Solana Wallet</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 20,
    },
    buttonPrimary: {
        backgroundColor: '#14F195', // Solana Green
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#14F195',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonSecondary: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    connectedBox: {
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#14F195',
        alignItems: 'center',
    },
    addressText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default WalletConnect;
