import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import WalletConnect from '../components/WalletConnect';
import NFCHandshake from '../components/NFCHandshake';

const { width } = Dimensions.get('window');

const Home = ({ navigation }: any) => {
    const [address, setAddress] = useState<string | null>(null);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                ])
            )
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F0F0F', '#050505', '#1A0A2A']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>VIBE</Animated.Text>
                <View style={styles.badgeContainer}>
                    <Text style={styles.subtitle}>SOLTAG Protocol</Text>
                </View>
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.content}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Magic handshakes meet the Solana blockchain. Connect, Tap, and Mint your real-world social graph.
                </Text>

                {/* Wallet Connection Section */}
                <View style={styles.sectionCard}>
                    <WalletConnect onConnect={setAddress} />
                </View>

                {/* NFC Handshake Section */}
                {address && (
                    <Animated.View style={[styles.sectionCard, { transform: [{ scale: pulseAnim }] }]}>
                        <NFCHandshake
                            address={address}
                            onPeerFound={(peer) => navigation.navigate('ConfirmConnection', { targetAddress: peer, myAddress: address })}
                        />
                    </Animated.View>
                )}

                <View style={styles.featureGrid}>
                    <TouchableOpacity
                        style={styles.glassCard}
                        onPress={() => address ? navigation.navigate('ShowQR', { address }) : Alert.alert('Connect Wallet', 'Please connect your wallet first.')}
                    >
                        <LinearGradient colors={['#2A2A2A', '#1A1A1A']} style={styles.cardGradient}>
                            <Text style={styles.cardEmoji}>📱</Text>
                            <Text style={styles.cardText}>Show My VIBE</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.glassCard}
                        onPress={() => address
                            ? navigation.navigate('Scan', { myAddress: address })
                            : Alert.alert('Connect Wallet', 'Please connect your wallet before scanning.')}
                    >
                        <LinearGradient colors={['#2A2A2A', '#1A1A1A']} style={styles.cardGradient}>
                            <Text style={styles.cardEmoji}>🔍</Text>
                            <Text style={styles.cardText}>Scan VIBE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Organizer Tools */}
                {address && (
                    <View style={styles.organizerSection}>
                        <View style={styles.organizerDivider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.organizerLabel}>ORGANIZER TOOLS</Text>
                            <View style={styles.dividerLine} />
                        </View>
                        <TouchableOpacity
                            style={styles.organizerCard}
                            onPress={() => navigation.navigate('CreateEvent', { myAddress: address })}
                            activeOpacity={0.82}
                        >
                            <LinearGradient colors={['rgba(20,241,149,0.12)', 'rgba(20,241,149,0.04)']} style={styles.organizerCardGradient}>
                                <Text style={styles.organizerCardEmoji}>🎪</Text>
                                <View style={styles.organizerCardTextWrapper}>
                                    <Text style={styles.organizerCardTitle}>Create Event QR</Text>
                                    <Text style={styles.organizerCardSub}>Generate a Proof-of-Attendance QR for your event</Text>
                                </View>
                                <Text style={styles.organizerCardArrow}>→</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.footerNav}>
                    <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Connections')}>
                        <Text style={styles.navButtonText}>History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Map')}>
                        <Text style={styles.navButtonText}>Global Map</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statusFooter}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Protocol v1.0.0 Devnet Active</Text>
                </View>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 8,
        textShadowColor: 'rgba(153, 69, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    badgeContainer: {
        backgroundColor: 'rgba(153, 69, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(153, 69, 255, 0.3)',
        marginTop: 8,
    },
    subtitle: {
        fontSize: 10,
        color: '#9945FF',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    description: {
        color: '#AAA',
        textAlign: 'center',
        marginBottom: 32,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
    },
    sectionCard: {
        width: '100%',
        marginBottom: 20,
    },
    featureGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    glassCard: {
        width: '48%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardEmoji: {
        fontSize: 24,
        marginBottom: 12,
    },
    cardText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    footerNav: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 20,
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    navButtonText: {
        color: '#9945FF',
        fontWeight: '800',
        fontSize: 14,
    },
    statusFooter: {
        marginTop: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(20, 241, 149, 0.05)',
        padding: 12,
        borderRadius: 100,
        alignSelf: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#14F195',
        marginRight: 10,
        shadowColor: '#14F195',
        shadowRadius: 5,
        shadowOpacity: 1,
    },
    statusText: {
        color: '#14F195',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    organizerSection: {
        marginTop: 28,
        width: '100%',
    },
    organizerDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(20,241,149,0.15)',
    },
    organizerLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#14F195',
        letterSpacing: 2,
    },
    organizerCard: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(20,241,149,0.2)',
    },
    organizerCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 14,
    },
    organizerCardEmoji: { fontSize: 28 },
    organizerCardTextWrapper: { flex: 1 },
    organizerCardTitle: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 15,
        marginBottom: 4,
    },
    organizerCardSub: {
        color: '#64748B',
        fontSize: 12,
        lineHeight: 18,
    },
    organizerCardArrow: {
        color: '#14F195',
        fontWeight: '900',
        fontSize: 18,
    },
});

export default Home;
