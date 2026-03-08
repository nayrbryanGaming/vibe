import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCodeDisplay from '../components/QRCodeDisplay';

const { width } = Dimensions.get('window');

const ShowQR = ({ route, navigation }: any) => {
    const { address } = route.params;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F0F', '#050505', '#1A0A2A']} style={StyleSheet.absoluteFill} />

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backText}>BACK</Text>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>MY VIBE</Text>
                    <Text style={styles.subtitle}>SOLTAG SIGNAL ACTIVE</Text>
                </View>

                <View style={styles.qrWrapper}>
                    <QRCodeDisplay address={address} size={240} />
                </View>

                <View style={styles.footer}>
                    <View style={styles.scanningBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.badgeText}>BROADCASTING</Text>
                    </View>
                    <Text style={styles.infoText}>
                        Scanning another user's device will establish an immutable on-chain connection.
                    </Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backButton: {
        marginTop: 60,
        marginLeft: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#9945FF',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 2,
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        marginBottom: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 8,
    },
    subtitle: {
        fontSize: 10,
        color: '#14F195',
        marginTop: 8,
        fontWeight: '900',
        letterSpacing: 2,
    },
    qrWrapper: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 40,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#14F195',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 50,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 60,
    },
    scanningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#14F195',
        marginRight: 8,
    },
    badgeText: {
        color: '#14F195',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    infoText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 20,
        paddingHorizontal: 40,
    },
});

export default ShowQR;
