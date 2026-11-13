import { Link } from "react-router-dom";
import AuthFrame from "../components/AuthFrame.jsx";
export default function ResetPasswordPage() {
  return (
    <AuthFrame
      title="Password recovery"
      description="For this standalone local prototype, password resets require the system administrator."
    >
      <p className="ct-auth-information">
        For now, please contact your system administrator to recover account
        access. No password reset emails are sent by this local demo.
      </p>
      <Link className="ct-btn ct-btn-primary ct-form-submit" to="/login">
        Return to Sign In
      </Link>
    </AuthFrame>
  );
}
