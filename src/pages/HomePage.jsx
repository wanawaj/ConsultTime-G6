import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Reveal from "../components/Reveal.jsx";
import WorkflowSteps from "../components/WorkflowSteps.jsx";
import PortalPreview from "../components/PortalPreview.jsx";

const capabilities = [
  {
    icon: "calendar",
    title: "Simple scheduling",
    text: "Make consultation booking less complicated and more convenient for everyone.",
  },
  {
    icon: "bell",
    title: "Clear communication",
    text: "Stay informed about consultation requests and their current status.",
  },
  {
    icon: "shield",
    title: "Role-based experience",
    text: "Dedicated experiences for students, faculty members, and system administrators.",
  },
];

export default function HomePage() {
  return (
    <div className="ct-page-home">
      <section className="ct-container ct-hero" aria-labelledby="ct-home-title">
        <div className="ct-hero-copy">
          <span className="ct-eyebrow">
            <i /> SMARTER CAMPUS CONNECTIONS
          </span>
          <h1 id="ct-home-title">
            Your time matters.<span>Make every consultation count.</span>
          </h1>
          <p className="ct-hero-tagline">
            Simpler scheduling. Better communication.
          </p>
          <p className="ct-hero-description">
            ConsultTime brings students and faculty together through a
            streamlined platform for requesting, organizing, and managing
            academic consultations.
          </p>
          <div className="ct-hero-actions">
            <Link to="/signup" className="ct-btn ct-btn-primary">
              Get Started <Icon name="arrow-right" size={18} />
            </Link>
            <Link to="/features" className="ct-btn ct-btn-outline">
              Explore Features <Icon name="chevron-right" size={17} />
            </Link>
          </div>
          <div className="ct-hero-footnote">
            <span className="ct-mini-icon">
              <Icon name="check-circle" size={19} />
            </span>
            <strong>Built for a better consultation experience</strong>
          </div>
        </div>
        <div className="ct-hero-visual">
          <span className="ct-hero-ring ring-a" />
          <span className="ct-hero-ring ring-b" />
          <PortalPreview />
          <img
            className="ct-hero-user-image"
            src="/consulttime-hero.jpg"
            alt="ConsultTime consultation system visual"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      </section>

      <Reveal
        as="section"
        className="ct-value-band"
        aria-label="ConsultTime benefits"
      >
        <div className="ct-container ct-value-band-inner">
          <div>
            <Icon name="graduation" size={26} />
            <span>
              <b>For students</b>
              <small>Find and request consultation times</small>
            </span>
          </div>
          <div>
            <Icon name="calendar" size={26} />
            <span>
              <b>For faculty</b>
              <small>Organize availability and requests</small>
            </span>
          </div>
          <div>
            <Icon name="shield" size={26} />
            <span>
              <b>For administrators</b>
              <small>Support system-wide management</small>
            </span>
          </div>
        </div>
      </Reveal>

      <section className="ct-section ct-container" id="how-it-works">
        <Reveal className="ct-section-heading">
          <span className="ct-eyebrow">A BETTER WAY TO CONNECT</span>
          <h2>How ConsultTime works</h2>
          <p>
            Three simple steps to make academic consultations more organized,
            accessible, and convenient.
          </p>
        </Reveal>
        <WorkflowSteps />
      </section>

      <section className="ct-section ct-section-soft">
        <div className="ct-container ct-feature-showcase">
          <Reveal className="ct-feature-showcase-left">
            <span className="ct-eyebrow">BUILT AROUND YOUR SCHEDULE</span>
            <h2>All the essentials, one connected experience.</h2>
            <p>
              Spend less time coordinating schedules and more time focusing on
              what matters: meaningful academic conversations.
            </p>
            <Link className="ct-text-link" to="/features">
              Discover the features <Icon name="arrow-right" size={16} />
            </Link>
          </Reveal>
          <div className="ct-capability-stack">
            {capabilities.map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 95}
                className="ct-capability-row"
              >
                <span>
                  <Icon name={item.icon} size={23} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <Icon
                  name="arrow-up-right"
                  size={20}
                  className="ct-capability-arrow"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Reveal as="section" className="ct-cta-wrap ct-container">
        <div className="ct-cta">
          <span className="ct-cta-orbit orbit-left" />
          <span className="ct-cta-orbit orbit-right" />
          <span className="ct-eyebrow">READY WHEN YOU ARE</span>
          <h2>Let's make consultations easier.</h2>
          <p>
            Get started with a simpler way to plan, request, and manage faculty
            consultation schedules.
          </p>
          <div className="ct-cta-actions">
            <Link to="/signup" className="ct-btn ct-btn-light">
              Create an Account <Icon name="arrow-right" size={16} />
            </Link>
            <Link to="/about" className="ct-btn ct-btn-glass">
              Learn About Us
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
