import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal.jsx";
import Icon from "../components/Icon.jsx";
import WorkflowSteps from "../components/WorkflowSteps.jsx";
import PortalPreview from "../components/PortalPreview.jsx";
import "../styles/features.css";

// The descriptions and availability flags reflect the bundled local prototype.
// "planned" items are concepts for future development, NOT working product features.
const roles = [
  { id: "all", label: "All features", icon: "layers" },
  { id: "student", label: "Students", icon: "graduation" },
  { id: "faculty", label: "Faculty", icon: "users" },
  { id: "admin", label: "Administrators", icon: "shield" },
];

const roleNames = { student: "Student", faculty: "Faculty", admin: "Admin" };

const groups = [
  {
    id: "scheduling",
    number: "01",
    eyebrow: "START WITH A SCHEDULE",
    title: "Plan & book consultations",
    description:
      "Make it easy to find the right faculty member, choose a time, and manage requests without back-and-forth messages.",
    icon: "calendar",
    features: [
      {
        id: "directory",
        title: "Faculty directory",
        icon: "search",
        status: "available",
        roles: ["student"],
        text: "Find available faculty accounts in one place before sending a consultation request.",
      },
      {
        id: "booking",
        title: "Consultation requests",
        icon: "send",
        status: "available",
        roles: ["student"],
        text: "Choose a faculty member, date, time, and topic, then submit a consultation request.",
      },
      {
        id: "slots",
        title: "Available time slots",
        icon: "clock",
        status: "available",
        roles: ["student"],
        text: "See the preset weekday consultation slots used by the local demo to coordinate bookings.",
      },
      {
        id: "approval",
        title: "Review & approve requests",
        icon: "check-circle",
        status: "available",
        roles: ["faculty", "admin"],
        text: "Review incoming requests and approve or decline pending consultations from your dashboard.",
      },
      {
        id: "conflicts",
        title: "Booking conflict protection",
        icon: "shield",
        status: "available",
        roles: ["student", "faculty"],
        text: "Prevent more than one active consultation from taking the same faculty time slot.",
      },
      {
        id: "recurring",
        title: "Recurring office hours",
        icon: "repeat",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Set weekly consultation hours and automatically offer repeating availability to students.",
      },
      {
        id: "followups",
        title: "Linked follow-up sessions",
        icon: "network",
        status: "planned",
        roles: ["student", "faculty"],
        text: "Connect related consultations and track follow-up sessions for ongoing academic concerns.",
      },
    ],
  },
  {
    id: "workspace",
    number: "02",
    eyebrow: "FIND YOUR OWN VIEW",
    title: "Organize your workflow",
    description:
      "Different people need different ways of keeping track. These views adapt task-management ideas to academic consultations.",
    icon: "columns",
    features: [
      {
        id: "list",
        title: "Consultation list view",
        icon: "list",
        status: "available",
        roles: ["student", "faculty", "admin"],
        text: "Review consultation details, scheduled dates, and current request statuses in a clear table.",
      },
      {
        id: "calendar-view",
        title: "Consultation calendar",
        icon: "calendar",
        status: "planned",
        roles: ["student", "faculty", "admin"],
        text: "View appointments by day, week, or month in a dedicated academic consultation calendar.",
      },
      {
        id: "kanban",
        title: "Request status board",
        icon: "columns",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Organize consultation requests by Pending, Approved, Declined, and Completed stages.",
      },
      {
        id: "timeline",
        title: "Consultation timeline",
        icon: "history",
        status: "planned",
        roles: ["student", "faculty", "admin"],
        text: "See consultation milestones, follow-up dates, and scheduled sessions along a timeline.",
      },
      {
        id: "archive",
        title: "Consultation archive",
        icon: "archive",
        status: "planned",
        roles: ["student", "faculty", "admin"],
        text: "Keep completed sessions accessible while separating them from active consultation requests.",
      },
      {
        id: "fields",
        title: "Custom consultation fields",
        icon: "sliders",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Add structured details such as consultation type, concern category, or required documents.",
      },
    ],
  },
  {
    id: "communication",
    number: "03",
    eyebrow: "KEEP EVERYONE IN THE LOOP",
    title: "Communicate & collaborate",
    description:
      "Support clear decisions and timely follow-ups, whether the conversation starts with a student or a faculty member.",
    icon: "message-square",
    features: [
      {
        id: "tracking",
        title: "Request status tracking",
        icon: "check-circle",
        status: "available",
        roles: ["student", "faculty"],
        text: "Check whether a consultation is Pending, Approved, Declined, or Cancelled inside ConsultTime.",
      },
      {
        id: "automation",
        title: "Automated workflow actions",
        icon: "settings",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Trigger appropriate next steps when a consultation request is created or its status changes.",
      },
      {
        id: "alerts",
        title: "Smart reminders & alerts",
        icon: "bell",
        status: "planned",
        roles: ["student", "faculty", "admin"],
        text: "Get reminders about upcoming consultations, changes, and unanswered requests.",
      },
      {
        id: "activity",
        title: "Activity log & discussion",
        icon: "message-square",
        status: "planned",
        roles: ["student", "faculty"],
        text: "Keep consultation notes, messages, and status activity together with each appointment.",
      },
      {
        id: "email",
        title: "Email notifications",
        icon: "mail",
        status: "planned",
        roles: ["student", "faculty", "admin"],
        text: "Send booking confirmations and relevant consultation updates by email.",
      },
      {
        id: "templates",
        title: "Email & SMS templates",
        icon: "file-text",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Prepare consistent confirmation, reminder, cancellation, and follow-up messages.",
      },
      {
        id: "collaboration",
        title: "Real-time coordination",
        icon: "refresh-cw",
        status: "planned",
        roles: ["student", "faculty"],
        text: "Show new messages and request changes instantly without refreshing the page.",
      },
    ],
  },
  {
    id: "oversight",
    number: "04",
    eyebrow: "A CLEARER CAMPUS OVERVIEW",
    title: "Control & analyze",
    description:
      "Give administrators better oversight while keeping student and faculty experiences appropriate to their roles.",
    icon: "bar-chart",
    features: [
      {
        id: "access",
        title: "Role-based visibility",
        icon: "lock",
        status: "available",
        roles: ["student", "faculty", "admin"],
        text: "Provide different dashboards and restrict consultation records according to user permissions.",
      },
      {
        id: "dashboard",
        title: "Administration dashboard",
        icon: "layout-dashboard",
        status: "available",
        roles: ["admin"],
        text: "See account totals, consultation counts, pending requests, and the overall consultation list.",
      },
      {
        id: "analytics",
        title: "Consultation analysis",
        icon: "activity",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Understand consultation volume, common request types, outcomes, and busy periods.",
      },
      {
        id: "time",
        title: "Session time tracking",
        icon: "timer",
        status: "planned",
        roles: ["faculty", "admin"],
        text: "Record actual consultation durations to better estimate workload and future availability.",
      },
      {
        id: "reports",
        title: "Visual graphs & reports",
        icon: "bar-chart",
        status: "planned",
        roles: ["admin"],
        text: "Explore trends through charts and summary reports for academic consultation planning.",
      },
    ],
  },
];

function FeatureCard({ feature, index }) {
  return (
    <Reveal as="article" delay={(index % 3) * 70} className="ct-catalog-card">
      <div className="ct-catalog-card-top">
        <span className="ct-catalog-icon">
          <Icon name={feature.icon} size={23} />
        </span>
        <span
          className={`ct-catalog-status ${feature.status === "available" ? "is-available" : "is-planned"}`}
        >
          <span aria-hidden="true" className="ct-catalog-status-dot" />
          {feature.status === "available" ? "In the demo" : "Planned"}
        </span>
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.text}</p>
      <div className="ct-catalog-roles" aria-label="Relevant user roles">
        {feature.roles.map((role) => (
          <span className="ct-catalog-role-chip" key={role}>
            <span>{roleNames[role]}</span>
          </span>
        ))}
      </div>
    </Reveal>
  );
}

export default function FeaturesPage() {
  const [activeRole, setActiveRole] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const firstGroupRef = useRef(null);
  const emptyResultsRef = useRef(null);
  const [scrollRequest, setScrollRequest] = useState(0);
  const trimmedSearch = search.trim().toLowerCase();

  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          features: group.features.filter((feature) => {
            if (activeRole !== "all" && !feature.roles.includes(activeRole))
              return false;
            if (activeStatus !== "all" && feature.status !== activeStatus)
              return false;
            if (trimmedSearch) {
              const haystack = [
                feature.title,
                feature.text,
                group.title,
                ...feature.roles.map((role) => roleNames[role]),
              ]
                .join(" ")
                .toLowerCase();
              if (!haystack.includes(trimmedSearch)) return false;
            }
            return true;
          }),
        }))
        .filter((group) => group.features.length > 0),
    [activeRole, activeStatus, trimmedSearch],
  );

  const visibleCount = visibleGroups.reduce(
    (total, group) => total + group.features.length,
    0,
  );
  const resetFilters = () => {
    setActiveRole("all");
    setActiveStatus("all");
    setSearch("");
  };

  // A role selection changes the catalog and then moves to its first matching group.
  // The counter also allows re-clicking the selected role to scroll there again.
  const chooseRole = (role) => {
    setActiveRole(role);
    setScrollRequest((request) => request + 1);
  };

  useEffect(() => {
    if (!scrollRequest) return;
    const frame = window.requestAnimationFrame(() => {
      const target = firstGroupRef.current || emptyResultsRef.current;
      if (!target) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [scrollRequest]);

  return (
    <div className="ct-inner-page ct-features-page">
      <section
        className="ct-inner-hero ct-features-intro"
        aria-labelledby="ct-features-title"
      >
        <div className="ct-container ct-inner-hero-grid">
          <div>
            <span className="ct-eyebrow">EXPLORE CONSULTTIME</span>
            <h1 id="ct-features-title">
              One platform. Every consultation made simpler.
            </h1>
            <p>
              From requesting a meeting to coordinating appointments and
              reviewing campus activity, discover how ConsultTime brings the
              consultation journey together.
            </p>
            <a href="#feature-catalog" className="ct-btn ct-btn-primary">
              Explore Features <Icon name="arrow-right" size={16} />
            </a>
          </div>
          <div className="ct-feature-visual">
            <PortalPreview />
          </div>
        </div>
      </section>

      <section
        className="ct-container ct-section ct-feature-catalog-section"
        id="feature-catalog"
        aria-labelledby="ct-catalog-title"
      >
        <Reveal className="ct-catalog-heading">
          <div>
            <span className="ct-eyebrow">BUILT FOR THE WHOLE CAMPUS</span>
            <h2 id="ct-catalog-title">Explore what ConsultTime can do.</h2>
            <p>
              Find the tools that matter to your role, from everyday scheduling
              to future consultation-management enhancements.
            </p>
          </div>
        </Reveal>

        <div className="ct-feature-filter-wrap">
          <div className="ct-catalog-refine-row">
            <label className="ct-catalog-search">
              <Icon name="search" size={18} />
              <input
                type="search"
                placeholder="Search features..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search ConsultTime features"
              />
            </label>
            <div
              className="ct-catalog-stage-filter"
              role="group"
              aria-label="Filter by availability"
            >
              <button
                type="button"
                className={activeStatus === "all" ? "active" : ""}
                aria-pressed={activeStatus === "all"}
                onClick={() => setActiveStatus("all")}
              >
                All
              </button>
              <button
                type="button"
                className={activeStatus === "available" ? "active" : ""}
                aria-pressed={activeStatus === "available"}
                onClick={() => setActiveStatus("available")}
              >
                In the demo
              </button>
              <button
                type="button"
                className={activeStatus === "planned" ? "active" : ""}
                aria-pressed={activeStatus === "planned"}
                onClick={() => setActiveStatus("planned")}
              >
                Planned
              </button>
            </div>
          </div>
          <div className="ct-catalog-results">
            <p aria-live="polite">
              Showing <strong>{visibleCount}</strong>{" "}
              {visibleCount === 1 ? "feature" : "features"}
              {activeRole !== "all"
                ? ` for ${roles.find((role) => role.id === activeRole).label.toLowerCase()}`
                : ""}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              disabled={
                activeRole === "all" && activeStatus === "all" && !search
              }
            >
              Reset filters <Icon name="refresh-cw" size={14} />
            </button>
          </div>
          <div className="ct-catalog-role-filter">
            <div className="ct-feature-filter-label">
              <span>Browse by user role</span>
              <span className="ct-feature-filter-hint">
                Choose a role to jump to its features.
              </span>
            </div>
            <div
              className="ct-catalog-role-tabs"
              role="group"
              aria-label="Filter by user role"
            >
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={activeRole === role.id}
                  className={`ct-catalog-role-tab${activeRole === role.id ? " active" : ""}`}
                  onClick={() => chooseRole(role.id)}
                >
                  <Icon name={role.icon} size={17} />
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibleCount ? (
          <div className="ct-catalog-sections">
            {visibleGroups.map((group, groupIndex) => (
              <section
                ref={groupIndex === 0 ? firstGroupRef : undefined}
                className="ct-catalog-group"
                key={group.id}
                aria-labelledby={`ct-group-${group.id}`}
              >
                <Reveal className="ct-catalog-group-heading">
                  <div className="ct-catalog-group-number">{group.number}</div>
                  <div className="ct-catalog-group-copy">
                    <span className="ct-eyebrow">{group.eyebrow}</span>
                    <h3 id={`ct-group-${group.id}`}>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                  <span className="ct-catalog-group-count">
                    {group.features.length}{" "}
                    {group.features.length === 1 ? "feature" : "features"}
                  </span>
                </Reveal>
                <div className="ct-catalog-grid">
                  {group.features.map((feature, index) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div ref={emptyResultsRef} className="ct-catalog-empty">
            <span className="ct-catalog-empty-icon">
              <Icon name="search" size={27} />
            </span>
            <h3>No features found</h3>
            <p>Try a different role, stage, or search term.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="ct-btn ct-btn-outline"
            >
              Show all features <Icon name="refresh-cw" size={16} />
            </button>
          </div>
        )}

        <div className="ct-catalog-roadmap-note">
          <Icon name="check-circle" size={19} />
          <p>
            <strong>What do the labels mean?</strong> <b>In the demo</b>{" "}
            identifies functionality currently provided in this local
            ConsultTime prototype. <b>Planned</b> identifies ideas inspired by
            your references that still need to be developed, tested, and
            connected to the backend.
          </p>
        </div>
      </section>

      <section className="ct-section ct-section-soft" id="how-it-works">
        <div className="ct-container">
          <Reveal className="ct-section-heading">
            <span className="ct-eyebrow">GETTING STARTED</span>
            <h2>Three simple steps</h2>
            <p>
              From finding faculty to managing your consultation, the essentials
              are easy to follow.
            </p>
          </Reveal>
          <WorkflowSteps />
        </div>
      </section>
      <Reveal className="ct-container ct-features-end">
        <h2>Ready to give ConsultTime a try?</h2>
        <p>
          Get started with the consultation features available in the local
          demo.
        </p>
        <Link to="/signup" className="ct-btn ct-btn-primary">
          Create Account <Icon name="arrow-right" size={16} />
        </Link>
      </Reveal>
    </div>
  );
}
