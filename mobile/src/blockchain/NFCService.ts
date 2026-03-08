import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { Platform } from 'react-native';

/**
 * NFCService
 * Handles the logic for VIBE's NFC-based social graph connection.
 */
class NFCService {
    private static instance: NFCService;

    private constructor() {
        NfcManager.start();
    }

    public static getInstance(): NFCService {
        if (!NFCService.instance) {
            NFCService.instance = new NFCService();
        }
        return NFCService.instance;
    }

    /**
     * Broadcasts the user's wallet address via NFC (works best on Android for P2P/HCE).
     * Note: iOS NFC support is mostly for reading tags. 
     */
    public async broadcastAddress(address: string) {
        if (Platform.OS === 'ios') {
            console.warn('NFC Broadcasting is not fully supported on iOS.');
            return;
        }

        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const bytes = Ndef.encodeMessage([
                Ndef.textRecord(address),
            ]);

            if (bytes) {
                // await NfcManager.setNdefPushMessage(bytes); 
                console.log('NFC broadcast payload prepared (Android Beam is deprecated, use HCE for production):', address);
            }
        } catch (ex) {
            console.warn('NFC broadcast failed:', ex);
            throw ex;
        }
    }

    /**
     * Starts listening for other users' NFC broadcasts.
     */
    public async scanPeer(onPeerFound: (address: string) => void) {
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();

            if (tag && tag.ndefMessage) {
                const record = tag.ndefMessage[0];
                if (record) {
                    const payload = Ndef.text.decodePayload(record.payload as any);
                    onPeerFound(payload);
                }
            }
        } catch (ex) {
            console.warn('NFC scan failed:', ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    }

    public async stop() {
        await NfcManager.unregisterTagEvent();
        await NfcManager.cancelTechnologyRequest();
    }
}

export default NFCService.getInstance();
