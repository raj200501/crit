import type { Metadata } from "next";
import InviteFlow from "@/components/InviteFlow";

export const metadata: Metadata = { title: "Your branch" };

export default function Page() {
  return <InviteFlow />;
}
