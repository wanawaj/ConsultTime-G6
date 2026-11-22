import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthFrame from "../components/AuthFrame.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendPassword, setResendPassword] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@wmsu\.edu\.ph$/.test(normalizedEmail)) {
      return setError("Enter your valid WMSU email.");
    }

    if (!/^\d{6}$/.test(code)) {
      return setError("Enter the 6-digit verification code.");
    }

    setBusy(true);

    try {
      await verifyEmail(normalizedEmail, code);
      navigate("/portal", { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setError("");
    setResendMessage("");

    if (!/^[^\s@]+@wmsu\.edu\.ph$/.test(email.trim().toLowerCase())) {
      return setError("Enter your valid WMSU email.");
    }

    if (!resendPassword) {
      return setError("Enter your account password to resend the code.");
    }

    setResendBusy(true);

    try {
      const result = await resendVerification(email, resendPassword);
      setResendMessage(
        result.message ||
          "If your account is eligible, a verification code will be sent.",
      );
    } catch (err) {
      setError(err.message || "Unable to request another code.");
    } finally {
      setResendPassword("");
      setResendBusy(false);
    }
  };

  return (
    <AuthFrame
      title="Verify your WMSU email"
      description="Enter the six-digit verification code sent to your university email."
      sideLabel="EMAIL VERIFICATION"
    >
      <form className="ct-auth-form" onSubmit={submit}>
        <label className="ct-field">
          <span>University Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@wmsu.edu.ph"
            autoComplete="email"
            required
          />
        </label>

        <label className="ct-field">
          <span>Verification Code</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            autoComplete="one-time-code"
            required
          />
          <small>This code expires after 5 minutes.</small>
        </label>

        {error && (
          <p className="ct-form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="ct-btn ct-btn-primary" disabled={busy}>
          {busy ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <form className="ct-auth-form" onSubmit={handleResend}>
        <label className="ct-field">
          <span>Didn't receive your code?</span>
          <small>Enter your account password to request another code.</small>
          <input
            type="password"
            value={resendPassword}
            onChange={(e) => setResendPassword(e.target.value)}
            placeholder="Account password"
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          className="ct-btn ct-btn-outline"
          disabled={busy || resendBusy}
        >
          {resendBusy ? "Sending..." : "Resend Verification Code"}
        </button>

        {resendMessage && (
          <p role="status" aria-live="polite">
            {resendMessage}
          </p>
        )}
      </form>

      <p className="ct-auth-switch">
        Need to start again? <Link to="/signup">Back to Signup</Link>
      </p>
    </AuthFrame>
  );
}
