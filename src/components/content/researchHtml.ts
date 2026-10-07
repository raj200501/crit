// /research: docs/research.md → HTML at build time (DESIGN §10.5). Pure string transforms, unit-tested in tests/research.test.ts.
// Order matters: escape stray tags → heading ids → source anchors → inline citations → external links → table wrappers.
import { marked } from "marked";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ResearchDoc {
  /** The article body (the markdown's own H1 removed: the page renders its own). */
  html: string;
  /** H1 text of the markdown. */
  title: string;
  toc: TocItem[];
  /** Number of numbered sources (li#source-N). */
  sources: number;
  /** Words in the write-up (the Sources list isn't counted). */
  words: number;
  /** Reading time at 230 words a minute, rounded up. */
  minutes: number;
}

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Decodes the entities marked emits (&amp; &lt; &gt; &quot; &#39; and numeric ones). */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    }
    return NAMED[e.toLowerCase()] ?? all;
  });
}

export const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

/** GitHub-style slug: lowercase, keep only a–z, 0–9, spaces and hyphens, then each space becomes a hyphen. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/ /g, "-");
}

/**
 * CommonMark lets only a list that starts at 1 interrupt a paragraph, so in "**Privacy and compliance**\n33. Hunton…"
 * sources 33–121 rendered as one run-on paragraph. Inside the Sources section, put a blank line between a bold
 * group label and the numbered line under it, so marked emits <ol start="33">.
 */
export function normalizeSourceLists(md: string): string {
  const at = md.search(/^## Sources[ \t]*$/m);
  if (at < 0) return md;
  return md.slice(0, at) + md.slice(at).replace(/^(\*\*[^\n]+\*\*)[ \t]*\n(?=\d+\. )/gm, "$1\n\n");
}

// Every tag marked can emit for this document. Anything else is a placeholder written in angle brackets
// ("from <health system>'s record, retrieved <date>"), which browsers would swallow as an unknown element.
const HTML_TAGS = new Set(
  "a abbr b blockquote br code del div em h1 h2 h3 h4 h5 h6 hr i img input li ol p pre s span strong sub sup table tbody td tfoot th thead tr ul".split(" "),
);

/** Escapes `<word …>` tokens that aren't HTML (outside code they reach the browser as unknown elements and vanish). */
export function escapeUnknownTags(html: string): string {
  return html.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^<>]*)>/g, (all, slash: string, name: string, rest: string) =>
    HTML_TAGS.has(name.toLowerCase()) ? all : `&lt;${slash}${name}${rest}&gt;`,
  );
}

/** Adds GitHub-style ids to every heading (duplicates get -1, -2…) and returns the h2/h3 outline. */
export function addHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const seen = new Map<string, number>();
  const toc: TocItem[] = [];
  const out = html.replace(/<h([1-6])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g, (all, lvl: string, attrs: string, inner: string) => {
    if (/\sid=/.test(attrs)) return all;
    const text = decodeEntities(stripTags(inner)).replace(/\s+/g, " ").trim();
    const base = slugify(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n ? `${base}-${n}` : base;
    if (lvl === "2" || lvl === "3") toc.push({ id, text, level: Number(lvl) as 2 | 3 });
    return `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}

/** In the "Sources" section, item k of each <ol start="S"> gets id="source-{S+k}" (S = 1 without a start). */
export function addSourceAnchors(html: string): string {
  const at = html.search(/<h2\b[^>]*>Sources<\/h2>/);
  if (at < 0) return html;
  const tail = html.slice(at).replace(/<ol((?:\s+start="(\d+)")?)>([\s\S]*?)<\/ol>/g, (all, attrs: string, start: string | undefined, body: string) => {
    let k = start ? Number(start) : 1;
    return `<ol${attrs}>${body.replace(/<li>/g, () => `<li id="source-${k++}">`)}</ol>`;
  });
  return html.slice(0, at) + tail;
}

/** Numbers that have a source anchor. */
export function sourceIds(html: string): number[] {
  return [...html.matchAll(/<li id="source-(\d+)"/g)].map((m) => Number(m[1]));
}

/**
 * Text "[87]" (and runs like "[72][83]") becomes <a class="cite" href="#source-87">[87]</a>. Never inside <a>, <code> or
 * <pre>, and only for numbers in `known` when it's given (so "[1999]" or a typo never links to nothing).
 */
export function linkCitations(html: string, known?: ReadonlySet<number>): string {
  let skip = 0;
  return html
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        const m = /^<(\/?)(a|code|pre)\b/i.exec(part);
        if (m) skip = Math.max(0, skip + (m[1] ? -1 : 1));
        return part;
      }
      if (skip > 0) return part;
      return part.replace(/\[(\d{1,3})\]/g, (all, n: string) => (known && !known.has(Number(n)) ? all : `<a class="cite" href="#source-${n}">[${n}]</a>`));
    })
    .join("");
}

/** External sources open in a new tab without leaking where the reader came from. */
export function externalLinksInNewTab(html: string): string {
  return html.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}

/** Wraps each table in a keyboard-scrollable group (tables scroll sideways inside it, never the page). */
export function wrapTables(html: string): string {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (all, body: string) => {
    const heads = [...body.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].slice(0, 4).map((m) => decodeEntities(stripTags(m[1])).trim()).filter(Boolean);
    const label = heads.length ? `Table: ${heads.join(", ")}` : "Table";
    return `<div data-table-wrap role="group" tabindex="0" aria-label="${label.replace(/"/g, "&quot;")}">${all}</div>`;
  });
}

/** Word count of the markdown's prose (links, URLs and markup removed). */
export function countWords(md: string): number {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_`>|[\]-]+/g, " ");
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** The whole pipeline: markdown in, article HTML + outline + meta out. */
export function renderResearch(md: string): ResearchDoc {
  const source = normalizeSourceLists(md.replace("[`mvp-spec.md`](./mvp-spec.md)", "`docs/mvp-spec.md` in the repository"));
  let html = marked.parse(source, { gfm: true, async: false }) as string;
  html = escapeUnknownTags(html);
  const h1 = /<h1>([\s\S]*?)<\/h1>\s*/.exec(html);
  const title = h1 ? decodeEntities(stripTags(h1[1])).trim() : "";
  if (h1) html = html.replace(h1[0], "");
  const withIds = addHeadingIds(html);
  html = addSourceAnchors(withIds.html);
  const ids = sourceIds(html);
  html = linkCitations(html, new Set(ids));
  html = externalLinksInNewTab(html);
  html = wrapTables(html);
  // reading time covers the write-up, not the bibliography
  const sourcesAt = md.search(/^## Sources[ \t]*$/m);
  const words = countWords(sourcesAt < 0 ? md : md.slice(0, sourcesAt));
  return { html, title, toc: withIds.toc, sources: ids.length, words, minutes: Math.max(1, Math.ceil(words / 230)) };
}
