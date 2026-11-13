import { Link } from "react-router-dom";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";

export default function AuthFrame({
  title,
  description,
  children,
  wide = false,
  sideLabel = "STAY CONNECTED",
}) {
  return (
    <div className="ct-auth-page">
      <div className={`ct-auth-card${wide ? " wide" : ""}`}>
        <div className="ct-auth-decoration">
          <div className="ct-auth-decoration-top">
            <span className="ct-auth-decoration-dot" />
            {sideLabel}
          </div>
          <div>
            <span className="ct-auth-decoration-icon">
              <Icon name="calendar" size={37} />
            </span>
            <h2>
              Your schedule,
              <br />
              your peace of mind.
            </h2>
            <p>A simpler, more connected way to plan academic consultations.</p>
          </div>
          <div className="ct-auth-decoration-bottom">
            <Icon name="check-circle" size={18} /> Thoughtfully designed for
            campus life
          </div>
        </div>
        <div className="ct-auth-content">
          <div className="ct-auth-brand">
            <Brand />
          </div>
          <div className="ct-auth-heading">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          <p className="ct-auth-return">
            <Link to="/">
              <span aria-hidden="true">←</span> Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
