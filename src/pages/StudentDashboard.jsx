import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import StudentCalendar from "../components/StudentCalendar.jsx";
import MessageCenter from "../components/MessageCenter.jsx";
import SelectField from "../components/SelectField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/student-dashboard.css";

const NAV = [
  { id: "overview", name: "Overview", icon: "layout-dashboard" },
  { id: "faculty", name: "Faculty Directory", icon: "users" },
  { id: "booking", name: "Book Consultation", icon: "calendar" },
  { id: "history", name: "Consultation History", icon: "history" },
  { id: "profile", name: "My Profile", icon: "graduation" },
];
const STATUSES = ["All", "Pending", "Approved", "Declined", "Cancelled", "Completed"];
const nameOf = (person) => [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "Student";
const fmtDate = (value) => {
  if (!value) return "Date not set";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
};
const fmtTime = (value) => {
  if (!value) return "Time not set";
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value));
  if (!match) return String(value);
  const h = Number(match[1]);
  return `${h % 12 || 12}:${match[2]} ${h >= 12 ? "PM" : "AM"}`;
};
const isUpcoming = (a) => {
  if (a.status !== "Approved") return false;
  const when = new Date(`${String(a.date).slice(0, 10)}T${a.time || "00:00"}:00`);
  return !Number.isNaN(when.getTime()) && when.getTime() >= Date.now();
};
function Status({ value }) {
  return <span className={`csd-status csd-status-${String(value || "unknown").toLowerCase()}`}>{value || "Unknown"}</span>;
}
function Empty({ icon = "calendar", title, detail }) {
  return (
    <div className="csd-empty">
      <span className="csd-empty-icon"><Icon name={icon} size={23} /></span>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}
function SectionTitle({ eyebrow, title, detail, trailing }) {
  return (
    <div className="csd-section-title">
      <div>
        {eyebrow && <span className="csd-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {trailing && <div className="csd-section-title-action">{trailing}</div>}
    </div>
  );
}

export default function StudentDashboard({
  user, faculty = [], appointments = [], facultyId, setFacultyId,
  date, setDate, time, setTime, topic, setTopic, notes, setNotes,
  days = [], times = [], busy, message, error, createRequest, changeStatus, refresh,
}) {
  const [view, setView] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyStatus, setHistoryStatus] = useState("All");
  const [pendingCancel, setPendingCancel] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState(null);
  const cancelRef = useRef(null);
  useEffect(() => {
    if (message) setToast({id: `${Date.now()}-${Math.random()}`, type:'success', text:message, action:'history'});
  }, [message]);
  useEffect(() => {
    if (error) setToast({id: `${Date.now()}-${Math.random()}`, type:'error', text:error});
  }, [error]);
  useEffect(() => {
    if (!toast) return;
    const id = toast.id;
    const startExit = setTimeout(() => setToast(current => current?.id === id ? {...current, leaving:true} : current), 4800);
    const remove = setTimeout(() => setToast(current => current?.id === id ? null : current), 5130);
    return () => { clearTimeout(startExit); clearTimeout(remove); };
  }, [toast?.id]);
  function dismissToast() {
    setToast(current => current ? {...current, leaving:true} : null);
    setTimeout(() => setToast(current => current?.leaving ? null : current), 330);
  }

  const { signOut } = useAuth();
  const navigate = useNavigate();
  const fullName = nameOf(user);
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "ST";
  const sorted = useMemo(() => [...appointments].sort((a, b) => {
    const first = `${a.date || ""}T${a.time || ""}`;
    const second = `${b.date || ""}T${b.time || ""}`;
    return second.localeCompare(first);
  }), [appointments]);
  const upcoming = useMemo(() => [...appointments].filter(isUpcoming).sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)), [appointments]);
  // The overview summaries stay distinct: upcoming approved sessions are not repeated in recent requests.
  const recent = sorted.filter((a) => !isUpcoming(a)).slice(0, 4);
  const pending = appointments.filter((a) => a.status === "Pending").length;
  const approved = appointments.filter((a) => a.status === "Approved").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const filteredFaculty = faculty.filter((f) =>
    `${f.firstName} ${f.lastName} ${f.department || ""}`.toLowerCase().includes(query.toLowerCase()));
  const filteredHistory = sorted.filter((a) =>
    (historyStatus === "All" || a.status === historyStatus) &&
    `${a.facultyName || ""} ${a.topic || ""} ${a.date || ""}`.toLowerCase().includes(historyQuery.toLowerCase()));
  const selectedFaculty = faculty.find((f) => String(f.id) === String(facultyId));

  const choose = (id) => {
    setView(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const chooseFaculty = (f) => {
    setFacultyId(String(f.id));
    setDate("");
    setTime("");
    choose("booking");
  };
  const cancelAllowed = (a) => ["Pending", "Approved"].includes(a.status);
  const requestCancel = (a) => setPendingCancel(a);
  useEffect(() => {
    if (!pendingCancel) return;
    cancelRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape" && !busy) setPendingCancel(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pendingCancel, busy]);
  async function confirmCancel() {
    if (!pendingCancel || busy) return;
    const { id } = pendingCancel;
    setPendingCancel(null);
    await changeStatus(id, "Cancelled");
  }
  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try { await signOut(); navigate("/", { replace: true }); }
    catch { setSigningOut(false); }
  }
  const recordRow = (a, compact = false) => (
    <tr key={a.id}>
      <td><div className="csd-person"><span className="csd-person-avatar"><Icon name="users" size={17} /></span><span><strong>{a.facultyName || "Faculty member"}</strong><small>{compact ? a.topic : "Faculty consultation"}</small></span></div></td>
      <td><strong>{fmtDate(a.date)}</strong><small>{fmtTime(a.time)}</small></td>
      {!compact && <td><strong className="csd-topic">{a.topic || "—"}</strong>{a.notes && <small className="csd-notes">{a.notes}</small>}</td>}
      <td><Status value={a.status} /></td>
      {!compact && <td>{cancelAllowed(a) ? <button type="button" disabled={busy} className="csd-text-danger" onClick={() => requestCancel(a)}>Cancel request</button> : <span className="csd-muted">—</span>}</td>}
    </tr>
  );
  const recordTable = (items, compact = false) => (
    <div className="csd-table-scroll"><table className="csd-table">
      <thead><tr><th>Faculty member</th><th>Date & time</th>{!compact && <th>Topic</th>}<th>Status</th>{!compact && <th>Action</th>}</tr></thead>
      <tbody>{items.map((a) => recordRow(a, compact))}</tbody>
    </table></div>
  );

  return (
    <div className="csd-app">
      {menuOpen && <button type="button" className="csd-mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`csd-sidebar${menuOpen ? " is-open" : ""}`} aria-label="Student portal navigation">
        <div className="csd-sidebar-brand">
          <span className="csd-brand-mark"><Icon name="calendar" size={24} strokeWidth={2.1} /></span>
          <span><strong>Consult<span>Time</span></strong><small>ACADEMIC CONSULTATION</small></span>
          <button type="button" className="csd-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" size={20} /></button>
        </div>
        <div className="csd-sidebar-label">STUDENT WORKSPACE</div>
        <nav className="csd-nav" aria-label="Dashboard sections">
          {NAV.map((item) => <button type="button" key={item.id} className={`csd-nav-link${view === item.id ? " is-active" : ""}`} onClick={() => choose(item.id)} aria-current={view === item.id ? "page" : undefined}>
            <Icon name={item.icon} size={20} /><span>{item.name}</span>{view === item.id && <span className="csd-nav-dot" aria-hidden="true" />}
          </button>)}
        </nav>
        <div className="csd-sidebar-bottom">
          <Link to="/" className="csd-back-link"><Icon name="arrow-right" size={17} /> Back to website</Link>
          <button type="button" className="csd-logout" onClick={handleSignOut} disabled={signingOut}><Icon name="lock" size={17} />{signingOut ? "Signing out…" : "Sign out"}</button>
        </div>
      </aside>
      <div className="csd-workspace">
        <header className="csd-topbar">
          <div className="csd-topbar-left"><button type="button" className="csd-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Icon name="menu" size={22} /></button><div className="csd-breadcrumb">Student Portal <Icon name="chevron-right" size={15} /> <strong>{NAV.find((item) => item.id === view)?.name}</strong></div></div>
          <div className="csd-topbar-actions"><span className="csd-campus"><Icon name="graduation" size={16} /> WMSU</span><div className="csd-user-chip" aria-label={`Signed in as ${fullName}`}><span className="csd-user-avatar">{initials}</span><span><strong>{fullName}</strong><small>Student</small></span></div></div>
        </header>
        {toast && <div className={`csd-toast csd-toast-${toast.type}${toast.leaving ? " is-leaving" : ""}`} key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'}>
          <span className="csd-toast-symbol"><Icon name={toast.type === 'error' ? 'shield' : 'check-circle'} size={19}/></span>
          <div className="csd-toast-text"><strong>{toast.type === 'error' ? 'Action needs attention' : 'Success'}</strong><span>{toast.text}</span></div>
          {toast.action === 'history' && <button type="button" className="csd-toast-action" onClick={() => {choose('history');setToast(null)}}>View</button>}
          <button type="button" className="csd-toast-dismiss" aria-label="Dismiss notification" onClick={dismissToast}><Icon name="close" size={16}/></button>
        </div>}
        <div className="csd-main" id="student-main" key={view}>

          {view === "overview" && <>
            <div className="csd-welcome-row"><div><span className="csd-kicker">STUDENT DASHBOARD</span><h1>Good to see you, {user.firstName || "Student"}<span className="csd-wave">.</span></h1><p>Here's what's happening with your academic consultations.</p></div><button type="button" className="csd-quiet-button" onClick={refresh} disabled={busy}><Icon name="refresh-cw" size={16} /> Refresh</button></div>
            <section className="csd-hero" aria-label="Your consultation schedule">
              <div className="csd-hero-copy"><span className="csd-hero-pill"><Icon name="sparkles" size={14}/> YOUR ACADEMIC TIME, ORGANIZED</span><h2>Better conversations.<br/>Better progress.</h2><p>Stay on top of your faculty consultations and personal schedule.</p><button type="button" className="csd-hero-button" onClick={() => choose("booking")}>Book a consultation <Icon name="arrow-right" size={17}/></button></div>
              <div className="csd-hero-calendar"><StudentCalendar userId={user.id} appointments={appointments} onHistory={() => choose('history')} /></div>
            </section>
            <div className="csd-stats" aria-label="Your consultation statistics">
              <div className="csd-stat"><span className="csd-stat-icon neutral"><Icon name="calendar" size={20}/></span><div><small>Total Requests</small><strong>{appointments.length}</strong><span>All consultation records</span></div></div>
              <div className="csd-stat"><span className="csd-stat-icon amber"><Icon name="clock" size={20}/></span><div><small>Pending Review</small><strong>{pending}</strong><span>Awaiting faculty response</span></div></div>
              <div className="csd-stat"><span className="csd-stat-icon green"><Icon name="check-circle" size={20}/></span><div><small>Approved</small><strong>{approved}</strong><span>Accepted requests</span></div></div>
              <div className="csd-stat"><span className="csd-stat-icon coral"><Icon name="history" size={20}/></span><div><small>Completed</small><strong>{completed}</strong><span>Recorded consultations</span></div></div>
            </div>
            <section className="csd-surface"><SectionTitle eyebrow="LATEST ACTIVITY" title="Other recent requests" detail="Latest request statuses, excluding upcoming approved consultations. See Consultation History for all records."/>{recent.length ? recordTable(recent,true) : <Empty icon="history" title="No requests yet" detail="Your consultation requests will show up here once you book a slot."/>}</section>
          </>}

          {view === "faculty" && <><div className="csd-page-heading"><div><span className="csd-kicker">CONNECT WITH YOUR FACULTY</span><h1>Faculty directory</h1><p>Search for your faculty member and continue to their available consultation dates.</p></div><span className="csd-count-badge">{faculty.length} faculty members</span></div><section className="csd-surface"><div className="csd-directory-toolbar"><label className="csd-search"><Icon name="search" size={19}/><input aria-label="Search faculty" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name or department…" /></label><span className="csd-muted">Select a faculty member to book</span></div>{filteredFaculty.length ? <div className="csd-faculty-grid">{filteredFaculty.map((f) => <div key={f.id} className="csd-faculty-card"><span className="csd-faculty-avatar">{[f.firstName?.[0],f.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "FC"}</span><div className="csd-faculty-info"><strong>{nameOf(f)}</strong><span>{f.department || "Faculty member"}</span></div><button type="button" className="csd-outline-button" onClick={()=>chooseFaculty(f)}>View schedule <Icon name="arrow-right" size={15}/></button></div>)}</div> : <Empty icon="search" title={faculty.length ? "No matching faculty" : "No faculty accounts found"} detail={faculty.length ? "Try a different name or department." : "Faculty members will appear here when their accounts are available."}/>}</section></>}

          {view === "booking" && <><div className="csd-page-heading"><div><span className="csd-kicker">PLAN YOUR NEXT CONVERSATION</span><h1>Book a consultation</h1><p>Choose a faculty member, select an available slot, and share your topic.</p></div></div><div className="csd-booking-layout"><section className="csd-surface"><SectionTitle eyebrow="NEW REQUEST" title="Consultation details" detail="Only slots provided by the system can be requested."/><form onSubmit={createRequest} className="csd-book-form"><div className="ct-field"><span id="csd-faculty-label">Faculty member <em>*</em></span><SelectField labelId="csd-faculty-label" name="facultyId" value={facultyId} onChange={(id)=>{setFacultyId(id);setDate("");setTime("");}} placeholder="Select a faculty member" options={faculty.map((f)=>({value:String(f.id),label:`${nameOf(f)} — ${f.department || "Faculty"}`}))}/></div><div className="csd-two-fields"><div className="ct-field"><span id="csd-date-label">Available date <em>*</em></span><SelectField labelId="csd-date-label" name="date" value={date} disabled={!facultyId} onChange={(v)=>{setDate(v);setTime("");}} placeholder={facultyId && !days.length ? "No available dates" : "Select a date"} options={days.map((d)=>({value:d,label:fmtDate(d)}))}/></div><div className="ct-field"><span id="csd-time-label">Available time <em>*</em></span><SelectField labelId="csd-time-label" name="time" value={time} disabled={!date} onChange={setTime} placeholder="Select a time" options={times.map((t)=>({value:t,label:fmtTime(t)}))}/></div></div><label className="ct-field"><span>Consultation topic <em>*</em></span><input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="e.g. Capstone project guidance" required maxLength={120}/></label><label className="ct-field"><span>Additional notes <small>(optional)</small></span><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} maxLength={800} rows={4} placeholder="What would you like to discuss?"/></label><button type="submit" className="csd-primary-button" disabled={busy || !facultyId || !date || !time || !topic.trim()}>{busy ? "Submitting request…" : "Submit consultation request"} <Icon name="arrow-right" size={18}/></button></form></section><aside className="csd-booking-aside"><div className="csd-surface csd-booking-summary"><span className="csd-kicker">REQUEST SUMMARY</span><h3>You're almost there</h3><div className="csd-summary-row"><Icon name="users" size={18}/><div><small>Faculty</small><strong>{selectedFaculty ? nameOf(selectedFaculty) : "Not selected"}</strong></div></div><div className="csd-summary-row"><Icon name="calendar" size={18}/><div><small>Date</small><strong>{date ? fmtDate(date) : "Not selected"}</strong></div></div><div className="csd-summary-row"><Icon name="clock" size={18}/><div><small>Time</small><strong>{time ? fmtTime(time) : "Not selected"}</strong></div></div><div className="csd-summary-note"><Icon name="shield" size={17}/><span>Submitting creates a <strong>Pending</strong> request. Your faculty member must review it.</span></div></div>{facultyId && days.length===0 && <div className="csd-hint"><Icon name="clock" size={18}/> No currently offered slots for this faculty member. Try another faculty member or check later.</div>}</aside></div></>}

          {view === "history" && <><div className="csd-page-heading"><div><span className="csd-kicker">ALL IN ONE PLACE</span><h1>Consultation history</h1><p>View requests and consultations together, including cancelled and declined records.</p></div><span className="csd-count-badge">{appointments.length} total records</span></div><section className="csd-surface"><div className="csd-history-toolbar"><label className="csd-search"><Icon name="search" size={19}/><input value={historyQuery} onChange={(e)=>setHistoryQuery(e.target.value)} aria-label="Search consultation history" placeholder="Search faculty, topic or date…"/></label><label className="csd-filter-label">Status <select value={historyStatus} onChange={(e)=>setHistoryStatus(e.target.value)}>{STATUSES.map((s)=><option key={s} value={s}>{s}</option>)}</select></label></div>{filteredHistory.length ? recordTable(filteredHistory) : <Empty icon="history" title={appointments.length ? "No matching records" : "No consultation history yet"} detail={appointments.length ? "Adjust the search or status filter." : "Your first consultation request will appear here."}/>}</section></>}

          {view === "profile" && <><div className="csd-page-heading"><div><span className="csd-kicker">ACCOUNT INFORMATION</span><h1>My student profile</h1><p>Review the academic details associated with your ConsultTime account.</p></div></div><div className="csd-profile-grid"><section className="csd-surface csd-profile-main"><div className="csd-profile-banner"><span className="csd-profile-avatar">{initials}</span><div><h2>{fullName}</h2><p>Student account · Western Mindanao State University</p></div></div><SectionTitle title="Personal information"/><dl className="csd-profile-fields"><div><dt>First name</dt><dd>{user.firstName || "Not provided"}</dd></div><div><dt>Middle name</dt><dd>{user.middleName || "Not provided"}</dd></div><div><dt>Last name</dt><dd>{user.lastName || "Not provided"}</dd></div><div><dt>Student ID</dt><dd>{user.studentId || "Not provided"}</dd></div><div className="csd-profile-span"><dt>University email</dt><dd>{user.email || "Not provided"}</dd></div></dl><SectionTitle title="Academic information"/><dl className="csd-profile-fields"><div><dt>College / department</dt><dd>{user.college || "Not provided"}</dd></div><div><dt>Program / course</dt><dd>{user.program || "Not provided"}</dd></div><div><dt>Year level</dt><dd>{user.yearLevel || "Not provided"}</dd></div><div><dt>School year</dt><dd>{user.schoolYear || "Not configured"}</dd></div></dl></section><aside className="csd-profile-aside"><div className="csd-surface"><span className="csd-profile-side-icon"><Icon name="shield" size={23}/></span><h3>Account details</h3><p>Your profile currently displays information from your saved registration record.</p><div className="csd-profile-rule"/><h4>Planned improvements</h4><p>Verified university email (OTP), editable contact information, and academic-year settings require backend support before they can be enabled.</p></div></aside></div></>}
          <footer className="csd-footer">ConsultTime · WMSU academic consultation workspace <span>Student portal</span></footer>
        </div>
      </div>
      <MessageCenter user={user} faculty={faculty} onNotify={({type,text}) => setToast({id:`${Date.now()}-${Math.random()}`,type,text})}/>
      {pendingCancel && <div className="csd-modal-scrim" onMouseDown={(e)=>{if(e.target===e.currentTarget&&!busy)setPendingCancel(null)}}><div className="csd-modal" role="alertdialog" aria-modal="true" aria-labelledby="csd-cancel-title" aria-describedby="csd-cancel-desc"><span className="csd-modal-icon"><Icon name="shield" size={25}/></span><h2 id="csd-cancel-title">Cancel consultation request?</h2><p id="csd-cancel-desc">This will mark your consultation with <strong>{pendingCancel.facultyName || "the faculty member"}</strong> on <strong>{fmtDate(pendingCancel.date)}</strong> as Cancelled. This action cannot be undone from this screen.</p><div className="csd-modal-actions"><button ref={cancelRef} type="button" className="csd-outline-button" disabled={busy} onClick={()=>setPendingCancel(null)}>Keep request</button><button type="button" className="csd-danger-button" disabled={busy} onClick={confirmCancel}>{busy ? "Cancelling…" : "Yes, cancel request"}</button></div></div></div>}
    </div>
  );
}
