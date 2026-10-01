import type { Metadata } from "next";
import ClinicianView from "@/components/ClinicianView";

export const metadata: Metadata = { title: "Shared summary" };

export default function Page() {
  return <ClinicianView />;
}
