import React, { useState, useRef } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, TextInput,
    Animated, Alert, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { isValidPublicKey } from '../blockchain/wallet';

const { width } = Dimensions.get('window');

/**
 * Scan Screen
 *
 * Allows the user to connect with a peer by entering their wallet address.
 * This is the QR fallback flow: User A shows their QR (wallet address encoded),
 * User B either reads it visually or taps phones via NFC (handled on Home screen).
 *
 * For demo: paste the wallet address from the peer's ShowQR screen.
 */
const Scan = ({ route, navigation }: any) => {
    const { myAddress } = route.params ?? {};
    const [peerAddress, setPeerAddress] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;
    const borderAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();
    }, []);

    const animateBorder = (focused: boolean) => {
        Animated.timing(borderAnim, {
            toValue: focused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        setIsFocused(focused);
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.12)', '#9945FF'],
    });

    const handleConnect = () => {
        const trimmed = peerAddress.trim();
        if (!trimmed) {
            Alert.alert('Empty Address', 'Paste or type the peer wallet address from their QR code.');
            return;
        }
        if (!isValidPublicKey(trimmed)) {
            Alert.alert('Invalid Address', 'This does not look like a valid Solana wallet address (base58, 32–44 chars).');
            return;
        }
        if (myAddress && trimmed === myAddress) {
            Alert.alert('Same Wallet', 'You cannot connect with yourself.');
            return;
        }
        navigation.navigate('ConfirmConnection', {
            targetAddress: trimmed,
            myAddress: myAddress ?? '',
        });
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0D0D1A', '#050505', '#1A0A2A']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Header */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← BACK</Text>
                </TouchableOpacity>

                <Animated.View
                    style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                >
                    {/* Scanner frame illustration */}
                    <View style={styles.scanFrame}>
                        <LinearGradient
                            colors={['rgba(153,69,255,0.15)', 'rgba(20,241,149,0.08)']}
                            style={styles.scanFrameInner}
                        >
                            <Text style={styles.scanIcon}>🔍</Text>
                            <View style={styles.cornerTL} />
                            <View style={styles.cornerTR} />
                            <View style={styles.cornerBL} />
                            <View style={styles.cornerBR} />
                        </LinearGradient>
                    </View>

                    <Text style={styles.title}>SCAN VIBE</Text>
                    <Text style={styles.subtitle}>SOLTAG ADDRESS INPUT</Text>

                    <Text style={styles.instruction}>
                        Ask your peer to open{' '}
                        <Text style={styles.highlight}>Show My VIBE</Text>
                        {' '}and paste their wallet address below.
                    </Text>

                    {/* Address Input */}
                    <Animated.View style={[styles.inputWrapper, { borderColor }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Paste wallet address (e.g. 9xDef…)"
                            placeholderTextColor="#555"
                            value={peerAddress}
                            onChangeText={setPeerAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => animateBorder(true)}
                            onBlur={() => animateBorder(false)}
                            multiline={false}
                        />
                    </Animated.View>

                    {/* Paste helper */}
                    <TouchableOpacity
                        style={styles.pasteHint}
                        onPress={() => {
                            // Long-press the field to paste from clipboard on Android
                            Alert.alert(
                                'How to paste',
                                'Long-press the text field above and select "Paste" to insert the address copied from your peer\'s screen.',
                            );
                        }}
                    >
                        <Text style={styles.pasteHintText}>📋  How to paste?</Text>
                    </TouchableOpacity>

                    {/* Connect CTA */}
                    <TouchableOpacity
                        style={[styles.connectBtn, !peerAddress.trim() && styles.connectBtnDisabled]}
                        onPress={handleConnect}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={peerAddress.trim() ? ['#9945FF', '#6D28D9'] : ['#2A2A2A', '#1A1A1A']}
                            style={styles.connectBtnGradient}
                        >
                            <Text style={styles.connectBtnText}>CONNECT →</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or use NFC tap on Home</Text>
                        <View style={styles.dividerLine} />
                    </View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    backButton: { position: 'absolute', top: 52, left: 20, zIndex: 10, padding: 8 },
    backText: { color: '#9945FF', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingTop: 60 },
    scanFrame: {
        width: 180, height: 180, borderRadius: 24, overflow: 'hidden',
        marginBottom: 28,
        shadowColor: '#9945FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 24,
        elevation: 12,
    },
    scanFrameInner: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(153,69,255,0.3)', borderRadius: 24,
    },
    scanIcon: { fontSize: 56 },
    cornerTL: { position: 'absolute', top: 12, left: 12, width: 22, height: 22, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#9945FF', borderTopLeftRadius: 6 },
    cornerTR: { position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#9945FF', borderTopRightRadius: 6 },
    cornerBL: { position: 'absolute', bottom: 12, left: 12, width: 22, height: 22, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#14F195', borderBottomLeftRadius: 6 },
    cornerBR: { position: 'absolute', bottom: 12, right: 12, width: 22, height: 22, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#14F195', borderBottomRightRadius: 6 },
    title: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 6, marginBottom: 4 },
    subtitle: { fontSize: 10, color: '#9945FF', fontWeight: '700', letterSpacing: 2, marginBottom: 24 },
    instruction: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 24, maxWidth: 300 },
    highlight: { color: '#14F195', fontWeight: '700' },
    inputWrapper: {
        width: '100%', borderRadius: 16, borderWidth: 1.5,
        backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden', marginBottom: 12,
    },
    input: { color: '#F1F5F9', fontSize: 14, paddingVertical: 16, paddingHorizontal: 18, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    pasteHint: { alignSelf: 'flex-start', marginBottom: 28 },
    pasteHintText: { color: '#475569', fontSize: 12 },
    connectBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
    connectBtnDisabled: { opacity: 0.5 },
    connectBtnGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    connectBtnText: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 2 },
    divider: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
    dividerText: { color: '#475569', fontSize: 12 },
});

export default Scan;
