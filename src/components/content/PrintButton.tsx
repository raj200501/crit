"use client";

import { Printer } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";

/** "Print this brief": window.print() (the page's print styles fit it on one Letter page). */
export function PrintButton({ children = "Print this brief", ...props }: Omit<ButtonProps, "onClick" | "href">) {
  return (
    <Button iconLeft={<Printer />} {...props} onClick={() => window.print()} className={["print:hidden", props.className].filter(Boolean).join(" ")}>
      {children}
    </Button>
  );
}
