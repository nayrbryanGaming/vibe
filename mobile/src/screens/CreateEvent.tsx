import React, { useState, useRef } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, TextInput,
    Animated, Alert, ScrollView, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

/**
 * CreateEvent Screen — Creator / Organizer Mode
 *
 * The event organizer enters an event name and generates a branded QR code.
 * Attendees scan the QR → ConfirmConnection fires → mintPoC records a
 * Proof-of-Attendance cNFT with eventId metadata on Solana.
 *
 * QR payload structure:
 * {
 *   type:    "vibe_event"
 *   wallet:  <organizer wallet address>   ← peer address for ConfirmConnection
 *   eventId: "<timestamp>"
 *   name:    "<event name>"
 * }
 */
const CreateEvent = ({ route, navigation }: any) => {
    const { myAddress } = route.params ?? {};
    const [eventName, setEventName] = useState('');
    const [qrPayload, setQrPayload] = useState<string | null>(null);
    const [eventId, setEventId] = useState<string>('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(32)).current;
    const qrAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleGenerate = () => {
        const trimmed = eventName.trim();
        if (!trimmed) {
            Alert.alert('Event Name Required', 'Please enter a name for your event.');
            return;
        }
        if (!myAddress) {
            Alert.alert('Wallet Required', 'Connect your wallet on the Home screen first.');
            return;
        }
        const id = Date.now().toString();
        const payload = JSON.stringify({
            type: 'vibe_event',
            wallet: myAddress,
            eventId: id,
            name: trimmed,
        });
        setEventId(id);
        setQrPayload(payload);
        qrAnim.setValue(0);
        Animated.spring(qrAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    };

    const handleReset = () => {
        setQrPayload(null);
        setEventId('');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0D0D1A', '#050505', '#0A1A0A']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Header */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← BACK</Text>
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                    >
                        {/* Badge */}
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>🎪  CREATOR MODE</Text>
                        </View>

                        <Text style={styles.title}>CREATE{'\n'}EVENT QR</Text>
                        <Text style={styles.subtitle}>PROOF-OF-ATTENDANCE GENERATOR</Text>

                        <Text style={styles.description}>
                            Attendees scan this QR → their wallet mints a{' '}
                            <Text style={styles.highlight}>cNFT Proof-of-Attendance</Text>
                            {' '}on Solana Devnet.
                        </Text>

                        {!qrPayload ? (
                            /* ── Input Form ─────────────────────── */
                            <View style={styles.formSection}>
                                <Text style={styles.label}>EVENT NAME</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Solana Hacker House Jakarta"
                                    placeholderTextColor="#555"
                                    value={eventName}
                                    onChangeText={setEventName}
                                    maxLength={60}
                                    returnKeyType="done"
                                    onSubmitEditing={handleGenerate}
                                />
                                <Text style={styles.charCount}>{eventName.length}/60</Text>

                                <View style={styles.infoCards}>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoIcon}>🔗</Text>
                                        <Text style={styles.infoText}>Each attendee's wallet is linked to your event on-chain</Text>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoIcon}>🌿</Text>
                                        <Text style={styles.infoText}>Compressed NFT — costs ~0.000005 SOL per connection</Text>
                                    </View>
                                    <View style={styles.infoCard}>
                                        <Text style={styles.infoIcon}>📴</Text>
                                        <Text style={styles.infoText}>Works offline — syncs when connection is restored</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.generateBtn, !eventName.trim() && styles.generateBtnDisabled]}
                                    onPress={handleGenerate}
                                    activeOpacity={0.82}
                                >
                                    <LinearGradient
                                        colors={eventName.trim() ? ['#14F195', '#0EA371'] : ['#1A1A1A', '#0D0D0D']}
                                        style={styles.generateBtnGradient}
                                    >
                                        <Text style={[styles.generateBtnText, !eventName.trim() && { color: '#555' }]}>
                                            GENERATE QR  →
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* ── QR Display ─────────────────────── */
                            <Animated.View style={[styles.qrSection, { opacity: qrAnim, transform: [{ scale: qrAnim }] }]}>
                                <Text style={styles.qrEventLabel}>{eventName}</Text>

                                <View style={styles.qrWrapper}>
                                    <LinearGradient
                                        colors={['rgba(20,241,149,0.1)', 'rgba(153,69,255,0.08)']}
                                        style={styles.qrBackground}
                                    >
                                        <QRCode
                                            value={qrPayload}
                                            size={220}
                                            color="#14F195"
                                            backgroundColor="transparent"
                                        />
                                    </LinearGradient>
                                </View>

                                <View style={styles.qrMeta}>
                                    <Text style={styles.qrMetaLabel}>EVENT ID</Text>
                                    <Text style={styles.qrMetaValue} numberOfLines={1} ellipsizeMode="tail">
                                        {eventId}
                                    </Text>
                                </View>

                                <View style={styles.qrMeta}>
                                    <Text style={styles.qrMetaLabel}>ORGANIZER</Text>
                                    <Text style={styles.qrMetaValue} numberOfLines={1} ellipsizeMode="middle">
                                        {myAddress ?? '—'}
                                    </Text>
                                </View>

                                <Text style={styles.qrInstructions}>
                                    Show this QR to each attendee.{'\n'}
                                    They scan it in <Text style={styles.highlight}>Scan VIBE</Text> → Confirm → PoC minted. ✅
                                </Text>

                                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                                    <Text style={styles.resetBtnText}>↺  Create New Event QR</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </Animated.View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    backButton: { position: 'absolute', top: 52, left: 20, zIndex: 10, padding: 8 },
    backText: { color: '#14F195', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
    scroll: { paddingBottom: 48 },
    content: { alignItems: 'center', paddingTop: 108, paddingHorizontal: 24 },
    badge: {
        backgroundColor: 'rgba(20,241,149,0.1)', borderWidth: 1, borderColor: 'rgba(20,241,149,0.3)',
        borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginBottom: 20,
    },
    badgeText: { color: '#14F195', fontWeight: '700', fontSize: 12, letterSpacing: 1.5 },
    title: { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: 4, textAlign: 'center', marginBottom: 6 },
    subtitle: { fontSize: 10, color: '#14F195', fontWeight: '700', letterSpacing: 2, marginBottom: 20 },
    description: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 32, maxWidth: 320 },
    highlight: { color: '#14F195', fontWeight: '700' },

    /* Form */
    formSection: { width: '100%' },
    label: { fontSize: 10, fontWeight: '800', color: '#14F195', letterSpacing: 2, marginBottom: 10 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(20,241,149,0.2)',
        borderRadius: 14, paddingVertical: 16, paddingHorizontal: 18,
        color: '#F1F5F9', fontSize: 15, marginBottom: 4,
    },
    charCount: { color: '#475569', fontSize: 11, textAlign: 'right', marginBottom: 24 },
    infoCards: { gap: 10, marginBottom: 28 },
    infoCard: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12, padding: 14, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    infoIcon: { fontSize: 20 },
    infoText: { flex: 1, color: '#64748B', fontSize: 13, lineHeight: 20 },
    generateBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    generateBtnDisabled: { opacity: 0.5 },
    generateBtnGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    generateBtnText: { color: '#050505', fontWeight: '900', fontSize: 15, letterSpacing: 2 },

    /* QR display */
    qrSection: { width: '100%', alignItems: 'center' },
    qrEventLabel: { fontSize: 18, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 24, lineHeight: 26 },
    qrWrapper: {
        borderRadius: 24, overflow: 'hidden', marginBottom: 24,
        shadowColor: '#14F195', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 32,
        elevation: 16,
    },
    qrBackground: { padding: 28, alignItems: 'center', justifyContent: 'center' },
    qrMeta: {
        width: '100%', flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
        marginBottom: 8, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    qrMetaLabel: { fontSize: 10, fontWeight: '700', color: '#14F195', letterSpacing: 1.5, minWidth: 90 },
    qrMetaValue: { flex: 1, color: '#94A3B8', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    qrInstructions: { color: '#64748B', fontSize: 13, textAlign: 'center', lineHeight: 22, marginTop: 16, marginBottom: 24 },
    resetBtn: {
        borderWidth: 1.5, borderColor: 'rgba(20,241,149,0.25)', borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center',
    },
    resetBtnText: { color: '#14F195', fontWeight: '700', fontSize: 13, letterSpacing: 1.5 },
});

export default CreateEvent;
