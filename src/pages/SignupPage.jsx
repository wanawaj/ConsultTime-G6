import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFrame from '../components/AuthFrame.jsx'
import PasswordField from '../components/PasswordField.jsx'
import Icon from '../components/Icon.jsx'
import SelectField from '../components/SelectField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { WMSU_COLLEGES, WMSU_PROGRAMS, validWmsuProgram } from '../data/wmsuPrograms.js'
import { validPassword } from '../utils/passwordRules.js'
import { formatStudentId, validStudentId } from '../utils/studentId.js'

const initial = { firstName:'', middleName:'', lastName:'', studentId:'', email:'', college:'', program:'', yearLevel:'', password:'', confirmPassword:'', agreed:false }
export default function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key) => (event) => setForm((cur) => ({...cur, [key]: event.target.value}))
  const setStudentId = (event) => setForm(cur => ({...cur, studentId: formatStudentId(event.target.value)}))
  const goBack = () => { setStep(1); setError('') }
  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (step === 1) {
      if (![form.firstName, form.lastName, form.studentId, form.email].every((v) => v.trim())) return setError('Please complete all required student details.')
      if (!validStudentId(form.studentId)) return setError('Student ID must be exactly 4 digits, a hyphen, and 5 digits (e.g., 2025-02698).')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email address.')
      setStep(2); return
    }
    if (!form.college || !form.program || !form.yearLevel) return setError('Select your college/department, program and year level.')
    if (!validWmsuProgram(form.college, form.program)) return setError('Choose a program under the selected WMSU college.')
    if (!validPassword(form.password)) return setError('Check the live password requirements below and complete any missing items.')
    if (form.password !== form.confirmPassword) return setError('Your passwords do not match.')
    if (!form.agreed) return setError('Please confirm the account information acknowledgement.')
    setBusy(true)
    try { await register(form); navigate('/portal') }
    catch (err) { setError(err.message || 'Registration is unavailable.') }
    finally { setBusy(false) }
  }
  return <AuthFrame wide pageClassName={step === 2 ? 'ct-signup-step-two' : ''} title="Create your account" description="Get started with a more organized academic consultation experience." sideLabel="GETTING STARTED">
    <div className="ct-registration-progress" aria-label={`Step ${step} of 2`}>
      <div className={`ct-progress-step ${step >= 1 ? 'active' : ''} ${step === 2 ? 'complete' : ''}`} aria-current={step === 1 ? 'step': undefined}><span className="ct-progress-circle">{step === 2 ? <Icon name="check" size={16}/> : '1'}</span><div><strong>Student details</strong><small>Basic information</small></div></div>
      <div className={`ct-progress-connector${step === 2 ? ' done' : ''}`}/>
      <div className={`ct-progress-step${step === 2 ? ' active' : ''}`} aria-current={step === 2 ? 'step': undefined}><span className="ct-progress-circle">2</span><div><strong>Account security</strong><small>Finish setup</small></div></div>
    </div>
    <form className="ct-auth-form ct-signup-form" onSubmit={submit} noValidate>
      {step === 1 ? <div className="ct-form-grid">
        <label className="ct-field"><span>First name <em>*</em></span><input value={form.firstName} onChange={set('firstName')} placeholder="First name" autoComplete="given-name" /></label>
        <label className="ct-field"><span>Middle name <small>(optional)</small></span><input value={form.middleName} onChange={set('middleName')} placeholder="Middle name" autoComplete="additional-name" /></label>
        <label className="ct-field"><span>Last name <em>*</em></span><input value={form.lastName} onChange={set('lastName')} placeholder="Last name" autoComplete="family-name" /></label>
        <label className="ct-field"><span>Student ID <em>*</em></span><input type="text" inputMode="numeric" maxLength={10} pattern="[0-9]{4}-[0-9]{5}" value={form.studentId} onChange={setStudentId} placeholder="0000-00000" autoComplete="off" aria-describedby="ct-student-id-format" aria-invalid={Boolean(form.studentId) && !validStudentId(form.studentId)} /><small id="ct-student-id-format">Format: 0000-00000</small></label>
        <label className="ct-field ct-field-full"><span>University email <em>*</em></span><input type="email" value={form.email} onChange={set('email')} placeholder="you@wmsu.edu.ph" autoComplete="email" /><small>Use the university email address associated with your student record.</small></label>
      </div> : <div className="ct-form-grid ct-signup-security-grid">
        <div className="ct-field"><span id="ct-college-label">College / Department <em>*</em></span><SelectField labelId="ct-college-label" name="college" value={form.college} onChange={v => setForm(cur => ({...cur, college:v, program:''}))} placeholder="Select your WMSU college / department" options={WMSU_COLLEGES} /></div>
        <div className="ct-field"><span id="ct-program-label">Program / Course <em>*</em></span><SelectField labelId="ct-program-label" name="program" value={form.program} disabled={!form.college} onChange={v => setForm(cur => ({...cur, program:v}))} placeholder={form.college ? 'Select your program / course' : 'Select a college / department first'} options={form.college ? WMSU_PROGRAMS[form.college] : []} /></div>
        <div className="ct-field"><span id="ct-year-label">Year level <em>*</em></span><SelectField labelId="ct-year-label" name="yearLevel" value={form.yearLevel} onChange={v => setForm(cur => ({...cur, yearLevel:v}))} placeholder="Select year level" options={['1st Year','2nd Year','3rd Year','4th Year','5th Year','6th Year']} /></div>
        <PasswordField label="Password" id="signup-password" value={form.password} onChange={set('password')} showRequirements />
        <div className="ct-security-confirm"><PasswordField label="Confirm password" id="signup-confirm" value={form.confirmPassword} onChange={set('confirmPassword')} />{form.confirmPassword && <small className={`ct-password-match ${form.password === form.confirmPassword ? 'met' : 'missing'}`} role="status" aria-live="polite">{form.password === form.confirmPassword ? '✓ Passwords match' : 'Passwords do not match yet'}</small>}</div>
        <div className="ct-account-note ct-security-agreement"><label><input type="checkbox" checked={form.agreed} onChange={e => setForm(cur=>({...cur,agreed:e.target.checked}))}/> <span>I confirm that the details entered are accurate and understand my account will need to be handled securely.</span></label></div>
      </div>}
      {error && <p className="ct-form-error" role="alert">{error}</p>}
      <div className="ct-registration-actions">{step === 2 && <button className="ct-btn ct-btn-outline" type="button" onClick={goBack}>Back</button>}<button disabled={busy} className="ct-btn ct-btn-primary" type="submit">{busy ? 'Submitting…' : step === 1 ? 'Continue' : 'Create Account'} <Icon name="arrow-right" size={17}/></button></div>
    </form>
    <p className="ct-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </AuthFrame>
}
