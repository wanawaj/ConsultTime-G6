import { Link } from "react-router-dom";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";

export default function SiteFooter() {
  return (
    <footer className="ct-footer">
      <div className="ct-container">
        <div className="ct-footer-main">
          <div className="ct-footer-intro">
            <Brand light />
            <p>
              Make every consultation count. A more organized way for students
              and faculty to connect, schedule, and stay informed.
            </p>
            <span className="ct-footer-campus">
              <Icon name="location" size={16} /> Designed for campus
              consultation workflows
            </span>
          </div>
          <nav aria-label="Explore" className="ct-footer-col">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/features">Features</Link>
            <Link to="/features#how-it-works">How It Works</Link>
          </nav>
          <nav aria-label="Account" className="ct-footer-col">
            <h3>Account</h3>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Create Account</Link>
            <Link to="/forgot-password">Password Help</Link>
          </nav>
          <div className="ct-footer-col">
            <h3>Built for</h3>
            <span>Students</span>
            <span>Faculty Members</span>
            <span>Administrators</span>
            <span>Consultation scheduling</span>
          </div>
        </div>
        <div className="ct-footer-bottom">
          <span>
            © {new Date().getFullYear()} ConsultTime. All rights reserved.
          </span>
          <span>Schedule better. Connect smarter.</span>
        </div>
      </div>
    </footer>
  );
}
