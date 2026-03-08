import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import { StorageService } from '../blockchain/StorageService';
import { CONFIG } from '../config';

const { width, height } = Dimensions.get('window');

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#1A1A1A" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#4A4A4A" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1A1A1A" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#333333" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#222222" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

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
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: localConnections.length > 0 ? localConnections[0].latitude : -6.1751,
                    longitude: localConnections.length > 0 ? localConnections[0].longitude : 106.8272,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
                }}
                customMapStyle={darkMapStyle}
            >
                {heatmapDots.map((dot, idx) => (
                    <Marker
                        key={`global-${idx}`}
                        coordinate={{ latitude: dot.latitude, longitude: dot.longitude }}
                        opacity={0.4}
                    >
                        <View style={styles.globalMarker} />
                    </Marker>
                ))}

                {localConnections.map((conn) => (
                    <Marker
                        key={conn.signature}
                        coordinate={{ latitude: conn.latitude, longitude: conn.longitude }}
                        title="VIBE Connection"
                        description={`${conn.walletB.slice(0, 12)}...`}
                    >
                        <LinearGradient colors={['#14F195', '#10BC74']} style={styles.localMarker} />
                    </Marker>
                ))}
            </MapView>

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
    map: {
        ...StyleSheet.absoluteFillObject,
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
    globalMarker: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#9945FF',
        shadowColor: '#9945FF',
        shadowRadius: 10,
        shadowOpacity: 1,
    },
    localMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFF',
    }
});

export default Map;
