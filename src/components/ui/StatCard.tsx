import type { CourseMetric } from "../../types";

export function StatCard({ metric }: { metric: CourseMetric }) {
  return (
    <article className={`stat-card stat-${metric.tone}`}>
      <div className="stat-icon">{metric.icon}</div>
      <div>
        <span>{metric.label}</span>
        <strong>{metric.value}</strong>
        <small>{metric.detail}</small>
      </div>
    </article>
  );
}
