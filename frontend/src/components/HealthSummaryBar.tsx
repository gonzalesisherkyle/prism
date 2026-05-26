import type { DashboardRepository, HealthGrade } from "../types/api";
import { gradeTextClass } from "./RepoHealthGrade";

interface HealthSummaryBarProps {
  repos: DashboardRepository[];
  selectedGrade: HealthGrade | null;
  onSelectGrade: (grade: HealthGrade | null) => void;
}

const grades: readonly HealthGrade[] = ["A", "B", "C", "D", "F"];

export function HealthSummaryBar({
  repos,
  selectedGrade,
  onSelectGrade,
}: HealthSummaryBarProps) {
  const counts = grades.map((grade) => ({
    grade,
    count: repos.filter(
      (repo) => repo.health.reviewCount >= 3 && repo.health.grade === grade,
    ).length,
  }));
  const insufficientCount = repos.filter((repo) => repo.health.reviewCount < 3).length;

  return (
    <section
      aria-label="Repository health summary"
      className="panel mb-lg flex flex-col gap-md border-primary/20 p-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="label-caps text-primary">REPO HEALTH</p>
        <p className="mt-xs text-body-sm text-secondary">Rolling average from the last 10 reviews</p>
      </div>
      <div className="flex flex-wrap items-center gap-sm">
        <button
          aria-pressed={selectedGrade === null}
          className={`border px-md py-sm font-mono text-code-sm transition-colors ${
            selectedGrade === null
              ? "border-primary bg-primary/10 text-on-surface"
              : "border-structure text-secondary hover:border-primary hover:text-on-surface"
          }`}
          onClick={() => onSelectGrade(null)}
          type="button"
        >
          ALL {repos.length}
        </button>
        {counts
          .filter(({ count }) => count > 0)
          .map(({ grade, count }) => (
            <button
              aria-pressed={selectedGrade === grade}
              className={`border px-md py-sm font-mono text-code-sm transition-colors ${
                selectedGrade === grade
                  ? "border-primary bg-primary/10 text-on-surface"
                  : "border-structure text-secondary hover:border-primary hover:text-on-surface"
              }`}
              key={grade}
              onClick={() => onSelectGrade(selectedGrade === grade ? null : grade)}
              type="button"
            >
              {count} <span className={`${gradeTextClass(grade)} font-bold`}>{grade}</span>
            </button>
          ))}
        {insufficientCount > 0 && (
          <p className="border border-structure px-md py-sm font-mono text-code-sm text-outline">
            {insufficientCount} PENDING
          </p>
        )}
      </div>
    </section>
  );
}
