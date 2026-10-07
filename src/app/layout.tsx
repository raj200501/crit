import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { HydrationMark } from "@/components/ui/HydrationMark";
import { InlineScript } from "@/components/ui/InlineScript";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { PresentModeHotkey } from "@/components/ui/PresentMode";
import { SkipLink } from "@/components/ui/SkipLink";
import { Toaster } from "@/components/ui/Toast";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false });
const display = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"], // optical size: crisp at 72px, sturdy at 10pt in print
  style: ["normal", "italic"], // italic = the family's "vague voice" in the H1
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Family Health Tree", template: "%s · Family Health Tree" },
  description:
    "Turn “heart problems run in the family” into who, what, and at what age, before the cardiology visit. A Team 709 student prototype with a made-up demo family.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#F6F8F7", colorScheme: "light" };

// Runs before first paint: marks JS-on (pinned hero only when JS runs) and present mode (?present / ?present=0).
const BOOT = `try{var d=document.documentElement;d.setAttribute('data-js','');var q=new URLSearchParams(location.search);
if(q.get('present')==='0')sessionStorage.removeItem('fht:present');else if(q.has('present'))sessionStorage.setItem('fht:present','1');
if(sessionStorage.getItem('fht:present'))d.setAttribute('data-present','')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <InlineScript html={BOOT} />
      </head>
      <body>
        <SkipLink />
        {/* The Toaster's m.li needs LazyMotion's features, so it renders inside the provider (outside it, toasts stay at opacity 0). */}
        <MotionProvider>
          {children}
          <Toaster />
        </MotionProvider>
        <PresentModeHotkey />
        <HydrationMark />
      </body>
    </html>
  );
}
