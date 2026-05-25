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

function badgeClassName(tone: ScoreTone): string {
  switch (tone) {
    case "critical":
      return "badge badge-critical";
    case "warning":
      return "badge badge-warning";
    case "success":
      return "badge badge-success";
    default:
      return "badge border-outline-variant bg-surface-container-high text-secondary";
  }
}

function scoreBarClassName(tone: ScoreTone): string {
  switch (tone) {
    case "critical":
      return "bg-error";
    case "warning":
      return "bg-tertiary";
    case "success":
      return "bg-diagnostic-success";
    default:
      return "bg-outline";
  }
}

export function ScoreBadge({ score, large = false }: ScoreBadgeProps) {
  const tone = scoreTone(score);
  const value = score === null ? "--" : score.toFixed(score % 1 === 0 ? 0 : 1);

  if (large) {
    return (
      <div className="min-w-28 text-right">
        <p className="label-caps mb-sm">REVIEW SCORE</p>
        <p className="font-mono text-[48px] font-bold leading-[56px] text-on-surface">{value}</p>
        <div className={`ml-auto mt-sm h-1 w-20 ${scoreBarClassName(tone)}`} />
      </div>
    );
  }

  return <span className={badgeClassName(tone)}>SCORE {value}</span>;
}

