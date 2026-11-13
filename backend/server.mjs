// Keep the existing JSON-backed prototype available for local development.
// Production MUST use PostgreSQL; Render sets NODE_ENV=production explicitly.
if (process.env.DATABASE_URL) {
  await import('./server-postgres.mjs')
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production. Configure it in Render from Neon.')
} else {
  await import('./server-local.mjs')
}
