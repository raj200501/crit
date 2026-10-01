import type { Metadata } from "next";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = { title: "How it works" };

export default function Page() {
  return (
    <AppShell active="how">
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
        <p className="kicker">How it would really work</p>
        <h1 style={{ fontSize: 40, margin: "10px 0 16px" }}>Research in progress</h1>
        <p className="muted">The research write-up is being finalized.</p>
      </main>
    </AppShell>
  );
}
