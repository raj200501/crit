import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SummaryPage from "@/components/SummaryPage";

export const metadata: Metadata = { title: "Pre-visit summary" };

export default function Page() {
  return (
    <AppShell active="summary">
      <SummaryPage />
    </AppShell>
  );
}
