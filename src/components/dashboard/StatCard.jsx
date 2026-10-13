import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "teal",
}) {
  return (
    <article className="stat-card">
      <div className={`stat-card-icon ${color}`}>
        {Icon && <Icon size={22} />}
      </div>

      <div className="stat-card-content">
        <p>{title}</p>
        <h3>{value}</h3>
        {subtitle && <span>{subtitle}</span>}
      </div>

      <ArrowUpRight size={18} className="stat-card-arrow" />
    </article>
  );
}