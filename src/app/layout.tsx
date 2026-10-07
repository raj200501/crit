import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { HydrationMark } from "@/components/ui/HydrationMark";
import { InlineScript } from "@/components/ui/InlineScript";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { PresentModeHotkey } from "@/components/ui/PresentMode";
import { SkipLink } from "@/components/ui/SkipLink";
import { Toaster } from "@/components/ui/Toast";

// Sans: the same metric overrides next/font generates for Arial, declared in globals.css ("Geist Fallback") so they also
// apply to Arial's metric twins (Liberation Sans, Arimo) on Linux, where local(Arial) doesn't resolve.
const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap", adjustFontFallback: false, fallback: ["Geist Fallback"] });
// Mono is preloaded and falls back to a real monospace (not Arial at 134%): a mono meta row that wraps in the fallback and
// unwraps on swap shifted /summary by 15 px.
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", "monospace"],
});
// One generated fallback face can't match both styles (Newsreader italic is ~10% narrower than its roman against Times),
// so the roman and italic fallback faces are declared in globals.css ("Newsreader Fallback"), with metric-compatible
// Liberation Serif / Tinos as local sources so Linux and Android get the adjustment too.
const display = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"], // optical size: crisp at 72px, sturdy at 10pt in print
  style: ["normal", "italic"], // italic = the family's "vague voice" in the H1
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Newsreader Fallback"],
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
