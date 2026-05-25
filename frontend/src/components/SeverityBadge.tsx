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

  const dotColor =
    severity === "critical"
      ? "bg-error"
      : severity === "warning"
        ? "bg-tertiary"
        : "bg-diagnostic-suggestion";

  return (
    <span className={`inline-flex items-center gap-sm border rounded-none px-sm py-xs font-mono text-[10px] font-bold tracking-wider uppercase ${severityClassName} shadow-sm shadow-black/10`}>
      <span className={`h-1.5 w-1.5 ${dotColor} animate-pulse`} />
      {severity}
    </span>
  );
}

