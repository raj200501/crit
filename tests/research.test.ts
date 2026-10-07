// P4 unit tests (DESIGN §10.5, §13.4 acceptance 4–5): the /research HTML transforms (heading slugs, source anchors,
// citation links, never inside <a>/<code>/<pre>) on fixtures and on the real docs/research.md, plus the /pilot ROI math.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import {
  addHeadingIds,
  addSourceAnchors,
  countWords,
  decodeEntities,
  escapeUnknownTags,
  externalLinksInNewTab,
  linkCitations,
  normalizeSourceLists,
  renderResearch,
  slugify,
  sourceIds,
  wrapTables,
} from "../src/components/content/researchHtml";
import { clampInput, formatUsd, staffTimeValuePerMonth } from "../src/components/content/roi";
import { FDA_LINE, PILOT, PROOF_POINTS, STATS } from "../src/content/site";

const ROOT = path.resolve(import.meta.dirname, "..");
const MD = readFileSync(path.join(ROOT, "docs/research.md"), "utf8");

describe("slugify (GitHub style)", () => {
  test("lowercases, drops punctuation, turns spaces into hyphens", () => {
    assert.equal(slugify("2. Privacy and compliance"), "2-privacy-and-compliance");
    assert.equal(slugify("1.1 The three people involved"), "11-the-three-people-involved");
    assert.equal(slugify("2.5 The Box plan: what it covers and what it doesn't"), "25-the-box-plan-what-it-covers-and-what-it-doesnt");
    assert.equal(slugify("5. Risks, riskiest assumptions, and the cheapest test for each"), "5-risks-riskiest-assumptions-and-the-cheapest-test-for-each");
    assert.equal(slugify("Go/no-go"), "gono-go");
  });
  test("decodes entities before slugging", () => {
    assert.equal(decodeEntities("doesn&#39;t &amp; &quot;x&quot; &lt;y&gt; &#x41;"), `doesn't & "x" <y> A`);
  });
});

describe("addHeadingIds", () => {
  test("ids every heading, dedupes with -1/-2 and returns the h2/h3 outline", () => {
    const { html, toc } = addHeadingIds("<h1>Top</h1><h2>Bottom line</h2><h3>Notes</h3><h2>Notes</h2><h3>Notes</h3><h4>Deep</h4>");
    assert.equal(html, '<h1 id="top">Top</h1><h2 id="bottom-line">Bottom line</h2><h3 id="notes">Notes</h3><h2 id="notes-1">Notes</h2><h3 id="notes-2">Notes</h3><h4 id="deep">Deep</h4>');
    assert.deepEqual(toc, [
      { id: "bottom-line", text: "Bottom line", level: 2 },
      { id: "notes", text: "Notes", level: 3 },
      { id: "notes-1", text: "Notes", level: 2 },
      { id: "notes-2", text: "Notes", level: 3 },
    ]);
  });
  test("uses the text without markup or entities", () => {
    const { html } = addHeadingIds("<h2>It&#39;s <em>real</em> &amp; measurable</h2>");
    assert.equal(html, '<h2 id="its-real--measurable">It&#39;s <em>real</em> &amp; measurable</h2>');
  });
  test("keeps an id that is already there", () => {
    assert.equal(addHeadingIds('<h2 id="x">Y</h2>').html, '<h2 id="x">Y</h2>');
  });
});

describe("source anchors", () => {
  test("a bold group label no longer swallows the numbered list under it", () => {
    const md = "## Sources\n\n**A**\n1. one\n2. two\n\n**B**\n3. three\n4. four\n";
    assert.equal(normalizeSourceLists(md), "## Sources\n\n**A**\n\n1. one\n2. two\n\n**B**\n\n3. three\n4. four\n");
    // only inside the Sources section
    assert.equal(normalizeSourceLists("**Steps**\n2. two\n"), "**Steps**\n2. two\n");
  });
  test("item k of <ol start=S> gets id source-{S+k}, only after the Sources heading", () => {
    const html = '<ol><li>not a source</li></ol><h2 id="sources">Sources</h2><ol><li>a</li><li>b</li></ol><p>x</p><ol start="33"><li>c</li><li>d</li></ol>';
    const out = addSourceAnchors(html);
    assert.equal(
      out,
      '<ol><li>not a source</li></ol><h2 id="sources">Sources</h2><ol><li id="source-1">a</li><li id="source-2">b</li></ol><p>x</p><ol start="33"><li id="source-33">c</li><li id="source-34">d</li></ol>',
    );
    assert.deepEqual(sourceIds(out), [1, 2, 33, 34]);
  });
});

describe("linkCitations", () => {
  const known = new Set([5, 7, 10, 72, 83, 87]);
  test("links [n] and runs like [72][83]", () => {
    assert.equal(linkCitations("<p>Caught 57.6% [87].</p>", known), '<p>Caught 57.6% <a class="cite" href="#source-87">[87]</a>.</p>');
    assert.equal(
      linkCitations("<li>Guideline [72][83]</li>", known),
      '<li>Guideline <a class="cite" href="#source-72">[72]</a><a class="cite" href="#source-83">[83]</a></li>',
    );
  });
  test("never inside <a>, <code> or <pre>", () => {
    const html = '<p><a href="https://x.org">see [5]</a> <code>arr[7]</code> [10]</p><pre><code>x = [87]\n</code></pre><p>after [5]</p>';
    assert.equal(
      linkCitations(html, known),
      '<p><a href="https://x.org">see [5]</a> <code>arr[7]</code> <a class="cite" href="#source-10">[10]</a></p><pre><code>x = [87]\n</code></pre><p>after <a class="cite" href="#source-5">[5]</a></p>',
    );
  });
  test("leaves numbers without a source alone", () => {
    assert.equal(linkCitations("<p>[999] [1999] [5]</p>", known), '<p>[999] [1999] <a class="cite" href="#source-5">[5]</a></p>');
  });
});

describe("other transforms", () => {
  test("escapes angle-bracket placeholders but keeps real tags", () => {
    assert.equal(
      escapeUnknownTags("<p>from <health system>'s record, retrieved <date>, <strong>not</strong> verified</p>"),
      "<p>from &lt;health system&gt;'s record, retrieved &lt;date&gt;, <strong>not</strong> verified</p>",
    );
  });
  test("external links open in a new tab without a referrer; internal ones don't", () => {
    assert.equal(
      externalLinksInNewTab('<a href="https://a.org/x">a</a> <a href="#source-1">b</a>'),
      '<a href="https://a.org/x" target="_blank" rel="noopener noreferrer">a</a> <a href="#source-1">b</a>',
    );
  });
  test("tables get a keyboard-scrollable wrapper named by their headers", () => {
    assert.equal(
      wrapTables("<table><thead><tr><th>Person</th><th>Pays?</th></tr></thead></table>"),
      '<div data-table-wrap role="group" tabindex="0" aria-label="Table: Person, Pays?"><table><thead><tr><th>Person</th><th>Pays?</th></tr></thead></table></div>',
    );
  });
  test("counts prose words, not URLs or markup", () => {
    assert.equal(countWords("## Two words\n\n- **one** [link](https://x.org/a-b) https://y.org | 3 |"), 5);
  });
});

describe("docs/research.md, rendered", () => {
  const doc = renderResearch(MD);

  test("§2 heading is #2-privacy-and-compliance and the TOC holds the h2/h3 outline", () => {
    assert.match(doc.html, /<h2 id="2-privacy-and-compliance">2\. Privacy and compliance<\/h2>/);
    assert.ok(doc.toc.some((t) => t.id === "2-privacy-and-compliance" && t.level === 2));
    assert.ok(doc.toc.some((t) => t.id === "11-the-three-people-involved" && t.level === 3));
    assert.equal(new Set(doc.toc.map((t) => t.id)).size, doc.toc.length, "TOC ids are unique");
    for (const t of doc.toc) assert.ok(doc.html.includes(`id="${t.id}"`), t.id);
  });

  test("the markdown's own H1 is dropped (the page renders one)", () => {
    assert.equal(doc.title, "How Family Health Tree would actually work");
    assert.doesNotMatch(doc.html, /<h1/);
  });

  test("every source has an anchor, in order, and each site.ts citation resolves", () => {
    const ids = sourceIds(doc.html);
    assert.equal(ids.length, 121);
    assert.deepEqual(ids, Array.from({ length: 121 }, (_, i) => i + 1));
    const cited = [...STATS.map((s) => s.cite), ...PROOF_POINTS.map((p) => p.cite), FDA_LINE.cite];
    for (const n of [32, 72, 83, 84, 87, 89, 95, 117, ...cited]) assert.ok(doc.html.includes(`<li id="source-${n}">`), `source-${n}`);
  });

  test("each anchor sits on the right source line", () => {
    for (const n of [1, 32, 33, 72, 87, 117, 121]) {
      const line = new RegExp(`^${n}\\. ([^:\\n]+)`, "m").exec(MD.slice(MD.indexOf("## Sources")))?.[1];
      assert.ok(line, `md line ${n}`);
      const li = new RegExp(`<li id="source-${n}">([^<]*)`).exec(doc.html)?.[1] ?? "";
      assert.ok(decodeEntities(li).startsWith(line), `source-${n}: "${li}" should start with "${line}"`);
    }
  });

  test("every bracket citation in the body is a link to an existing source, and none sit inside code", () => {
    const body = doc.html.slice(0, doc.html.indexOf('id="sources"'));
    const anchors = new Set(sourceIds(doc.html));
    const links = [...body.matchAll(/<a class="cite" href="#source-(\d+)">\[(\d+)\]<\/a>/g)];
    assert.ok(links.length > 100, `${links.length} citation links`);
    for (const [, href, text] of links) {
      assert.equal(href, text);
      assert.ok(anchors.has(Number(href)), `source-${href} exists`);
    }
    const textOnly = body.replace(/<a\b[\s\S]*?<\/a>/g, "").replace(/<code>[\s\S]*?<\/code>/g, "");
    assert.deepEqual(textOnly.match(/\[\d{1,3}\]/g), null, "no unlinked [n] left in running text");
    assert.doesNotMatch(doc.html, /<code>[^<]*<a class="cite"/);
    assert.doesNotMatch(doc.html, /<a [^>]*>[^<]*<a class="cite"/);
  });

  test("placeholders survive as text, external links open safely, tables are wrapped", () => {
    assert.ok(doc.html.includes("&lt;health system&gt;"));
    assert.doesNotMatch(doc.html, /<(health|date)\b/);
    const external = [...doc.html.matchAll(/<a href="https?:[^"]+"([^>]*)>/g)];
    assert.ok(external.length > 100);
    for (const [, rest] of external) assert.equal(rest, ' target="_blank" rel="noopener noreferrer"');
    assert.equal((doc.html.match(/<table>/g) ?? []).length, (doc.html.match(/<div data-table-wrap/g) ?? []).length);
  });

  test("reading meta: sources and minutes at 230 words a minute", () => {
    assert.equal(doc.sources, 121);
    assert.ok(doc.words > 5000, `${doc.words} words`);
    assert.equal(doc.minutes, Math.ceil(doc.words / 230));
  });
});

describe("ROI calculator math (/pilot)", () => {
  test("minutes × patients × cost ÷ 60 with the labeled assumptions", () => {
    const { minutesSaved, staffCostPerHour } = PILOT.roiAssumptions;
    assert.equal(staffTimeValuePerMonth({ patients: 40, minutes: minutesSaved, costPerHour: staffCostPerHour }), 200);
    assert.equal(staffTimeValuePerMonth({ patients: 120, minutes: 7, costPerHour: 34 }), 476);
    assert.equal(staffTimeValuePerMonth({ patients: 0, minutes: 10, costPerHour: 30 }), 0);
  });
  test("bad input counts as 0 and huge input is capped", () => {
    assert.equal(clampInput("", "patients"), 0);
    assert.equal(clampInput("-5", "minutes"), 0);
    assert.equal(clampInput("abc", "costPerHour"), 0);
    assert.equal(clampInput("$1,200", "patients"), 1200);
    assert.equal(clampInput(99999, "patients"), 2000);
    assert.equal(staffTimeValuePerMonth({ patients: Number.NaN, minutes: 10, costPerHour: 30 }), 0);
  });
  test("formats whole dollars with separators", () => {
    assert.equal(formatUsd(200), "$200");
    assert.equal(formatUsd(1249.6), "$1,250");
    assert.equal(formatUsd(0), "$0");
  });
});
