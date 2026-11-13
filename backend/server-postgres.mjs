import http from 'node:http'
import crypto from 'node:crypto'
import { pool, ensureSchema, closePool } from './db/postgres.mjs'
import { hashPassword, verifyPassword, hashToken, safeSecretEquals } from './db/auth.mjs'
import { userById, facultyList } from './db/users.mjs'
import { validPassword } from '../src/utils/passwordRules.js'
import { validStudentId } from '../src/utils/studentId.js'
import { validWmsuProgram } from '../src/data/wmsuPrograms.js'

const isProduction = process.env.NODE_ENV === 'production'
const proxySecret = process.env.API_PROXY_SECRET || ''
if (isProduction && proxySecret.length < 32) {
  throw new Error('Production requires API_PROXY_SECRET with at least 32 characters on Render and Cloudflare.')
}

const port = Number(process.env.PORT || process.env.API_PORT || 3001)
const SESSION_LIFETIME_SECONDS = 24 * 60 * 60
const cookieSecure = isProduction ? '; Secure' : ''
const cookieBase = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_LIFETIME_SECONDS}${cookieSecure}`

function send(res, status, value, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  })
  res.end(JSON.stringify(value))
}
const bad = (res, message, code = 400) => send(res, code, { error: message })
const textField = (value, max = 200) => String(value ?? '').trim().slice(0, max)
const validEmail = (value) => typeof value === 'string' && value.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const validYear = (value) => ['1st Year','2nd Year','3rd Year','4th Year','5th Year','6th Year'].includes(value)

async function bodyJSON(req) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > 20_000) {
      const error = new Error('Request too large.')
      error.status = 413
      throw error
    }
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try { return JSON.parse(raw) }
  catch {
    const error = new Error('Invalid request data.')
    error.status = 400
    throw error
  }
}

function getCookie(req, key) {
  const cookies = (req.headers.cookie || '').split(';').map(x => x.trim())
  const match = cookies.find(x => x.startsWith(`${key}=`))
  return match?.slice(key.length + 1) || ''
}

async function currentUser(req) {
  const token = getCookie(req, 'consulttime_session')
  if (!/^[0-9a-f]{64}$/.test(token)) return null
  const result = await pool.query(`
    SELECT u.id, u.role, u.first_name AS "firstName", u.last_name AS "lastName",
           u.middle_name AS "middleName", u.student_id AS "studentId", u.email,
           u.college, u.program, u.year_level AS "yearLevel", u.department
    FROM ct_sessions s JOIN ct_users u ON u.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > NOW()
  `, [hashToken(token)])
  return result.rows[0] || null
}

async function startSession(res, user, status = 200) {
  const token = crypto.randomBytes(32).toString('hex')
  await pool.query(`INSERT INTO ct_sessions (token_hash, user_id, expires_at)
                    VALUES ($1, $2, NOW() + INTERVAL '24 hours')`, [hashToken(token), user.id])
  return send(res, status, { user }, { 'Set-Cookie': `consulttime_session=${token}; ${cookieBase}` })
}

function buildSlots() {
  const dates = []
  for (let i = 1; i <= 24; i++) {
    const d = new Date(Date.now() + i * 86_400_000)
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates.flatMap(date => ['09:00', '10:30', '13:00', '14:30'].map(time => ({ date, time })))
}

const APPOINTMENT_SELECT = `
  SELECT a.id, a.student_id AS "studentId", a.faculty_id AS "facultyId",
         a.slot_date::text AS date, a.slot_time AS time, a.topic, a.notes, a.status,
         a.created_at AS "createdAt", a.updated_at AS "updatedAt",
         CONCAT(f.first_name, ' ', f.last_name) AS "facultyName",
         CONCAT(s.first_name, ' ', s.last_name) AS "studentName"
  FROM ct_appointments a
  JOIN ct_users f ON f.id = a.faculty_id
  JOIN ct_users s ON s.id = a.student_id
`

async function appointmentById(id) {
  const { rows } = await pool.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [id])
  return rows[0] || null
}

// Simple local defense in depth. Add IP-based limits and university account verification
// before opening this service for real student data.
const loginAttempts = new Map()

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const method = req.method
  if (!url.pathname.startsWith('/api/')) return bad(res, 'API routes begin with /api.', 404)
  if (method === 'OPTIONS') return bad(res, 'Unsupported method.', 405)
  try {
    if (method === 'GET' && url.pathname === '/api/health') {
      try { await pool.query('SELECT 1'); return send(res, 200, { ok: true, storage: 'postgresql' }) }
      catch { return bad(res, 'Database not ready.', 503) }
    }

    if (isProduction && !safeSecretEquals(req.headers['x-ct-proxy-secret'], proxySecret)) {
      return bad(res, 'Requests must come through the ConsultTime website.', 403)
    }
    if (!isProduction && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && req.headers.origin) {
      if (new URL(req.headers.origin).host !== req.headers.host) return bad(res, 'Cross-origin request rejected.', 403)
    }

    if (method === 'GET' && url.pathname === '/api/me') {
      return send(res, 200, { user: await currentUser(req) })
    }

    if (method === 'POST' && url.pathname === '/api/register') {
      const data = await bodyJSON(req)
      const firstName = textField(data.firstName, 80), lastName = textField(data.lastName, 80)
      const studentId = textField(data.studentId, 40), email = textField(data.email, 160).toLowerCase()
      const college = textField(data.college, 120), program = textField(data.program, 160)
      const yearLevel = textField(data.yearLevel, 20)
      if (!firstName || !lastName || !studentId || !validEmail(email) || !college || !program || !yearLevel) {
        return bad(res, 'Please complete the required registration details.')
      }
      if (!validStudentId(studentId)) return bad(res, 'Student ID must contain exactly four digits, a hyphen, and five digits (0000-00000).')
      if (!validWmsuProgram(college, program)) return bad(res, 'Choose a program under its WMSU college.')
      if (!validYear(yearLevel)) return bad(res, 'Choose a valid year level.')
      if (!validPassword(data.password)) return bad(res, 'Password needs 8–128 characters, uppercase and lowercase letters, a number, a special character, and no spaces.')
      const id = crypto.randomUUID()
      const passwordHash = await hashPassword(data.password)
      try {
        await pool.query(`
          INSERT INTO ct_users (id, role, first_name, last_name, middle_name, student_id, email, college, program, year_level, password_hash)
          VALUES ($1, 'student', $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [id, firstName, lastName, textField(data.middleName, 80), studentId, email, college, program, yearLevel, passwordHash])
      } catch (error) {
        if (error.code === '23505') return bad(res, 'This email or student ID is already registered.', 409)
        throw error
      }
      const user = await userById(pool, id)
      return startSession(res, user, 201)
    }

    if (method === 'POST' && url.pathname === '/api/login') {
      const data = await bodyJSON(req)
      const email = textField(data.email, 160).toLowerCase()
      const attempts = loginAttempts.get(email) || { count: 0, start: Date.now() }
      if (Date.now() - attempts.start > 600_000) { attempts.count = 0; attempts.start = Date.now() }
      if (attempts.count >= 15) return bad(res, 'Too many attempts. Try again later.', 429)
      const { rows } = await pool.query('SELECT id, password_hash FROM ct_users WHERE email = $1', [email])
      const identity = rows[0]
      const verified = identity && await verifyPassword(String(data.password || ''), identity.password_hash)
      if (!verified) {
        attempts.count++
        loginAttempts.set(email, attempts)
        return bad(res, 'Incorrect email or password.', 401)
      }
      loginAttempts.delete(email)
      const user = await userById(pool, identity.id)
      return startSession(res, user)
    }

    if (method === 'POST' && url.pathname === '/api/logout') {
      const token = getCookie(req, 'consulttime_session')
      if (/^[0-9a-f]{64}$/.test(token)) await pool.query('DELETE FROM ct_sessions WHERE token_hash = $1', [hashToken(token)])
      return send(res, 200, { ok: true }, { 'Set-Cookie': `consulttime_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${cookieSecure}` })
    }

    const user = await currentUser(req)
    if (!user) return bad(res, 'Please sign in first.', 401)

    if (method === 'GET' && url.pathname === '/api/faculty') {
      return send(res, 200, { faculty: await facultyList(pool) })
    }

    if (method === 'GET' && url.pathname === '/api/slots') {
      const facultyId = url.searchParams.get('facultyId')
      const { rowCount } = await pool.query("SELECT 1 FROM ct_users WHERE id = $1 AND role = 'faculty'", [facultyId])
      if (!rowCount) return bad(res, 'Choose a faculty member.')
      const { rows } = await pool.query(`
        SELECT slot_date::text AS date, slot_time AS time
        FROM ct_appointments
        WHERE faculty_id = $1 AND status IN ('Pending', 'Approved')
      `, [facultyId])
      const booked = new Set(rows.map(a => `${a.date} ${a.time}`))
      return send(res, 200, { slots: buildSlots().filter(s => !booked.has(`${s.date} ${s.time}`)) })
    }

    if (method === 'GET' && url.pathname === '/api/appointments') {
      const clause = user.role === 'admin' ? '' : user.role === 'faculty' ? 'WHERE a.faculty_id = $1' : 'WHERE a.student_id = $1'
      const params = user.role === 'admin' ? [] : [user.id]
      const { rows } = await pool.query(`${APPOINTMENT_SELECT} ${clause} ORDER BY a.created_at DESC`, params)
      return send(res, 200, { appointments: rows })
    }

    if (method === 'POST' && url.pathname === '/api/appointments') {
      if (user.role !== 'student') return bad(res, 'Only students may request a consultation.', 403)
      const data = await bodyJSON(req)
      const facultyId = textField(data.facultyId, 80), date = textField(data.date, 20)
      const time = textField(data.time, 10), topic = textField(data.topic, 120), notes = textField(data.notes, 800)
      const { rowCount } = await pool.query("SELECT 1 FROM ct_users WHERE id = $1 AND role = 'faculty'", [facultyId])
      if (!rowCount) return bad(res, 'Choose a valid faculty member.')
      if (!buildSlots().some(s => s.date === date && s.time === time)) return bad(res, 'That time is not available.')
      if (!topic) return bad(res, 'Please enter a consultation topic.')
      const id = crypto.randomUUID()
      try {
        await pool.query(`
          INSERT INTO ct_appointments (id, student_id, faculty_id, slot_date, slot_time, topic, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [id, user.id, facultyId, date, time, topic, notes])
      } catch (error) {
        if (error.code === '23505') return bad(res, 'That time has already been booked.', 409)
        throw error
      }
      return send(res, 201, { appointment: await appointmentById(id) })
    }

    const match = url.pathname.match(/^\/api\/appointments\/([^/]+)$/)
    if (method === 'PATCH' && match) {
      const data = await bodyJSON(req)
      const status = textField(data.status, 20)
      const appt = await appointmentById(match[1])
      if (!appt) return bad(res, 'Consultation not found.', 404)
      if (user.role === 'student') {
        if (appt.studentId !== user.id || status !== 'Cancelled' || !['Pending', 'Approved'].includes(appt.status)) {
          return bad(res, 'You cannot change this consultation.', 403)
        }
      } else {
        if (user.role === 'faculty' && appt.facultyId !== user.id) return bad(res, 'This consultation belongs to another faculty member.', 403)
        if (!['Approved', 'Declined'].includes(status) || appt.status !== 'Pending') return bad(res, 'Only pending requests can be approved or declined.')
      }
      const { rowCount } = await pool.query(`
        UPDATE ct_appointments SET status = $1, updated_at = NOW()
        WHERE id = $2 AND status = $3
      `, [status, appt.id, appt.status])
      if (!rowCount) return bad(res, 'Consultation status changed. Please refresh.', 409)
      return send(res, 200, { appointment: await appointmentById(appt.id) })
    }

    if (method === 'GET' && url.pathname === '/api/admin/summary') {
      if (user.role !== 'admin') return bad(res, 'Administrator access required.', 403)
      const { rows } = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM ct_users WHERE role = 'student') AS students,
          (SELECT COUNT(*) FROM ct_users WHERE role = 'faculty') AS faculty,
          (SELECT COUNT(*) FROM ct_appointments) AS consultations,
          (SELECT COUNT(*) FROM ct_appointments WHERE status = 'Pending') AS pending
      `)
      const summary = Object.fromEntries(Object.entries(rows[0]).map(([key, value]) => [key, Number(value)]))
      return send(res, 200, summary)
    }

    return bad(res, 'Endpoint not found.', 404)
  } catch (error) {
    if (error.status) return bad(res, error.message, error.status)
    console.error('Request error:', error)
    return bad(res, 'The server could not complete your request.', 500)
  }
})

await ensureSchema()
// Keep stale session storage tidy when restarting. A future migration can add scheduled cleanup.
await pool.query('DELETE FROM ct_sessions WHERE expires_at < NOW()')
server.listen(port, '0.0.0.0', () => console.log(`ConsultTime PostgreSQL API listening on port ${port}`))

const shutdown = () => server.close(() => closePool().catch(console.error))
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
