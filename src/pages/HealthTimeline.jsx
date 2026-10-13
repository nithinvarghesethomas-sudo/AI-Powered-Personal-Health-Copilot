import { useState } from "react";
import {
  GitBranch,
  FileText,
  CalendarDays,
  Activity,
  Pill,
  Stethoscope,
  FlaskConical,
  Filter,
  ShieldCheck,
} from "lucide-react";
import "./HealthTimeline.css";

const timelineData = [
  {
    id: 1,
    date: "12 Oct 2026",
    category: "Lab Report",
    title: "Complete Blood Count",
    description:
      "Sample timeline entry representing a laboratory report.",
    icon: FlaskConical,
    color: "teal",
  },
  {
    id: 2,
    date: "10 Oct 2026",
    category: "Prescription",
    title: "General Prescription",
    description:
      "Sample timeline entry representing a prescription document.",
    icon: Pill,
    color: "purple",
  },
  {
    id: 3,
    date: "08 Oct 2026",
    category: "Lab Report",
    title: "Health Checkup Report",
    description:
      "Sample timeline entry representing a health checkup report.",
    icon: Activity,
    color: "blue",
  },
  {
    id: 4,
    date: "05 Oct 2026",
    category: "Medical Visit",
    title: "General Consultation",
    description:
      "Sample timeline entry representing a medical consultation.",
    icon: Stethoscope,
    color: "orange",
  },
];

function HealthTimeline() {
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Lab Report", "Prescription", "Medical Visit"];

  const filteredEvents =
    filter === "All"
      ? timelineData
      : timelineData.filter((event) => event.category === filter);

  return (
    <section className="timeline-page">
      <div className="timeline-heading">
        <div>
          <span className="timeline-eyebrow">YOUR HEALTH JOURNEY</span>
          <h1>Health Timeline</h1>
          <p>
            View your medical history and important health documents in
            chronological order.
          </p>
        </div>

        <div className="timeline-heading-icon">
          <GitBranch size={25} />
        </div>
      </div>

      <div className="timeline-notice">
        <ShieldCheck size={20} />
        <p>
          <strong>Demo timeline:</strong> All events shown here are sample
          entries. No real medical history has been imported or verified.
        </p>
      </div>

      <div className="timeline-summary">
        <div className="timeline-summary-icon">
          <CalendarDays size={21} />
        </div>
        <div>
          <span>Timeline overview</span>
          <h2>{timelineData.length} sample events</h2>
          <p>October 2026 · Demonstration data</p>
        </div>
      </div>

      <div className="timeline-toolbar">
        <div>
          <h2>Medical history</h2>
          <p>Explore entries by document category.</p>
        </div>

        <div className="timeline-filter-label">
          <Filter size={16} />
          <span>Filter</span>
        </div>
      </div>

      <div className="timeline-filter-options">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={`timeline-filter-chip ${
              filter === item ? "selected" : ""
            }`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="timeline-events">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const Icon = event.icon;

            return (
              <article className="timeline-event" key={event.id}>
                <div className="timeline-track">
                  <div className={`timeline-event-icon ${event.color}`}>
                    <Icon size={19} />
                  </div>
                  <div className="timeline-connector" />
                </div>

                <div className="timeline-event-card">
                  <div className="timeline-event-top">
                    <span className="timeline-event-date">
                      <CalendarDays size={14} />
                      {event.date}
                    </span>
                    <span className="timeline-demo-badge">Demo</span>
                  </div>

                  <span className="timeline-event-category">
                    {event.category}
                  </span>

                  <h3>{event.title}</h3>
                  <p>{event.description}</p>

                  <div className="timeline-event-footer">
                    <FileText size={15} />
                    <span>Sample record · Not verified</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="timeline-empty">
            No events found in this category.
          </div>
        )}
      </div>

      <div className="timeline-footer-note">
        <ShieldCheck size={17} />
        <span>
          This timeline is for interface demonstration only and is not medical
          advice.
        </span>
      </div>
    </section>
  );
}

export default HealthTimeline;