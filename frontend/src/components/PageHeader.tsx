import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-xl flex flex-wrap items-end justify-between gap-lg border-b border-structure pb-lg">
      <div>
        <p className="label-caps mb-sm">{eyebrow}</p>
        <h1 className="text-headline-md text-on-surface">{title}</h1>
        {description && <p className="mt-sm max-w-2xl text-body-md text-secondary">{description}</p>}
      </div>
      {action}
    </header>
  );
}

