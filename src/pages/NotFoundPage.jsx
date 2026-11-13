import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
export default function NotFoundPage() {
  return (
    <section className="ct-container ct-not-found">
      <span className="ct-eyebrow">404 / PAGE NOT FOUND</span>
      <h1>Looks like this page missed its appointment.</h1>
      <p>Let's get you back to where you need to be.</p>
      <Link to="/" className="ct-btn ct-btn-primary">
        Back to Home <Icon name="arrow-right" size={16} />
      </Link>
    </section>
  );
}
