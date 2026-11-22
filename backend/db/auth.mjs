import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = (await scrypt(password, salt, 64)).toString('hex')
  return `${salt}:${hash}`
}

export async function verifyPassword(password, stored = '') {
  if (typeof stored !== 'string') return false
  const [salt, hash] = stored.split(':')
  if (!/^[0-9a-f]{32}$/.test(salt || '') || !/^[0-9a-f]{128}$/.test(hash || '')) return false
  const actual = await scrypt(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return crypto.timingSafeEqual(actual, expected)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function safeSecretEquals(supplied, expected) {
  if (!supplied || !expected || typeof supplied !== 'string') return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
