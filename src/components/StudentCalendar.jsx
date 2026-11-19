import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import '../styles/student-calendar.css'

const pad = (v) => String(v).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const dateFrom = (key) => new Date(`${key.slice(0,10)}T12:00:00`)
const monday = (d) => { const v = new Date(d); v.setDate(v.getDate() - ((v.getDay()+6)%7)); return v }
const titleDate = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
const COLORS = ['#dc0e0e', '#3478cb', '#309a6c', '#a36ce2']

export default function StudentCalendar({ userId, appointments, onHistory }) {
  const [focus, setFocus] = useState(() => dateFrom(dayKey(new Date())))
  const [selected, setSelected] = useState(() => dayKey(new Date()))
  const [mode, setMode] = useState('week')
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState('')
  const [eventTime, setEventTime] = useState('09:00')
  const [color, setColor] = useState(COLORS[1])
  const [personal, setPersonal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ct_student_calendar_${userId}`) || '[]') } catch { return [] }
  })
  const modalRef = useRef(null)
  useEffect(() => { try { localStorage.setItem(`ct_student_calendar_${userId}`, JSON.stringify(personal)) } catch { /* private mode */ } }, [userId, personal])
  useEffect(() => {
    if (!editing) return
    modalRef.current?.focus()
    const close = (e) => { if (e.key === 'Escape') setEditing(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [editing])
  const weeks = useMemo(() => {
    const base = monday(mode === 'week' ? focus : new Date(focus.getFullYear(), focus.getMonth(), 1, 12))
    const count = mode === 'week' ? 7 : 42
    return Array.from({ length: count }, (_, i) => { const d = new Date(base); d.setDate(d.getDate()+i); return d })
  }, [focus, mode])
  const appointmentDays = useMemo(() => new Map(appointments.reduce((acc, a) => {
    const key = String(a.date || '').slice(0,10)
    if (!key) return acc
    const list = acc.get(key) || []
    list.push(a)
    acc.set(key,list)
    return acc
  }, new Map())), [appointments])
  const dayAppointments = appointmentDays.get(selected) || []
  const dayNotes = personal.filter(e => e.date === selected)
  function move(n) { setFocus(prev => { const d = new Date(prev); mode === 'week' ? d.setDate(d.getDate()+7*n) : d.setMonth(d.getMonth()+n); setSelected(dayKey(d)); return d }) }
  function jumpToday() { const d = dateFrom(dayKey(new Date())); setFocus(d); setSelected(dayKey(d)) }
  function pick(d) { setSelected(dayKey(d)); setFocus(d) }
  function addEvent(e) {
    e.preventDefault()
    if (!label.trim()) return
    setPersonal(old => [...old, { id: crypto.randomUUID(), date: selected, title: label.trim().slice(0,80), time: eventTime, color }])
    setLabel(''); setEditing(false)
  }
  function removeEvent(id) { setPersonal(old => old.filter(e => e.id !== id)) }
  return <div className={`ctcal-card ${mode === 'month' ? 'ctcal-month' : ''}`} aria-label="Interactive student consultation calendar">
    <div className="ctcal-toolbar">
      <div className="ctcal-title"><Icon name="calendar" size={16}/><strong>{focus.toLocaleDateString('en-PH',{month:'long',year:'numeric'})}</strong></div>
      <div className="ctcal-controls">
        <button type="button" onClick={jumpToday} className="ctcal-today">Today</button>
        <button type="button" aria-label="Previous period" onClick={() => move(-1)}><Icon name="chevron-right" size={15} className="ctcal-flip"/></button>
        <button type="button" aria-label="Next period" onClick={() => move(1)}><Icon name="chevron-right" size={15}/></button>
        <select value={mode} aria-label="Calendar view" onChange={e => setMode(e.target.value)}><option value="week">Week</option><option value="month">Month</option></select>
      </div>
    </div>
    <div className="ctcal-days" role="group" aria-label="Select a day">
      {weeks.map(d => { const key = dayKey(d); const events = appointmentDays.get(key) || []; const mine = personal.filter(e => e.date === key); return <button type="button" key={key}
        title={`${titleDate(d)} — ${events.length} consultation(s), ${mine.length} personal event(s)`}
        className={`ctcal-day ${key === selected ? 'is-selected' : ''} ${key === dayKey(new Date()) ? 'is-today' : ''} ${d.getMonth() !== focus.getMonth() && mode === 'month' ? 'is-other' : ''}`}
        aria-pressed={selected === key} onClick={() => pick(d)}>
          <small>{d.toLocaleDateString('en-PH', { weekday: 'short' })}</small><strong>{d.getDate()}</strong>
          <span className="ctcal-dots">{events.length > 0 && <i className="ctcal-dot consultation"/>}{mine.length > 0 && <i className="ctcal-dot personal"/>}</span>
        </button> })}
    </div>
    <div className="ctcal-agenda">
      <div className="ctcal-agenda-heading"><span><strong>{dateFrom(selected).toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'})}</strong> · {dayAppointments.length + dayNotes.length} events</span><button type="button" onClick={() => setEditing(true)}><Icon name="calendar" size={14}/> Add personal event</button></div>
      <div className="ctcal-agenda-items">
        {dayAppointments.slice(0,2).map(a => <button type="button" className="ctcal-event" key={a.id} onClick={onHistory} title="View consultation in History"><span className="ctcal-event-strip"/><span><strong>{a.topic || 'Consultation'}</strong><small>{a.time} · {a.facultyName || 'Faculty'} · {a.status}</small></span><Icon name="arrow-right" size={13}/></button>)}
        {dayNotes.slice(0,2).map(n => <div className="ctcal-event" key={n.id}><span className="ctcal-event-strip" style={{background:n.color}}/><span><strong>{n.title}</strong><small>{n.time} · Private event (this browser)</small></span><button type="button" title="Remove personal event" aria-label={`Remove ${n.title}`} onClick={() => removeEvent(n.id)}><Icon name="close" size={14}/></button></div>)}
        {!dayAppointments.length && !dayNotes.length && <span className="ctcal-no-events">No events on this day. Choose a date or add a private reminder.</span>}
        {dayAppointments.length + dayNotes.length > 2 && <span className="ctcal-more">+{dayAppointments.length + dayNotes.length - 2} more on this day</span>}
      </div>
    </div>
    {editing && <div className="ctcal-modal-backdrop" onMouseDown={e => { if (e.target===e.currentTarget) setEditing(false) }}><form className="ctcal-modal" onSubmit={addEvent} role="dialog" aria-modal="true" aria-label="Add personal calendar event">
      <div className="ctcal-modal-heading"><h3>Personal calendar event</h3><button type="button" onClick={()=>setEditing(false)} aria-label="Close"><Icon name="close" size={17}/></button></div>
      <p>Saved only on this browser, not shared with faculty.</p>
      <label>Event title<input ref={modalRef} value={label} maxLength={80} required placeholder="Study session or reminder" onChange={e=>setLabel(e.target.value)}/></label>
      <div className="ctcal-input-grid"><label>Date<input type="date" value={selected} onChange={e=>setSelected(e.target.value)} required/></label><label>Time<input type="time" value={eventTime} onChange={e=>setEventTime(e.target.value)} required/></label></div>
      <div className="ctcal-palette" role="group" aria-label="Event color">{COLORS.map(c => <button type="button" key={c} style={{background:c}} aria-label={`Select color ${c}`} aria-pressed={color===c} onClick={()=>setColor(c)}>{color === c ? '✓' : ''}</button>)}</div>
      <button type="submit" className="ctcal-save">Save personal event</button>
    </form></div>}
  </div>
}
