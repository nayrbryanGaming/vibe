import React, { useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { mintPoC } from '../blockchain/mintPoC';
import { StorageService } from '../blockchain/StorageService';
import { CONFIG } from '../config';

const { width } = Dimensions.get('window');

const ConfirmConnection = ({ route, navigation }: any) => {
    const { targetAddress, myAddress } = route.params;
    const [isMinting, setIsMinting] = useState(false);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });

    // Premium Animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        (async () => {
            const res = await request(
                Platform.OS === 'ios'
                    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            );

            if (res === RESULTS.GRANTED) {
                Geolocation.getCurrentPosition(
                    (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => console.warn('Location error:', err),
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            }
        })();
    }, []);

    const handleConfirm = async () => {
        setIsMinting(true);
        try {
            const res = await mintPoC({
                walletA: myAddress,
                walletB: targetAddress,
                timestamp: Date.now(),
                latitude: location.lat,
                longitude: location.lng,
            });

            if (res.success) {
                const connectionData = { ...res.data, signature: res.signature };
                await StorageService.saveConnection(connectionData);

                fetch(`${CONFIG.API_BASE_URL}/api/connections`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(connectionData),
                }).catch(() => { });

                Alert.alert('VIBE Secured!', 'Connection minted successfully.', [
                    { text: 'Awesome', onPress: () => navigation.navigate('Home') }
                ]);
            }
        } catch (error) {
            await StorageService.savePendingSync({
                walletA: myAddress,
                walletB: targetAddress,
                timestamp: Date.now(),
                latitude: location.lat,
                longitude: location.lng,
            });
            Alert.alert('Offline Handshake', 'Sync will occur automatically when online.', [{ text: 'OK', onPress: () => navigation.navigate('Home') }]);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F0F', '#050505', '#12051E']} style={StyleSheet.absoluteFill} />

            <Animated.ScrollView
                contentContainerStyle={styles.content}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.topLabel}>PROTOCOL HANDSHAKE</Text>
                <Text style={styles.title}>Secure Connection</Text>

                <View style={styles.glassCard}>
                    <Text style={styles.cardLabel}>TARGET NODE</Text>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressText}>{targetAddress.slice(0, 16)}...</Text>
                        <Text style={[styles.addressText, { fontSize: 14, opacity: 0.5 }]}>{targetAddress.slice(-16)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.locRow}>
                        <View>
                            <Text style={styles.cardLabel}>LATITUDE</Text>
                            <Text style={styles.locValue}>{location.lat.toFixed(6)}°N</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.cardLabel}>LONGITUDE</Text>
                            <Text style={styles.locValue}>{location.lng.toFixed(6)}°E</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.disclaimer}>
                    Connections are minted as compressed NFTs on Solana. This action is immutable and establishes a permanent node in your social graph.
                </Text>

                {isMinting ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#14F195" />
                        <Text style={styles.loadingText}>MINTING ON SOLANA...</Text>
                        <Text style={styles.loadingSub}>Constructing proof & broadcasting txn</Text>
                    </View>
                ) : (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.cancelTxt}>CANCEL</Text>
                        </TouchableOpacity>

                        <Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                                <LinearGradient colors={['#9945FF', '#7935DF']} style={styles.btnGradient}>
                                    <Text style={styles.confirmTxt}>CONFIRM</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                )}
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        padding: 24,
        paddingTop: 80,
        paddingBottom: 60,
    },
    topLabel: {
        color: '#9945FF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 3,
        textAlign: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 2,
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 30,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 32,
    },
    cardLabel: {
        color: '#14F195',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 12,
    },
    addressContainer: {
        marginBottom: 30,
    },
    addressText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
    },
    locRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    locValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    disclaimer: {
        color: '#555',
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        paddingHorizontal: 20,
        marginBottom: 60,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
    },
    cancelBtn: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cancelTxt: {
        color: '#FF3B30',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
    },
    confirmBtn: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    btnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmTxt: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 2,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        color: '#14F195',
        marginTop: 20,
        fontWeight: '900',
        letterSpacing: 2,
        fontSize: 14,
    },
    loadingSub: {
        color: '#444',
        fontSize: 12,
        marginTop: 4,
    }
});

export default ConfirmConnection;
