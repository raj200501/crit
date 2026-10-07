import type { Metadata } from "next";
import PracticePreview from "./PracticePreview";

// PLACEHOLDER created by P1 so the AppShell role menu ("Practice · care-team view") never 404s.
// P7 owns this route (AMENDMENTS A1) and replaces both files.
export const metadata: Metadata = { title: "Practice view (demo)" };

export default function Page() {
  return <PracticePreview />;
}
