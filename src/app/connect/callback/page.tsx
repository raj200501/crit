import type { Metadata } from "next";
import ConnectCallback from "@/components/ConnectCallback";

export const metadata: Metadata = { title: "Connecting" };

export default function Page() {
  return <ConnectCallback />;
}
