import { useState } from "react";
import Icon from "./Icon.jsx";
import { passwordChecks } from "../utils/passwordRules.js";

const missingLabels = {
  length: "at least 8 characters",
  uppercase: "an uppercase letter",
  lowercase: "a lowercase letter",
  number: "a number",
  symbol: "a special character",
};

function naturalList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function passwordFeedback(value) {
  if (!value)
    return {
      strength: "",
      message:
        "Use 8–128 characters, uppercase and lowercase letters, a number, and a special character. No spaces.",
    };

  const checks = passwordChecks(value);
  const missing = checks.filter((item) => !item.passed);
  const requirements = missing
    .filter((item) => missingLabels[item.id])
    .map((item) => missingLabels[item.id]);
  const suggestions = [];

  if (requirements.length) suggestions.push(`Add ${naturalList(requirements)}`);
  if (missing.some((item) => item.id === "spaces"))
    suggestions.push("Remove spaces");
  if (missing.some((item) => item.id === "maximum"))
    suggestions.push("Use 128 characters or fewer");

  if (!missing.length)
    return {
      strength: value.length >= 12 ? "Strong" : "Good",
      message: "Your password meets all requirements.",
    };

  const completeCoreRules = checks.filter(
    (item) =>
      ["length", "uppercase", "lowercase", "number", "symbol"].includes(
        item.id,
      ) && item.passed,
  ).length;
  return {
    strength: completeCoreRules >= 4 ? "Fair" : "Weak",
    message: `${suggestions.join(". ")}.`,
  };
}

export default function PasswordField({
  label,
  id,
  value,
  onChange,
  autoComplete = "new-password",
  placeholder = "Enter your password",
  showRequirements = false,
  className = "",
}) {
  const [visible, setVisible] = useState(false);
  const feedback = showRequirements ? passwordFeedback(value) : null;

  return (
    <div className={`ct-field ${className}`.trim()}>
      <label htmlFor={id} className="ct-field-caption">
        {label}
      </label>
      <span className="ct-password-control">
        <input
          required
          minLength={8}
          maxLength={128}
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={showRequirements ? `${id}-guidance` : undefined}
        />
        <button
          className="ct-show-password"
          type="button"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={19} />
        </button>
      </span>
      {showRequirements && (
        <small
          className={`ct-password-hint ${feedback.strength ? `is-${feedback.strength.toLowerCase()}` : ""}`}
          id={`${id}-guidance`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback.strength && <strong>{feedback.strength} — </strong>}
          {feedback.message}
        </small>
      )}
    </div>
  );
}
