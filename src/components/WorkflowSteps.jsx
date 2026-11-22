import Reveal from "./Reveal.jsx";
import Icon from "./Icon.jsx";
const steps = [
  {
    number: "01",
    icon: "search",
    title: "Find your faculty",
    description:
      "Browse faculty members and see available consultation schedules in one place.",
  },
  {
    number: "02",
    icon: "calendar",
    title: "Request a schedule",
    description:
      "Choose a suitable time and submit a consultation request for review.",
  },
  {
    number: "03",
    icon: "check-circle",
    title: "Stay on track",
    description:
      "Follow your request status and manage upcoming consultations with ease.",
  },
];
export default function WorkflowSteps() {
  return (
    <div className="ct-steps-grid">
      {steps.map((step, i) => (
        <Reveal
          as="article"
          key={step.number}
          delay={i * 95}
          className="ct-step-card"
        >
          <div className="ct-step-top">
            <span className="ct-step-icon">
              <Icon name={step.icon} size={26} />
            </span>
            <span className="ct-step-number">{step.number}</span>
          </div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </Reveal>
      ))}
    </div>
  );
}
