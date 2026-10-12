"""Fifth pass: replacement frames that match the final Maker Day 2 deck (Oct 12, 2026).

The deck (Google Slides 1JGhz-94qJGlWLe-9ZmBesYhjJp6ZIuggMYgFx6BK6kM) was revised to stand alone and is final.
Its slide 9 changed the two business-logic sentences, the wedge card and the vision card; slide 7 and A3 changed
the riskiest claim; slides 3 and 6 say the practice opens the care-team copy by link or QR (no fax). The VCA
(docs/pitch/value-creation-analysis.md) was updated to match in the commit before this one.

Same builder as the fourth pass (gen4.B4: Noto Sans, 67/33/22/20 px, the blue/yellow/red palette, middle-aligned
table cells, 18% wrap slack). The text comes from the deck words below and from the VCA, found by heading rather
than by line number, so later edits to the VCA don't shift it. Frames are create-only: run
`python3 gen5.py` to write the SVGs, create each with canvas_create_from_svg, then record the ids in ids5.json;
the header is generated last because its board map links to the new frames.
"""
import os, re, sys, json

D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(D, "..", "miro4"))
sys.path.insert(0, os.path.join(D, "..", "miro2"))
import gen4
from gen4 import B4, md2, esc2, bullets2, BOARD
from fb import INK, BODY, BLUE, YELLOW, RED, GREY_FAINT
from frames import widths, SWATCH, TAGNAME
from content import NEW_URL

VCA_PATH = os.path.normpath(os.path.join(D, "..", "..", "value-creation-analysis.md"))
V = open(VCA_PATH, encoding="utf-8").read().split("\n")

# ------------------------------------------------------------------ the deck's words (final, Oct 12, 2026)
DECK_BUY = ("People will buy it because cardiology guidelines need which relative and what age, intake forms take it "
            "from memory, and for $500 per cardiologist a year a practice-sent link puts those details, sourced, in the "
            "chart before visit one.")                                                     # slide 9, s08_buy
DECK_MAKE = ("We can make it because the patient side already runs on open health standards, a PDF reaches any chart, "
             "and a pilot on vendors that sign HIPAA contracts costs under $850 a month, which 17–21 paying "
             "cardiologists cover, founders unpaid.")                                      # slide 9, s08_make
DECK_WEDGE = ("3 independent NYC cardiology groups. Why cardiology first: its guidelines count grandparents, aunts and "
              "uncles, by side and age.")                                                  # slide 9, s08_wedget
DECK_GOAL = "Goal: 4 in 10 invited new patients have a reviewed page in the chart before visit one."
DECK_VISION = ("Any doctor who needs a family history, one specialty at a time: the rest of NYC's ~20 cardiology groups → "
               "larger groups → genetics and lipid clinics → primary care wellness visits. US independent cardiology "
               "alone: 7,699 cardiologists, $3.8M a year at $500. Markets beyond it are not yet sized.")  # s08_visiont
DECK_RISK = "A practice pays $500 per cardiologist a year despite free intake tools."      # slide 7, s06_tilel2
BUY_LEAD, MAKE_LEAD = "People will buy it because", "We can make it because"


# ------------------------------------------------------------------ VCA access by heading
def section(heading):
    """Lines under an exact heading line, up to the next heading of the same or a higher level."""
    i = V.index(heading)
    lvl = len(heading) - len(heading.lstrip("#"))
    j = i + 1
    while j < len(V):
        s = V[j]
        if s.startswith("#") and len(s) - len(s.lstrip("#")) <= lvl:
            break
        j += 1
    return V[i + 1:j]


def split_row(line):
    line = line.strip()
    assert line.startswith("|") and line.endswith("|"), line
    return [c.strip() for c in line[1:-1].split("|")]


def first_table(lines):
    t = []
    for s in lines:
        if s.startswith("|"):
            t.append(s)
        elif t:
            break
    assert len(t) >= 3, lines[:3]
    return split_row(t[0]), [split_row(s) for s in t[2:]]


def md_table(lines):
    h, rows = first_table(lines)
    return [md2(c) for c in h], [[md2(c) for c in r] for r in rows]


def starting(lines, prefix):
    hit = [s for s in lines if s.startswith(prefix)]
    assert len(hit) == 1, (prefix, len(hit))
    return hit[0]


def plain(s):
    return re.sub(r"\*\*(.+?)\*\*", r"\1", s.strip().lstrip(">").strip())


def lead_body(sentence, lead):
    assert sentence.startswith(lead + " "), sentence[:40]
    return f"<b>{lead}</b> " + esc2(sentence[len(lead) + 1:])


LOGIC = section("## Central business logic")
CONFIG = section("## The configuration most likely to succeed")
SPECIFIC = section("### The wedge, made specific")
PATH = section("### Expansion path")
GLANCE = section("## At a glance (for the top of the Miro board)")
UNPROVEN = section("### 4.4 What is still unproven (ranked)")
VERDICT4 = section("### 4.5 Verdict")
VERDICT5 = section("### 5.4 Step 5 verdict")

# The VCA must carry the deck's words before the board repeats them.
_quotes = [plain(s) for s in LOGIC if s.startswith("> **")]
assert _quotes == [DECK_BUY, DECK_MAKE], _quotes
_glance = {re.sub(r"\*\*", "", r[0]): r[1] for r in first_table(GLANCE)[1]}
assert _glance["Wedge"].startswith(DECK_WEDGE + " " + DECK_GOAL), _glance["Wedge"][:80]
assert _glance["Vision"].startswith(DECK_VISION), _glance["Vision"][:80]
assert _glance["Riskiest claim and its test"].startswith(DECK_RISK)
assert starting(UNPROVEN, "1. ").startswith("1. " + DECK_RISK[:-1])

# Words the board must never use (honesty rules) and old wording that the deck replaced.
BANNED = ("compliant", "certified", "Family Health Tree", "family-health-tree-raj", "§ion", "built for any physician",
          "upload their medical records", "A practice manager will pay", "about ten two-cardiologist", "or fax",
          "by link or fax", "conflicting", "public standards", "criteria for any physician")
BANNED_RE = (r"\[N\d",)  # [N#] sources are not in the board's Sources frames


# ------------------------------------------------------------------ Central business logic
def f_logic5():
    f = B4("logic5", "Central business logic", 6020)
    f.header("CENTRAL BUSINESS LOGIC", "Central business logic")
    f.panel(lead_body(DECK_BUY, BUY_LEAD), fs=67, fill=YELLOW["light"], color=INK, pad=48, gap=24)
    f.panel(lead_body(DECK_MAKE, MAKE_LEAD), fs=67, fill=YELLOW["light"], color=INK, pad=48)
    t = starting(LOGIC, "The same two sentences")
    t = t[t.index('"Take it from memory"'):]
    f.text("Word for word as on the slide 9 cards of the Maker Day 2 deck (final, Oct 12, 2026). " + md2(t), fs=22)
    f.h2("Each clause and its evidence")
    h, rows = md_table(LOGIC)
    assert len(rows) == 9, len(rows)
    f.mtable(h, rows, widths([2, 4, 2.4], f.inner), fs=20, cell_pad=12)
    return f.finish4()


# ------------------------------------------------------------------ Configuration most likely to succeed
def f_config5():
    f = B4("config5", "Configuration most likely to succeed", 6020)
    f.header("CONFIGURATION", "The configuration most likely to succeed")
    h, rows = md_table(CONFIG)
    for r in rows:
        # deck A0/A1: $99 a month is a higher price we test, not a price already tested
        r[2] = r[2].replace("$99 per cardiologist per month (tested)", "$99 per cardiologist per month (a higher price we test)")
        # deck slide 2 and A1: who holds the budget is still untested
        r[1] = r[1].replace("(manager budgets, owner signs)", "(manager budgets, owner signs; untested)")
    assert any("check-in QR" in r[1] for r in rows) and not any("fax" in r[1] for r in rows)
    f.mtable(h, rows, widths([1, 3.4, 2.4], f.inner), fs=20, cell_pad=12)
    f.panel(md2(starting(CONFIG, "**Why these choices fit together.**")), fs=22, fill=YELLOW["light"], color=INK)
    return f.finish4()


# ------------------------------------------------------------------ Wedge (now) vs vision (later)
def f_wedge5():
    f = B4("wedge5", "Wedge (now) vs vision (later)", 3960)
    f.header("WEDGE", "The wedge (now) is smaller than the vision (later)")
    p = f.pad
    VX, VY, VW = p, f.y, f.inner
    vid = f.nid("vis")
    vidx = len(f.els)
    f.els.append(None)  # vision panel, sized below
    yy = VY + 40
    yy += f.textarea("<b>VISION (LATER): any doctor who needs a family history, one specialty at a time</b>",
                     VX + 48, yy, VW - 96, 33, BLUE["dark"], True, headroom=False) + 12
    yy += f.textarea(esc2(DECK_VISION) + " (slide 9)", VX + 48, yy, VW - 96, 22, INK) + 32
    h, rows = first_table(PATH)
    assert rows[0][0].startswith("1. Pilot") and len(rows) == 5, rows
    top = yy
    # wedge box, left: the slide 9 wedge card, then why cardiology first
    WX, WW = VX + 48, 1600
    widx = len(f.els)
    f.els.append(None)
    yy = top + 40
    yy += f.textarea("<b>WEDGE (NOW)</b>", WX + 40, yy, WW - 80, 33, YELLOW["dark"], True, headroom=False) + 16
    body = ("<b>3 independent NYC cardiology groups.</b> " + esc2(DECK_WEDGE[len("3 independent NYC cardiology groups. "):]) +
            "<br/><br/><b>" + esc2(DECK_GOAL) + "</b> (slide 9)<br/><br/>"
            f"<b>{esc2(rows[0][0])}</b><br/>Trigger to move on: {md2(rows[0][2])}<br/><br/>"
            "NYC's 285–320 independent cardiologists [S27] are worth $142–160k a year at $500: a pilot market, not a business.")
    yy += f.textarea(body, WX + 40, yy, WW - 80, 22, INK) + 24
    why = ("<b>Why cardiology first.</b> Its criteria need which relative, which side and what age, out to grandparents, "
           "aunts and uncles [76][77][72]; Medicare's wellness visit requires, at minimum, only parents, siblings and "
           "children [104]. And one practice manager can say yes. In our wedge scoring (team judgment before any buyer "
           "call), independent NYC cardiology scores 21 of 30 and primary care wellness visits 19; if access were 2 "
           "instead of 4, primary care would tie, so the five manager calls decide. <b>Decision rule:</b> if fewer than "
           "3 of 5 cardiology managers name a budget owner by Oct 23, run the same five calls with primary care practice "
           "managers. Our ER interviewee pointed to primary care as the bigger user of family history (ID010, note); it "
           "is our expansion market. Any visit can use it today; only cardiology has clinician criteria.")
    yy += f.textarea(why, WX + 40, yy, WW - 80, 22, INK) + 40
    wbot = yy
    f.els[widx] = f'<rect id="{f.nid("wbox")}" x="{WX}" y="{top}" width="{WW}" height="{round(wbot - top)}" fill="{YELLOW["light"]}" stroke="none" rx="24" />'
    # stage cards, right
    SX = WX + WW + 64
    SWD = VX + VW - 48 - SX
    yy = top
    for r in rows[1:]:
        cidx = len(f.els)
        f.els.append(None)
        b = f"<b>{md2(r[0])}</b>: {md2(r[1])}<br/>Trigger to move on: {md2(r[2])}"
        hh = f.textarea(b, SX + 28, yy + 20, SWD - 56, 22, INK)
        f.els[cidx] = f'<rect id="{f.nid("card")}" x="{SX}" y="{yy}" width="{SWD}" height="{round(hh + 40)}" fill="#ffffff" stroke="none" rx="12" />'
        yy += hh + 40 + 20
    each = starting(PATH, "Each step reuses")
    each = each.replace(" Markets beyond independent cardiology are not yet sized (A9).", "")
    mk = ("<b>Market check.</b> The 7,699 are US cardiologists in organizations of 100 or fewer clinicians, a proxy that "
          "includes some hospital practices [99]: <b>$3.8M a year at $500</b>, or $9.1–13.8M at the higher monthly prices "
          "modeled in Step 5.3 (A4). Markets beyond independent cardiology are not yet sized. " + md2(each))
    yy += 12
    yy += f.textarea(mk, SX, yy, SWD, 22, INK)
    vbot = max(yy, wbot) + 48
    f.els[vidx] = f'<rect id="{vid}" x="{VX}" y="{VY}" width="{VW}" height="{round(vbot - VY)}" fill="{BLUE["faint"]}" stroke="none" rx="24" />'
    f.y = vbot + 48
    f.h2("The wedge, made specific")
    bl = [s for s in SPECIFIC if s.startswith("- ")]
    assert len(bl) == 9, len(bl)
    f.text(bullets2(bl), fs=22)
    return f.finish4()


# ------------------------------------------------------------------ Riskiest claim and its test
def f_risk5():
    f = B4("risk5", "Riskiest claim and its test", 3960)
    f.header("RISKIEST CLAIM", "Our riskiest claim, and its test")
    f.panel(f"<b>{esc2(DECK_RISK)}</b>", fs=67, fill=RED["faint"], color=INK, bold=True, label="RISKIEST CLAIM",
            label_color=RED["dark"], pad=48)
    f.text("Slide 7 of the Maker Day 2 deck, word for word; backup A3 shortens it to \"a practice pays $500 per "
           "cardiologist a year\". <b>0 of 21</b> logged interviews were practice managers (and 0 were cardiologists "
           "or relatives).", fs=22, color=INK)
    row = _glance["Riskiest claim and its test"]
    test = row[row.index("Test by Oct 23"):]
    f.panel(md2(test), fs=33, fill=GREY_FAINT, color=INK, label="THE TEST", label_color=INK, pad=40)
    h, rows = first_table(VERDICT4)
    assert rows[0][0] == "1" and rows[0][1].startswith("Price card")
    f.h2("What we ask each manager (test 1)", fs=33)
    f.text(md2(rows[0][1]), fs=22)
    f.h2("Why this is the riskiest claim", fs=33)
    u1 = starting(UNPROVEN, "1. ")[3:]
    v5 = re.search(r"\*\*(The main risk is price, not technology\.)\*\*", "\n".join(VERDICT5)).group(1)
    why = [
        "Step 4.4, unproven #1: " + md2(u1),
        "Step 4 (deck A3): saved staff time only breaks even at $500 a year, so FamGenix's $500-a-year clinician license "
        "[111] sets our price; the pilot has to show time saved or clinical value.",
        "Step 3: " + md2("The old parts lower the risk of the business model but also mean the buyer already has cheap "
                         "substitutes, which is why price is the riskiest assumption."),
        "Configuration: " + md2(re.search(r"\*\*(The weak joint is[^*]+)\*\*", starting(CONFIG, "**Why these choices")).group(1)),
        "Step 5 verdict: " + md2(v5),
        "If it fails: fewer than 3 of 5 cardiology managers naming a budget owner by Oct 23 means we run the same five "
        "calls with primary care practice managers (see the Wedge frame).",
    ]
    f.text("<br/>".join("• " + w for w in why), fs=22)
    return f.finish4()


# ------------------------------------------------------------------ header (replacement of hdrv2, created last)
MAP = [("Step 1 canvas", "bmc1"), ("Why each Post-it", "why1"), ("Step 2", "s2a"), ("Step 3", "s3v2"),
       ("Mockup screens", "mock"), ("Step 4", "s4a"), ("Step 4 verdict", "s4v"), ("Step 5", "s5av2"),
       ("Step 5 verdict", "s5v"), ("Business logic", "logic5"), ("Configuration", "config5"), ("Wedge", "wedge5"),
       ("Riskiest claim", "risk5"), ("Choices and open items", "choices"), ("Sources", "srcv2_1")]
# frames kept from earlier passes; a key replaced in this pass falls back to the old frame only until it exists
FALLBACK = dict(gen4.OLD_IDS, logic5=gen4.OLD_IDS["logic"], config5=gen4.OLD_IDS["config"],
                wedge5=gen4.OLD_IDS["wedge"], risk5=gen4.OLD_IDS["risk"])


def glance_counts():
    """Post-it tags per the VCA canvas tables (88: 2 N, 17 N/O, 69 O on Oct 12)."""
    tot = {"N": 0, "N/O": 0, "O": 0}
    for box in ("Customer Segments", "Value Propositions", "Channels", "Customer Relationships", "Revenue Streams",
                "Key Resources", "Key Activities", "Key Partnerships", "Cost Structure"):
        _, rows = first_table(section("### " + box))
        for r in rows:
            if r[0]:
                tot[r[2]] += 1
    return tot


def f_header5(links):
    W = 12200
    f = B4("hdrv3", "Header · Team 709 · Stemma", W)
    p = f.pad
    LW = 5200
    GW = 2000
    AX = p + LW + 96 + GW + 96
    AW = W - AX - p
    y = p
    y += f.textarea("<b>Team 709 · Stemma, the family health tree</b>", p, y, LW, 90, INK, True, headroom=False) + 10
    y += f.textarea("<b>Value Creation Analysis (Milestone 4)</b>", p, y, LW, 67, BLUE["dark"], True, headroom=False) + 24
    y += f.textarea("TECH 5900 Product Studio · Section 7 · Raj Kashikar · Viha Srinivas · Unser Jaffry", p, y, LW, 33, INK) + 10
    y += f.textarea("Oral review with our coach Oct 12–23, 2026 · one PDF due Oct 23, 2026 · analysis drafted Oct 6, 2026, "
                    "revised after review and aligned with the final Maker Day 2 deck on Oct 12", p, y, LW, 22, BODY) + 20
    prod_md = starting(V, "**The product in one line.**")
    cut = " Live prototype, synthetic data only: " + NEW_URL
    assert prod_md.endswith(cut)
    y += f.textarea(md2(prod_md[:-len(cut)]), p, y, LW, 22, BODY) + 14
    y += f.textarea(f"<b>Live prototype, synthetic data only:</b> {NEW_URL}", p, y, LW, 22, INK) + 14
    how = starting(V, "**How to read this.**")
    old = ('`[S#]` is a source opened for the pitch work (Oct 6, 2026), and `[N#]` one opened on Oct 12, 2026 for the '
           '"any doctor" question or the 23andMe tree audit. All three lists, with URLs, are at the end.')
    assert old in how
    how = how.replace(old, "`[S#]` is a source opened for the pitch work (Oct 6, 2026). Both lists, with URLs, are in the "
                           "three Sources frames (see the board map).")
    how = how.replace("Where this file quotes", "Where this board quotes")
    y += f.textarea(md2(how), p, y, LW, 20, BODY) + 14
    parts = []
    for lab, key in MAP:
        wid = links.get(key) or FALLBACK.get(key) or "0000000000000000000"
        parts.append(f'<a href="{BOARD}?moveToWidget={wid}">{lab}</a>')
    y += f.textarea("<b>Board map:</b> " + " · ".join(parts), p, y, LW, 22, INK, eid="hdrv3-map") + 10
    left_h = y
    gx = p + LW + 96
    yy = p
    yy += f.textarea("<b>Legend</b>", gx, yy, GW, 33, INK, True) + 16
    tot = glance_counts()
    assert tot == {"N": 2, "N/O": 17, "O": 69}, tot  # deck A1 and A5: 88 canvas notes
    for t in ("O", "N/O", "N"):
        f.rect(gx, yy, 80, 80, SWATCH[t])
        f.textarea(f"<b>[{t}] = {TAGNAME[t]}</b><br/>{tot[t]} Post-its", gx + 104, yy + 9, GW - 104, 22, INK, headroom=False)
        yy += 80 + 20
    f.circle(gx + 40, yy + 40, 18, RED["medium"])
    f.textarea("<b>Red dot</b> = the Post-it rests on an untested assumption (6 Post-its)", gx + 104, yy + 9, GW - 104, 22, INK, headroom=False)
    yy += 80 + 24
    yy += f.textarea("Each Post-it reads: sub-group rank [tag] text. Ranks restart at 1 in each sub-group and follow order of preference. Tags follow the course: N = new, O = old, N/O = some of each.", gx, yy, GW, 20, BODY) + 10
    leg_h = yy
    _, rows = md_table(GLANCE)
    for r in rows:  # the VCA's writing rule, not board text; the board says what is built instead
        r[1] = r[1].replace(" Never \"criteria for any physician\".", "")
    assert len(rows) == 9 and rows[-1][0] == "<b>Riskiest claim and its test</b>", [r[0] for r in rows]
    f.y = p
    f.mtable(["At a glance", ""], rows, widths([0.7, 3.7], AW), fs=22, x=AX, zebra=True, cell_pad=10)
    glance_h = f.y
    f.y = max(left_h, leg_h, glance_h) + 16
    return f.finish4(extra=32)


# ------------------------------------------------------------------ layout
X5 = 16480     # column of replacement frames, below s5bv2 (ends at y 19856)
Y5 = 20000
GAP = 160
ORDER = ("logic5", "config5", "wedge5", "risk5")
HDR_X, HDR_Y, HDR_BOTTOM = 12360, 7600, 8600 - GAP   # above hdrv2 (12360, 8600)
DRAG = {"logic5": (0, 20878), "config5": (6180, 20878), "wedge5": (0, 22793), "risk5": (8240, 22793), "hdrv3": (0, 8600)}


def build(links=None):
    fr = {"logic5": f_logic5(), "config5": f_config5(), "wedge5": f_wedge5(), "risk5": f_risk5(),
          "hdrv3": f_header5(links or {})}
    return fr


def positions(fr):
    pos = {}
    y = Y5
    for k in ORDER:
        pos[k] = (X5, y)
        y += fr[k].h + GAP
    hy = HDR_Y if HDR_Y + fr["hdrv3"].h <= HDR_BOTTOM else HDR_BOTTOM - fr["hdrv3"].h
    pos["hdrv3"] = (HDR_X, hy)
    # once the old header is deleted, the new one must still end above the first content row (y 9644)
    assert DRAG["hdrv3"][1] + fr["hdrv3"].h <= gen4.YC - 100, fr["hdrv3"].h
    # wedge5 dragged to (0, 22793) must end above Sources (1 of 3) at (0, 24664); logic5 above wedge5
    assert DRAG["wedge5"][1] + fr["wedge5"].h <= 24664 - 100, fr["wedge5"].h
    assert DRAG["logic5"][1] + fr["logic5"].h <= DRAG["wedge5"][1] - 100, fr["logic5"].h
    assert DRAG["risk5"][1] + fr["risk5"].h <= 24664 - 100 and DRAG["config5"][1] + fr["config5"].h <= DRAG["risk5"][1] - 100
    return pos


def write(fr, pos, key):
    f = fr[key]
    x, y = pos[key]
    s = '<svg xmlns="http://www.w3.org/2000/svg">\n' + f.svg(x, y) + "\n</svg>"
    fn = os.path.join(D, f"c5_{key}.svg")
    open(fn, "w").write(s)
    return fn, s


if __name__ == "__main__":
    lp = os.path.join(D, "links5.json")
    links = dict(json.load(open(os.path.join(D, "..", "miro4", "links.json"))))
    if os.path.exists(lp):
        links.update(json.load(open(lp)))
    fr = build(links)
    pos = positions(fr)
    for k in fr:
        fn, s = write(fr, pos, k)
        bad = [w for w in BANNED if w in s] + [r for r in BANNED_RE if re.search(r, s)]
        n = gen4.n_items(fr[k])
        print(f"{k:8s} pos={pos[k]} w={fr[k].w} h={fr[k].h} items={n} chars={len(s)} {bad}{'  <-- OVER' if n > 60 else ''}")
