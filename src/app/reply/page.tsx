import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ReplyImport from "@/components/ReplyImport";

export const metadata: Metadata = { title: "Add answers" };

export default function Page() {
  return (
    <AppShell>
      <ReplyImport />
    </AppShell>
  );
}
