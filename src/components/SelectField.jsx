import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import "../styles/dropdowns.css";

/**
 * Reusable, keyboard-accessible ConsultTime select control.
 * Receives the same controlled string value as the original native selects.
 * Supports labels, disabled states, Arrow/Home/End navigation, Enter, and Escape.
 */
export default function SelectField({
  value = "",
  onChange,
  options = [],
  placeholder = "Select an option",
  labelId,
  disabled = false,
  name,
}) {
  const uid = useId().replace(/:/g, "");
  const listId = `ct-options-${uid}`;
  const triggerRef = useRef(null);
  const wrapRef = useRef(null);
  const itemRefs = useRef([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [openUp, setOpenUp] = useState(false);
  const choices = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
  const chosen = choices.find(
    (option) => String(option.value) === String(value),
  );
  const selectedIndex = choices.findIndex(
    (option) => String(option.value) === String(value),
  );
  const current = chosen?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    function handlePointer(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    function handleFocus(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("focusin", handleFocus);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  function show() {
    if (disabled || !choices.length) return;
    const box = triggerRef.current?.getBoundingClientRect();
    if (box) setOpenUp(window.innerHeight - box.bottom < 260 && box.top > 300);
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function choose(index) {
    const option = choices[index];
    if (!option || option.disabled) return;
    onChange(String(option.value));
    setOpen(false);
    triggerRef.current?.focus();
  }

  function move(by) {
    if (!choices.length) return;
    let candidate = open ? active : Math.max(selectedIndex, 0);
    for (let i = 0; i < choices.length; i += 1) {
      candidate = (candidate + by + choices.length) % choices.length;
      if (!choices[candidate].disabled) break;
    }
    if (!open) show();
    setActive(candidate);
  }

  function onKeyDown(e) {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        if (!open) show();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        if (!open) show();
        setActive(choices.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else show();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`ct-select${open ? " is-open" : ""}${openUp ? " opens-up" : ""}${disabled ? " is-disabled" : ""}`}
    >
      <button
        ref={triggerRef}
        className={`ct-select-trigger${!chosen ? " is-placeholder" : ""}`}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-autocomplete="none"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && choices[active] ? `${listId}-${active}` : undefined
        }
        aria-labelledby={labelId ? `${labelId} ${listId}-value` : undefined}
      >
        <span className="ct-select-value" id={`${listId}-value`}>
          {current}
        </span>
        <Icon name="chevron-down" size={17} className="ct-select-arrow" />
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      {open && (
        <div
          className="ct-select-menu"
          role="listbox"
          id={listId}
          aria-labelledby={labelId}
        >
          {choices.map((option, index) => (
            <div
              key={`${option.value}-${index}`}
              id={`${listId}-${index}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              role="option"
              aria-selected={String(option.value) === String(value)}
              aria-disabled={option.disabled || undefined}
              className={`ct-select-option${index === active ? " is-active" : ""}${String(option.value) === String(value) ? " is-selected" : ""}${option.disabled ? " is-disabled" : ""}`}
              onMouseEnter={() => setActive(index)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {String(option.value) === String(value) && (
                <Icon name="check" size={16} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
