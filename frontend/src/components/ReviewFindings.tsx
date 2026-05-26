import type { ReviewComment } from "../types/api";
import { SeverityBadge } from "./SeverityBadge";
import { StatusPanel } from "./StatusPanel";

interface ReviewFindingsProps {
  comments: ReviewComment[];
}

function groupByFilename(comments: ReviewComment[]): Array<[string, ReviewComment[]]> {
  const grouped = new Map<string, ReviewComment[]>();

  comments.forEach((comment) => {
    const existing = grouped.get(comment.path) ?? [];
    existing.push(comment);
    grouped.set(comment.path, existing);
  });

  return [...grouped.entries()];
}

export function ReviewFindings({ comments }: ReviewFindingsProps) {
  const commentGroups = groupByFilename(comments);

  if (commentGroups.length === 0) {
    return (
      <StatusPanel
        label="NO INLINE FINDINGS"
        message="Prism did not identify actionable issues."
      />
    );
  }

  return (
    <section className="grid gap-md lg:grid-cols-[260px_minmax(0,1fr)]">
      <nav aria-label="Reviewed files" className="panel relative self-start overflow-hidden p-md">
        <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-primary/10 to-transparent" />
        <p className="label-caps mb-md font-semibold text-primary">FILES</p>
        <div className="grid gap-sm">
          {commentGroups.map(([filename, fileComments]) => (
            <div
              className="border-l-2 border-structure/50 border-l-primary/50 bg-surface-container-lowest/30 px-md py-sm transition-colors hover:bg-surface-container-high/30"
              key={filename}
            >
              <p className="break-all font-mono text-code-sm font-medium text-secondary">
                {filename}
              </p>
              <p className="mt-xs font-mono text-label-caps text-outline">
                {fileComments.length} FINDING{fileComments.length === 1 ? "" : "S"}
              </p>
            </div>
          ))}
        </div>
      </nav>

      <div className="grid gap-lg">
        {commentGroups.map(([filename, fileComments]) => (
          <section className="panel relative overflow-hidden p-lg" key={filename}>
            <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-primary/20 to-transparent" />
            <h2 className="mb-md flex items-center gap-sm border-b border-structure/50 pb-md font-mono text-code-md font-semibold text-on-surface">
              <span className="h-2 w-2 bg-primary" />
              {filename}
            </h2>
            <div className="grid gap-md">
              {fileComments.map((comment, index) => (
                <article
                  className="border border-structure bg-surface-container-low/40 p-md transition-all duration-300 hover:border-outline-variant hover:bg-surface-container-low/70 hover:shadow-md"
                  key={`${comment.line}-${index}`}
                >
                  <header className="mb-md flex flex-wrap items-center justify-between gap-sm">
                    <div className="flex items-center gap-sm">
                      <span className="grid h-6 w-6 place-items-center bg-gradient-to-br from-primary to-primary-container font-mono text-[10px] font-bold text-white shadow-md shadow-primary/25">
                        P
                      </span>
                      <span className="font-mono text-code-sm font-semibold text-on-surface">
                        Prism AI
                      </span>
                      <span className="font-mono text-code-sm text-outline">
                        line {comment.line}
                      </span>
                    </div>
                    <SeverityBadge severity={comment.severity} />
                  </header>
                  <p className="pl-[32px] text-body-md leading-relaxed text-on-surface">
                    {comment.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
