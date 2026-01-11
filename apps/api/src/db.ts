import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T = any>(
  text: string,
  params?: any[],
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
