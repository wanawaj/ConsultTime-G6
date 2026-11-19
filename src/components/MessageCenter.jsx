import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/api.js'
import Icon from './Icon.jsx'
import '../styles/message-center.css'

const ALLOWED = '.pdf,.png,.jpg,.jpeg,.txt,.docx'
const MAX_BYTES = 350_000
const readableDate = (value) => new Date(value).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})
const asBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(Error('Cannot read the selected file.'))
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
  reader.readAsDataURL(file)
})
const cleanName = str => String(str||'attachment').replace(/[\\/<>:"|?*\x00-\x1f]/g,'_').slice(0,100)

export default function MessageCenter({ user, faculty = [], onNotify }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [composing, setComposing] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)
  const isStudent = user.role === 'student'
  const facultyByEmail = useMemo(() => faculty.find(f => f.email?.toLowerCase() === recipientEmail.toLowerCase()), [faculty, recipientEmail])
  const threads = useMemo(() => {
    const groups = new Map()
    for (const m of messages) {
      const group = groups.get(m.threadId) || []
      group.push(m)
      groups.set(m.threadId, group)
    }
    return [...groups.entries()].map(([id, items]) => ({ id, items: [...items].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)), last: items[0] }))
      .sort((a,b)=>new Date(b.last.createdAt)-new Date(a.last.createdAt))
  }, [messages])
  const active = threads.find(t => t.id === selectedThread)
  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true)
    try { const r = await api('/messages'); setMessages(r.messages || []); if (!silent) setError('') }
    catch (e) { if (!silent) setError(e.message) }
    finally { if (!silent) setLoading(false) }
  }
  useEffect(() => {
    if (!open) return
    load()
    const id = setInterval(() => load({silent:true}), 30_000)
    return () => clearInterval(id)
  }, [open, user.id])
  const activePeerId = active && (active.last.senderId === user.id ? active.last.recipientId : active.last.senderId)
  const activePeer = active && (active.last.senderId === user.id ? active.last.recipientName : active.last.senderName)
  function startNew() { setSelectedThread(null);setComposing(true);setRecipientEmail('');setSubject('');setBody('');setAttachment(null);setError('') }
  function openThread(id) { setSelectedThread(id);setComposing(false);setBody('');setAttachment(null);setError('') }
  async function submit(e) {
    e.preventDefault()
    if (sending) return
    const toId = composing ? facultyByEmail?.id : activePeerId
    const chosenSubject = composing ? subject : active?.items[0]?.subject
    if (!toId) { setError('Choose a registered faculty email from the directory.');return }
    setSending(true); setError('')
    try {
      let payloadFile = null
      if (attachment) {
        if (attachment.size > MAX_BYTES) throw Error('Attachment must be 350 KB or smaller.')
        payloadFile = {name: attachment.name, type: attachment.type || 'text/plain', data: await asBase64(attachment)}
      }
      const result = await api('/messages',{ method:'POST',body:{recipientId:toId,threadId:composing ? '' : selectedThread,subject:chosenSubject,body,attachment:payloadFile}})
      await load({silent:true})
      setComposing(false);setSelectedThread(result.threadId || result.message?.threadId || selectedThread)
      setBody('');setAttachment(null)
      if (fileRef.current) fileRef.current.value = ''
      onNotify?.({type:'success',text:'Message saved and delivered to the faculty inbox.',action:'messages'})
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }
  async function download(m) {
    setError('')
    try {
      const result = await api(`/messages/${encodeURIComponent(m.id)}/attachment`)
      const binary = atob(result.data)
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}))
      const anchor = document.createElement('a')
      anchor.href=url;anchor.download=cleanName(result.name);document.body.appendChild(anchor);anchor.click();anchor.remove()
      setTimeout(()=>URL.revokeObjectURL(url),3000)
    } catch (err) { setError(err.message) }
  }
  return <div className="ctmsg-root">
    {!open && <button type="button" className="ctmsg-launch" onClick={()=>setOpen(true)} aria-label="Open faculty messages"><Icon name="message-square" size={20}/><span>{isStudent ? 'Message faculty' : 'Student messages'}</span></button>}
    {open && <section className="ctmsg-panel" role="dialog" aria-modal="false" aria-label={isStudent ? 'Faculty communication center' : 'Student messages'}>
      <div className="ctmsg-head"><div><span className="ctmsg-head-icon"><Icon name="mail" size={18}/></span><div><strong>{isStudent ? 'Faculty communication' : 'Student messages'}</strong><small>ConsultTime · Campus messaging</small></div></div><div className="ctmsg-head-actions"><button type="button" onClick={()=>load()} title="Refresh messages" aria-label="Refresh messages"><Icon name="refresh-cw" size={16}/></button><button type="button" onClick={()=>setOpen(false)} title="Minimize messages" aria-label="Close messages"><Icon name="close" size={18}/></button></div></div>
      <div className="ctmsg-toolbar"><strong>{composing ? 'New formal message' : active ? 'Conversation' : 'Messages'}</strong><div>{(composing || active) && <button type="button" onClick={()=>{setSelectedThread(null);setComposing(false);setError('')}}>All messages</button>}{isStudent && !composing && <button type="button" className="ctmsg-compose" onClick={startNew}><Icon name="send" size={14}/> Compose</button>}</div></div>
      {error && <div className="ctmsg-error" role="alert">{error}<button type="button" aria-label="Dismiss error" onClick={()=>setError('')}><Icon name="close" size={14}/></button></div>}
      <div className="ctmsg-content">
        {!composing && !active && <div className="ctmsg-thread-list">
          {loading && <p className="ctmsg-muted">Loading conversations…</p>}
          {!loading && !threads.length && <div className="ctmsg-empty"><Icon name="message-square" size={26}/><strong>No messages yet</strong><p>{isStudent ? 'Compose a message to a faculty member using their registered university email.' : 'Student messages will appear here when received.'}</p></div>}
          {threads.map(t => {const name = t.last.senderId === user.id ? t.last.recipientName : t.last.senderName;return <button type="button" key={t.id} className="ctmsg-thread" onClick={()=>openThread(t.id)}><span className="ctmsg-thread-avatar">{String(name || 'F').slice(0,1).toUpperCase()}</span><span><strong>{name}</strong><small>{t.items[0]?.subject}</small><em>{t.last.body}</em></span><time>{readableDate(t.last.createdAt)}</time></button>})}
        </div>}
        {!composing && active && <div className="ctmsg-thread-body"><div className="ctmsg-conversation-meta"><strong>{activePeer}</strong><span>{active.items[0]?.subject}</span></div><div className="ctmsg-bubbles">{active.items.map(m=><div key={m.id} className={`ctmsg-bubble ${m.senderId === user.id ? 'is-self' : ''}`}><small>{m.senderId === user.id ? 'You' : m.senderName} · {readableDate(m.createdAt)}</small><p>{m.body}</p>{m.hasAttachment && <button type="button" onClick={()=>download(m)}><Icon name="file-text" size={14}/> {m.attachmentName} <Icon name="arrow-right" size={12}/></button>}</div>)}</div></div>}
        {(composing || active) && <form className="ctmsg-form" onSubmit={submit}>
          {composing && <><label>To (registered faculty email)<input type="email" list="ctmsg-faculty" required value={recipientEmail} placeholder="faculty@wmsu.edu.ph" onChange={e=>setRecipientEmail(e.target.value)} autoComplete="off"/></label><datalist id="ctmsg-faculty">{faculty.filter(f=>f.email).map(f=><option key={f.id} value={f.email}>{f.firstName} {f.lastName}</option>)}</datalist><label>Subject<input required maxLength={160} value={subject} placeholder="Consultation follow-up" onChange={e=>setSubject(e.target.value)}/></label></>}
          {!composing && <span className="ctmsg-to-line">Reply to {activePeer}</span>}
          <label className="ctmsg-compose-body"><span>{composing ? 'Message' : 'Reply'}</span><textarea required maxLength={3000} rows={composing?4:3} placeholder="Good day, Professor…" value={body} onChange={e=>setBody(e.target.value)}/></label>
          <div className="ctmsg-attach-line"><label className="ctmsg-file-trigger"><Icon name="file-text" size={15}/> {attachment ? attachment.name : 'Attach file'}<input ref={fileRef} type="file" accept={ALLOWED} onChange={e=>{const f=e.target.files?.[0];if(f?.size>MAX_BYTES){setError('File must be 350 KB or smaller.');e.target.value='';setAttachment(null)}else{setError('');setAttachment(f||null)}}}/></label>{attachment && <button type="button" onClick={()=>{setAttachment(null);if(fileRef.current)fileRef.current.value=''}}>Remove</button>}</div>
          <div className="ctmsg-send-row"><span>PDF, JPG, PNG, TXT, DOCX · ≤350 KB</span><button type="submit" disabled={sending || !body.trim()}><Icon name="send" size={16}/>{sending ? 'Sending…' : 'Send'}</button></div>
        </form>}
      </div>
      <div className="ctmsg-foot">Messages stay inside ConsultTime. This is not a Gmail email.</div>
    </section>}
  </div>
}
