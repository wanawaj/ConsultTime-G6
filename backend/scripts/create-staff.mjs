// Run interactively on your own computer with DATABASE_URL set:
//   node --env-file=.env backend/scripts/create-staff.mjs
// Creates staff directly in Neon; this route is intentionally NOT exposed over HTTP.
import crypto from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { pool, ensureSchema, closePool } from '../db/postgres.mjs'
import { hashPassword } from '../db/auth.mjs'
import { validPassword } from '../../src/utils/passwordRules.js'

if (!process.stdin.isTTY) {
  console.error('Run this command in an interactive terminal, not in a CI/deployment job.')
  process.exit(1)
}

const rl = createInterface({ input: process.stdin, output: process.stdout })
const input = async (label) => (await rl.question(label)).trim()

async function readPassword(prompt) {
  process.stdout.write(prompt)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  return new Promise((resolve, reject) => {
    let value = ''
    function done(error) {
      process.stdin.removeListener('data', onData)
      process.stdin.setRawMode(false)
      process.stdout.write('\n')
      if (error) reject(error)
      else resolve(value)
    }
    function onData(buffer) {
      for (const ch of buffer.toString('utf8')) {
        if (ch === '\r' || ch === '\n') return done(null)
        if (ch === '\u0003') return done(new Error('Cancelled.'))
        if (ch === '\b' || ch === '\u007f') value = value.slice(0, -1)
        else if (ch >= ' ' && value.length < 128) value += ch
      }
    }
    process.stdin.on('data', onData)
  })
}

try {
  console.log('ConsultTime • Private faculty/admin account provisioning')
  const role = (await input('Role (faculty/admin): ')).toLowerCase()
  if (!['faculty', 'admin'].includes(role)) throw new Error('Role must be faculty or admin.')
  const firstName = await input('First name: ')
  const lastName = await input('Last name: ')
  const email = (await input('Email: ')).toLowerCase()
  const department = role === 'faculty' ? await input('Department or college: ') : ''
  if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160 || (role === 'faculty' && !department) || department.length > 120) {
    throw new Error('Please supply valid names, email, and department.')
  }
  rl.close()
  const password = await readPassword('Password (typing hidden): ')
  if (!validPassword(password)) throw new Error('Password must have 8–128 characters, upper/lowercase, number, symbol, and no spaces.')
  const confirmation = await readPassword('Confirm password (typing hidden): ')
  if (password !== confirmation) throw new Error('Passwords did not match.')
  await ensureSchema()
  const passwordHash = await hashPassword(password)
  await pool.query(`
    INSERT INTO ct_users (id, role, first_name, last_name, email, department, password_hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [crypto.randomUUID(), role, firstName, lastName, email, department || null, passwordHash])
  console.log(`Created ${role} account for ${email}.`)
} catch (error) {
  if (error.code === '23505') console.error('This email is already registered.')
  else console.error(error.message)
  process.exitCode = 1
} finally {
  rl.close()
  await closePool()
}
