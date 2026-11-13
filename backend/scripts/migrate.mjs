// Safe to rerun. Run with: node --env-file=.env backend/scripts/migrate.mjs
import { ensureSchema, closePool } from '../db/postgres.mjs'
try {
  await ensureSchema()
  console.log('ConsultTime PostgreSQL schema is ready.')
} catch (error) {
  console.error('Database migration failed:', error.message)
  process.exitCode = 1
} finally {
  await closePool()
}
