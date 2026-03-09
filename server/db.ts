/**
 * PostgreSQL connection pool.
 * Reads DATABASE_URL from environment (set in .env locally, or Vercel env vars in production).
 * Supports any PostgreSQL provider: Vercel Postgres (Neon), Railway, Supabase, etc.
 */

import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    console.error('[VIBE DB] ERROR: DATABASE_URL environment variable is not set.');
    console.error('[VIBE DB] Add DATABASE_URL to your .env file for local dev,');
    console.error('[VIBE DB] or set it in Vercel Dashboard → Settings → Environment Variables.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Required for Vercel Postgres, Neon, Railway, Supabase (all use SSL in production)
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
        ? undefined
        : { rejectUnauthorized: false },
    max: 10,           // max pool size (Vercel serverless: 1 connection per function is fine)
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('[VIBE DB] Unexpected pool error:', err);
});

export default pool;
