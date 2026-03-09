import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { Platform } from 'react-native';

/**
 * NFCService
 *
 * Handles the NFC P2P handshake for the VIBE social graph.
 *
 * ARCHITECTURE NOTE:
 *  On modern Android (API 14+), Android Beam is removed. The practical approach is:
 *   - "Show My VIBE" screen sets up an NFC NDEF push message (Android ≤ 13) or acts as HCE.
 *   - "Scan VIBE" screen reads an NDEF-formatted NFC tag from the peer device.
 *
 *  NFC TECH LOCK BUG (fixed):
 *  The original code called requestTechnology(Ndef) in BOTH broadcastAddress and scanPeer,
 *  causing the second request to fail with "NFC tech already held". The fix separates
 *  the two modes: broadcastAddress no longer calls requestTechnology (it prepares the
 *  NDEF payload without holding the tech lock), and scanPeer exclusively manages the
 *  tech lifecycle with a proper try/finally cleanup.
 */
class NFCService {
    private static instance: NFCService;

    private constructor() {
        // Initialise NFC subsystem. Errors here are non-fatal; we handle them per operation.
        NfcManager.start().catch((err) => {
            console.warn('[NFC] Initialisation warning:', err);
        });
    }

    public static getInstance(): NFCService {
        if (!NFCService.instance) {
            NFCService.instance = new NFCService();
        }
        return NFCService.instance;
    }

    /**
     * Prepares an NDEF payload carrying the user's wallet address.
     *
     * On Android: attempts to register the payload via setNdefPushMessage (Android Beam,
     * works on Android ≤ 13). On Android 14+ this is silently skipped — QR code is the
     * primary fallback.
     * On iOS: NFC P2P broadcasting is NOT supported by CoreNFC; no-op.
     *
     * FIXED: No longer calls requestTechnology(), so it does NOT hold the NFC tech lock.
     * This allows scanPeer() to independently acquire the lock without conflict.
     */
    public async broadcastAddress(address: string): Promise<void> {
        if (Platform.OS === 'ios') {
            // iOS CoreNFC only supports tag reading, not P2P broadcasting.
            console.log('[NFC] iOS: broadcast skipped (use QR code).');
            return;
        }

        try {
            const bytes = Ndef.encodeMessage([Ndef.textRecord(address)]);
            if (bytes) {
                console.log('[NFC] NDEF payload ready for broadcast:', address.slice(0, 8) + '…');
                // setNdefPushMessage is available in older versions of react-native-nfc-manager.
                // On devices/versions where it is unavailable, this call is a no-op.
                if (typeof (NfcManager as any).setNdefPushMessage === 'function') {
                    await (NfcManager as any).setNdefPushMessage(bytes);
                }
            }
        } catch (e) {
            // Broadcast failure is non-fatal; the QR code path remains available.
            console.warn('[NFC] Broadcast setup failed (non-fatal):', e);
        }
    }

    /**
     * Waits for the peer device to tap and reads their NDEF-encoded wallet address.
     *
     * FIXED: Exclusively manages the NFC tech lock with a try/finally block to guarantee
     * release even if getTag() throws. cancelTechnologyRequest().catch() prevents a
     * double-throw if the tech was never successfully acquired.
     */
    public async scanPeer(onPeerFound: (address: string) => void): Promise<void> {
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();

            if (tag?.ndefMessage?.[0]) {
                const record = tag.ndefMessage[0];
                // Explicitly convert payload (number[] from lib) to Uint8Array to satisfy type.
                const payload = Ndef.text.decodePayload(new Uint8Array(record.payload as number[]) as any);
                const trimmed = (payload ?? '').trim();

                // Validate minimum length of a Solana public key (32 chars minimum).
                if (trimmed.length >= 32) {
                    onPeerFound(trimmed);
                } else {
                    console.warn('[NFC] Received payload too short to be a valid wallet address.');
                }
            } else {
                console.warn('[NFC] Tag found but contained no NDEF message.');
            }
        } catch (ex) {
            console.warn('[NFC] Scan failed:', ex);
            throw ex;
        } finally {
            // Always release the tech lock, even on error, to avoid permanent NFC lock-up.
            NfcManager.cancelTechnologyRequest().catch(() => {});
        }
    }

    /**
     * Stops all active NFC operations and releases any held resources.
     * Each call is wrapped individually so a failure on one does not block the other.
     */
    public async stop(): Promise<void> {
        try {
            await NfcManager.cancelTechnologyRequest();
        } catch (_) { /* already released or not held */ }
        try {
            await NfcManager.unregisterTagEvent();
        } catch (_) { /* not registered */ }
    }
}

export default NFCService.getInstance();
