import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

/** Shared Home / About / Features hero. The real header is rendered by App. */
const gradientSources = [
  { id: "left", x: 0.07, y: 0.84, fallbackX: -0.85, fallbackY: 0.5 },
  { id: "right", x: 0.95, y: 0.31, fallbackX: 0.9, fallbackY: -0.45 },
  { id: "top", x: 0.15, y: 0.12, fallbackX: -0.7, fallbackY: -0.7 },
  { id: "bottom", x: 0.87, y: 0.82, fallbackX: 0.8, fallbackY: 0.6 },
];
const zeroOffsets = () => gradientSources.map(() => [0, 0]);

export default function LandingHero({
  eyebrow,
  title,
  accent,
  subtitle,
  description,
  primary = { label: "Get Started", to: "/signup" },
  secondary = { label: "Explore Features", to: "/features" },
  badges = [],
  id,
  variant = "home",
}) {
  const stageRef = useRef(null);
  const frameRef = useRef(0);
  const currentRef = useRef(zeroOffsets());
  const targetRef = useRef(zeroOffsets());

  // Change only CSS variables, not React state: pointer movement never
  // re-renders the heading, buttons, or the feature catalog.
  const tick = () => {
    const stage = stageRef.current;
    if (!stage) {
      frameRef.current = 0;
      return;
    }
    let moving = false;
    for (let i = 0; i < gradientSources.length; i += 1) {
      const pair = currentRef.current[i];
      const target = targetRef.current[i];
      for (let axis = 0; axis < 2; axis += 1) {
        const difference = target[axis] - pair[axis];
        pair[axis] =
          Math.abs(difference) < 0.18
            ? target[axis]
            : pair[axis] + difference * 0.14;
        if (Math.abs(target[axis] - pair[axis]) > 0.18) moving = true;
      }
      const { id: sourceId } = gradientSources[i];
      stage.style.setProperty(
        `--ct-gradient-${sourceId}-x`,
        `${pair[0].toFixed(1)}px`,
      );
      stage.style.setProperty(
        `--ct-gradient-${sourceId}-y`,
        `${pair[1].toFixed(1)}px`,
      );
    }
    frameRef.current = moving ? window.requestAnimationFrame(tick) : 0;
  };

  const scheduleMotion = () => {
    if (!frameRef.current)
      frameRef.current = window.requestAnimationFrame(tick);
  };

  const resetGradient = () => {
    targetRef.current = zeroOffsets();
    scheduleMotion(); // Smoothly return each color source to its original position.
  };

  const onGradientPointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const radius = Math.max(340, Math.min(675, rect.width * 0.43));

    targetRef.current = gradientSources.map((source) => {
      const dx = source.x * rect.width - x;
      const dy = source.y * rect.height - y;
      const distance = Math.hypot(dx, dy);
      const power = Math.pow(Math.max(0, 1 - distance / radius), 1.35);
      const magnitude = 175 * power;
      return [
        (distance > 1 ? dx / distance : source.fallbackX) * magnitude,
        (distance > 1 ? dy / distance : source.fallbackY) * magnitude,
      ];
    });
    scheduleMotion();
  };

  useEffect(
    () => () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      const stage = stageRef.current;
      gradientSources.forEach(({ id: sourceId }) => {
        stage?.style.removeProperty(`--ct-gradient-${sourceId}-x`);
        stage?.style.removeProperty(`--ct-gradient-${sourceId}-y`);
      });
    },
    [],
  );

  return (
    <section
      ref={stageRef}
      onPointerMove={onGradientPointerMove}
      onPointerLeave={resetGradient}
      className={`ct-landing-stage ct-landing-${variant}`}
      aria-labelledby={id}
    >
      <span
        className="ct-landing-glow ct-landing-glow-left"
        aria-hidden="true"
      />
      <span
        className="ct-landing-glow ct-landing-glow-right"
        aria-hidden="true"
      />
      <span
        className="ct-landing-glow ct-landing-glow-top"
        aria-hidden="true"
      />
      <span
        className="ct-landing-glow ct-landing-glow-bottom"
        aria-hidden="true"
      />
      <span
        className="ct-landing-contour ct-landing-contour-left"
        aria-hidden="true"
      />
      <span
        className="ct-landing-contour ct-landing-contour-right"
        aria-hidden="true"
      />

      <div className="ct-landing-content">
        <span className="ct-landing-eyebrow">{eyebrow}</span>
        <h1 id={id}>
          {title}
          {accent ? <span className="ct-landing-accent">{accent}</span> : null}
        </h1>
        {subtitle ? (
          <strong className="ct-landing-subtitle">{subtitle}</strong>
        ) : null}
        <p className="ct-landing-description">{description}</p>
        <div className="ct-landing-actions">
          <Link to={primary.to} className="ct-btn ct-btn-primary">
            {primary.label}
            <Icon name="arrow-up-right" size={17} />
          </Link>
          <Link to={secondary.to} className="ct-btn ct-btn-outline">
            {secondary.label}
            <Icon name="chevron-right" size={17} />
          </Link>
        </div>
      </div>

      <div className="ct-landing-badges" aria-label="ConsultTime benefits">
        {badges
          .slice(0, 6)
          .map(({ title: badgeTitle, text, icon, spot }, i) => (
            <div
              className={`ct-landing-float ct-landing-float-${spot}`}
              key={`${badgeTitle}-${i}`}
            >
              <span className="ct-landing-float-icon">
                <Icon name={icon} size={20} />
              </span>
              <div>
                <strong>{badgeTitle}</strong>
                <small>{text}</small>
              </div>
            </div>
          ))}
      </div>

      <div className="ct-landing-trust">
        <span className="ct-landing-trust-caption">
          Made for better campus connections
        </span>
        <div
          className="ct-landing-trust-roles"
          aria-label="For students, faculty, and administrators"
        >
          <span>
            <Icon name="graduation" size={18} /> Students
          </span>
          <span>
            <Icon name="users" size={18} /> Faculty
          </span>
          <span>
            <Icon name="shield" size={18} /> Administrators
          </span>
        </div>
      </div>
    </section>
  );
}
