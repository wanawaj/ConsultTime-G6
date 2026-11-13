import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import { promisify } from 'node:util'
import { validPassword } from '../src/utils/passwordRules.js'
import { validStudentId } from '../src/utils/studentId.js'
import { validWmsuProgram } from '../src/data/wmsuPrograms.js'

// This server is a LOCAL development reference, not a production auth service.
const scrypt = promisify(crypto.scrypt)
const dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(dirname, 'data')
const dataPath = path.join(dataDir, 'dev-db.json')
const port = Number(process.env.API_PORT || 3001)
fs.mkdirSync(dataDir, { recursive: true })

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = (await scrypt(password, salt, 64)).toString('hex')
  return `${salt}:${hash}`
}
async function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':')
  if (!salt || !hash) return false
  const check = await scrypt(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return expected.length === check.length && crypto.timingSafeEqual(expected, check)
}
const isoDay = (d) => d.toISOString().slice(0, 10)
function buildSlots() {
  const dates = []
  for (let i = 1; i <= 24; i++) {
    const d = new Date(Date.now() + i * 86400000)
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue
    dates.push(isoDay(d))
  }
  return dates.flatMap(date => ['09:00','10:30','13:00','14:30'].map(time => ({ date, time })))
}
async function seed() {
  const users = [
    { id: 'faculty-1', role: 'faculty', firstName: 'Alex', lastName: 'Reyes', email: 'faculty@consulttime.local', department: 'Computer Science' },
    { id: 'faculty-2', role: 'faculty', firstName: 'Jamie', lastName: 'Santos', email: 'faculty2@consulttime.local', department: 'Information Technology' },
    { id: 'admin-1', role: 'admin', firstName: 'System', lastName: 'Administrator', email: 'admin@consulttime.local' },
  ]
  for (const user of users) user.passwordHash = await hashPassword('DemoPass123!')
  return { version: 1, users, appointments: [] }
}
const db = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : await seed()
function save() {
  const tmp = `${dataPath}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), { mode: 0o600 })
  fs.renameSync(tmp, dataPath)
}
if (!fs.existsSync(dataPath)) save()
const sessions = new Map()
function cleanUser(user) {
  if (!user) return null
  const { passwordHash, ...safe } = user
  return safe
}
function getCookie(req, key) {
  return (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${key}=`))?.slice(key.length + 1)
}
function currentUser(req) {
  const token = getCookie(req, 'consulttime_session')
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiration < Date.now()) { sessions.delete(token); return null }
  return db.users.find(x => x.id === session.userId) || null
}
function send(res, status, value, headers={}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers })
  res.end(JSON.stringify(value))
}
const bad = (res, message, code=400) => send(res, code, { error: message })
async function bodyJSON(req) {
  let chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > 20_000) throw new Error('Request too large.')
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try { return JSON.parse(raw) }
  catch { throw new Error('Invalid request data.') }
}
const validEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text || '') && text.length <= 160
const textField = (v, max=200) => String(v || '').trim().slice(0,max)
const getFaculty = () => db.users.filter(u => u.role === 'faculty').map(u=>cleanUser(u))
const getAppointments = user => db.appointments.filter(a => user.role === 'admin' || (user.role === 'faculty' ? a.facultyId === user.id : a.studentId === user.id)).map(a => {
  const faculty = db.users.find(u=>u.id===a.facultyId)
  const student = db.users.find(u=>u.id===a.studentId)
  return { ...a, facultyName: faculty ? `${faculty.firstName} ${faculty.lastName}` : 'Faculty', studentName: student ? `${student.firstName} ${student.lastName}` : 'Student' }
}).sort((a,b) => b.createdAt.localeCompare(a.createdAt))
const loginAttempts = new Map()

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const method = req.method
  if (method === 'OPTIONS') return bad(res, 'Not supported.', 405)
  if (!url.pathname.startsWith('/api/')) return bad(res, 'API routes begin with /api.', 404)
  // Prevent cross-site form submissions; Vite development proxy shares the page origin.
  if (['POST','PUT','PATCH','DELETE'].includes(method) && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return bad(res, 'Cross-origin request rejected.', 403)
  try {
    if (method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true, mode: 'local-development' })
    if (method === 'GET' && url.pathname === '/api/me') return send(res, 200, { user: cleanUser(currentUser(req)) })

    if (method === 'POST' && url.pathname === '/api/register') {
      const data = await bodyJSON(req)
      const firstName=textField(data.firstName,80), lastName=textField(data.lastName,80)
      const studentId=textField(data.studentId,40), email=textField(data.email,160).toLowerCase()
      const college = textField(data.college, 120), program = textField(data.program, 160), yearLevel = textField(data.yearLevel, 20)
      if (!firstName || !lastName || !studentId || !validEmail(email) || !college || !program || !yearLevel) return bad(res, 'Please complete the required registration details.')
      if (!validStudentId(studentId)) return bad(res, 'Student ID must contain exactly four digits, a hyphen, and five digits (0000-00000).')
      if (!validWmsuProgram(college, program)) return bad(res, 'Choose a program under its WMSU college.')
      if (!['1st Year','2nd Year','3rd Year','4th Year','5th Year','6th Year'].includes(yearLevel)) return bad(res, 'Choose a valid year level.')
      if (!validPassword(data.password)) return bad(res, 'Password needs 8–128 characters, uppercase and lowercase letters, a number, a special character, and no spaces.')
      if (db.users.some(u=>u.email===email || (u.studentId && u.studentId.toLowerCase()===studentId.toLowerCase()))) return bad(res, 'This email or student ID is already registered.',409)
      const user = { id: crypto.randomUUID(), role:'student',firstName,lastName,middleName:textField(data.middleName,80),studentId,email,college,program,yearLevel,passwordHash:await hashPassword(data.password) }
      db.users.push(user); save()
      const token = crypto.randomBytes(32).toString('hex'); sessions.set(token,{userId:user.id,expiration:Date.now()+86400000})
      return send(res,201,{user:cleanUser(user)}, {'Set-Cookie': `consulttime_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${process.env.NODE_ENV==='production' ? '; Secure' : ''}`})
    }
    if (method === 'POST' && url.pathname === '/api/login') {
      const data = await bodyJSON(req)
      const email=textField(data.email,160).toLowerCase()
      const tries = loginAttempts.get(email) || { count: 0, start: Date.now() }
      if (Date.now()-tries.start > 10*60_000) { tries.count=0; tries.start=Date.now() }
      if (tries.count >= 15) return bad(res,'Too many attempts. Try again later.',429)
      const user=db.users.find(u=>u.email===email)
      if (!user || !await verifyPassword(String(data.password || ''),user.passwordHash)) { tries.count++; loginAttempts.set(email,tries); return bad(res,'Incorrect email or password.',401) }
      loginAttempts.delete(email)
      const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{userId:user.id,expiration:Date.now()+86400000})
      return send(res,200,{user:cleanUser(user)}, {'Set-Cookie': `consulttime_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${process.env.NODE_ENV==='production' ? '; Secure' : ''}`})
    }
    if (method === 'POST' && url.pathname === '/api/logout') {
      sessions.delete(getCookie(req,'consulttime_session'))
      return send(res,200,{ok:true},{'Set-Cookie':'consulttime_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'})
    }
    const user = currentUser(req)
    if (!user) return bad(res, 'Please sign in first.', 401)
    if (method === 'GET' && url.pathname === '/api/faculty') return send(res,200,{faculty:getFaculty()})
    if (method === 'GET' && url.pathname === '/api/slots') {
      const facultyId=url.searchParams.get('facultyId')
      if (!db.users.some(u=>u.id===facultyId&&u.role==='faculty')) return bad(res,'Choose a faculty member.')
      const booked=new Set(db.appointments.filter(a=>a.facultyId===facultyId&&!['Declined','Cancelled'].includes(a.status)).map(a=>`${a.date} ${a.time}`))
      return send(res,200,{slots:buildSlots().filter(s=>!booked.has(`${s.date} ${s.time}`))})
    }
    if (method === 'GET' && url.pathname === '/api/appointments') return send(res,200,{appointments:getAppointments(user)})
    if (method === 'POST' && url.pathname === '/api/appointments') {
      if (user.role!=='student') return bad(res,'Only students may request a consultation.',403)
      const data=await bodyJSON(req)
      const facultyId=textField(data.facultyId,80),date=textField(data.date,20),time=textField(data.time,10)
      const topic=textField(data.topic,120),notes=textField(data.notes,800)
      if (!db.users.some(u=>u.id===facultyId&&u.role==='faculty')) return bad(res,'Choose a valid faculty member.')
      if (!buildSlots().some(s=>s.date===date&&s.time===time)) return bad(res,'That time is not available.')
      if (!topic) return bad(res,'Please enter a consultation topic.')
      if (db.appointments.some(a=>a.facultyId===facultyId&&a.date===date&&a.time===time&&!['Declined','Cancelled'].includes(a.status))) return bad(res,'That time has already been booked.',409)
      const appointment={id:crypto.randomUUID(),studentId:user.id,facultyId,date,time,topic,notes,status:'Pending',createdAt:new Date().toISOString()}
      db.appointments.push(appointment);save()
      return send(res,201,{appointment})
    }
    const statusPath=url.pathname.match(/^\/api\/appointments\/([^/]+)$/)
    if (method==='PATCH' && statusPath) {
      const data=await bodyJSON(req)
      const appt=db.appointments.find(x=>x.id===statusPath[1]);if(!appt) return bad(res,'Consultation not found.',404)
      const status=textField(data.status,20)
      if (user.role==='student') {
        if (appt.studentId!==user.id||status!=='Cancelled'||!['Pending','Approved'].includes(appt.status)) return bad(res,'You cannot change this consultation.',403)
      } else {
        if (user.role==='faculty'&&appt.facultyId!==user.id) return bad(res,'This consultation belongs to another faculty member.',403)
        if (!['Approved','Declined'].includes(status)||appt.status!=='Pending') return bad(res,'Only pending requests can be approved or declined.')
      }
      appt.status=status;appt.updatedAt=new Date().toISOString();save()
      return send(res,200,{appointment:appt})
    }
    if (method==='GET' && url.pathname==='/api/admin/summary') {
      if (user.role!=='admin') return bad(res,'Administrator access required.',403)
      return send(res,200,{ students:db.users.filter(u=>u.role==='student').length, faculty:db.users.filter(u=>u.role==='faculty').length, consultations:db.appointments.length, pending:db.appointments.filter(a=>a.status==='Pending').length })
    }
    return bad(res,'Endpoint not found.',404)
  } catch (error) {
    if (/Request too large|Invalid request/.test(error.message)) return bad(res,error.message)
    console.error('Request error:',error)
    return bad(res,'The server could not complete your request.',500)
  }
})
server.listen(port, '127.0.0.1', () => console.log(`ConsultTime local API: http://127.0.0.1:${port}`))
