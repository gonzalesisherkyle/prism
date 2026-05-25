interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  if (compact) {
    return (
      <span className="font-mono font-extrabold text-code-md bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent select-none cursor-pointer">
        P
      </span>
    );
  }

  return (
    <div className="font-mono font-extrabold tracking-[0.18em] text-on-surface cursor-pointer select-none">
      <span className="text-code-md bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent hover:text-white transition-colors">
        PRISM
      </span>
    </div>
  );
}

