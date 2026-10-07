import type { Metadata } from "next";
import { PracticeView } from "@/components/summary/PracticeView";

// The practice-side demo (AMENDMENTS A1): upcoming new-patient visits and the care-team document.
export const metadata: Metadata = { title: "Practice view (demo)" };

export default function Page() {
  return <PracticeView />;
}
