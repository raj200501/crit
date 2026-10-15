#!/usr/bin/env python3
"""Milestone 4 review prep page: prep.json -> one self-contained HTML page (talk track, Q&A drill, checklist).

usage: make_prep.py PREP.json OUT.html
"""
import json
import sys

BOARD = "https://miro.com/app/board/uXjVEZts9lk=/"
SITE = "https://stemmahealth.vercel.app"
DECK = "https://docs.google.com/presentation/d/1JGhz-94qJGlWLe-9ZmBesYhjJp6ZIuggMYgFx6BK6kM/edit"

PAGE = r"""<title>Milestone 4 Review Prep</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Layout: a speaker's cue binder. Tabs across the top, one column of cue cards, owner chips carry who speaks. */
:root{
  --paper:#f5f7f3; --card:#ffffff; --ink:#18221d; --soft:#56635b; --rule:#dfe5df;
  --accent:#1d6b48; --accent-ink:#ffffff; --accent-tint:#e3f1e9;
  --raj:#2d5fa8; --raj-t:#e4ecf8; --viha:#8a3d86; --viha-t:#f4e6f3; --unser:#9a5a00; --unser-t:#fbefdc;
  --display:"Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif;
  --body:"Atkinson Hyperlegible",ui-sans-serif,system-ui,sans-serif;
  --mono:"JetBrains Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --paper:#111613; --card:#1a211d; --ink:#e7eee9; --soft:#a3b0a8; --rule:#2c3530;
  --accent:#5fc493; --accent-ink:#0d1a13; --accent-tint:#1f3328;
  --raj:#8db4ee; --raj-t:#1d2a3d; --viha:#dc9bd7; --viha-t:#33223a; --unser:#f0b45c; --unser-t:#3a2c17; color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#111613; --card:#1a211d; --ink:#e7eee9; --soft:#a3b0a8; --rule:#2c3530;
  --accent:#5fc493; --accent-ink:#0d1a13; --accent-tint:#1f3328;
  --raj:#8db4ee; --raj-t:#1d2a3d; --viha:#dc9bd7; --viha-t:#33223a; --unser:#f0b45c; --unser-t:#3a2c17; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:17px/1.55 var(--body)}
.wrap{max-width:860px;margin:0 auto;padding-block:20px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
header h1{font:800 clamp(30px,6vw,46px)/1.05 var(--display);letter-spacing:-.01em;margin:6px 0 8px;text-wrap:balance}
.eyebrow{font:500 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent)}
.lede{color:var(--soft);margin:0 0 14px;max-width:62ch}
.links{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}
.links a{color:var(--ink);text-decoration:none;border:1px solid var(--rule);background:var(--card);padding:7px 12px;border-radius:999px;font-weight:700;font-size:14px}
.links a:hover,.links a:focus-visible{border-color:var(--accent);outline:none}
nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--paper);padding:10px 0;border-bottom:1px solid var(--rule);margin-bottom:18px}
.tabs,.who{display:flex;gap:6px;flex-wrap:wrap}
.who{margin-top:8px}
button{font:inherit;cursor:pointer}
.tab{border:0;background:transparent;color:var(--soft);font:700 15px var(--body);padding:8px 12px;border-radius:10px}
.tab[aria-selected="true"]{background:var(--ink);color:var(--paper)}
.tab:focus-visible,.chip:focus-visible,.btn:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.chip{border:1px solid var(--rule);background:var(--card);color:var(--ink);border-radius:999px;padding:5px 12px;font-size:14px;font-weight:700}
.chip[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
section[hidden]{display:none}
.card{background:var(--card);border:1px solid var(--rule);border-radius:14px;padding:16px 18px;margin-bottom:12px}
.row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.who-tag{font:700 13px var(--body);padding:3px 10px;border-radius:999px}
.who-Raj{background:var(--raj-t);color:var(--raj)} .who-Viha{background:var(--viha-t);color:var(--viha)} .who-Unser{background:var(--unser-t);color:var(--unser)}
.t{font:500 12px var(--mono);color:var(--soft);margin-left:auto;font-variant-numeric:tabular-nums}
.page{font:600 20px/1.2 var(--display);margin:8px 0 4px}
.point{color:var(--soft);font-size:15px;margin:0 0 8px}
.say{font-size:19px;line-height:1.55;margin:0;border-left:0}
.say::before{content:"Say: ";font-weight:700;color:var(--accent)}
.skip{font:500 11px var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--soft);border:1px dashed var(--rule);padding:2px 8px;border-radius:6px}
.bookend{background:var(--accent-tint);border-color:transparent}
h2{font:800 24px/1.15 var(--display);margin:22px 0 10px}
.q{font:600 19px/1.3 var(--display);margin:6px 0 10px}
.a{margin:0 0 8px}
.pushed{color:var(--soft);margin:0}
.pushed b{color:var(--ink)}
.btn{border:1px solid var(--rule);background:var(--card);color:var(--ink);border-radius:10px;padding:8px 14px;font-weight:700;font-size:15px}
.btn.primary{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.tally{font:500 13px var(--mono);color:var(--soft)}
.ok{color:var(--accent)}
ol.admit{padding-left:22px;margin:0} ol.admit li{margin:0 0 10px}
.check{display:flex;gap:12px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--rule)}
.check:last-child{border-bottom:0}
.check input{width:20px;height:20px;margin-top:3px;accent-color:var(--accent);flex:none}
.check label{min-width:0}
.check input:checked+label{color:var(--soft);text-decoration:line-through}
.foot{color:var(--soft);font-size:13px;margin-top:28px}
@media (prefers-reduced-motion:no-preference){.reveal{animation:fade .18s ease-out}@keyframes fade{from{opacity:.4}to{opacity:1}}}
</style>
<div class="wrap">
<header>
  <div class="eyebrow">Team 709 · Stemma · TECH 5900 · Oral review Oct 12–23</div>
  <h1>Milestone 4 Review Prep</h1>
  <p class="lede">Walk the coach through the board in about 11 minutes, everyone speaks, then take questions. Every answer below comes from the Value Creation Analysis and the final Maker Day 2 deck.</p>
  <div class="links">
    <a href="__BOARD__" target="_blank" rel="noopener">Miro board</a>
    <a href="__SITE__" target="_blank" rel="noopener">Live prototype</a>
    <a href="__DECK__" target="_blank" rel="noopener">Maker Day 2 deck</a>
  </div>
</header>
<nav aria-label="Sections">
  <div class="tabs" role="tablist">
    <button class="tab" role="tab" id="t-run" aria-controls="run" aria-selected="true">Run of show</button>
    <button class="tab" role="tab" id="t-drill" aria-controls="drill" aria-selected="false">Q&amp;A drill</button>
    <button class="tab" role="tab" id="t-admit" aria-controls="admit" aria-selected="false">Say first</button>
    <button class="tab" role="tab" id="t-check" aria-controls="check" aria-selected="false">Checklist</button>
  </div>
  <div class="who" aria-label="Show cues for">
    <button class="chip" data-who="All" aria-pressed="true">Everyone</button>
    <button class="chip" data-who="Raj" aria-pressed="false">Raj</button>
    <button class="chip" data-who="Viha" aria-pressed="false">Viha</button>
    <button class="chip" data-who="Unser" aria-pressed="false">Unser</button>
  </div>
</nav>
<section id="run" role="tabpanel" aria-labelledby="t-run"></section>
<section id="drill" role="tabpanel" aria-labelledby="t-drill" hidden>
  <div class="row" style="margin-bottom:12px"><button class="btn" id="shuffle">Shuffle</button><button class="btn" id="reset">Reset tally</button><span class="tally" id="tally"></span></div>
  <div id="qs"></div>
</section>
<section id="admit" role="tabpanel" aria-labelledby="t-admit" hidden>
  <div class="card"><p style="margin:0 0 10px;color:var(--soft)">Say these before the coach asks. Owning the gaps scores better than defending them.</p><ol class="admit" id="admits"></ol></div>
</section>
<section id="check" role="tabpanel" aria-labelledby="t-check" hidden></section>
<p class="foot">Synthetic demo data only. Ticks and tallies are saved in this browser only.</p>
</div>
<script>
const DATA = __DATA__;
const store = {
  get(k, d) { try { const v = localStorage.getItem("m4prep:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("m4prep:" + k, JSON.stringify(v)); } catch (e) {} },
};
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
let who = store.get("who", "All");
const whoTag = (w) => `<span class="who-tag who-${esc(w)}">${esc(w)}</span>`;
const fmt = (m) => { const s = Math.round(m * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

function renderRun() {
  let t = 0;
  const bits = [];
  const o = DATA.opening;
  if (o && (who === "All" || who === o.who)) bits.push(`<div class="card bookend"><div class="row">${whoTag(o.who)}<span class="t">0:00 · opening</span></div><p class="say" style="margin-top:8px">${esc(o.say)}</p></div>`);
  t += 0.35;
  for (const r of DATA.run || []) {
    const start = t;
    t += Number(r.minutes) || 0.5;
    if (who !== "All" && r.who !== who) continue;
    bits.push(`<div class="card"><div class="row">${whoTag(r.who)}${r.skip_if_short ? '<span class="skip">skip if short</span>' : ""}<span class="t">${fmt(start)}–${fmt(t)}</span></div>
      <div class="page">${esc(r.page)}</div><p class="point">Point at: ${esc(r.point_at)}</p><p class="say">${esc(r.say)}</p></div>`);
  }
  const c = DATA.close;
  if (c && (who === "All" || who === c.who)) bits.push(`<div class="card bookend"><div class="row">${whoTag(c.who)}<span class="t">${fmt(t)} · close</span></div><p class="say" style="margin-top:8px">${esc(c.say)}</p></div>`);
  document.getElementById("run").innerHTML = bits.join("") || '<p class="point">No cues for this person in the walkthrough.</p>';
}

let order = (DATA.drill || []).map((_, i) => i);
function tally() {
  const st = store.get("tally", {});
  const vals = Object.values(st);
  document.getElementById("tally").textContent = `${vals.filter((v) => v === "ok").length} got it · ${vals.filter((v) => v === "again").length} again`;
}
function renderDrill() {
  const st = store.get("tally", {});
  const out = [];
  for (const i of order) {
    const d = DATA.drill[i];
    if (who !== "All" && d.who !== who) continue;
    const mark = st[i] === "ok" ? '<span class="tally ok">got it</span>' : st[i] === "again" ? '<span class="tally">again</span>' : "";
    out.push(`<div class="card" data-i="${i}"><div class="row">${whoTag(d.who)}<span class="tally">${esc(d.page)}</span>${mark}<span class="t">Q${i + 1}</span></div>
      <div class="q">${esc(d.q)}</div>
      <div class="ans" hidden><p class="a">${esc(d.a)}</p><p class="pushed"><b>If pushed:</b> ${esc(d.pushed)}</p></div>
      <div class="row" style="margin-top:10px"><button class="btn primary show" aria-expanded="false">Show answer</button><button class="btn mark" data-v="ok">Got it</button><button class="btn mark" data-v="again">Again</button></div></div>`);
  }
  document.getElementById("qs").innerHTML = out.join("");
  tally();
}
document.getElementById("qs").addEventListener("click", (e) => {
  const card = e.target.closest(".card"); if (!card) return;
  const i = card.dataset.i;
  if (e.target.classList.contains("show")) {
    const a = card.querySelector(".ans"); a.hidden = !a.hidden; a.classList.add("reveal");
    e.target.textContent = a.hidden ? "Show answer" : "Hide answer"; e.target.setAttribute("aria-expanded", String(!a.hidden));
  }
  if (e.target.classList.contains("mark")) { const st = store.get("tally", {}); st[i] = e.target.dataset.v; store.set("tally", st); renderDrill(); }
});
document.getElementById("shuffle").addEventListener("click", () => { for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } renderDrill(); });
document.getElementById("reset").addEventListener("click", () => { store.set("tally", {}); renderDrill(); });

function renderAdmit() { document.getElementById("admits").innerHTML = (DATA.admit || []).map((s) => `<li>${esc(s)}</li>`).join(""); }
function renderCheck() {
  const done = store.get("done", {});
  const groups = [["before", "Before the review"], ["after_pitch", "Right after the pitch, Oct 16"], ["export", "The Oct 23 PDF"], ["rules", "One rule each, in the room"]];
  let n = 0;
  document.getElementById("check").innerHTML = groups.map(([k, title]) => {
    const items = (DATA.checklist || {})[k] || [];
    if (!items.length) return "";
    return `<h2>${esc(title)}</h2><div class="card">${items.map((s) => { const id = "c" + (n++); return `<div class="check"><input type="checkbox" id="${id}" ${done[id] ? "checked" : ""}><label for="${id}">${esc(s)}</label></div>`; }).join("")}</div>`;
  }).join("");
}
document.getElementById("check").addEventListener("change", (e) => { if (e.target.type === "checkbox") { const d = store.get("done", {}); d[e.target.id] = e.target.checked; store.set("done", d); } });

const tabs = [...document.querySelectorAll(".tab")];
function openTab(id) {
  for (const t of tabs) { const on = t.getAttribute("aria-controls") === id; t.setAttribute("aria-selected", String(on)); document.getElementById(t.getAttribute("aria-controls")).hidden = !on; }
  store.set("tab", id);
}
tabs.forEach((t) => t.addEventListener("click", () => openTab(t.getAttribute("aria-controls"))));
document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
  who = c.dataset.who; store.set("who", who);
  document.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
  renderRun(); renderDrill();
}));
document.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.who === who)));
renderRun(); renderDrill(); renderAdmit(); renderCheck();
const hash = (location.hash || "").slice(1);
openTab(["run", "drill", "admit", "check"].includes(hash) ? hash : store.get("tab", "run"));
</script>
"""


def main(src, out):
    data = json.load(open(src))
    html = (PAGE.replace("__BOARD__", BOARD).replace("__SITE__", SITE).replace("__DECK__", DECK)
            .replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/")))
    open(out, "w").write(html)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
