import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { DocsLayout } from "@/components/content/DocsLayout";
import { renderResearch } from "@/components/content/researchHtml";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import styles from "./research.module.css";

export const metadata: Metadata = {
  title: "Research",
  description: "The fact-checked research behind Family Health Tree: patient portals, privacy and compliance, clinical criteria and the business, with numbered sources.",
};

// docs/research.md, rendered once at build time (DESIGN §10.5). Heading ids, #source-N anchors and [n] citation links
// come from the pure transforms in researchHtml.ts (tests/research.test.ts).
const doc = renderResearch(readFileSync(path.join(process.cwd(), "docs", "research.md"), "utf8"));

export default function ResearchPage() {
  return (
    <main id="main">
      <Section theme="night" grain aria-labelledby="research-title" className="relative overflow-hidden pt-36 pb-16 lg:pt-44 lg:pb-24">
        {/* a faint lumen pool behind the title: light is earned, the write-up is the finished thing */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.14),transparent)]"
        />
        <Container className="relative">
          <Eyebrow>Research</Eyebrow>
          <h1 id="research-title" className="mt-5 max-w-[20ch] font-display text-display-xl font-book text-fg">
            The research behind Family Health Tree
          </h1>
          <p className="mt-6 max-w-[60ch] text-lead text-fg-2">
            Five research tracks, each checked against primary sources by an independent reviewer as of October 2026. Every bracketed number links to
            its source.
          </p>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow text-fg-2 uppercase">
            <span className="tabular-nums">{doc.sources} sources</span>
            <span aria-hidden className="text-fg-3">
              ·
            </span>
            <span className="tabular-nums">{doc.minutes} min read</span>
            <span aria-hidden className="text-fg-3">
              ·
            </span>
            <span className="whitespace-nowrap">Updated Oct 2026</span>
          </p>
        </Container>
      </Section>

      <Section theme="paper" aria-label="The write-up" className="py-12 lg:py-20">
        <DocsLayout toc={doc.toc} backToTop>
          <article aria-labelledby="research-title" className={styles.prose} dangerouslySetInnerHTML={{ __html: doc.html }} />
        </DocsLayout>
      </Section>
    </main>
  );
}
