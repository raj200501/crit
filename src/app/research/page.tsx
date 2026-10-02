import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { marked } from "marked";
import AppShell from "@/components/AppShell";
import styles from "./research.module.css";

export const metadata: Metadata = { title: "Research" };

// Renders docs/research.md (fact-checked research write-up) at build time.
export default async function ResearchPage() {
  const md = await readFile(path.join(process.cwd(), "docs", "research.md"), "utf8");
  const html = (await marked.parse(md.replace("[`mvp-spec.md`](./mvp-spec.md)", "`docs/mvp-spec.md` in the repository"), { gfm: true }))
    // External sources open in a new tab without leaking where the reader came from.
    .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
  return (
    <AppShell active="how">
      <main className={styles.main}>
        <article className={styles.doc} dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </AppShell>
  );
}
