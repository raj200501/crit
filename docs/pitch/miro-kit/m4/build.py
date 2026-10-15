#!/usr/bin/env python3
"""Milestone 4 board, rebuilt from scratch: page specs -> Canvas Composer SVG (for Miro) and an HTML preview.

usage: build.py PAGES.json OUTDIR

PAGES.json holds the page specs written from the VCA (see the brief in the repo README for the format). The canvas,
Step 3 bars, mockups and sources are drawn here from the VCA itself. Every page is a 1920 x 1080 frame except the canvas
(one big frame). Writes OUTDIR/board.svg (all frames, in reading order), OUTDIR/frames/<key>.svg (one file per frame),
OUTDIR/preview/<key>.html (one HTML page per frame for a local screenshot) and OUTDIR/report.json (overflows).
"""
import html
import json
import os
import re
import sys

D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(D, "..", "miro2"))
from measure import count_lines  # noqa: E402  (PIL Noto Sans metrics)

VCA = os.path.normpath(os.path.join(D, "..", "..", "value-creation-analysis.md"))
SITE = "https://stemmahealth.vercel.app"
FONT_DIR = "/tmp/claude-0/-home-user-crit/2d8be54e-cfae-5350-92b4-b34495ce136f/scratchpad/fonts"

# ---------------------------------------------------------------- design tokens (Miro "Bright Paper", 3 families)
PW, PH, PAD = 1920, 1080, 64
GAP = 32                      # between blocks and cards
INK, BODY, GFAINT, EDGE, LINE = "#1a1a1a", "#595959", "#f7f7f7", "#e7e7e7", "#b0b0b0"
GREEN = dict(faint="#eaf9ef", light="#adf0c7", medium="#2dc75c", dark="#067429")
BLUE = dict(faint="#f0f5fd", light="#c6dcff", medium="#659df2", dark="#305bab")
RED = dict(faint="#fff0f0", light="#ffc6c6", medium="#ff6464", dark="#bd0a0a")
TONE = {"pos": GREEN, "neg": RED, "neutral": BLUE, "mixed": BLUE}
STICKY_HEX = {"light_blue": "#a6ccf5", "light_green": "#d5f692", "dark_green": "#93d275"}
TAG_STICKY = {"O": "light_blue", "N/O": "light_green", "N": "dark_green"}
TAG_NAME = {"O": "Old", "N/O": "Some of each", "N": "New"}

# two type scales: every page tries the large one first and falls back to the regular one if it overflows
SCALES = {
    "L": dict(kicker=24, head=60, sub=30, title=32, body=28, table=24, label=18, chip=18, small=20, note=22, stat=67,
              statement=36, verdict=36),
    "M": dict(kicker=22, head=56, sub=28, title=28, body=24, table=22, label=18, chip=18, small=18, note=20, stat=56,
              statement=33, verdict=33),
}
T = dict(SCALES["L"])

# Miro wraps earlier than the PIL measure (calibrated on the old board); 1.40 line height.
SLACK, LH = 0.18, 1.40
FOOTER_TAG = "Team 709 · Stemma · Milestone 4 Value Creation Analysis"


# ---------------------------------------------------------------- text helpers
def esc(s):
    return html.escape(s, quote=False)


def md(s):
    """plain text with **bold** -> HTML markup (text escaped)."""
    s = esc((s or "").strip())
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    return s.replace("\n", "<br/>")


def lines_of(markup, fs, w, bold=False):
    return count_lines(markup, fs, w, bold, SLACK)


def text_h(markup, fs, w, bold=False):
    n = lines_of(markup, fs, w, bold)
    h = n * LH * fs
    return round(h), n


def xml_body(markup):
    """textArea body: tags stay literal, entities get one more escape (Miro unescapes twice)."""
    return markup.replace("&", "&amp;")


def xml_attr(markup):
    return markup.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def plain(markup):
    return html.unescape(re.sub(r"<[^>]+>", " ", markup))


# ---------------------------------------------------------------- page model
class Page:
    def __init__(self, key, title, w=PW, h=PH, scale=1.0):
        self.key, self.title, self.w, self.h, self.s = key, title, w, h, scale
        self.els = []
        self.n = 0
        self.overflow = []

    def nid(self):
        self.n += 1
        return f"{self.key}-{self.n}"

    def rect(self, x, y, w, h, fill, rx=12):
        self.els.append(dict(k="rect", x=x, y=y, w=w, h=h, fill=fill, rx=rx))

    def circle(self, cx, cy, r, fill):
        self.els.append(dict(k="circle", cx=cx, cy=cy, r=r, fill=fill))

    def line(self, x1, y1, x2, y2, color=LINE, width=2):
        self.els.append(dict(k="line", x1=x1, y1=y1, x2=x2, y2=y2, color=color, width=width))

    def text(self, markup, x, y, w, fs, color=BODY, bold=False, align=None):
        """returns the estimated height"""
        h, n = text_h(markup, fs, w, bold)
        self.els.append(dict(k="text", x=x, y=y, w=w, fs=fs, color=color, bold=bold, align=align, body=markup, h=h))
        return h

    def sticky(self, x, y, w, h, color, markup):
        self.els.append(dict(k="sticky", x=x, y=y, w=w, h=h, color=color, body=markup))

    def image(self, x, y, w, h, href):
        self.els.append(dict(k="image", x=x, y=y, w=w, h=h, href=href))

    # ---- svg
    def svg(self, X, Y):
        out = [f'<g id="{self.key}" transform="translate({X},{Y})" data-frame="{xml_attr(esc(self.title))}">',
               f'<rect data-type="frame" x="0" y="0" width="{self.w}" height="{self.h}" fill="#ffffff" />']
        for e in self.els:
            k = e["k"]
            if k == "rect":
                rx = f' rx="{e["rx"]}"' if e["rx"] else ""
                out.append(f'<rect x="{e["x"]:.0f}" y="{e["y"]:.0f}" width="{e["w"]:.0f}" height="{e["h"]:.0f}"{rx} '
                           f'fill="{e["fill"]}" stroke="none" />')
            elif k == "circle":
                out.append(f'<circle cx="{e["cx"]:.0f}" cy="{e["cy"]:.0f}" r="{e["r"]:.0f}" fill="{e["fill"]}" stroke="none" />')
            elif k == "line":
                out.append(f'<line data-type="divider" x1="{e["x1"]:.0f}" y1="{e["y1"]:.0f}" x2="{e["x2"]:.0f}" '
                           f'y2="{e["y2"]:.0f}" stroke="{e["color"]}" stroke-width="{e["width"]}" />')
            elif k == "text":
                fw = ' font-weight="bold"' if e["bold"] else ""
                al = f' text-align="{e["align"]}"' if e["align"] else ""
                out.append(f'<textArea x="{e["x"]:.0f}" y="{e["y"]:.0f}" width="{e["w"]:.0f}" font-size="{e["fs"]}" '
                           f'font-family="noto_sans" fill="{e["color"]}"{fw}{al}>{xml_body(e["body"])}</textArea>')
            elif k == "sticky":
                out.append(f'<rect data-type="sticky" x="{e["x"]:.0f}" y="{e["y"]:.0f}" width="{e["w"]:.0f}" '
                           f'height="{e["h"]:.0f}" data-color="{e["color"]}" data-content="{xml_attr(e["body"])}" />')
            elif k == "image":
                out.append(f'<image data-type="image" href="{xml_attr(e["href"])}" x="{e["x"]:.0f}" y="{e["y"]:.0f}" '
                           f'width="{e["w"]:.0f}" height="{e["h"]:.0f}" />')
        out.append("</g>")
        return "\n".join(out)

    # ---- html preview (Miro wraps about 15% early, so text boxes are narrowed to match)
    def html(self):
        css = f"""@font-face{{font-family:N;src:url(file://{FONT_DIR}/NotoSans-Regular.ttf)}}
@font-face{{font-family:N;font-weight:bold;src:url(file://{FONT_DIR}/NotoSans-Bold.ttf)}}
body{{margin:0;background:#ddd}} .f{{position:relative;width:{self.w}px;height:{self.h}px;background:#fff;overflow:hidden;font-family:N}}
.a{{position:absolute;box-sizing:border-box}} .t{{line-height:{LH}}}
.st{{display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;line-height:1.25;color:#1a1a1a;box-shadow:0 1px 2px rgba(0,0,0,.15)}}"""
        parts = [f"<!doctype html><html><head><meta charset=utf-8><style>{css}</style></head><body><div class=f>"]
        for e in self.els:
            k = e["k"]
            if k == "rect":
                parts.append(f'<div class=a style="left:{e["x"]}px;top:{e["y"]}px;width:{e["w"]}px;height:{e["h"]}px;'
                             f'background:{e["fill"]};border-radius:{e["rx"]}px"></div>')
            elif k == "circle":
                r = e["r"]
                parts.append(f'<div class=a style="left:{e["cx"]-r}px;top:{e["cy"]-r}px;width:{2*r}px;height:{2*r}px;'
                             f'background:{e["fill"]};border-radius:50%"></div>')
            elif k == "line":
                parts.append(f'<div class=a style="left:{min(e["x1"],e["x2"])}px;top:{min(e["y1"],e["y2"])}px;'
                             f'width:{max(abs(e["x2"]-e["x1"]),e["width"])}px;height:{max(abs(e["y2"]-e["y1"]),e["width"])}px;background:{e["color"]}"></div>')
            elif k == "text":
                fw = "bold" if e["bold"] else "normal"
                al = e["align"] or "left"
                parts.append(f'<div class="a t" style="left:{e["x"]}px;top:{e["y"]}px;width:{e["w"]*0.85:.0f}px;'
                             f'font-size:{e["fs"]}px;color:{e["color"]};font-weight:{fw};text-align:{al}">{e["body"]}</div>'
                             f'<div class=a style="left:{e["x"]}px;top:{e["y"]}px;width:{e["w"]}px;height:{e["h"]}px;'
                             f'outline:1px dashed rgba(255,0,0,.25)"></div>')
            elif k == "sticky":
                fs = sticky_fs(e["body"], e["w"], e["h"])
                parts.append(f'<div class="a st" style="left:{e["x"]}px;top:{e["y"]}px;width:{e["w"]}px;height:{e["h"]}px;'
                             f'background:{STICKY_HEX.get(e["color"], "#ff0")};font-size:{fs}px"><div>{e["body"]}</div></div>')
            elif k == "image":
                src = e["href"]
                if src.startswith(SITE + "/pitch/"):
                    src = "file://" + os.path.normpath(os.path.join(D, "..", "..", "..", "..", "public", "pitch", src.rsplit("/", 1)[1]))
                parts.append(f'<img class=a src="{src}" style="left:{e["x"]}px;top:{e["y"]}px;width:{e["w"]}px;height:{e["h"]}px;object-fit:contain">')
        parts.append("</div></body></html>")
        return "".join(parts)


def sticky_fs(markup, w, h):
    """roughly what Miro's auto-size picks: the largest size whose wrapped text fits the note"""
    for fs in range(40, 9, -1):
        n = count_lines(markup, fs, (w - 20) * 0.92, False, 0)
        if n * fs * 1.25 <= (h - 20) * 0.9:
            return fs
    return 10


# ---------------------------------------------------------------- header / footer
def header(p, spec):
    s = p.s
    x, w = PAD * s, p.w - 2 * PAD * s
    y = PAD * s
    y += p.text(md(spec.get("kicker", "")).upper(), x, y, w, round(T["kicker"] * s), BLUE["dark"], bold=True) + 12 * s
    y += p.text(md(spec["headline"]), x, y, w, round(T["head"] * s), INK, bold=True) + 10 * s
    if spec.get("sub"):
        y += p.text(md(spec["sub"]), x, y, w, round(T["sub"] * s), BODY) + 0
    return y + 44 * s


def footer(p, spec, pageno, total):
    s = p.s
    fs = round(T["small"] * s)
    y = p.h - PAD * s - fs * LH
    right = f"{FOOTER_TAG} · {pageno} / {total}"
    rw = 780 * s
    p.text(esc(right), p.w - PAD * s - rw, y, rw, fs, BODY, align="right")
    top = y
    if spec.get("footer"):
        fw = p.w - 2 * PAD * s - rw - 32 * s
        h, n = text_h(md(spec["footer"]), fs, fw)
        top = p.h - PAD * s - h
        p.text(md(spec["footer"]), PAD * s, top, fw, fs, BODY)
    return top - 28 * s


# ---------------------------------------------------------------- blocks: measure(block, w) -> h ; draw(p, block, x, y, w, h)
def count_w(text, fs):
    from measure import width_of
    return width_of(text, True, fs) * (1 + SLACK)


CARD_PAD = 32


def card_parts(it, cw):
    inner = cw - 2 * CARD_PAD
    parts = []
    toprow = 0
    if it.get("label") or it.get("chip"):
        toprow = 36
        if it.get("label"):
            lw = inner - (count_w(it["chip"], T["chip"]) + 52 if it.get("chip") else 0)
            toprow = max(toprow, text_h(esc(it["label"].upper()), T["label"], lw, True)[0] + 6)
    parts.append(("top", toprow))
    if it.get("title"):
        parts.append(("title", text_h(md(it["title"]), T["title"], inner, True)[0]))
    if it.get("body"):
        parts.append(("body", text_h(md(it["body"]), T["body"], inner)[0]))
    return parts


def card_h(it, cw):
    parts = card_parts(it, cw)
    h = 2 * CARD_PAD + sum(v for _, v in parts) + 12 * (len([1 for _, v in parts if v]) - 1)
    return h


def measure_cards(b, w):
    items = b.get("items") or []
    if b.get("stack"):
        return sum(card_h(it, w) for it in items) + GAP * (len(items) - 1)
    n = max(1, len(items))
    cw = (w - GAP * (n - 1)) / n
    return max(card_h(it, cw) for it in items) if items else 0


def draw_chip(p, x_right, y, text, tone):
    fam = TONE.get(tone or "neutral", BLUE)
    fill, color = fam["light"], fam["dark"]
    if tone == "warn":
        fill, color = GFAINT, BODY
    cw = count_w(text, T["chip"]) + 36
    p.rect(x_right - cw, y, cw, 36, fill, rx=18)
    p.text(esc(text), x_right - cw + 18, y + 4, cw - 24, T["chip"], color, bold=True)


def draw_card(p, it, x, y, cw, ch):
    p.rect(x, y, cw, ch, BLUE["faint"])
    inner = cw - 2 * CARD_PAD
    yy = y + CARD_PAD
    first = True
    for name, h in card_parts(it, cw):
        if name == "top":
            if h:
                if it.get("label"):
                    p.text(esc(it["label"].upper()), x + CARD_PAD, yy + 6, inner - (count_w(it["chip"], T["chip"]) + 52 if it.get("chip") else 0), T["label"], BLUE["dark"], bold=True)
                if it.get("chip"):
                    draw_chip(p, x + cw - CARD_PAD, yy, it["chip"], it.get("tone"))
                yy += h + 12
            continue
        if name == "title":
            p.text(md(it["title"]), x + CARD_PAD, yy, inner, T["title"], INK, bold=True)
        else:
            p.text(md(it["body"]), x + CARD_PAD, yy, inner, T["body"], BODY)
        yy += h + 12


def draw_cards(p, b, x, y, w, h):
    items = b.get("items") or []
    if b.get("stack"):
        yy = y
        for it in items:
            ch = card_h(it, w)
            draw_card(p, it, x, yy, w, ch)
            yy += ch + GAP
        return
    n = max(1, len(items))
    cw = (w - GAP * (n - 1)) / n
    for i, it in enumerate(items):
        draw_card(p, it, x + i * (cw + GAP), y, cw, h)


def table_cols(b, w):
    cols = b.get("columns") or []
    n = len(cols)
    ws = b.get("widths") or [1] * n
    tot = sum(ws)
    return [w * v / tot for v in ws]


TPX, TPY = 20, 14


def cell_markup(c, bold):
    m = md(c)
    return m


def table_rows_h(b, w):
    cws = table_cols(b, w)
    fb = b.get("first_col_bold", True)
    hh = max(text_h(md(c), T["table"], cw - 2 * TPX, True)[0] for c, cw in zip(b["columns"], cws)) + 2 * TPY
    rhs = []
    for r in b.get("rows") or []:
        rh = 0
        for i, (c, cw) in enumerate(zip(r, cws)):
            rh = max(rh, text_h(md(c), T["table"], cw - 2 * TPX, fb and i == 0)[0])
        rhs.append(rh + 2 * TPY)
    return hh, rhs


def measure_table(b, w):
    hh, rhs = table_rows_h(b, w)
    t = text_h(md(b["title"]), T["title"], w, True)[0] + 12 if b.get("title") else 0
    return t + hh + sum(rhs)


def draw_table(p, b, x, y, w, h):
    if b.get("title"):
        y += p.text(md(b["title"]), x, y, w, T["title"], INK, bold=True) + 12
    cws = table_cols(b, w)
    fb = b.get("first_col_bold", True)
    hh, rhs = table_rows_h(b, w)
    p.rect(x, y, w, hh, BLUE["light"], rx=0)
    cx = x
    for c, cw in zip(b["columns"], cws):
        p.text(md(c), cx + TPX, y + TPY, cw - 2 * TPX, T["table"], INK, bold=True)
        cx += cw
    yy = y + hh
    for ri, (r, rh) in enumerate(zip(b.get("rows") or [], rhs)):
        p.rect(x, yy, w, rh, BLUE["faint"] if ri % 2 else "#ffffff", rx=0)
        cx = x
        for i, (c, cw) in enumerate(zip(r, cws)):
            bold = fb and i == 0
            p.text(md(c), cx + TPX, yy + TPY, cw - 2 * TPX, T["table"], INK if bold else BODY, bold=bold)
            cx += cw
        yy += rh
    p.line(x, yy, x + w, yy, LINE, 2)


def measure_stats(b, w):
    items = b.get("items") or []
    n = max(1, len(items))
    tw = (w - GAP * (n - 1)) / n
    inner = tw - 2 * CARD_PAD
    return max(2 * CARD_PAD + text_h(md(it.get("value", "")), T["stat"], inner, True)[0] + 8 +
               text_h(md(it.get("label", "")), T["table"], inner)[0] for it in items)


def draw_stats(p, b, x, y, w, h):
    items = b.get("items") or []
    n = max(1, len(items))
    tw = (w - GAP * (n - 1)) / n
    inner = tw - 2 * CARD_PAD
    for i, it in enumerate(items):
        tx = x + i * (tw + GAP)
        p.rect(tx, y, tw, h, BLUE["faint"])
        vh = p.text(md(it.get("value", "")), tx + CARD_PAD, y + CARD_PAD, inner, T["stat"], INK, bold=True)
        p.text(md(it.get("label", "")), tx + CARD_PAD, y + CARD_PAD + vh + 8, inner, T["table"], BODY)


def bullet_items(b):
    out = []
    for it in b.get("items") or []:
        out.append(it.get("text") if isinstance(it, dict) else it)
    return out


def measure_bullets(b, w):
    t = text_h(md(b["title"]), T["title"], w, True)[0] + 16 if b.get("title") else 0
    return t + sum(text_h(md(s), T["body"], w - 36)[0] + 14 for s in bullet_items(b)) - 14


def draw_bullets(p, b, x, y, w, h):
    if b.get("title"):
        y += p.text(md(b["title"]), x, y, w, T["title"], INK, bold=True) + 16
    for s in bullet_items(b):
        p.circle(x + 8, y + T["body"] * LH / 2, 6, BLUE["medium"])
        y += p.text(md(s), x + 36, y, w - 36, T["body"], BODY) + 14


def measure_verdict(b, w):
    inner = w - 80
    return 80 + 30 + text_h(md(b.get("title", "")), T["verdict"], inner, True)[0] + (12 + text_h(md(b.get("body", "")), T["body"], inner)[0] if b.get("body") else 0)


def draw_verdict(p, b, x, y, w, h):
    fam = TONE.get(b.get("tone") or "mixed", BLUE)
    p.rect(x, y, w, h, fam["light"])
    inner = w - 80
    yy = y + 40
    p.text("VERDICT", x + 40, yy, inner, T["label"], fam["dark"], bold=True)
    yy += 30
    yy += p.text(md(b.get("title", "")), x + 40, yy, inner, T["verdict"], INK, bold=True) + 12
    if b.get("body"):
        p.text(md(b["body"]), x + 40, yy, inner, T["body"], INK)


STATEMENT_LEADS = ("People will buy it because", "We can make it because")


def statement_markup(t):
    m = md(t)
    for lead in STATEMENT_LEADS:
        if plain(m).strip().startswith(lead):
            m = m.replace(esc(lead), f"<b>{esc(lead)}</b>", 1)
    return m


def measure_statement(b, w):
    t = text_h(md(b["title"]), T["label"], w - 80, True)[0] + 12 if b.get("title") else 0
    return 80 + t + text_h(statement_markup(b.get("text", "")), T["statement"], w - 80)[0]


def draw_statement(p, b, x, y, w, h):
    p.rect(x, y, w, h, GREEN["faint"])
    yy = y + 40
    if b.get("title"):
        yy += p.text(md(b["title"]).upper(), x + 40, yy, w - 80, T["label"], GREEN["dark"], bold=True) + 12
    p.text(statement_markup(b.get("text", "")), x + 40, yy, w - 80, T["statement"], INK)


def measure_note(b, w):
    return text_h(md(b.get("text", "")), T["note"], w)[0]


def draw_note(p, b, x, y, w, h):
    p.text(md(b.get("text", "")), x, y, w, T["note"], BODY)


BLOCKS = {
    "cards": (measure_cards, draw_cards), "table": (measure_table, draw_table), "stats": (measure_stats, draw_stats),
    "bullets": (measure_bullets, draw_bullets), "verdict": (measure_verdict, draw_verdict),
    "statement": (measure_statement, draw_statement), "note": (measure_note, draw_note),
}


def layout_rows(p, rows, x, y, w, ymax):
    for row in rows:
        blocks = row.get("blocks") or []
        if not blocks:
            continue
        fr = [b.get("width") for b in blocks]
        if any(f is None for f in fr):
            fr = [1 / len(blocks)] * len(blocks)
        tot = sum(fr)
        avail = w - GAP * (len(blocks) - 1)
        ws = [avail * f / tot for f in fr]
        hs = [BLOCKS[b["type"]][0](b, bw) for b, bw in zip(blocks, ws)]
        rh = max(hs)
        bx = x
        for b, bw, bh in zip(blocks, ws, hs):
            same = b["type"] in ("cards", "stats", "verdict", "statement") and not b.get("stack")
            BLOCKS[b["type"]][1](p, b, bx, y, bw, rh if same else bh)
            bx += bw + GAP
        y += rh + 40
    if y - 40 > ymax:
        p.overflow.append(f"body ends at {y - 40:.0f}, limit {ymax:.0f} (over by {y - 40 - ymax:.0f}px)")
    return y


def use_scale(name):
    T.clear()
    T.update(SCALES[name])


def standard_page(spec, pageno, total):
    for sc in ("L", "M"):
        use_scale(sc)
        p = Page(spec["key"], spec["title"])
        y = header(p, spec)
        ymax = footer(p, spec, pageno, total)
        layout_rows(p, spec.get("rows") or [], PAD, y, PW - 2 * PAD, ymax)
        p.scale_name = sc
        if not p.overflow:
            break
    use_scale("L")
    return p


# ---------------------------------------------------------------- the canvas, from the VCA
BOX_ORDER = [("KP", "Key Partnerships"), ("KA", "Key Activities"), ("KR", "Key Resources"), ("VP", "Value Propositions"),
             ("CR", "Customer Relationships"), ("CH", "Channels"), ("CS", "Customer Segments"), ("CO", "Cost Structure"),
             ("RS", "Revenue Streams")]
UNTESTED = {("CS", 0, 1), ("CS", 0, 2), ("RS", 0, 1), ("RS", 0, 2), ("RS", 0, 3), ("KP", 0, 1)}  # (box, group index, rank)


def vca_lines():
    return open(VCA, encoding="utf-8").read().split("\n")


def split_row(line):
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    return cells


def parse_canvas():
    L = vca_lines()
    start = next(i for i, l in enumerate(L) if l.startswith("## Step 1."))
    end = next(i for i, l in enumerate(L) if l.startswith("## Step 2."))
    boxes, cur_box, cur_group = {}, None, None
    names = {t: k for k, t in BOX_ORDER}
    for l in L[start:end]:
        if l.startswith("### "):
            t = l[4:].strip()
            cur_box = names.get(t)
            if cur_box:
                boxes[cur_box] = []
                cur_group = None
            continue
        if not cur_box or not l.startswith("|") or l.startswith("| ---") or l.startswith("| #") or l.startswith("| ---:"):
            continue
        c = split_row(l)
        if len(c) < 3:
            continue
        if c[0] == "" and c[1].startswith("**"):
            cur_group = {"label": c[1].strip("*").strip(), "items": []}
            boxes[cur_box].append(cur_group)
            continue
        if not c[0].isdigit():
            continue
        if cur_group is None:
            cur_group = {"label": "In order of preference", "items": []}
            boxes[cur_box].append(cur_group)
        tag = c[2]
        assert tag in TAG_STICKY, (cur_box, c)
        gi = len(boxes[cur_box]) - 1
        cur_group["items"].append({"rank": int(c[0]), "tag": tag, "text": c[1].replace("`", ""),
                                   "untested": (cur_box, gi, int(c[0])) in UNTESTED})
    return boxes


def canvas_counts(boxes):
    out = {}
    for k, groups in boxes.items():
        c = {"N": 0, "N/O": 0, "O": 0}
        for g in groups:
            for it in g["items"]:
                c[it["tag"]] += 1
        out[k] = c
    return out


SW, SH, SG = 160, 184, 12          # sticky size and gap on the canvas
BOXPAD = 24


def group_label(lbl):
    lbl = re.sub(r"^\((.*)\)$", r"\1", lbl)
    return lbl[:1].upper() + lbl[1:]


def pack_lines(groups, per):
    """put whole groups side by side while they fit in one row of stickies (one empty slot between groups)."""
    lines, cur, used = [], [], 0
    for gi, g in enumerate(groups):
        n = len(g["items"])
        need = n if not cur else used + 1 + n
        if cur and need <= per:
            cur.append(gi)
            used = need
        else:
            if cur:
                lines.append(cur)
            cur, used = [gi], n
    if cur:
        lines.append(cur)
    return lines


def box_layout(groups, w):
    """-> (height, placements) with placements = [(gi, label_x, label_y, label_w, [(item, x, y)])] relative to the box"""
    per = max(1, int((w - 2 * BOXPAD + SG) // (SW + SG)))
    y = BOXPAD + 52 + 8 + 30 + 20
    out = []
    for line in pack_lines(groups, per):
        col = 0
        lab_h = 0
        line_rows = 0
        specs = []
        for gi in line:
            g = groups[gi]
            n = len(g["items"])
            span = min(n, per)
            lw = span * (SW + SG) - SG
            lh = text_h(esc(group_label(g["label"])).upper(), 20, lw, True)[0]
            lab_h = max(lab_h, lh)
            specs.append((gi, col, lw))
            line_rows = max(line_rows, -(-n // per))
            col += span + 1
        yy = y + lab_h + 10
        for gi, c0, lw in specs:
            g = groups[gi]
            items = []
            for i, it in enumerate(g["items"]):
                r, c = divmod(i, per)
                items.append((it, BOXPAD + (c0 + c) * (SW + SG), yy + r * (SH + SG)))
            out.append((gi, BOXPAD + c0 * (SW + SG), y, lw, items))
        y = yy + line_rows * (SH + SG) - SG + 28
    return y + BOXPAD - 28, out


def box_height(groups, w):
    return box_layout(groups, w)[0]


def draw_box(p, key, title, groups, x, y, w, h, counts):
    p.rect(x, y, w, h, GFAINT, rx=16)
    yy = y + BOXPAD
    p.text(esc(title), x + BOXPAD, yy, w - 2 * BOXPAD, 40, INK, bold=True)
    yy += 52 + 8
    c = counts[key]
    total = sum(c.values())
    p.text(esc(f"{total} Post-its · N {c['N']} · N/O {c['N/O']} · O {c['O']}"), x + BOXPAD, yy, w - 2 * BOXPAD, 22, BODY)
    dots = []
    _, placed = box_layout(groups, w)
    for gi, lx, ly, lw, items in placed:
        p.text(esc(group_label(groups[gi]["label"])).upper(), x + lx, y + ly, lw, 20, BODY, bold=True)
        for it, sx, sy in items:
            body = f"<b>{it['rank']} · {esc(it['tag'])}</b><br/>{esc(it['text'])}"
            p.sticky(x + sx, y + sy, SW, SH, TAG_STICKY[it["tag"]], body)
            if it["untested"]:
                dots.append((x + sx + SW - 20, y + sy + 20))
    return dots


def canvas_page(spec, pageno, total, boxes):
    W = 4160
    s = 2.0
    counts = canvas_counts(boxes)
    p = Page("canvas", spec["title"], W, 2480, scale=s)
    top = header(p, spec)
    x0, inner = PAD * s, W - 2 * PAD * s
    colw = (inner - 4 * GAP) / 5
    cols = [["KP"], ["KA", "KR"], ["VP"], ["CR", "CH"], ["CS"]]
    names = dict(BOX_ORDER)
    hs = {k: box_height(boxes[k], colw) for k in names}
    toph = max(sum(hs[k] for k in col) + GAP * (len(col) - 1) for col in cols)
    botw = (inner - GAP) / 2
    bh = max(box_height(boxes["CO"], botw), box_height(boxes["RS"], botw))
    legend_h = 60
    p.h = round(top + toph + GAP + bh + 40 + legend_h + 40 + PAD * s + 18 * s * LH)
    dots = []
    for ci, col in enumerate(cols):
        cx = x0 + ci * (colw + GAP)
        yy = top
        for j, k in enumerate(col):
            h = hs[k] if j < len(col) - 1 else toph - (yy - top)
            dots += draw_box(p, k, names[k], boxes[k], cx, yy, colw, h, counts)
            yy += h + GAP
    yb = top + toph + GAP
    dots += draw_box(p, "CO", names["CO"], boxes["CO"], x0, yb, botw, bh, counts)
    dots += draw_box(p, "RS", names["RS"], boxes["RS"], x0 + botw + GAP, yb, botw, bh, counts)
    # legend
    ly = yb + bh + 40
    lx = x0
    for tag in ("O", "N/O", "N"):
        p.sticky(lx, ly - 4, 58, 66, TAG_STICKY[tag], "")
        p.text(esc(f"{tag} = {TAG_NAME[tag].lower()}"), lx + 76, ly + 10, 420, 32, INK, bold=True)
        lx += 520
    p.circle(lx + 24, ly + 30, 18, RED["medium"])
    p.text("Red dot = rests on an untested assumption", lx + 60, ly + 10, 1100, 32, INK, bold=True)
    for (cx, cy) in dots:
        p.circle(cx, cy, 14, RED["medium"])
    footer(p, spec, pageno, total)
    return p


# ---------------------------------------------------------------- Step 3 bars
def s3_page(spec, pageno, total, boxes):
    p = Page("s3", spec["title"])
    y = header(p, spec)
    ymax = footer(p, spec, pageno, total)
    counts = canvas_counts(boxes)
    names = dict(BOX_ORDER)
    order = ["CS", "VP", "CH", "CR", "RS", "KR", "KA", "KP", "CO"]
    leftw = 1080
    x = PAD
    # legend
    lx = x + 330
    for tag, fill in (("N", GREEN["medium"]), ("N/O", GREEN["light"]), ("O", BLUE["light"])):
        p.rect(lx, y + 4, 28, 28, fill, rx=6)
        p.text(esc(f"{tag} = {TAG_NAME[tag].lower()}"), lx + 40, y, 260, 22, INK, bold=True)
        lx += 250
    y0 = y + 52
    unit = (leftw - 330 - 150) / 15
    for i, k in enumerate(order):
        yy = y0 + i * 50
        p.text(esc(names[k]), x, yy + 2, 320, 22, INK, bold=True)
        bx = x + 330
        c = counts[k]
        for tag, fill in (("N", GREEN["medium"]), ("N/O", GREEN["light"]), ("O", BLUE["light"])):
            if c[tag]:
                p.rect(bx, yy, c[tag] * unit - 3, 36, fill, rx=4)
                bx += c[tag] * unit
        p.text(esc(f"{c['N']} · {c['N/O']} · {c['O']}"), bx + 14, yy + 2, 150, 22, BODY)
    tot = {t: sum(counts[k][t] for k in counts) for t in ("N", "N/O", "O")}
    yy = y0 + 9 * 50 + 6
    p.line(x, yy, x + leftw, yy, LINE, 2)
    p.text(esc(f"All 88 Post-its · N {tot['N']} · N/O {tot['N/O']} · O {tot['O']}"), x + 330, yy + 12, 700, 22, INK, bold=True)
    bottom = yy + 12 + 22 * LH
    # the writers' three cards, as compact bullets on the right
    rows = spec.get("rows") or []
    cards = next((b for r in rows for b in r.get("blocks", []) if b["type"] == "cards"), None)
    if cards:
        items = []
        for it in cards.get("items") or []:
            lead = it.get("title") or it.get("label") or ""
            items.append({"text": f"**{lead}.** {it.get('body', '')}".replace("..**", ".**")})
        bl = {"type": "bullets", "title": cards.get("title") or "Where the new sits", "items": items}
        rx = x + leftw + 64
        rw = PW - PAD - rx
        for sc in ("L", "M"):
            use_scale(sc)
            h = measure_bullets(bl, rw)
            if y + h <= ymax:
                break
        draw_bullets(p, bl, rx, y, rw, h)
        use_scale("L")
        bottom = max(bottom, y + h)
    if bottom > ymax:
        p.overflow.append(f"s3 ends at {bottom:.0f}, limit {ymax:.0f}")
    return p


# ---------------------------------------------------------------- mockups
SHOTS = {
    "tree": ("slide3-tree.png", 1608, 808), "relative": ("slide4-relative.png", 780, 1688),
    "portal": ("slide4-portal.png", 780, 1688), "patient": ("slide5-patient.png", 1100, 1221),
    "care": ("slide5-care.png", 1300, 1155),
}


def mock_page(spec, key, title, screens, captions, pageno, total):
    p = Page(key, title)
    y = header(p, spec)
    ymax = footer(p, spec, pageno, total)
    capw_min = 300
    asp = [SHOTS[s][1] / SHOTS[s][2] for s in screens]
    avail = PW - 2 * PAD - GAP * (len(screens) - 1) - 2 * 24 * len(screens)
    cap_h = 150
    h = min((ymax - y) - cap_h - 48, avail / sum(asp))
    widths = [max(capw_min, a * h) for a in asp]
    totalw = sum(widths) + 48 * len(screens) + GAP * (len(screens) - 1)
    x = PAD + (PW - 2 * PAD - totalw) / 2
    for s, a, w in zip(screens, asp, widths):
        pw = w + 48
        p.rect(x, y, pw, h + 48, GFAINT, rx=12)
        iw = a * h
        p.image(x + 24 + (w - iw) / 2, y + 24, iw, h, f"{SITE}/pitch/{SHOTS[s][0]}")
        cap = captions.get(s, {})
        yy = y + h + 48 + 16
        yy += p.text(md(cap.get("caption", "")), x, yy, pw, 22, INK, bold=True) + 6
        if cap.get("shows"):
            p.text(md("Shows: " + cap["shows"]), x, yy, pw, 18, BODY)
        x += pw + GAP
    return p


# ---------------------------------------------------------------- sources
MARK = re.compile(r"\[((?:S|N)?\d+)\]")


def vca_sources():
    L = vca_lines()
    start = next(i for i, l in enumerate(L) if l.startswith("## Sources"))
    out = {}
    for l in L[start:]:
        m = re.match(r"^- \[((?:S|N)?\d+)\] (.+)$", l.strip())
        if m:
            out[m.group(1)] = m.group(2)
    return out


def used_markers(specs, extra_text=""):
    blob = json.dumps(specs, ensure_ascii=False) + extra_text
    seen = []
    for m in MARK.finditer(blob):
        if m.group(1) not in seen:
            seen.append(m.group(1))

    def k(s):
        pre = {"": 0, "S": 1, "N": 2}[re.match(r"[SN]?", s).group(0)]
        return (pre, int(re.sub(r"\D", "", s)))
    return sorted(seen, key=k)


def source_pages(spec, markers, srcs, start_no, total):
    entries = []
    for m in markers:
        t = srcs.get(m)
        if not t:
            entries.append((m, "(not in the VCA source list)", None))
            continue
        um = re.search(r"https?://[^\s)\]]+", t)
        url = um.group(0).rstrip(".,;") if um else None
        name = re.sub(r"https?://[^\s)\]]+", "", t)
        name = re.sub(r"\s*\([^)]*\)\s*$", "", name).strip(" :;,.")
        name = re.sub(r"\s+", " ", name)
        if len(name) > 95:
            name = name[:95].rsplit(" ", 1)[0].rstrip(",;:") + "..."
        entries.append((m, name, url))
    pages, i, n = [], 0, 0
    NC = 4
    colw = (PW - 2 * PAD - (NC - 1) * GAP) / NC
    while i < len(entries) or not pages:
        n += 1
        key = "sources" if n == 1 else f"sources{n}"
        title = "Sources" if n == 1 else f"Sources ({n})"
        sp = dict(spec, key=key, title=title)
        p = Page(key, title)
        y0 = header(p, sp)
        ymax = footer(p, sp, start_no + n - 1, total)
        col, y = 0, y0
        while i < len(entries):
            m, name, url = entries[i]
            if url:
                dom = re.sub(r"^https?://(www\.)?", "", url).split("/")[0]
                body = f'<b>[{esc(m)}]</b> <a href="{esc(url)}">{esc(name)}</a> <i>{esc(dom)}</i>'
            else:
                body = f"<b>[{esc(m)}]</b> {esc(name)}"
            h = text_h(body, 17, colw)[0]
            if y + h > ymax:
                col += 1
                y = y0
                if col == NC:
                    break
            p.text(body, PAD + col * (colw + GAP), y, colw, 17, BODY)
            y += h + 12
            i += 1
        pages.append(p)
    return pages


# ---------------------------------------------------------------- board layout
ORDER = ["cover", "canvas", "s2a", "s2b", "s2c", "s3", "s4a", "s4b", "s4v", "s5a", "s5b", "s5c", "s5v",
         "logic", "config", "wedge", "risk", "mockups", "mockups2", "choices", "sources", "sources2", "sources3"]


LEFT = ["cover", "logic", "mockups", "mockups2"]          # column 0, beside the canvas
RIGHT = ["s2a", "s2b", "s2c", "s3", "s4a", "s4b", "s4v", "s5a"]  # columns 3-4, beside the canvas, row by row


def positions(pages):
    """The canvas sits in columns 1-2; the cover, the logic and the mockups to its left; Steps 2-4 to its right;
    everything else in full rows of five below it. 1920-wide pages, 320 gaps."""
    CX = [i * (PW + 320) for i in range(5)]
    rowh = PH + 320
    keys = [p.key for p in pages]
    canvas = next(p for p in pages if p.key == "canvas")
    band = max(len([k for k in LEFT if k in keys]), -(-len([k for k in RIGHT if k in keys]) // 2),
               -(-(canvas.h + 320) // rowh))
    pos = {"canvas": (CX[1], 0)}
    for i, k in enumerate([k for k in LEFT if k in keys]):
        pos[k] = (CX[0], i * rowh)
    for i, k in enumerate([k for k in RIGHT if k in keys]):
        pos[k] = (CX[3 + i % 2], (i // 2) * rowh)
    rest = [k for k in keys if k not in pos]
    for i, k in enumerate(rest):
        pos[k] = (CX[i % 5], (band + i // 5) * rowh)
    return pos


def build(pages_json, outdir):
    specs = {p["key"]: p for p in json.load(open(pages_json))["pages"]}
    boxes = parse_canvas()
    counts = canvas_counts(boxes)
    tot = {t: sum(counts[k][t] for k in counts) for t in ("N", "N/O", "O")}
    assert sum(tot.values()) == 88 and tot == {"N": 2, "N/O": 17, "O": 69}, tot
    srcs = vca_sources()
    markers = used_markers(list(specs.values()))
    ssp = specs.get("sources") or {"key": "sources", "title": "Sources", "kicker": "Sources",
                                   "headline": "Every marker on the board, with its link.",
                                   "sub": "[n] = numbered research source; [S#] = opened for the pitch work, Oct 6; [N#] = opened Oct 12."}
    n_src_pages = len(source_pages(ssp, markers, srcs, 1, 1))
    total = len([k for k in ORDER[:ORDER.index("choices") + 1] if k in specs]) + ("mockups" in specs) + n_src_pages
    pages, no = [], 0
    for k in ORDER:
        if k.startswith("sources"):
            continue
        if k == "mockups2":
            continue
        if k not in specs:
            continue
        no += 1
        sp = specs[k]
        if k == "canvas":
            pages.append(canvas_page(sp, no, total, boxes))
        elif k == "s3":
            pages.append(s3_page(sp, no, total, boxes))
        elif k == "mockups":
            caps = {c.get("screen"): c for c in sp.get("captions") or []}
            pages.append(mock_page(sp, "mockups", "Mockup screens (1 of 2)", ["tree", "relative", "portal"], caps, no, total))
            no += 1
            sp2 = dict(sp, headline="What the patient and the care team see.")
            pages.append(mock_page(sp2, "mockups2", "Mockup screens (2 of 2)", ["patient", "care"], caps, no, total))
        else:
            pages.append(standard_page(sp, no, total))
    pages += source_pages(ssp, markers, srcs, no + 1, total)
    pos = positions(pages)
    os.makedirs(os.path.join(outdir, "frames"), exist_ok=True)
    os.makedirs(os.path.join(outdir, "preview"), exist_ok=True)
    allsvg = []
    report = {}
    for p in pages:
        X, Y = pos[p.key]
        s = p.svg(X, Y)
        allsvg.append(s)
        open(os.path.join(outdir, "frames", f"{p.key}.svg"), "w").write(f"<svg>\n{s}\n</svg>")
        open(os.path.join(outdir, "preview", f"{p.key}.html"), "w").write(p.html())
        report[p.key] = {"pos": [X, Y], "size": [p.w, p.h], "items": len(p.els), "overflow": p.overflow}
    open(os.path.join(outdir, "board.svg"), "w").write("<svg>\n" + "\n".join(allsvg) + "\n</svg>")
    json.dump({"pages": report, "markers": markers, "missing_sources": [m for m in markers if m not in srcs]},
              open(os.path.join(outdir, "report.json"), "w"), indent=1)
    return pages, report


if __name__ == "__main__":
    pages, report = build(sys.argv[1], sys.argv[2])
    for k, v in report.items():
        print(f"{k:10s} {v['size'][0]}x{v['size'][1]} at {v['pos']} items={v['items']} {v['overflow'] or ''}")
