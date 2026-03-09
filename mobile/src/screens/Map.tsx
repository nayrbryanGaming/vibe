import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StorageService } from '../blockchain/StorageService';
import { CONFIG } from '../config';

const Map = ({ navigation }: any) => {
    const [localConnections, setLocalConnections] = React.useState<any[]>([]);
    const [globalStats, setGlobalStats] = React.useState({ totalUsers: 0, totalConnections: 0 });
    const [heatmapDots, setHeatmapDots] = React.useState<any[]>([]);

    React.useEffect(() => {
        const load = async () => {
            const data = await StorageService.getConnections();
            setLocalConnections(data);

            try {
                const statsRes = await fetch(`${CONFIG.API_BASE_URL}/api/stats`);
                const stats = await statsRes.json();
                setGlobalStats(stats);

                const heatmapRes = await fetch(`${CONFIG.API_BASE_URL}/api/heatmap`);
                const heatmap = await heatmapRes.json();
                setHeatmapDots(heatmap.dots || []);
            } catch (err) {
                setGlobalStats({ totalUsers: data.length, totalConnections: data.length });
            }
        };
        load();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.placeholder}>
                <LinearGradient colors={['#9945FF', '#7935DF']} style={styles.placeholderIcon}>
                    <Text style={styles.iconTxt}>🗺</Text>
                </LinearGradient>
                <Text style={styles.placeholderTitle}>NETWORK MAP</Text>
                <Text style={styles.placeholderSub}>{globalStats.totalConnections} connections · {globalStats.totalUsers} wallets</Text>
            </View>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backTxt}>BACK</Text>
            </TouchableOpacity>

            <View style={styles.glassStats}>
                <LinearGradient colors={['#9945FF', '#7935DF']} style={styles.statsIcon}>
                    <Text style={styles.iconTxt}>G</Text>
                </LinearGradient>
                <View style={styles.statsMeta}>
                    <Text style={styles.statsTitle}>{globalStats.totalConnections.toLocaleString()} NODES FOUND</Text>
                    <Text style={styles.statsSub}>{globalStats.totalUsers} Active Wallets Synchronized</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    placeholderIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    placeholderTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 3,
    },
    placeholderSub: {
        color: '#666',
        fontSize: 13,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    backTxt: {
        color: '#9945FF',
        fontWeight: '900',
        fontSize: 10,
        letterSpacing: 2,
    },
    glassStats: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(26,26,26,0.95)',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statsIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
    },
    iconTxt: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 18,
    },
    statsMeta: {
        flex: 1,
    },
    statsTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    statsSub: {
        color: '#666',
        fontSize: 11,
        marginTop: 2,
    },
});

export default Map;
