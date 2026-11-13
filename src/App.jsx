import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import FeaturesPage from "./pages/FeaturesPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import LoginPage from "./components/LoginPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PortalPage from "./pages/PortalPage.jsx";

const titles = {
  "/": "Home",
  "/about": "About Us",
  "/features": "Features",
  "/login": "Sign In",
  "/signup": "Create Account",
  "/forgot-password": "Password Recovery",
  "/portal": "Dashboard",
};

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document.title = `ConsultTime | ${titles[pathname] ?? "Page Not Found"}`;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.requestAnimationFrame(() =>
      document
        .getElementById(id)
        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
    return () => window.cancelAnimationFrame(timer);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <div className="site-shell">
      <RouteEffects />
      <SiteHeader />
      <main id="main-content" className="site-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}
