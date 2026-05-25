interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-md font-mono font-bold tracking-[0.14em] text-on-surface">
      <span className="grid h-8 w-8 place-items-center bg-primary text-on-primary-fixed">
        P
      </span>
      {!compact && <span className="text-code-md">PRISM</span>}
    </div>
  );
}

