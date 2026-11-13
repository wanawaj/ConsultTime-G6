import { Link } from "react-router-dom";
import AuthFrame from "../components/AuthFrame.jsx";
export default function ResetPasswordPage() {
  return (
    <AuthFrame
      title="Password recovery"
      description="Password recovery currently requires help from the system administrator."
    >
      <p className="ct-auth-information">
        Contact your system administrator to recover account access. Automatic
        password-reset emails are not yet available.
      </p>
      <Link className="ct-btn ct-btn-primary ct-form-submit" to="/login">
        Return to Sign In
      </Link>
    </AuthFrame>
  );
}
