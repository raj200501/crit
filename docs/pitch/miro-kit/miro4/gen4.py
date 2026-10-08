"""Fourth pass: create-only fix-up frames for the Stemma VCA board.

Lessons applied from the read-back of the third pass:
- Miro wraps ~15% earlier than the PIL Noto Sans measure, so wrap estimates use SLACK=0.18.
- A taller-than-planned textArea grows symmetrically around its centre, so every block gets
  headroom and table cells are middle-aligned in their row band (growth stays inside the band).
- Text nodes are HTML-escaped and then XML-escaped (&amp;amp; etc.), so '&section' in a URL stays
  literal and '<year>' is not eaten as a tag.
- '#' header cells rendered blank: use 'No.'.
"""
import os, re, sys, json

D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(D, "..", "miro2"))
import fb
from fb import FB, INK, BODY, BLUE, YELLOW, RED, GREY_FAINT, GREY_EDGE, GREY_LINE, attr
from measure import count_lines
import content
from content import L, BOXES, NEW_URL, counts
from frames import widths, strip_lead, SWATCH, TAGNAME

BOARD = "https://miro.com/app/board/uXjVEdDYBoA=/"
SLACK = 0.18
LH = 1.40
XA = 12360            # column A: new analysis frames (right of the mockups)
XB = XA + 3960 + 160  # column B: replacement frames, same widths as the holes they replace
YC = 9644             # first content row of the main layout
GXY = 160


# ------------------------------------------------------------------ text helpers
def esc2(s):
    return s.replace("&", "&amp;amp;").replace("<", "&amp;lt;").replace(">", "&amp;gt;")


def md2(s):
    s = s.strip().replace("`", "")
    s = esc2(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])", r"<i>\1</i>", s)
    return s


def _measurable(body):
    return body.replace("&amp;amp;", "&amp;").replace("&amp;lt;", "&lt;").replace("&amp;gt;", "&gt;")


def est(body, fs, w, bold=False, headroom=True):
    n = count_lines(_measurable(body), fs, w, bold, SLACK)
    h = n * LH * fs
    if headroom and n >= 3:
        h += 0.5 * LH * fs
    return round(h), n


def mdrow(a, b):
    h, rows = content.table(a, b)
    return [md2(c) for c in h], [[md2(c) for c in r] for r in rows]


def bullets2(lines):
    out = []
    for ln in lines:
        s = ln.strip()
        if s.startswith("- "):
            s = "• " + s[2:]
        out.append(md2(s))
    return "<br/>".join(out)


# ------------------------------------------------------------------ builder
class B4(FB):
    def textarea(self, body, x, y, w, fs, color=BODY, bold=False, align=None, eid=None, h=None, headroom=True):
        eid = eid or self.nid("t")
        if h is None:
            h, _ = est(body, fs, w, bold, headroom)
        fw = ' font-weight="bold"' if bold else ""
        al = f' text-align="{align}"' if align else ""
        self.els.append(
            f'<textArea id="{eid}" x="{round(x, 1)}" y="{round(y, 1)}" width="{w}" height="{h}" font-family="noto_sans" '
            f'font-size="{fs}" fill="{color}"{fw}{al}>{body}</textArea>')
        return h

    def header(self, chip, title, sub=None):
        cw = int(len(chip) * 0.66 * 22 + 48)
        self.rect(self.pad, self.y, cw, 48, BLUE["light"], rx=24, content=f"<b>{chip}</b>", fs=22, tc=BLUE["dark"])
        self.y += 48 + 20
        self.text(f"<b>{title}</b>", fs=67, color=INK, bold=True, gap=20)
        if sub:
            self.text(sub, fs=22, color=BODY, gap=20)
        self.y += 12

    def mtable(self, header, rows, ws, fs=22, x=None, bold_rows=(), first_col_bold=True, zebra=True, cell_pad=14, gap=32):
        """Middle-aligned cells: a cell that wraps more than planned grows inside its own row band."""
        x = self.pad if x is None else x
        total = sum(ws)
        y0 = self.y
        hs = [est(f"<b>{c}</b>", fs, w - 2 * cell_pad, True)[0] if c else 0 for c, w in zip(header, ws)]
        rowh = max(hs) + 2 * cell_pad + 8
        self.rect(x, y0, total, rowh, BLUE["light"])
        cx = x
        for c, w, h in zip(header, ws, hs):
            if c:
                self.textarea(f"<b>{c}</b>", cx + cell_pad, y0 + (rowh - h) / 2, w - 2 * cell_pad, fs, INK, True, h=h)
            cx += w
        yy = y0 + rowh
        for ri, row in enumerate(rows):
            cells = []
            for ci, (c, w) in enumerate(zip(row, ws)):
                b = (ri in bold_rows) or (ci == 0 and first_col_bold)
                body = c
                if b and body and not body.startswith("<b>"):
                    body = f"<b>{body}</b>"
                h = est(body, fs, w - 2 * cell_pad)[0] if body.strip() else 0
                cells.append((body, h, b))
            mh = max([h for _, h, _ in cells] + [round(LH * fs)])
            rh = mh + 2 * cell_pad + 8
            fill = None
            if zebra and ri % 2 == 1:
                fill = BLUE["faint"]
            if ri in bold_rows:
                fill = YELLOW["faint"]
            if fill:
                self.rect(x, yy, total, rh, fill)
            cx = x
            for (body, h, b), w in zip(cells, ws):
                if body.strip():
                    self.textarea(body, cx + cell_pad, yy + (rh - h) / 2, w - 2 * cell_pad, fs, INK if b else BODY, h=h)
                cx += w
            yy += rh
        self.divider(x, yy, x + total, yy, GREY_LINE, 2)
        self.y = yy + gap
        return yy - y0

    def finish4(self, extra=48):
        self.h = round(self.y - 32 + self.pad + extra)
        return self


def n_items(f):
    return 1 + len([e for e in f.els if e])


# ------------------------------------------------------------------ Step 1: why each Post-it
WHY_GROUPS = [("KP", "KA", "KR"), ("VP", "CR", "CH"), ("CS", "CO", "RS")]
WHY_TITLES = ["partners, activities, resources", "value, relationships, channels", "segments, costs, revenue"]


def why_rows(key):
    a, b = [x[2] for x in content.BOX_SECTIONS if x[0] == key][0]
    _, rows = content.table(a, b)
    whys = [r[3] for r in rows if r[0] != ""]
    items = []
    k = 0
    for g in BOXES[key]["groups"]:
        lab = g["label"]
        group = []
        for it in g["items"]:
            group.append((g["prefix"], it, whys[k]))
            k += 1
        items.append((lab, group))
    assert k == len(whys)
    return items


def f_why(i):
    keys = WHY_GROUPS[i]
    f = B4(f"why{i + 1}", f"Step 1 · Why each Post-it ({i + 1} of 3): {WHY_TITLES[i]}", 3960)
    f.header("STEP 1 · WHY EACH POST-IT", f"Why each Post-it ({i + 1} of 3): {WHY_TITLES[i]}",
             sub="The why and evidence behind every Post-it on the canvas, in canvas order. "
                 "Bold line: the Post-it as written on the canvas (sub-group rank [tag] text). Line below: why it is there, with its sources.")
    p = f.pad
    G = 48
    CW = (f.inner - 2 * G) // 3
    top = f.y
    bottoms = []
    for ci, key in enumerate(keys):
        x = p + ci * (CW + G)
        ridx = len(f.els)
        f.els.append(None)  # zone rect, filled in after the height is known
        ZP = 28
        y = top + ZP
        c = counts()[key]
        n = sum(c.values())
        y += f.textarea(f"<b>{BOXES[key]['title']}</b>", x + ZP, y, CW - 2 * ZP, 33, INK, True) + 6
        y += f.textarea(f"{n} Post-its · N {c['N']} · N/O {c['N/O']} · O {c['O']}", x + ZP, y, CW - 2 * ZP, 20, BODY) + 20
        for lab, group in why_rows(key):
            y += f.textarea(f"<b>{esc2(lab)}</b>", x + ZP, y, CW - 2 * ZP, 22, BLUE["dark"], True) + 12
            for prefix, it, why in group:
                body = f"<b>{esc2(prefix)} {it['rank']} [{it['tag']}] {md2(it['text'])}</b>"
                if why.strip():
                    body += f"<br/>{md2(why)}"
                y += f.textarea(body, x + ZP, y, CW - 2 * ZP, 22, INK) + 22
            y += 10
        bottoms.append((ridx, x, y + ZP - 32))
    H = max(b for _, _, b in bottoms) - top
    for ridx, x, _ in bottoms:
        f.els[ridx] = f'<rect id="{f.nid("z")}" x="{x}" y="{top}" width="{CW}" height="{round(H)}" fill="{GREY_FAINT}" stroke="none" />'
    f.y = top + H + 32
    return f.finish4()


# ------------------------------------------------------------------ choices and open items
def f_choices():
    f = B4("choices", "Choices made, and open items", 3960)
    f.header("CHOICES AND OPEN ITEMS", "Choices made, and open items",
             sub="Where the research memos disagreed and what we chose, then the open items that Step 5a ('open items') and Step 5b ('open item 4') point to.")
    f.h2("Choices made where the research memos disagreed")
    h, rows = mdrow(568, 576)
    f.mtable(h, rows, widths([1.1, 2.4, 4.2], f.inner), fs=22)
    f.h2("Open items only the team can close")
    f.text("Numbered as in the analysis.", fs=22, color=BODY, gap=16)
    items = []
    for n in (2, 3, 4, 5, 6, 8, 9):
        ln = [L(i) for i in range(582, 592) if L(i).startswith(f"{n}. ")][0]
        items.append(md2(ln))
    for s in items:
        f.text(s, fs=22, color=INK, gap=18)
        if s.startswith("8. "):
            f.text("<b>Status, Oct 7, 2026:</b> fixes (a), (b) and (c) are in the production prototype (" + NEW_URL +
                   "), and the six mockup screens were captured after them.", fs=22, color=BLUE["dark"], gap=22)
    return f.finish4()


# ------------------------------------------------------------------ Step 3 (replacement)
def coltable4(f, header, rows, ws, fs=22, x=None, bold_rows=(), gap=32, cell_pad=12):
    x = f.pad if x is None else x
    total = sum(ws)
    lh = LH * fs
    y0 = f.y
    hdr_h = round(lh) + 2 * cell_pad
    f.rect(x, y0, total, hdr_h, BLUE["light"])
    yb = y0 + hdr_h + cell_pad
    for ri in range(len(rows)):
        if ri in bold_rows:
            f.rect(x, round(yb + ri * 2 * lh) - 8, total, round(lh) + 16, YELLOW["faint"])
    cx = x
    n = len(rows)
    for ci, w in enumerate(ws):
        f.textarea(f"<b>{header[ci]}</b>", cx + cell_pad, y0 + cell_pad, w - 2 * cell_pad, fs, INK, True, h=round(lh))
        cells = []
        for ri, r in enumerate(rows):
            c = re.sub(r"</?b>", "", r[ci])
            b = ri in bold_rows or ci == 0
            cells.append(f"<b>{c}</b>" if b and c else (c or " "))
            assert est(cells[-1], fs, w - 2 * cell_pad, b, False)[1] == 1, (header[ci], c)
        f.textarea("<br/><br/>".join(cells), cx + cell_pad, yb, w - 2 * cell_pad, fs, INK if ci == 0 else BODY,
                   h=round((2 * n - 1) * lh))
        cx += w
    yy = round(yb + (2 * n - 1) * lh) + cell_pad
    f.divider(x, yy, x + total, yy, GREY_LINE, 2)
    f.y = yy + gap


def f_3v2():
    f = B4("s3v2", "Step 3 · What's new and what's old", 5496)
    f.header("STEP 3", "What's new and what's old", sub="The tag on every Post-it of the canvas above, counted per box.")
    p = f.pad
    G = 64
    LW = int((f.inner - G) * 0.45)
    RW = f.inner - G - LW
    y0 = f.y
    f.text(md2(L(253)), fs=22, x=p, w=LW)
    h, rows = mdrow(255, 266)
    coltable4(f, h, rows, widths([3, 1, 1, 1, 1], LW), fs=22, x=p, bold_rows=(len(rows) - 1,))
    yl = f.y
    f.y = y0
    rx = p + LW + G
    f.text("<b>Where the new sits</b>", fs=33, color=INK, bold=True, gap=16, x=rx, w=RW)
    f.text(bullets2([L(269), L(270), L(271)]), fs=22, x=rx, w=RW, gap=40)
    f.panel(md2(L(273)), fs=22, fill=YELLOW["light"], color=INK, x=rx, w=RW)
    f.y = max(yl, f.y)
    return f.finish4()


# ------------------------------------------------------------------ Step 5a (replacement)
CHIP5 = "STEP 5 · CAN WE MAKE IT?"


def f_5av2():
    f = B4("s5av2", "Step 5a · Technical feasibility", 3960)
    f.header(CHIP5, "5.1 Technical feasibility")
    f.text(md2(L(357)), fs=22, color=INK)
    h, rows = mdrow(359, 366)
    f.mtable(h, rows, widths([3, 2.2], f.inner), fs=20, zebra=False)
    f.text(md2(L(368)), fs=22, color=INK)
    h, rows = mdrow(370, 377)
    h[0] = "No."
    f.mtable(h, rows, widths([0.3, 2, 1.8, 2.4], f.inner), fs=20, zebra=False)
    f.panel(md2(L(379)), fs=33, fill=YELLOW["light"], color=INK)
    return f.finish4()


# ------------------------------------------------------------------ Step 5b (replacement: clinical safety line now says the fix shipped)
def f_5bv2():
    f = B4("s5bv2", "Step 5b · Operational feasibility", 3960)
    f.header(CHIP5, "5.2 Operational feasibility")
    h, rows = mdrow(383, 387)
    f.mtable(h, rows, widths([1.2, 2.2, 2.6], f.inner), fs=22, zebra=False)
    bl = [L(i) for i in range(389, 395)]
    bl = [b.replace(' Never "HIPAA compliant" or "certified" [55][39].', '') for b in bl]
    assert not any("compliant" in b for b in bl)
    assert "Since Oct 7, 2026" in bl[1]
    f.text(bullets2(bl), fs=22)
    f.text(md2(L(395).lstrip("- ")), fs=22, color=INK)
    h, rows = mdrow(397, 404)
    f.mtable(h, rows, widths([0.6, 3, 1.3], f.inner), fs=22, zebra=False)
    f.panel(md2(L(406)), fs=33, fill=YELLOW["light"], color=INK)
    return f.finish4()


# ------------------------------------------------------------------ Sources (replacement, three frames)
def source_entries():
    ents = [("head", "<b>" + re.sub(r"</?b>", "", md2(L(596))) + "</b>")]
    for i in range(598, 666):
        ents.append(("src", md2(L(i)[2:])))
    ents.append(("head", "<b>" + re.sub(r"</?b>", "", md2(L(667))) + "</b>"))
    for i in range(669, 719):
        s = L(i)[2:]
        if s.startswith("[S28]"):
            s = s.replace("https://family-health-tree-raj-s-projects12.vercel.app", "Prototype now at " + NEW_URL)
            assert "stemmahealth" in s
        ents.append(("src", md2(s)))
    ents.append(("head", md2(L(720))))
    return ents


SRC_FS = 20
SRC_GAP = 18


def f_sources_v2():
    ents = source_entries()
    W = 3960
    pad = 64
    G = 64
    CW = (W - 2 * pad - G) // 2
    hs = [est(b, SRC_FS, CW, False)[0] for _, b in ents]
    # split into 3 frames x 2 columns, keeping order, balancing heights
    total = sum(h + SRC_GAP for h in hs)
    target = total / 6
    cols = [[]]
    acc = 0
    for e, h in zip(ents, hs):
        if cols[-1] and acc + (h + SRC_GAP) / 2 > target * len(cols) and len(cols) < 6:
            cols.append([])
        cols[-1].append((e, h))
        acc += h + SRC_GAP
    frames = []
    for k in range(3):
        f = B4(f"srcv2_{k + 1}", f"Sources ({k + 1} of 3)", W)
        f.header("SOURCES", f"Sources ({k + 1} of 3)",
                 sub="Every [n] and [S#] marker on this board points to an entry in these three frames. Interview IDs (ID002, ID006, ID007, ID010, D021) "
                     "match the Team Hub Interview Logs; (note) means the note-taker's wording.")
        y0 = f.y
        ymax = y0
        for j in range(2):
            col = cols[2 * k + j]
            x = pad + j * (CW + G)
            y = y0
            for (kind, body), h in col:
                y += f.textarea(body, x, y, CW, SRC_FS, INK if kind == "head" else BODY, h=h) + SRC_GAP
            ymax = max(ymax, y)
        f.y = ymax + 16
        frames.append(f.finish4())
    return frames


# ------------------------------------------------------------------ header (replacement, created last)
MAP = [("Step 1 canvas", "bmc1"), ("Why each Post-it", "why1"), ("Step 2", "s2a"), ("Step 3", "s3v2"),
       ("Mockup screens", "mock"), ("Step 4", "s4a"), ("Step 4 verdict", "s4v"), ("Step 5", "s5av2"),
       ("Step 5 verdict", "s5v"), ("Business logic", "logic"), ("Configuration", "config"), ("Wedge", "wedge"),
       ("Riskiest claim", "risk"), ("Choices and open items", "choices"), ("Sources", "srcv2_1")]
OLD_IDS = {"bmc1": "3458764686319551093", "s2a": "3458764686319750904", "mock": "3458764686320118849",
           "s4a": "3458764686320269172", "s4v": "3458764686320417017", "s5v": "3458764686320889478",
           "logic": "3458764686320889757", "config": "3458764686321122013", "wedge": "3458764686321122341",
           "risk": "3458764686321261033",
           # fallbacks until the replacement frames exist
           "s3v2": "3458764686320118391", "s5av2": "3458764686320572749", "srcv2_1": "3458764686321274594"}


def f_header4(links):
    W = 12200
    f = B4("hdrv2", "Header · Team 709 · Stemma", W)
    p = f.pad
    LW = 5200
    GW = 2000
    AX = p + LW + 96 + GW + 96
    AW = W - AX - p
    y = p
    y += f.textarea("<b>Team 709 · Stemma, the family health tree</b>", p, y, LW, 90, INK, True, headroom=False) + 10
    y += f.textarea("<b>Value Creation Analysis (Milestone 4)</b>", p, y, LW, 67, BLUE["dark"], True, headroom=False) + 24
    y += f.textarea("TECH 5900 Product Studio · Section 7 · Raj Kashikar · Viha Srinivas · Unser Jaffry", p, y, LW, 33, INK) + 10
    y += f.textarea("Oral review with our coach Oct 12–23, 2026 · one PDF due Oct 23, 2026 · analysis as drafted Oct 6, 2026 (revised after review)", p, y, LW, 22, BODY) + 20
    prod = md2(L(8)).replace("Live prototype, synthetic data only: https://family-health-tree-raj-s-projects12.vercel.app", "").strip()
    assert "family-health-tree-raj" not in prod
    y += f.textarea(prod, p, y, LW, 22, BODY) + 14
    y += f.textarea(f"<b>Live prototype, synthetic data only:</b> {NEW_URL}", p, y, LW, 22, INK) + 14
    how = md2(L(6)).replace("Both lists, with URLs, are at the end.", "Both lists, with URLs, are in the three Sources frames (see the board map).")
    assert "Sources frames" in how
    y += f.textarea(how, p, y, LW, 20, BODY) + 14
    parts = []
    for lab, key in MAP:
        wid = links.get(key) or OLD_IDS.get(key) or "0000000000000000000"
        parts.append(f'<a href="{BOARD}?moveToWidget={wid}">{lab}</a>')
    y += f.textarea("<b>Board map:</b> " + " · ".join(parts), p, y, LW, 22, INK, eid="hdrv2-map") + 10
    left_h = y
    gx = p + LW + 96
    yy = p
    yy += f.textarea("<b>Legend</b>", gx, yy, GW, 33, INK, True) + 16
    c = counts()
    tot = {"N": 0, "N/O": 0, "O": 0}
    for k in c:
        for t in c[k]:
            tot[t] += c[k][t]
    for t in ("O", "N/O", "N"):
        f.rect(gx, yy, 80, 80, SWATCH[t])
        f.textarea(f"<b>[{t}] = {TAGNAME[t]}</b><br/>{tot[t]} Post-its", gx + 104, yy + 9, GW - 104, 22, INK, headroom=False)
        yy += 80 + 20
    f.circle(gx + 40, yy + 40, 18, RED["medium"])
    f.textarea("<b>Red dot</b> = the Post-it rests on an untested assumption (6 Post-its)", gx + 104, yy + 9, GW - 104, 22, INK, headroom=False)
    yy += 80 + 24
    yy += f.textarea("Each Post-it reads: sub-group rank [tag] text. Ranks restart at 1 in each sub-group and follow order of preference. Tags follow the course: N = new, O = old, N/O = some of each.", gx, yy, GW, 20, BODY) + 10
    leg_h = yy
    hdr, rows = mdrow(14, 22)
    f.y = p
    f.mtable(["At a glance", ""], rows, widths([1, 3.4], AW), fs=22, x=AX, zebra=True, cell_pad=12)
    glance_h = f.y
    f.y = max(left_h, leg_h, glance_h) + 16
    return f.finish4(extra=32)


# ------------------------------------------------------------------ layout
def build(links=None):
    fr = {}
    for i in range(3):
        f = f_why(i)
        fr[f.key] = f
    fr["choices"] = f_choices()
    fr["s3v2"] = f_3v2()
    fr["s5av2"] = f_5av2()
    fr["s5bv2"] = f_5bv2()
    for f in f_sources_v2():
        fr[f.key] = f
    fr["hdrv2"] = f_header4(links or {})
    return fr


def positions(fr):
    pos = {}
    y = YC
    for k in ("why1", "why2", "why3", "choices"):
        pos[k] = (XA, y)
        y += fr[k].h + GXY
    y = YC
    for k in ("s3v2", "s5av2", "srcv2_1", "srcv2_2", "srcv2_3", "s5bv2"):
        pos[k] = (XB, y)
        y += fr[k].h + GXY
    pos["hdrv2"] = (XA, 8600)
    assert 8600 + fr["hdrv2"].h <= YC - 100, fr["hdrv2"].h
    return pos


def write(fr, pos, key):
    f = fr[key]
    x, y = pos[key]
    s = '<svg xmlns="http://www.w3.org/2000/svg">\n' + f.svg(x, y) + "\n</svg>"
    fn = os.path.join(D, f"c4_{key}.svg")
    open(fn, "w").write(s)
    return fn, s


if __name__ == "__main__":
    links = json.load(open(os.path.join(D, "links.json"))) if os.path.exists(os.path.join(D, "links.json")) else {}
    fr = build(links)
    pos = positions(fr)
    for k in fr:
        fn, s = write(fr, pos, k)
        bad = [w for w in ("compliant", "certified", "Family Health Tree", "family-health-tree-raj", "§ion") if w in s]
        n = n_items(fr[k])
        print(f"{k:9s} pos={pos[k]} w={fr[k].w} h={fr[k].h} items={n} chars={len(s)} {bad}{'  <-- OVER' if n > 60 else ''}")
