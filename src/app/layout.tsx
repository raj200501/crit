import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Family Health Tree",
    template: "%s · Family Health Tree",
  },
  description: "Turn “heart problems run in the family” into who, what, and at what age, before the cardiology visit. A Team 709 prototype.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
