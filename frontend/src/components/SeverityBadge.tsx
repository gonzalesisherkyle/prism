import type { ReviewSeverity } from "../types/api";

interface SeverityBadgeProps {
  severity: ReviewSeverity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const severityClassName =
    severity === "critical"
      ? "badge-critical"
      : severity === "warning"
        ? "badge-warning"
        : "badge-suggestion";

  return <span className={`badge ${severityClassName}`}>{severity}</span>;
}

