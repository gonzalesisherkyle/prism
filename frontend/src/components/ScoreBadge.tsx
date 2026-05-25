type ScoreTone = "critical" | "warning" | "success" | "neutral";

interface ScoreBadgeProps {
  score: number | null;
  large?: boolean;
}

export function scoreTone(score: number | null): ScoreTone {
  if (score === null) {
    return "neutral";
  }

  if (score <= 4) {
    return "critical";
  }

  if (score <= 6) {
    return "warning";
  }

  return "success";
}

function badgeColors(tone: ScoreTone): { bg: string; border: string; text: string; dot: string } {
  switch (tone) {
    case "critical":
      return {
        bg: "bg-error/10",
        border: "border-error/20",
        text: "text-error",
        dot: "bg-error",
      };
    case "warning":
      return {
        bg: "bg-tertiary/10",
        border: "border-tertiary/20",
        text: "text-tertiary",
        dot: "bg-tertiary",
      };
    case "success":
      return {
        bg: "bg-diagnostic-success/10",
        border: "border-diagnostic-success/20",
        text: "text-diagnostic-success",
        dot: "bg-diagnostic-success",
      };
    default:
      return {
        bg: "bg-outline-variant/10",
        border: "border-outline-variant/30",
        text: "text-secondary",
        dot: "bg-outline",
      };
  }
}

export function ScoreBadge({ score, large = false }: ScoreBadgeProps) {
  const tone = scoreTone(score);
  const value = score === null ? "--" : score.toFixed(score % 1 === 0 ? 0 : 1);
  const colors = badgeColors(tone);

  if (large) {
    const numericScore = score ?? 0;
    const r = 26;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference - (numericScore / 10) * circumference;

    const strokeColor =
      tone === "critical"
        ? "#ef4444"
        : tone === "warning"
          ? "#f59e0b"
          : tone === "success"
            ? "#10b981"
            : "#64748b";

    return (
      <div className="flex items-center gap-md select-none">
        <div className="text-right">
          <p className="label-caps mb-xs">REVIEW SCORE</p>
          <p className="text-body-sm text-secondary font-medium">
            {tone === "success" && "Excellent Quality"}
            {tone === "warning" && "Moderate Risk"}
            {tone === "critical" && "Critical Action"}
            {tone === "neutral" && "Pending Review"}
          </p>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            {/* Background Track */}
            <circle
              cx="32"
              cy="32"
              r={r}
              className="stroke-surface-container-highest"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Progress Circular Path */}
            <circle
              cx="32"
              cy="32"
              r={r}
              stroke={strokeColor}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 4px ${strokeColor}40)`
              }}
            />
          </svg>
          {/* Centered Value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xl font-extrabold text-on-surface leading-none">
              {value}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-sm border rounded-none px-sm py-xs font-mono text-[11px] font-bold tracking-wide uppercase ${colors.bg} ${colors.border} ${colors.text} shadow-sm shadow-black/10`}>
      <span className={`h-1.5 w-1.5 ${colors.dot} animate-pulse`} />
      SCORE {value}
    </span>
  );
}

