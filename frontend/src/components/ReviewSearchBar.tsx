import { LoaderCircle, Search } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";

interface ReviewSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  children?: ReactNode;
}

export function ReviewSearchBar({ value, onChange, loading, children }: ReviewSearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <section className="panel mb-lg overflow-hidden border-primary/20 p-lg shadow-lg shadow-primary/5">
      <div className={`grid gap-md ${children ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
        <label>
          <span className="label-caps mb-sm block text-primary">SEMANTIC SEARCH</span>
          <span className="relative block">
            <Search
              aria-hidden="true"
              className="absolute left-md top-1/2 -translate-y-1/2 text-outline"
              size={16}
            />
            <input
              aria-label="Search completed reviews"
              className="field py-md pl-xl pr-xl"
              onChange={handleChange}
              placeholder="Search review summaries by meaning..."
              type="search"
              value={value}
            />
            {loading && (
              <LoaderCircle
                aria-label="Searching"
                className="absolute right-md top-1/2 -translate-y-1/2 animate-spin text-primary"
                size={17}
              />
            )}
          </span>
        </label>
        {children}
      </div>
    </section>
  );
}
