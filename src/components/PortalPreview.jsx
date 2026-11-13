import Icon from "./Icon.jsx";

const slots = ["08:30 AM", "10:00 AM", "01:30 PM"];
export default function PortalPreview({ className = "" }) {
  return (
    <div
      className={`ct-portal-preview ${className}`}
      aria-label="Illustrative consultation portal preview"
    >
      <div className="ct-preview-top">
        <div className="ct-preview-dots">
          <i />
          <i />
          <i />
        </div>
        <span>ConsultTime / My dashboard</span>
        <Icon name="bell" size={17} />
      </div>
      <div className="ct-preview-content">
        <div className="ct-preview-heading">
          <div>
            <small>Welcome to your workspace</small>
            <strong>Plan your next consultation</strong>
          </div>
          <span className="ct-preview-avatar">
            <Icon name="graduation" size={20} />
          </span>
        </div>
        <div className="ct-preview-summary">
          <div className="ct-preview-summary-icon">
            <Icon name="calendar" size={24} />
          </div>
          <div>
            <small>Upcoming consultation</small>
            <b>Advising & academic support</b>
            <span>Scheduling made simple</span>
          </div>
          <span className="ct-preview-tag">Preview</span>
        </div>
        <div className="ct-preview-card">
          <div className="ct-preview-card-title">
            <strong>Available times</strong>
            <span>Sample schedule</span>
          </div>
          <div className="ct-preview-day">
            <span>
              MON <b>16</b>
            </span>
            <span>
              TUE <b>17</b>
            </span>
            <span className="selected">
              WED <b>18</b>
            </span>
            <span>
              THU <b>19</b>
            </span>
            <span>
              FRI <b>20</b>
            </span>
          </div>
          <div className="ct-preview-slots">
            {slots.map((slot) => (
              <span key={slot}>
                <Icon name="clock" size={12} /> {slot}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="ct-preview-floating ct-preview-floating-one">
        <span className="ct-floating-symbol">
          <Icon name="check" size={16} />
        </span>
        <div>
          <strong>Organized requests</strong>
          <small>All in one dashboard</small>
        </div>
      </div>
      <div className="ct-preview-floating ct-preview-floating-two">
        <Icon name="bell" size={18} />
        <span>Stay informed</span>
      </div>
    </div>
  );
}
