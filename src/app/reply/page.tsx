import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ReplyImport from "@/components/ReplyImport";

export const metadata: Metadata = { title: "Add a relative’s answers" };

export default function Page() {
  return (
    <AppShell>
      <ReplyImport />
    </AppShell>
  );
}
