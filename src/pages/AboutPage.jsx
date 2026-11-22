import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import Icon from "../components/Icon.jsx";
import LandingHero from "../components/LandingHero.jsx";

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
      <LandingHero
        id="ct-about-title"
        variant="about"
        eyebrow="ABOUT CONSULTTIME"
        title="Better communication begins"
        accent="with better scheduling."
        description="ConsultTime is a consultation management concept designed to make academic appointments simpler for students, faculty, and administrators."
        primary={{ label: "Explore What We Do", to: "/features" }}
        secondary={{ label: "Create Account", to: "/signup" }}
        badges={[
          {
            icon: "check-circle",
            title: "Better planning",
            text: "Keep every request organized",
            spot: "top-left",
          },
          {
            icon: "users",
            title: "Easier connections",
            text: "Find the right faculty",
            spot: "top-right",
          },
          {
            icon: "shield",
            title: "Role-based access",
            text: "Dedicated user experiences",
            spot: "bottom-left",
          },
          {
            icon: "clock",
            title: "Respect for time",
            text: "Coordinate with less effort",
            spot: "bottom-right",
          },
        ]}
      />
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
