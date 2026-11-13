import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/AuthFrame.jsx";
import PasswordField from "../components/PasswordField.jsx";
import Icon from "../components/Icon.jsx";
import SelectField from "../components/SelectField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initial = {
  firstName: "",
  middleName: "",
  lastName: "",
  studentId: "",
  email: "",
  program: "",
  yearLevel: "",
  password: "",
  confirmPassword: "",
  agreed: false,
};
export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) =>
    setForm((cur) => ({ ...cur, [key]: event.target.value }));
  const goBack = () => {
    setStep(1);
    setError("");
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (
        ![form.firstName, form.lastName, form.studentId, form.email].every(
          (v) => v.trim(),
        )
      )
        return setError("Please complete all required student details.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return setError("Please enter a valid email address.");
      setStep(2);
      return;
    }
    if (!form.program || !form.yearLevel)
      return setError("Select your program and year level.");
    if (form.password.length < 8)
      return setError("Use a password with at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Your passwords do not match.");
    if (!form.agreed)
      return setError(
        "Please confirm the account information acknowledgement.",
      );
    setBusy(true);
    try {
      await register(form);
      navigate("/portal");
    } catch (err) {
      setError(err.message || "Registration is unavailable.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthFrame
      wide
      title="Create your account"
      description="Get started with a more organized academic consultation experience."
      sideLabel="GETTING STARTED"
    >
      <div
        className="ct-registration-progress"
        aria-label={`Step ${step} of 2`}
      >
        <div
          className={`ct-progress-step ${step >= 1 ? "active" : ""} ${step === 2 ? "complete" : ""}`}
          aria-current={step === 1 ? "step" : undefined}
        >
          <span className="ct-progress-circle">
            {step === 2 ? <Icon name="check" size={16} /> : "1"}
          </span>
          <div>
            <strong>Student details</strong>
            <small>Basic information</small>
          </div>
        </div>
        <div className={`ct-progress-connector${step === 2 ? " done" : ""}`} />
        <div
          className={`ct-progress-step${step === 2 ? " active" : ""}`}
          aria-current={step === 2 ? "step" : undefined}
        >
          <span className="ct-progress-circle">2</span>
          <div>
            <strong>Account security</strong>
            <small>Finish setup</small>
          </div>
        </div>
      </div>
      <form
        className="ct-auth-form ct-signup-form"
        onSubmit={submit}
        noValidate
      >
        {step === 1 ? (
          <div className="ct-form-grid">
            <label className="ct-field">
              <span>
                First name <em>*</em>
              </span>
              <input
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="First name"
                autoComplete="given-name"
              />
            </label>
            <label className="ct-field">
              <span>
                Middle name <small>(optional)</small>
              </span>
              <input
                value={form.middleName}
                onChange={set("middleName")}
                placeholder="Middle name"
                autoComplete="additional-name"
              />
            </label>
            <label className="ct-field">
              <span>
                Last name <em>*</em>
              </span>
              <input
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Last name"
                autoComplete="family-name"
              />
            </label>
            <label className="ct-field">
              <span>
                Student ID <em>*</em>
              </span>
              <input
                value={form.studentId}
                onChange={set("studentId")}
                placeholder="Student ID"
                autoComplete="off"
              />
            </label>
            <label className="ct-field ct-field-full">
              <span>
                University email <em>*</em>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@university.edu"
                autoComplete="email"
              />
              <small>
                Use the university email address associated with your student
                record.
              </small>
            </label>
          </div>
        ) : (
          <div className="ct-form-grid">
            <div className="ct-field">
              <span id="ct-program-label">
                Program / Course <em>*</em>
              </span>
              <SelectField
                labelId="ct-program-label"
                name="program"
                value={form.program}
                onChange={(v) => setForm((cur) => ({ ...cur, program: v }))}
                placeholder="Select program"
                options={[
                  "BS Computer Science",
                  "BS Information Technology",
                  "BS Information Systems",
                  "Other",
                ]}
              />
            </div>
            <div className="ct-field">
              <span id="ct-year-label">
                Year level <em>*</em>
              </span>
              <SelectField
                labelId="ct-year-label"
                name="yearLevel"
                value={form.yearLevel}
                onChange={(v) => setForm((cur) => ({ ...cur, yearLevel: v }))}
                placeholder="Select year level"
                options={[
                  "1st Year",
                  "2nd Year",
                  "3rd Year",
                  "4th Year",
                  "5th Year",
                  "Other",
                ]}
              />
            </div>
            <PasswordField
              label="Password"
              id="signup-password"
              value={form.password}
              onChange={set("password")}
            />
            <PasswordField
              label="Confirm password"
              id="signup-confirm"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
            />
            <div className="ct-field-full ct-account-note">
              <label>
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) =>
                    setForm((cur) => ({ ...cur, agreed: e.target.checked }))
                  }
                />{" "}
                <span>
                  I confirm that the details entered are accurate and understand
                  my account will need to be handled securely.
                </span>
              </label>
            </div>
          </div>
        )}
        {error && (
          <p className="ct-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="ct-registration-actions">
          {step === 2 && (
            <button
              className="ct-btn ct-btn-outline"
              type="button"
              onClick={goBack}
            >
              Back
            </button>
          )}
          <button
            disabled={busy}
            className="ct-btn ct-btn-primary"
            type="submit"
          >
            {busy ? "Submitting…" : step === 1 ? "Continue" : "Create Account"}{" "}
            <Icon name="arrow-right" size={17} />
          </button>
        </div>
      </form>
      <p className="ct-auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthFrame>
  );
}
