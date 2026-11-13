import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "./AuthFrame.jsx";
import PasswordField from "./PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate("/portal");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthFrame
      title="Welcome back"
      description="Sign in to your ConsultTime workspace."
    >
      <form className="ct-auth-form" onSubmit={submit}>
        <label className="ct-field" htmlFor="login-email">
          <span>Email address</span>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <PasswordField
          label="Password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div className="ct-form-between">
          <span>Sign in securely</span>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        {error && (
          <p className="ct-form-error" role="alert">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="ct-btn ct-btn-primary ct-form-submit"
          type="submit"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
      <p className="ct-auth-switch">
        New to ConsultTime? <Link to="/signup">Create an account</Link>
      </p>
      <p className="ct-auth-demo-note">
        Use a ConsultTime account created or provided for this system.
      </p>
    </AuthFrame>
  );
}
