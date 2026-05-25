interface StatusPanelProps {
  label: string;
  message: string;
  tone?: "standard" | "error";
}

export function StatusPanel({ label, message, tone = "standard" }: StatusPanelProps) {
  if (label === "LOADING") {
    return (
      <div className="grid gap-md w-full">
        <div className="panel p-lg flex flex-col gap-md">
          <div className="h-3 w-28 skeleton" />
          <div className="h-5 w-2/3 skeleton" />
          <div className="h-4 w-1/2 skeleton" />
        </div>
      </div>
    );
  }

  const borderToneClass =
    tone === "error"
      ? "border-l-4 border-l-error border-t-structure border-r-structure border-b-structure"
      : "border-l-4 border-l-primary border-t-structure border-r-structure border-b-structure";

  return (
    <div className={`panel p-lg transition-all duration-300 ${borderToneClass}`}>
      <p className={`label-caps mb-sm ${tone === "error" ? "text-error" : "text-primary"}`}>{label}</p>
      <p className="text-body-md text-secondary font-medium">{message}</p>
    </div>
  );
}

