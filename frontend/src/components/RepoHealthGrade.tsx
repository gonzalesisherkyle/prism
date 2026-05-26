import type { HealthGrade, HealthTrend, RepositoryHealth } from "../types/api";

interface RepoHealthGradeProps {
  health: RepositoryHealth;
  compact?: boolean;
}

const gradeClasses: Readonly<Record<HealthGrade, string>> = {
  A: "text-diagnostic-success",
  B: "text-teal-400",
  C: "text-tertiary",
  D: "text-orange-400",
  F: "text-error",
};

const trendClasses: Readonly<Record<HealthTrend, string>> = {
  up: "text-diagnostic-success",
  down: "text-error",
  stable: "text-outline",
};

const trendSymbols: Readonly<Record<HealthTrend, string>> = {
  up: "\u2191",
  down: "\u2193",
  stable: "\u2192",
};

export function gradeTextClass(grade: HealthGrade): string {
  return gradeClasses[grade];
}

export function RepoHealthGrade({ health, compact = false }: RepoHealthGradeProps) {
  const hasEnoughData = health.reviewCount >= 3;

  return (
    <div
      className={
        compact
          ? "border border-structure bg-surface-container-high/40 px-md py-sm text-right"
          : ""
      }
    >
      <p className="label-caps mb-xs">HEALTH</p>
      {hasEnoughData ? (
        <>
          <div className="flex items-center justify-end gap-sm font-mono">
            <span
              className={`${gradeTextClass(health.grade)} ${
                compact ? "text-title-sm" : "text-display-lg"
              } font-bold`}
            >
              {health.grade}
            </span>
            <span
              aria-label={`Trend ${health.trend}`}
              className={`${trendClasses[health.trend]} ${
                compact ? "text-title-sm" : "text-headline-md"
              } font-bold`}
            >
              {trendSymbols[health.trend]}
            </span>
          </div>
          <p className="font-mono text-code-sm text-secondary">
            avg {health.average.toFixed(1)}
          </p>
        </>
      ) : (
        <p className="font-mono text-code-sm text-secondary">Not enough data</p>
      )}
    </div>
  );
}
