import { useState } from "react";
import Icon from "./Icon.jsx";
export default function PasswordField({
  label,
  id,
  value,
  onChange,
  autoComplete = "new-password",
  placeholder = "Enter your password",
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="ct-field" htmlFor={id}>
      <span>{label}</span>
      <span className="ct-password-control">
        <input
          required
          minLength={8}
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
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
    </label>
  );
}
