import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import TreeWorkspace from "@/components/TreeWorkspace";

export const metadata: Metadata = { title: "Your tree" };

export default function TreePage() {
  return (
    <AppShell active="tree">
      <TreeWorkspace />
    </AppShell>
  );
}
