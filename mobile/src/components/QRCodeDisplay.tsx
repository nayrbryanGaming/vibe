import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface Props {
    address: string;
    size?: number;
}

/**
 * QRCodeDisplay Component
 * Renders a Solana wallet address as a QR code with premium SOLTAG styling.
 */
const QRCodeDisplay: React.FC<Props> = ({ address, size = 200 }) => {
    return (
        <View style={styles.container}>
            <View style={styles.qrWrapper}>
                <QRCode
                    value={address}
                    size={size}
                    color="#FFF"
                    backgroundColor="transparent"
                />
            </View>
            <View style={styles.addressLabel}>
                <Text style={styles.addressText}>
                    {address.slice(0, 4)}...{address.slice(-4)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrWrapper: {
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    addressLabel: {
        marginTop: 24,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    addressText: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});

export default QRCodeDisplay;
