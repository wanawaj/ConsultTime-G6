import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Icon from "../components/Icon.jsx";
import SelectField from "../components/SelectField.jsx";

const niceDate = (value) => {
  if (!value) return "—";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
function Status({ value }) {
  return (
    <span className={`ct-status ct-status-${(value || "").toLowerCase()}`}>
      {value}
    </span>
  );
}
export default function PortalPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [facultyId, setFacultyId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);
  async function refresh() {
    if (!user) return;
    try {
      const requests = [api("/appointments")];
      if (user.role === "student") requests.push(api("/faculty"));
      if (user.role === "admin") requests.push(api("/admin/summary"));
      const results = await Promise.all(requests);
      setAppointments(results[0].appointments);
      if (user.role === "student") setFaculty(results[1].faculty);
      if (user.role === "admin") setSummary(results[1]);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, [user?.id]);
  useEffect(() => {
    if (!facultyId) {
      setSlots([]);
      return;
    }
    let live = true;
    api(`/slots?facultyId=${encodeURIComponent(facultyId)}`)
      .then((r) => {
        if (live) setSlots(r.slots);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [
    facultyId,
    appointments.length,
    appointments.map((a) => a.status).join(","),
  ]);
  const days = useMemo(() => [...new Set(slots.map((x) => x.date))], [slots]);
  const times = useMemo(
    () => slots.filter((x) => x.date === date).map((x) => x.time),
    [slots, date],
  );
  async function createRequest(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await api("/appointments", {
        method: "POST",
        body: { facultyId, date, time, topic, notes },
      });
      setTopic("");
      setNotes("");
      setTime("");
      setDate("");
      setMessage("Your consultation request was submitted.");
      await refresh();
      const r = await api(`/slots?facultyId=${encodeURIComponent(facultyId)}`);
      setSlots(r.slots);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function changeStatus(id, status) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await api(`/appointments/${id}`, { method: "PATCH", body: { status } });
      setMessage(`Consultation ${status.toLowerCase()}.`);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (loading || !user)
    return (
      <div className="ct-container ct-portal-loading">
        Loading your workspace…
      </div>
    );
  const isStudent = user.role === "student";
  const openRequests = appointments.filter(
    (a) => a.status === "Pending",
  ).length;
  return (
    <div className="ct-portal-page">
      <div className="ct-portal-top">
        <div className="ct-container ct-portal-heading">
          <div>
            <span className="ct-eyebrow">
              <i /> YOUR CONSULTTIME WORKSPACE
            </span>
            <h1>
              {isStudent
                ? "Student"
                : user.role === "faculty"
                  ? "Faculty"
                  : "Administrator"}{" "}
              Dashboard
            </h1>
            <p>
              Welcome back, {user.firstName}.{" "}
              {isStudent
                ? "Find a time, submit a request, and monitor its status."
                : user.role === "faculty"
                  ? "Review your students’ consultation requests."
                  : "View activity and oversee consultation requests."}
            </p>
          </div>
          <div className="ct-portal-role">
            <Icon name="shield" size={20} />
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} account
          </div>
        </div>
      </div>
      <div className="ct-container ct-portal-content">
        <div className="ct-portal-stats">
          <div className="ct-portal-stat">
            <span>All requests</span>
            <strong>{appointments.length}</strong>
            <small>Consultation records</small>
          </div>
          <div className="ct-portal-stat">
            <span>Pending</span>
            <strong>{openRequests}</strong>
            <small>Awaiting review</small>
          </div>
          <div className="ct-portal-stat">
            <span>Approved</span>
            <strong>
              {appointments.filter((a) => a.status === "Approved").length}
            </strong>
            <small>Confirmed appointments</small>
          </div>
          {summary && (
            <div className="ct-portal-stat">
              <span>Registered students</span>
              <strong>{summary.students}</strong>
              <small>{summary.faculty} faculty accounts</small>
            </div>
          )}
        </div>
        {message && (
          <p className="ct-portal-message" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="ct-form-error" role="alert">
            {error}
          </p>
        )}
        {isStudent && (
          <section
            className="ct-portal-panel"
            aria-labelledby="new-appointment"
          >
            <div className="ct-portal-panel-head">
              <div>
                <span className="ct-eyebrow">BOOK A CONSULTATION</span>
                <h2 id="new-appointment">Request a faculty consultation</h2>
                <p>Available weekdays are shown for the upcoming weeks.</p>
              </div>
              <Icon name="calendar" size={27} />
            </div>
            <form className="ct-portal-form" onSubmit={createRequest}>
              <div className="ct-field">
                <span id="ct-faculty-label">Faculty member</span>
                <SelectField
                  labelId="ct-faculty-label"
                  name="facultyId"
                  value={facultyId}
                  onChange={(v) => {
                    setFacultyId(v);
                    setDate("");
                    setTime("");
                  }}
                  placeholder="Choose faculty"
                  options={faculty.map((f) => ({
                    value: f.id,
                    label: `${f.firstName} ${f.lastName} — ${f.department}`,
                  }))}
                />
              </div>
              <div className="ct-field">
                <span id="ct-date-label">Available date</span>
                <SelectField
                  labelId="ct-date-label"
                  name="date"
                  value={date}
                  onChange={(v) => {
                    setDate(v);
                    setTime("");
                  }}
                  disabled={!facultyId}
                  placeholder="Choose a date"
                  options={days.map((d) => ({ value: d, label: niceDate(d) }))}
                />
              </div>
              <div className="ct-field">
                <span id="ct-time-label">Time</span>
                <SelectField
                  labelId="ct-time-label"
                  name="time"
                  value={time}
                  onChange={setTime}
                  disabled={!date}
                  placeholder="Choose a time"
                  options={times}
                />
              </div>
              <label className="ct-field">
                <span>Consultation topic</span>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Capstone project guidance"
                  maxLength={120}
                  required
                />
              </label>
              <label className="ct-field ct-field-full">
                <span>Additional notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={800}
                  placeholder="Briefly describe what you would like to discuss."
                  rows={3}
                />
              </label>
              <button
                className="ct-btn ct-btn-primary"
                disabled={busy || !facultyId || !date || !time || !topic.trim()}
                type="submit"
              >
                {busy ? "Submitting…" : "Submit request"}{" "}
                <Icon name="arrow-right" size={17} />
              </button>
            </form>
          </section>
        )}
        <section className="ct-portal-panel" aria-labelledby="consultations">
          <div className="ct-portal-panel-head">
            <div>
              <span className="ct-eyebrow">CONSULTATION MANAGEMENT</span>
              <h2 id="consultations">
                {isStudent
                  ? "My consultation requests"
                  : user.role === "faculty"
                    ? "Student consultation requests"
                    : "All consultation requests"}
              </h2>
              <p>Review appointment dates, topics, and status updates.</p>
            </div>
          </div>
          {appointments.length === 0 ? (
            <div className="ct-portal-empty">
              <Icon name="calendar" size={27} />
              <h3>No consultations yet</h3>
              <p>
                {isStudent
                  ? "Choose a faculty member and submit your first request above."
                  : "Requests will appear here when students book consultations."}
              </p>
            </div>
          ) : (
            <div className="ct-portal-table-wrap">
              <table className="ct-portal-table">
                <thead>
                  <tr>
                    <th>{isStudent ? "Faculty" : "Student"}</th>
                    <th>Date / time</th>
                    <th>Topic</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>
                          {isStudent ? a.facultyName : a.studentName}
                        </strong>
                        {!isStudent && user.role === "admin" && (
                          <small>Faculty: {a.facultyName}</small>
                        )}
                      </td>
                      <td>
                        {niceDate(a.date)}
                        <small>{a.time}</small>
                      </td>
                      <td>
                        {a.topic}
                        {a.notes && <small>{a.notes}</small>}
                      </td>
                      <td>
                        <Status value={a.status} />
                      </td>
                      <td>
                        <div className="ct-portal-actions">
                          {isStudent &&
                            ["Pending", "Approved"].includes(a.status) && (
                              <button
                                disabled={busy}
                                type="button"
                                onClick={() => changeStatus(a.id, "Cancelled")}
                              >
                                Cancel
                              </button>
                            )}
                          {!isStudent && a.status === "Pending" && (
                            <>
                              <button
                                disabled={busy}
                                className="accept"
                                type="button"
                                onClick={() => changeStatus(a.id, "Approved")}
                              >
                                Approve
                              </button>
                              <button
                                disabled={busy}
                                type="button"
                                onClick={() => changeStatus(a.id, "Declined")}
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {!(
                            isStudent &&
                            ["Pending", "Approved"].includes(a.status)
                          ) &&
                            !(!isStudent && a.status === "Pending") && (
                              <span className="ct-portal-no-action">—</span>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p className="ct-portal-devnote">
          ConsultTime workspace • Requests are saved by the configured backend.
          University identity verification is required before accepting real
          student records.
        </p>
        <Link to="/" className="ct-portal-back">
          ← Back to ConsultTime homepage
        </Link>
      </div>
    </div>
  );
}
