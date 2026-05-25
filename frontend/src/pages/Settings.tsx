import { PageHeader } from "../components/PageHeader";
import { StatusPanel } from "../components/StatusPanel";
import { usePageTitle } from "../hooks/usePageTitle";

export function Settings() {
  usePageTitle("Settings");

  return (
    <>
      <PageHeader
        description="Application configuration and integration status."
        eyebrow="SYSTEM"
        title="Settings"
      />
      <StatusPanel
        label="GITHUB INTEGRATION"
        message="Repository registration and webhook settings are managed from the Repos section."
      />
    </>
  );
}
