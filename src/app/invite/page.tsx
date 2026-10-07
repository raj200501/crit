import type { Metadata } from "next";
import InviteFlow from "@/components/InviteFlow";

// The relative's phone flow. Everything it needs rides after the # in the invite link (never sent to a server).
export const metadata: Metadata = { title: "Your branch of the family tree" };

export default function Page() {
  return <InviteFlow />;
}
