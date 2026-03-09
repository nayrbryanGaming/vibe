/**
 * VIBE Persistence Layer — PostgreSQL
 *
 * Async API backed by pg. Works with any PostgreSQL provider:
 *  - Vercel Postgres (Neon) — recommended for production
 *  - Railway Postgres       — good alternative
 *  - Local PostgreSQL       — for local dev (set DATABASE_URL in .env)
 *
 * Tables are created automatically on first boot via initDb().
 */

import pool from './db';

export interface ConnectionRecord {
    walletA: string;
    walletB: string;
    timestamp: number;
    latitude: number;
    longitude: number;
    signature: string | null;
    eventId: string | null;
}

// ─── Schema bootstrap ─────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS connections (
            wallet_key  TEXT             PRIMARY KEY,
            wallet_a    TEXT             NOT NULL,
            wallet_b    TEXT             NOT NULL,
            timestamp   BIGINT           NOT NULL,
            latitude    DOUBLE PRECISION NOT NULL DEFAULT 0,
            longitude   DOUBLE PRECISION NOT NULL DEFAULT 0,
            signature   TEXT,
            event_id    TEXT
        );

        CREATE TABLE IF NOT EXISTS meta (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `);
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Persist a connection.
 * @returns true if inserted, false if already existed (ON CONFLICT DO NOTHING).
 */
export async function saveConnection(record: ConnectionRecord): Promise<boolean> {
    const [a, b] = [record.walletA, record.walletB].sort();
    const key = `${a}:${b}`;
    const result = await pool.query(
        `INSERT INTO connections
             (wallet_key, wallet_a, wallet_b, timestamp, latitude, longitude, signature, event_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (wallet_key) DO NOTHING`,
        [key, record.walletA, record.walletB, record.timestamp,
         record.latitude, record.longitude, record.signature ?? null, record.eventId ?? null]
    );
    return (result.rowCount ?? 0) > 0;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function hasConnection(walletA: string, walletB: string): Promise<boolean> {
    const [a, b] = [walletA, walletB].sort();
    const result = await pool.query(
        'SELECT 1 FROM connections WHERE wallet_key = $1 LIMIT 1',
        [`${a}:${b}`]
    );
    return result.rows.length > 0;
}

export async function loadAllConnections(): Promise<ConnectionRecord[]> {
    const result = await pool.query(
        'SELECT wallet_a, wallet_b, timestamp, latitude, longitude, signature, event_id FROM connections'
    );
    return result.rows.map((row) => ({
        walletA: row.wallet_a,
        walletB: row.wallet_b,
        timestamp: Number(row.timestamp),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        signature: row.signature ?? null,
        eventId: row.event_id ?? null,
    }));
}

export async function getRealConnectionCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) AS cnt FROM connections');
    return parseInt(result.rows[0].cnt, 10);
}

// ─── Meta key-value ───────────────────────────────────────────────────────────

export async function getMeta(key: string): Promise<string | null> {
    const result = await pool.query('SELECT value FROM meta WHERE key = $1', [key]);
    return result.rows[0]?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
    await pool.query(
        `INSERT INTO meta (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, value]
    );
}
