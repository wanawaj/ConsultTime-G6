import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function Brand({ light = false }) {
  return (
    <Link
      className={`ct-brand${light ? " ct-brand-light" : ""}`}
      to="/"
      aria-label="ConsultTime home"
    >
      <span className="ct-brand-symbol">
        <Icon name="calendar" size={24} strokeWidth={2.2} />
      </span>
      <span className="ct-brand-text">
        <strong>
          Consult<span>Time</span>
        </strong>
        <small>Faculty Consultation System</small>
      </span>
    </Link>
  );
}
