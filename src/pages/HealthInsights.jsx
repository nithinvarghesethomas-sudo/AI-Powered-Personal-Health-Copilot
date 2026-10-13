import { Brain, FileText, Sparkles, ShieldCheck } from "lucide-react";

const insights = [
  {
    icon: Brain,
    title: "Meaningful summaries",
    text: "Turn dense diagnosis notes into plain-language guidance and next steps.",
  },
  {
    icon: FileText,
    title: "Document grouping",
    text: "Group labs, prescriptions, and specialist notes in one health timeline.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & privacy",
    text: "Keep sensitive health context secure while reviewing your records together.",
  },
];

export default function HealthInsights() {
  return (
    <main className="page-content">
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            AI INSIGHTS
          </div>
          <h1>Understand your health in plain language.</h1>
        </div>
      </section>

      <section className="panel">
        <div className="welcome-label" style={{ marginBottom: 12 }}>
          <Sparkles size={15} />
          HEALTH COMPANION
        </div>
        <p className="muted-text">
          This space can summarize your records, point out follow-up items, and help
          you understand what matters most.
        </p>
      </section>

      <div className="metrics-grid" style={{ marginTop: 22 }}>
        {insights.map(({ icon: Icon, title, text }) => (
          <article key={title} className="metric-card">
            <div className="metric-top">
              <div className="metric-icon metric-teal">
                <Icon size={18} />
              </div>
            </div>
            <div className="metric-label" style={{ marginTop: 18 }}>{title}</div>
            <div className="metric-note" style={{ marginTop: 8 }}>{text}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
