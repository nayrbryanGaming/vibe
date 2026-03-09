/**
 * PostgreSQL connection pool.
 * Reads DATABASE_URL from environment (set in .env locally, or Vercel env vars in production).
 * Supports any PostgreSQL provider: Vercel Postgres (Neon), Railway, Supabase, etc.
 */

import { Pool } from 'pg';

/**
 * Lazy pool factory — avoids process.exit() at module load time.
 * On Vercel, module-level process.exit() kills the function before it can
 * return an HTTP 500; throwing here propagates to ensureInitialized() which
 * resets initPromise so the next warm request can retry.
 */
function createPool(): Pool {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error(
            '[VIBE DB] DATABASE_URL is not set. ' +
            'Add it to .env for local dev, or in Vercel Dashboard → Settings → Environment Variables.'
        );
    }
    const p = new Pool({
        connectionString: url,
        ssl: url.includes('localhost') || url.includes('127.0.0.1')
            ? undefined
            : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
    });
    p.on('error', (err) => console.error('[VIBE DB] Unexpected pool error:', err));
    return p;
}

const pool = createPool();
export default pool;
