import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import NFCService from '../blockchain/NFCService';

interface Props {
    address: string;
    onPeerFound: (peerAddress: string) => void;
}

/**
 * NFCHandshake Component
 * Handles broadcasting the user's address and scanning for peers via NFC with a premium UI.
 */
const NFCHandshake: React.FC<Props> = ({ address, onPeerFound }) => {
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isScanning || isBroadcasting) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }

        return () => {
            NFCService.stop();
        };
    }, [isScanning, isBroadcasting]);

    const startHandshake = async () => {
        try {
            setIsBroadcasting(true);
            setIsScanning(true);

            await NFCService.broadcastAddress(address);

            await NFCService.scanPeer((peerAddress) => {
                setIsScanning(false);
                setIsBroadcasting(false);
                onPeerFound(peerAddress);
            });
        } catch (error) {
            Alert.alert('NFC Unavailable', 'Please ensure NFC is enabled in your device settings.');
            setIsScanning(false);
            setIsBroadcasting(false);
        }
    };

    const stopHandshake = () => {
        NFCService.stop();
        setIsScanning(false);
        setIsBroadcasting(false);
    };

    return (
        <View style={styles.container}>
            {isScanning || isBroadcasting ? (
                <View style={styles.activeContainer}>
                    <LinearGradient
                        colors={['rgba(20, 241, 149, 0.1)', 'rgba(153, 69, 255, 0.05)']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <ActivityIndicator size="large" color="#14F195" />
                    </Animated.View>

                    <Text style={styles.statusText}>SIGNAL BROADCASTING</Text>
                    <Text style={styles.subStatus}>TAP PHONES TO EXCHANGE VIBE</Text>

                    <TouchableOpacity style={styles.cancelButton} onPress={stopHandshake}>
                        <Text style={styles.cancelText}>ABORT SESSION</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity activeOpacity={0.8} style={styles.tapButtonWrapper} onPress={startHandshake}>
                    <LinearGradient
                        colors={['#9945FF', '#14F195']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tapButton}
                    >
                        <Text style={styles.tapText}>ESTABLISH NFC LINK</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    tapButtonWrapper: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#14F195',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    tapButton: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tapText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 2,
    },
    activeContainer: {
        width: '100%',
        padding: 40,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(20, 241, 149, 0.3)',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    pulseCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    statusText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 4,
    },
    subStatus: {
        color: '#14F195',
        marginTop: 10,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    cancelButton: {
        marginTop: 30,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    cancelText: {
        color: '#FF3B30',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
    }
});

export default NFCHandshake;
