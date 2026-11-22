import pg from 'pg'
import { readFile } from 'node:fs/promises'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for PostgreSQL.')

// Neon URLs include sslmode=require. Keep the URL intact and do not turn off TLS verification.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 12_000,
  idleTimeoutMillis: 30_000,
})

pool.on('error', (error) => console.error('PostgreSQL idle connection error:', error.message))

export async function ensureSchema() {
  const script = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  // This schema uses no procedural blocks or semicolons inside string literals.
  for (const sql of script.split(';').map(item => item.trim()).filter(Boolean)) {
    await pool.query(sql)
  }
}

export async function closePool() {
  await pool.end()
}
