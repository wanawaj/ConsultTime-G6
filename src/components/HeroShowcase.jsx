import Icon from "./Icon.jsx";

function Badge({ icon, title, text, className = "" }) {
  return (
    <div className={`ct-showcase-badge ${className}`.trim()}>
      <span className="ct-showcase-badge-icon">
        <Icon name={icon} size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        {text ? <small>{text}</small> : null}
      </div>
    </div>
  );
}

export default function HeroShowcase({
  sectionLabel = "ConsultTime",
  navItems = ["Home", "About", "Features"],
  title,
  accent,
  description,
  primaryAction = "Request a consultation",
  secondaryAction = "Browse features",
  footerNote = "Designed for a clearer academic consultation experience",
  badges = [],
}) {
  return (
    <div className="ct-showcase-scene" aria-hidden="true">
      <div className="ct-showcase-card">
        <span className="ct-showcase-shape ct-showcase-shape-left" />
        <span className="ct-showcase-shape ct-showcase-shape-right" />
        <span className="ct-showcase-blur ct-showcase-blur-left" />
        <span className="ct-showcase-blur ct-showcase-blur-right" />

        <div className="ct-showcase-topbar">
          <div className="ct-showcase-brandline">
            <span className="ct-showcase-branddot" />
            <strong>{sectionLabel}</strong>
          </div>
          <div className="ct-showcase-nav" role="presentation">
            {navItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="ct-showcase-actions" role="presentation">
            <span>Preview</span>
            <span className="is-solid">Live demo</span>
          </div>
        </div>

        <div className="ct-showcase-content">
          <p className="ct-showcase-kicker">One smooth consultation flow</p>
          <h3>
            {title}
            {accent ? <span>{accent}</span> : null}
          </h3>
          <p>{description}</p>
          <div className="ct-showcase-buttons" role="presentation">
            <span className="ct-showcase-pill is-primary">
              {primaryAction} <Icon name="arrow-up-right" size={14} />
            </span>
            <span className="ct-showcase-pill">
              {secondaryAction} <Icon name="chevron-right" size={14} />
            </span>
          </div>
          <div className="ct-showcase-footnote">
            <Icon name="check-circle" size={16} /> {footerNote}
          </div>
        </div>
      </div>

      {badges.slice(0, 6).map((badge, index) => (
        <Badge key={`${badge.title}-${index}`} {...badge} />
      ))}
    </div>
  );
}
