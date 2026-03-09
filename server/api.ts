/**
 * VIBE API Server
 *
 * Production-quality Express server that backs the SOLTAG Protocol.
 * Deployable to Vercel (serverless) or any Node.js host.
 *
 * Security hardening:
 *  - Wallet address format validation (base58, 32–44 chars)
 *  - Duplicate connection prevention (PostgreSQL PRIMARY KEY + hasConnection check)
 *  - Input sanitisation on all POST bodies
 *  - Self-connection guard (walletA !== walletB)
 *  - Global error handler — process never crashes on unhandled route errors
 *  - CORS headers for web clients
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { globalGraph } from '../indexer/graph';
import { startIndexer } from '../indexer/indexer';
import { initDb, saveConnection, hasConnection, loadAllConnections, getRealConnectionCount } from './persistence';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));

app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.options(/.*/, (_req: Request, res: Response) => res.sendStatus(204));

// ─── Lazy initialisation (works for both long-running server and Vercel serverless) ──

/**
 * Lazy initialisation guard — ensures DB is ready and graph is hydrated exactly once,
 * even under concurrent cold-start requests on Vercel.
 */
let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
    if (!initPromise) {
        initPromise = (async () => {
            await initDb();

            const realCount = await getRealConnectionCount();

            if (realCount === 0) {
                // First boot — seed demo data into PostgreSQL + globalGraph
                console.log('[VIBE API] Empty DB — seeding demo data for first run.');
                await startIndexer();
            } else {
                // Subsequent boots — hydrate globalGraph from PostgreSQL
                const persisted = await loadAllConnections();
                for (const conn of persisted) {
                    globalGraph.addConnection(conn.walletA, conn.walletB, {
                        timestamp: conn.timestamp,
                        latitude: conn.latitude,
                        longitude: conn.longitude,
                        signature: conn.signature,
                        eventId: conn.eventId,
                    });
                }
                console.log(`[VIBE API] Loaded ${persisted.length} connection(s) from PostgreSQL.`);
            }

            const { totalUsers, totalConnections } = globalGraph.getGlobalStats();
            console.log(`[VIBE API] Graph ready: ${totalUsers} nodes, ${totalConnections} connections.`);
        })().catch((err) => {
            // Reset so the next request can retry (e.g. transient DB connection failure)
            initPromise = null;
            throw err;
        });
    }
    return initPromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SOLANA_ADDR_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const isValidSolanaAddress = (addr: unknown): addr is string =>
    typeof addr === 'string' && SOLANA_ADDR_REGEX.test(addr);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
    await ensureInitialized();
    res.json({
        status: 'ok',
        protocol: 'SOLTAG v1.0',
        uptime: Math.floor(process.uptime()),
        graph: globalGraph.getGlobalStats(),
    });
});

// ─── Record a new Proof-of-Connection ─────────────────────────────────────────

app.post('/api/connections', async (req: Request, res: Response): Promise<void> => {
    await ensureInitialized();
    const { walletA, walletB, timestamp, latitude, longitude, signature, eventId } = req.body;

    if (!isValidSolanaAddress(walletA)) {
        res.status(400).json({ error: 'Invalid or missing walletA address.' });
        return;
    }
    if (!isValidSolanaAddress(walletB)) {
        res.status(400).json({ error: 'Invalid or missing walletB address.' });
        return;
    }
    if (walletA === walletB) {
        res.status(400).json({ error: 'Self-connections are not permitted.' });
        return;
    }
    if (timestamp !== undefined && typeof timestamp !== 'number') {
        res.status(400).json({ error: 'timestamp must be a Unix epoch number (ms).' });
        return;
    }

    if (await hasConnection(walletA, walletB)) {
        res.status(200).json({ success: true, duplicate: true });
        return;
    }

    const meta = {
        timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
        latitude: typeof latitude === 'number' ? latitude : 0,
        longitude: typeof longitude === 'number' ? longitude : 0,
        signature: typeof signature === 'string' ? signature : null,
        eventId: typeof eventId === 'string' ? eventId : null,
    };

    await saveConnection({ walletA, walletB, ...meta });
    globalGraph.addConnection(walletA, walletB, meta);

    console.log(`[VIBE API] PoC recorded: ${walletA.slice(0, 8)}… ↔ ${walletB.slice(0, 8)}…`);
    res.status(201).json({ success: true });
});

// ─── Query connections for a wallet ───────────────────────────────────────────

app.get('/api/connections/:wallet', async (req: Request, res: Response): Promise<void> => {
    const { wallet } = req.params;
    if (!isValidSolanaAddress(wallet)) {
        res.status(400).json({ error: 'Invalid wallet address.' });
        return;
    }
    await ensureInitialized();
    const connections = globalGraph.getConnections(wallet);
    res.json({ wallet, connections, count: connections.length });
});

// ─── Global graph statistics ──────────────────────────────────────────────────

app.get('/api/stats', async (_req: Request, res: Response): Promise<void> => {
    await ensureInitialized();
    res.json(globalGraph.getGlobalStats());
});

// ─── Degrees of separation between two wallets ────────────────────────────────

app.get('/api/separation/:walletA/:walletB', async (req: Request, res: Response): Promise<void> => {
    const { walletA, walletB } = req.params;
    if (!isValidSolanaAddress(walletA) || !isValidSolanaAddress(walletB)) {
        res.status(400).json({ error: 'Invalid wallet address(es).' });
        return;
    }
    await ensureInitialized();
    const degrees = globalGraph.getDegreesOfSeparation(walletA, walletB);
    res.json({ walletA, walletB, degrees });
});

// ─── Heatmap data ─────────────────────────────────────────────────────────────

app.get('/api/heatmap', async (_req: Request, res: Response): Promise<void> => {
    await ensureInitialized();
    res.json({ dots: globalGraph.getHeatmapData() });
});

// ─── APK Download redirect ───────────────────────────────────────────────────

app.get('/download', (_req: Request, res: Response): void => {
    res.redirect(302, 'https://github.com/nayrbryanGaming/vibe/releases/latest/download/VIBE-SOLTAG.apk');
});

// ─── 404 catch-all ────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response): void => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('[VIBE API] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

// ─── Export for Vercel (serverless) ──────────────────────────────────────────

export default app;

// ─── Start listening when run directly (local dev / Railway / Fly.io) ────────

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`[VIBE API] Server listening at http://localhost:${PORT}`);
        console.log(`[VIBE API] Health: http://localhost:${PORT}/api/health`);
    });
}
