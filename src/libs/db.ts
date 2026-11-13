import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Reusable pg pool for Next.js API routes connecting to Neon PostgreSQL
const pool = new Pool({
  connectionString,
  ssl:
    connectionString?.includes('neon.tech') ||
    connectionString?.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
});

export async function query<R = any>(text: string, params?: any[]) {
  return pool.query<any, any[]>(text, params);
}

export default pool;
