import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import Icon from "../components/Icon.jsx";

const values = [
  {
    icon: "clock",
    title: "Respect for time",
    text: "Help students and faculty spend less time coordinating and more time discussing important academic concerns.",
  },
  {
    icon: "users",
    title: "Better connections",
    text: "Make it easier for students to reach the right faculty member at an appropriate time.",
  },
  {
    icon: "shield",
    title: "Organized process",
    text: "Give each user role a clear, consistent consultation experience.",
  },
];
export default function AboutPage() {
  return (
    <div className="ct-inner-page">
      <section className="ct-inner-hero">
        <div className="ct-container ct-inner-hero-grid">
          <div>
            <span className="ct-eyebrow">ABOUT CONSULTTIME</span>
            <h1>Better communication begins with better scheduling.</h1>
            <p>
              ConsultTime is a consultation management concept designed to make
              academic appointments simpler for students, faculty, and
              administrators.
            </p>
            <Link className="ct-btn ct-btn-primary" to="/features">
              Explore What We Do <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="ct-about-graphic" aria-hidden="true">
            <div className="ct-about-glow" />
            <div className="ct-about-symbol">
              <Icon name="calendar" size={72} />
            </div>
            <span className="ct-about-bubble bubble-first">
              <Icon name="check-circle" size={22} /> Better planning
            </span>
            <span className="ct-about-bubble bubble-second">
              <Icon name="users" size={22} /> Easier connections
            </span>
          </div>
        </div>
      </section>
      <section className="ct-container ct-section">
        <Reveal className="ct-section-heading">
          <span className="ct-eyebrow">WHAT DRIVES US</span>
          <h2>Designed around everyday campus needs.</h2>
          <p>
            A thoughtful consultation experience should be easy to understand,
            easy to access, and simple to manage.
          </p>
        </Reveal>
        <div className="ct-values-grid">
          {values.map((v, i) => (
            <Reveal key={v.title} className="ct-value-card" delay={i * 100}>
              <span className="ct-step-icon">
                <Icon name={v.icon} size={27} />
              </span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="ct-section ct-section-soft">
        <div className="ct-container ct-two-col">
          <Reveal>
            <span className="ct-eyebrow">OUR PURPOSE</span>
            <h2>One platform for every consultation journey.</h2>
          </Reveal>
          <Reveal delay={100}>
            <p>
              Students need a clear way to find available faculty. Faculty need
              an organized way to review requests. Administrators need a way to
              oversee the experience. ConsultTime brings these workflows
              together in a cleaner digital interface.
            </p>
            <Link to="/signup" className="ct-text-link">
              Join ConsultTime <Icon name="arrow-right" size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
