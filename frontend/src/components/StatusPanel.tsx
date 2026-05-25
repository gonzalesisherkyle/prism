interface StatusPanelProps {
  label: string;
  message: string;
  tone?: "standard" | "error";
}

export function StatusPanel({ label, message, tone = "standard" }: StatusPanelProps) {
  return (
    <div className={`panel p-lg ${tone === "error" ? "border-error" : ""}`}>
      <p className={`label-caps mb-sm ${tone === "error" ? "text-error" : ""}`}>{label}</p>
      <p className="text-body-md text-secondary">{message}</p>
    </div>
  );
}

