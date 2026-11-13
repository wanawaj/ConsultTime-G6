import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Features", to: "/features" },
];

export default function SiteHeader() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`ct-header${scrolled ? " scrolled" : ""}`}>
      <div className="ct-header-inner ct-container">
        <Brand />
        <button
          type="button"
          className="ct-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="ct-site-nav"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={24} />
        </button>
        <div
          className={`ct-header-navigation${menuOpen ? " open" : ""}`}
          id="ct-site-nav"
        >
          <nav aria-label="Primary navigation" className="ct-nav-links">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={to}
                end={to === "/"}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ct-nav-actions">
            {user ? (
              <>
                <Link
                  to="/portal"
                  className="ct-btn ct-btn-primary ct-header-join"
                >
                  Dashboard <Icon name="arrow-right" size={16} />
                </Link>
                <button
                  type="button"
                  className="ct-header-signin ct-signout"
                  onClick={signOut}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="ct-header-signin">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="ct-btn ct-btn-primary ct-header-join"
                >
                  Get Started <Icon name="arrow-right" size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
