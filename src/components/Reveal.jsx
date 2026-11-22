import { useEffect, useRef, useState } from "react";
export default function Reveal({
  as: Element = "div",
  className = "",
  children,
  delay = 0,
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Element
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` }}
      className={`ct-reveal${visible ? " visible" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}
