import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StorageService, SavedConnection } from '../blockchain/StorageService';
import { PoCMetadata } from '../blockchain/mintPoC';

const { width } = Dimensions.get('window');

/**
 * Connections Screen - Premium Social Graph
 * 
 * Displays the user's social graph with high-end glassmorphism and linear gradients.
 */
const Connections = ({ navigation }: any) => {
    const [connections, setConnections] = useState<SavedConnection[]>([]);
    const [pending, setPending] = useState<PoCMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [verifiedList, pendingList] = await Promise.all([
                StorageService.getConnections(),
                StorageService.getPendingSync()
            ]);
            setConnections(verifiedList);
            setPending(pendingList);
            setLoading(false);
        };
        loadData();
    }, []);

    const renderConnection = (item: SavedConnection | PoCMetadata, isPending: boolean) => (
        <View key={`${item.walletA}-${item.walletB}-${item.timestamp}`} style={styles.cardWrapper}>
            <LinearGradient
                colors={isPending ? ['rgba(153, 69, 255, 0.1)', 'rgba(153, 69, 255, 0.05)'] : ['rgba(20, 241, 149, 0.1)', 'rgba(20, 241, 149, 0.05)']}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.badge, isPending ? styles.pendingBadge : styles.verifiedBadge]}>
                        <Text style={[styles.badgeText, isPending ? styles.pendingText : styles.verifiedText]}>
                            {isPending ? 'OFFLINE SYNC' : 'ON-CHAIN VERIFIED'}
                        </Text>
                    </View>
                    <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                </View>

                <View style={styles.peerInfo}>
                    <LinearGradient
                        colors={isPending ? ['#333', '#222'] : ['#14F195', '#10BC74']}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarInitial}>{item.walletB.charAt(0).toUpperCase()}</Text>
                    </LinearGradient>
                    <View style={styles.meta}>
                        <Text style={styles.address}>
                            {item.walletB.slice(0, 8)}...{item.walletB.slice(-8)}
                        </Text>
                        <Text style={styles.location}>
                            📍 {(item.latitude ?? 0).toFixed(4)}, {(item.longitude ?? 0).toFixed(4)}
                        </Text>
                    </View>
                </View>

                {'signature' in item && item.signature ? (
                    <View style={styles.proofContainer}>
                        <Text style={styles.proofLabel}>PROOF OF CONNECTION</Text>
                        <Text style={styles.signature} numberOfLines={1}>
                            {item.signature.slice(0, 40)}…
                        </Text>
                    </View>
                ) : null}
            </LinearGradient>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#14F195" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={['#0F0F0F', '#050505']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← PROTOCOL HOME</Text>
                </TouchableOpacity>

                <View style={styles.titleSection}>
                    <Text style={styles.title}>Social Graph</Text>
                    <View style={styles.underline} />
                </View>

                {pending.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>AWAITING SYNCHRONIZATION</Text>
                        {pending.map(item => renderConnection(item, true))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>VERIFIED CONNECTIONS</Text>
                    {connections.length > 0 ? (
                        connections.map(item => renderConnection(item, false))
                    ) : pending.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.01)']}
                                style={styles.emptyGradient}
                            >
                                <Text style={styles.emptyEmoji}>🧬</Text>
                                <Text style={styles.emptyText}>No connections detected in your mesh network.</Text>
                            </LinearGradient>
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        padding: 24,
        paddingTop: 64,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginBottom: 32,
    },
    backText: {
        color: '#9945FF',
        fontWeight: '900',
        fontSize: 10,
        letterSpacing: 2,
    },
    titleSection: {
        marginBottom: 40,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 2,
    },
    underline: {
        width: 60,
        height: 4,
        backgroundColor: '#14F195',
        marginTop: 12,
        borderRadius: 2,
    },
    section: {
        marginBottom: 40,
    },
    sectionHeader: {
        color: '#666',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 3,
        marginBottom: 20,
    },
    cardWrapper: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    card: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    verifiedBadge: {
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
    },
    verifiedText: {
        color: '#14F195',
    },
    pendingBadge: {
        backgroundColor: 'rgba(153, 69, 255, 0.1)',
    },
    pendingText: {
        color: '#9945FF',
    },
    date: {
        color: '#444',
        fontSize: 10,
        fontWeight: 'bold',
    },
    peerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarInitial: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
    meta: {
        flex: 1,
    },
    address: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    location: {
        color: '#666',
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
    },
    proofContainer: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    proofLabel: {
        color: '#333',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 4,
    },
    signature: {
        color: '#555',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    emptyBox: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emptyGradient: {
        padding: 48,
        alignItems: 'center',
    },
    emptyEmoji: {
        fontSize: 32,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        color: '#444',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '600',
    }
});

export default Connections;
