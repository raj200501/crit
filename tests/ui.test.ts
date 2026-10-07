// P1 unit tests: cn() knows the custom scale, every DESIGN §3.1 contrast pair holds (recomputed from globals.css),
// and the Tailwind build still emits the utilities that `--color-*: initial` could have removed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { cn } from "../src/components/ui/cn";
import { sourceChipText } from "../src/components/ui/SourceChip";
import { HONESTY, PATIENT_QUESTIONS, pilotCta, pilotHref, SITE, STATS } from "../src/content/site";
import { statusWord } from "../src/components/tree/model";

const ROOT = path.resolve(import.meta.dirname, "..");
const GLOBALS = readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8");

describe("cn()", () => {
  test("keeps the custom type scale next to a text color", () => {
    assert.equal(cn("text-display-xl", "text-fg"), "text-display-xl text-fg");
    assert.equal(cn("text-eyebrow", "text-fg-3"), "text-eyebrow text-fg-3");
  });
  test("still merges real conflicts", () => {
    assert.equal(cn("px-2", "px-4"), "px-4");
    assert.equal(cn("shadow-paper", "shadow-glow"), "shadow-glow");
    assert.equal(cn("rounded-full", "rounded-paper"), "rounded-paper");
    assert.equal(cn("text-display-l", "text-display-m"), "text-display-m");
  });
  test("font-book and font-display coexist", () => {
    assert.equal(cn("font-display", "font-book"), "font-display font-book");
  });
  test("handles falsy values", () => {
    assert.equal(cn("a", false, null, undefined, "b"), "a b");
  });
});

// ---- contrast (WCAG 2.x relative luminance) ----
function token(name: string): string {
  const m = GLOBALS.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  assert.ok(m, `token --${name} not found in globals.css`);
  return m[1];
}
function lum(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
const c = (n: string) => token(`color-${n}`);
const f = (n: string) => token(`fht-${n}`);

// [foreground, background, stated contrast in DESIGN §3.1, minimum it must meet]
const TEXT = 4.5;
const UI = 3;
const PAIRS: [string, string, string, string, number, number][] = [
  ["ink", "paper", c("ink"), c("paper"), 16.1, TEXT],
  ["ink", "white", c("ink"), c("white"), 17.2, TEXT],
  ["ink-2", "paper", c("ink-2"), c("paper"), 9.8, TEXT],
  ["ink-2", "white", c("ink-2"), c("white"), 10.4, TEXT],
  ["ink-2", "mist", c("ink-2"), c("mist"), 9.2, TEXT],
  ["ink-3", "paper", c("ink-3"), c("paper"), 5.9, TEXT],
  ["ink-3", "white", c("ink-3"), c("white"), 6.3, TEXT],
  ["ink-3", "mist", c("ink-3"), c("mist"), 5.6, TEXT],
  ["ink-3", "mist-2", c("ink-3"), c("mist-2"), 5.2, TEXT],
  ["ink-3", "aurora-mint", c("ink-3"), c("aurora-mint"), 5.4, TEXT],
  ["ink-3", "aurora-sky", c("ink-3"), c("aurora-sky"), 5.1, TEXT],
  ["ink-3", "aurora-lilac", c("ink-3"), c("aurora-lilac"), 5.0, TEXT],
  ["ink", "aurora-mint", c("ink"), c("aurora-mint"), 14.6, TEXT],
  ["ink", "aurora-sky", c("ink"), c("aurora-sky"), 13.9, TEXT],
  ["ink", "aurora-lilac", c("ink"), c("aurora-lilac"), 13.6, TEXT],
  ["ink-4 (icons/borders)", "white", c("ink-4"), c("white"), 3.7, UI],
  ["ink-4 (icons/borders)", "paper", c("ink-4"), c("paper"), 3.5, UI],
  ["evergreen-700", "white", c("evergreen-700"), c("white"), 8.2, TEXT],
  ["evergreen-700", "paper", c("evergreen-700"), c("paper"), 7.7, TEXT],
  ["evergreen-600", "white", c("evergreen-600"), c("white"), 6.4, TEXT],
  ["evergreen-600", "paper", c("evergreen-600"), c("paper"), 6.0, TEXT],
  ["white", "evergreen-600", c("white"), c("evergreen-600"), 6.4, TEXT],
  ["ink", "lumen", c("ink"), c("lumen"), 11.5, TEXT],
  ["lumen", "night", c("lumen"), c("night"), 12.4, TEXT],
  ["lumen-200", "night", c("lumen-200"), c("night"), 14.2, TEXT],
  ["ivory", "night", c("ivory"), c("night"), 16.9, TEXT],
  ["ivory", "night-800", c("ivory"), c("night-800"), 14.0, TEXT],
  ["ivory-2", "night", c("ivory-2"), c("night"), 9.2, TEXT],
  ["ivory-2", "night-800", c("ivory-2"), c("night-800"), 7.6, TEXT],
  ["ivory-3", "night", c("ivory-3"), c("night"), 6.4, TEXT],
  ["ivory-3", "night-800", c("ivory-3"), c("night-800"), 5.3, TEXT],
  // status chips (text on chip bg) and rings (graphics on white / canvas)
  ["known chip", "known-bg", c("known-ink"), c("known-bg"), 7.2, TEXT],
  ["known ring", "white", c("known"), c("white"), 6.4, UI],
  ["known ring", "canvas", c("known"), c("canvas"), 5.8, UI],
  ["conflict chip", "conflict-bg", c("conflict-ink"), c("conflict-bg"), 6.4, TEXT],
  ["conflict ring", "white", c("conflict"), c("white"), 3.6, UI],
  ["conflict ring", "canvas", c("conflict"), c("canvas"), 3.3, UI],
  ["unknown chip", "unknown-bg", c("unknown-ink"), c("unknown-bg"), 7.1, TEXT],
  ["unknown ring", "white", c("unknown"), c("white"), 4.4, UI],
  ["unknown ring", "canvas", c("unknown"), c("canvas"), 4.0, UI],
  ["declined chip", "declined-bg", c("declined-ink"), c("declined-bg"), 7.0, TEXT],
  ["declined ring", "white", c("declined"), c("white"), 3.9, UI],
  ["declined ring", "canvas", c("declined"), c("canvas"), 3.5, UI],
  ["pending chip", "pending-bg", c("pending-ink"), c("pending-bg"), 5.8, TEXT],
  ["pending ring", "white", c("pending"), c("white"), 3.5, UI],
  ["pending ring", "canvas", c("pending"), c("canvas"), 3.2, UI],
  ["record chip", "record-bg", c("record"), c("record-bg"), 6.0, TEXT],
  ["record", "white", c("record"), c("white"), 6.9, TEXT],
  ["record (night)", "night", c("record-night"), c("night"), 10.4, TEXT],
  ["danger", "white", c("danger"), c("white"), 6.6, TEXT],
  ["danger chip", "danger-bg", c("danger"), c("danger-bg"), 5.8, TEXT],
  ["danger (night: field errors)", "night", c("danger-night"), c("night"), 6.7, TEXT],
  ["danger (night: field errors)", "night-900", c("danger-night"), c("night-900"), 6.2, TEXT],
  // 3D scene tokens: graphics on the stage
  ["scene known", "stage", f("known"), f("stage"), 14.2, UI],
  ["scene conflict", "stage", f("conflict"), f("stage"), 12.8, UI],
  ["scene unknown", "stage", f("unknown"), f("stage"), 7.0, UI],
  ["scene declined", "stage", f("declined"), f("stage"), 4.3, UI],
  ["scene line", "stage", f("line"), f("stage"), 4.7, UI],
  ["scene light", "stage", f("light"), f("stage"), 16.9, UI],
  ["scene fog", "stage", f("fog"), f("stage"), 5.4, UI],
  ["scene record", "stage", f("record"), f("stage"), 10.4, UI],
];

describe("DESIGN §3.1 contrast table (recomputed from globals.css)", () => {
  for (const [fgName, bgName, fg, bg, stated, min] of PAIRS) {
    test(`${fgName} on ${bgName}: ≥ ${min} (stated ${stated})`, () => {
      const r = ratio(fg, bg);
      assert.ok(r >= min, `${fgName} ${fg} on ${bgName} ${bg} is ${r.toFixed(2)}:1, below ${min}:1`);
      assert.ok(Math.abs(r - stated) < 0.06, `${fgName} on ${bgName} is ${r.toFixed(2)}:1 but DESIGN §3.1 states ${stated}:1`);
    });
  }
});

describe("Tailwind build", () => {
  test("emits transparent/current utilities and the custom tokens despite --color-*: initial", async () => {
    const { default: postcss } = await import("postcss");
    const { default: tailwind } = await import("@tailwindcss/postcss");
    const css =
      GLOBALS.replace('@import "tailwindcss";', '@import "tailwindcss" source(none);') +
      '\n@source inline("bg-transparent text-current border-transparent bg-bg text-fg text-display-xl font-book rounded-paper shadow-glow dark:bg-bg present:text-lg bg-red-500");\n';
    const out = await postcss([tailwind({ base: ROOT })]).process(css, { from: path.join(ROOT, "src/app/globals.css") });
    for (const cls of ["bg-transparent", "text-current", "border-transparent", "bg-bg", "text-fg", "text-display-xl", "font-book", "rounded-paper", "shadow-glow"]) {
      assert.match(out.css, new RegExp(`\\.${cls}\\s*\\{`), `.${cls} missing from the built CSS`);
    }
    assert.match(out.css, /\.dark\\:bg-bg/);
    assert.match(out.css, /\.present\\:text-lg/);
    assert.match(out.css, /\.bg-bg\s*\{\s*background-color:\s*var\(--ui-bg\)/, "bg-bg must read the per-element --ui-bg so night bands switch");
    assert.doesNotMatch(out.css, /\.bg-red-500\s*\{/, "only brand colors may exist");
    // the pre-revamp legacy layer (orange accent, .btn/.chip) was removed in the P1 cleanup; nothing may bring it back
    assert.doesNotMatch(out.css, /--accent:\s*#c2410c/i, "legacy tokens are gone");
    assert.doesNotMatch(out.css, /\.btn-primary\s*\{/, "legacy .btn classes are gone");
  });

  test("dark: skips a paper surface nested in a night band (document cards, frame screens)", async () => {
    const { default: postcss } = await import("postcss");
    const { default: tailwind } = await import("@tailwindcss/postcss");
    const css = GLOBALS.replace('@import "tailwindcss";', '@import "tailwindcss" source(none);') + '\n@source inline("dark:text-lumen");\n';
    const out = await postcss([tailwind({ base: ROOT })]).process(css, { from: path.join(ROOT, "src/app/globals.css") });
    const rule = out.css.match(/\.dark\\:text-lumen[^{]*\{/)?.[0] ?? "";
    assert.match(rule, /\[data-theme="night"\]/, `dark: must target night bands: ${rule}`);
    assert.match(rule, /:not\(.*\[data-theme="night"\] \[data-theme="paper"\]/, `dark: must exclude paper nested in night: ${rule}`);
    // the paper block resets the two tokens the night block overrides
    const paper = GLOBALS.match(/:root,\s*\[data-theme="paper"\]\s*\{[^}]*\}/)?.[0] ?? "";
    assert.match(paper, /--color-finding:\s*#0A1F1B/);
    assert.match(paper, /--color-record:\s*#2B4FC7/);
  });

  test("minified output keeps the unprefixed backdrop-filter on .glass (Chrome ignores the -webkit- one)", async () => {
    const { default: postcss } = await import("postcss");
    const { default: tailwind } = await import("@tailwindcss/postcss");
    const css = GLOBALS.replace('@import "tailwindcss";', '@import "tailwindcss" source(none);') + '\n@source inline("glass");\n';
    const out = await postcss([tailwind({ base: ROOT, optimize: { minify: true } })]).process(css, { from: path.join(ROOT, "src/app/globals.css") });
    const rule = out.css.match(/\.glass\{[^}]*\}/)?.[0] ?? "";
    assert.match(rule, /[;{]backdrop-filter:blur/, `unprefixed backdrop-filter missing: ${rule}`);
  });
});

describe("content and primitives", () => {
  test("source chips never say verified and use stable UTC dates", () => {
    assert.equal(sourceChipText("relative", "Mom", "2026-09-27T14:03:00Z"), "TOLD BY MOM · SEP 27");
    assert.equal(sourceChipText("self", undefined, "2026-09-27"), "SELF-REPORTED · SEP 27");
    assert.equal(sourceChipText("record", undefined, "2009-03-14"), "PORTAL RECORD · DEMO SANDBOX · 2009");
    assert.equal(sourceChipText("record", undefined, "2009-03-14", "MyChart (demo sandbox)"), "PORTAL RECORD · DEMO SANDBOX · 2009");
    assert.equal(sourceChipText("record", undefined, "2009-03-14", "Simulated portal record"), "PORTAL RECORD · SIMULATED · 2009");
    assert.doesNotMatch(sourceChipText("record"), /verified/i);
  });
  test("pilot CTAs fall back to /pilot#contact without NEXT_PUBLIC_PILOT_EMAIL", () => {
    if (!SITE.pilotEmail) assert.equal(pilotHref(), "/pilot#contact");
    else assert.match(pilotHref(), /^mailto:/);
  });
  test("the pilot CTA never promises a conversation it can't start", () => {
    const cta = pilotCta();
    if (!SITE.pilotEmail) assert.deepEqual(cta, { href: "/pilot", label: "See the pilot brief", contact: false });
    else assert.deepEqual(cta, { href: pilotHref(), label: "Request a pilot conversation", contact: true });
  });
  test("tree status words are the A3 labels, never abbreviated or clinical, and fit a node's status line", () => {
    const words = (["known", "conflicting", "unknown", "declined", "pending"] as const).map((s) => statusWord(s));
    assert.deepEqual(words, ["Known", "Reports disagree", "Unknown", "Chose not to share", "Not asked yet"]);
    assert.equal(statusWord("pending", true), "Invited · waiting");
    assert.equal(statusWord("self"), "You");
    // the node's 188 px card leaves ~122 px for the status line at 13 px: 18 characters is the longest that fits
    for (const w of [...words, statusWord("pending", true)]) assert.ok(w.length <= 18, w);
    assert.doesNotMatch(words.join(" "), /\bDeclined\b|^Disagree$|\bNot asked\b(?! yet)/);
  });
  test("patient questions are generic (never a recommendation or a risk)", () => {
    for (const q of PATIENT_QUESTIONS) assert.doesNotMatch(q, /risk|should get|you have|diagnos/i);
  });
  test("every stat carries a citation; honesty copy is present", () => {
    for (const s of STATS) assert.ok(s.cite > 0 && s.source.length > 0);
    assert.match(HONESTY.ribbon, /made-up demo family/);
    assert.doesNotMatch(Object.values(HONESTY).join(" "), /HIPAA (certified|compliant)|verified/i);
  });
});
