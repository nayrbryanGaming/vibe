import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Animated } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';

const Scan = ({ route, navigation }: any) => {
    const device = useCameraDevice('back');
    const [hasScanned, setHasScanned] = useState(false);
    const [hasPermission, setHasPermission] = React.useState(false);
    const scanLineAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'granted');
        })();

        // Scanner line animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, { toValue: 200, duration: 1500, useNativeDriver: true }),
                Animated.timing(scanLineAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (hasScanned) return;
            if (codes.length > 0 && codes[0].value) {
                const scannedValue = codes[0].value.trim();
                const solanaAddrRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

                if (solanaAddrRegex.test(scannedValue)) {
                    setHasScanned(true);
                    const { myAddress } = route.params;

                    navigation.navigate('ConfirmConnection', {
                        targetAddress: scannedValue,
                        myAddress
                    });
                }
            }
        }
    });

    if (!hasPermission) return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F0F0F', '#050505']} style={StyleSheet.absoluteFill} />
            <Text style={styles.instructions}>Camera Access Required</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Enable in Settings</Text>
            </TouchableOpacity>
        </View>
    );

    if (device == null) return (
        <View style={styles.container}>
            <Text style={{ color: '#FFF' }}>Camera Not Found</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />

            <View style={styles.overlay}>
                <View style={styles.scanWindow}>
                    <View style={[styles.corner, styles.topL]} />
                    <View style={[styles.corner, styles.topR]} />
                    <View style={[styles.corner, styles.bottomL]} />
                    <View style={[styles.corner, styles.bottomR]} />

                    <Animated.View
                        style={[
                            styles.scanLine,
                            { transform: [{ translateY: scanLineAnim }] }
                        ]}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>SCAN VIBE</Text>
                    <Text style={styles.subtitle}>Hold steady to capture the signal</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <BlurView blurType="dark" style={StyleSheet.absoluteFill} />
                <Text style={styles.closeText}>CANCEL</Text>
            </TouchableOpacity>
        </View>
    );
};

// Mock BlurView for Android/Environment if missing
const BlurView = ({ children, style }: any) => <View style={[style, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>{children}</View>;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanWindow: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#9945FF',
        borderWidth: 4,
    },
    topL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
    topR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
    bottomL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
    bottomR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
    scanLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#14F195',
        shadowColor: '#14F195',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    textContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
    },
    subtitle: {
        color: '#AAA',
        marginTop: 8,
        fontSize: 14,
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    closeText: {
        color: '#FFF',
        fontWeight: '900',
        letterSpacing: 2,
        fontSize: 12,
    },
    instructions: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 100,
    },
    backButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#1A1A1A',
        borderRadius: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#9945FF',
        fontWeight: 'bold',
    }
});

export default Scan;
