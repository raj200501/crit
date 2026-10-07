import math
from content import L, md, table, BOXES, counts, NEW_URL
from fb import FB, INK, BODY, BLUE, YELLOW, RED, GREY_FAINT, GREY_EDGE, GREY_LINE, est_text_h, MEASURED

STICKY = {"O": "light_yellow", "N/O": "light_blue", "N": "orange"}
SWATCH = {"O": "#fff9b1", "N/O": "#a6ccf5", "N": "#ff9d48"}
TAGNAME = {"O": "old", "N/O": "some of each", "N": "new"}


def widths(weights, total):
    s = sum(weights)
    ws = [int(total * w / s) for w in weights]
    ws[-1] += total - sum(ws)
    return ws


def mdt(a, b):
    h, rows = table(a, b)
    return [md(c) for c in h], [[md(c) for c in r] for r in rows]


def bullets(lines, numbered=False):
    out = []
    for ln in lines:
        s = ln.strip()
        if s.startswith("- "):
            s = "• " + s[2:]
        out.append(md(s))
    return "<br/>".join(out)


def strip_lead(s, lead):
    assert s.startswith(lead), (s[:60], lead)
    return s[len(lead):]


# ------------------------------------------------------------------ header
def f_header(W):
    f = FB("hdr", "Header · Team 709 · Stemma", W)
    p = f.pad
    LW = 5200
    GW = 2000
    AX = p + LW + 96 + GW + 96
    AW = W - AX - p
    y = p
    y += f.textarea("<b>Team 709 · Stemma, the family health tree</b>", p, y, LW, 90, INK, True) + 10
    y += f.textarea("<b>Value Creation Analysis (Milestone 4)</b>", p, y, LW, 67, BLUE["dark"], True) + 24
    y += f.textarea("TECH 5900 Product Studio · Section 7 · Raj Kashikar · Viha Srinivas · Unser Jaffry", p, y, LW, 33, INK) + 10
    y += f.textarea("Oral review with our coach Oct 12–23, 2026 · one PDF due Oct 23, 2026 · analysis as drafted Oct 6, 2026 (revised after review)", p, y, LW, 22, BODY) + 24
    prod = md(L(8))
    prod = prod.replace("Live prototype, synthetic data only: https://family-health-tree-raj-s-projects12.vercel.app", "")
    y += f.textarea(prod.strip(), p, y, LW, 22, BODY) + 16
    y += f.textarea(f"<b>Live prototype, synthetic data only:</b> {NEW_URL}", p, y, LW, 22, INK) + 16
    how = md(L(6)).replace("Both lists, with URLs, are at the end.", "Both lists, with URLs, are in the Sources panel at the bottom of this board.")
    y += f.textarea(how, p, y, LW, 18, BODY) + 10
    left_h = y

    # legend
    gx = p + LW + 96
    yy = p
    yy += f.textarea("<b>Legend</b>", gx, yy, GW, 33, INK, True) + 16
    c = counts()
    tot = {"N": 0, "N/O": 0, "O": 0}
    for k in c:
        for t in c[k]:
            tot[t] += c[k][t]
    for t in ("O", "N/O", "N"):
        f.rect(gx, yy, 80, 80, SWATCH[t], eid=f"hdr-sw-{t.replace('/', '')}")
        f.textarea(f"<b>[{t}] = {TAGNAME[t]}</b><br/>{tot[t]} Post-its", gx + 104, yy + 4, GW - 104, 22, INK)
        yy += 80 + 20
    f.circle(gx + 40, yy + 40, 18, RED["medium"], eid="hdr-dot")
    f.textarea("<b>Red dot</b> = the Post-it rests on an untested assumption (6 Post-its)", gx + 104, yy + 4, GW - 104, 22, INK)
    yy += 80 + 24
    yy += f.textarea("Each Post-it reads: sub-group rank [tag] text. Ranks restart at 1 in each sub-group and follow order of preference. Tags follow the course: N = new, O = old, N/O = some of each.", gx, yy, GW, 18, BODY) + 10
    leg_h = yy

    # at a glance
    hdr, rows = mdt(14, 22)
    ws = widths([1, 3.4], AW)
    f.y = p
    f.table(["At a glance", ""], rows, ws, fs=22, x=AX, zebra=True)
    glance_h = f.y
    f.y = max(left_h, leg_h, glance_h) + 32
    return f.finish()


# ------------------------------------------------------------------ BMC
def pack(groups, C):
    """Place items in bands of C columns. A group starts mid-band only if it fits or >=2 cols remain."""
    bands = []
    col = C
    for gi, g in enumerate(groups):
        n = len(g["items"])
        rem = C - col
        if not (rem >= n or rem >= 2):
            bands.append({"labels": [], "cells": []})
            col = 0
        first = True
        for it in g["items"]:
            if col >= C:
                bands.append({"labels": [], "cells": []})
                col = 0
            if first:
                span = min(n, C - col)
                bands[-1]["labels"].append((col, span, g["label"]))
                first = False
            bands[-1]["cells"].append((col, g["prefix"], it))
            col += 1
    return bands


def f_bmc(SW=199, SH=228, ZC=4):
    W = 2*64 + 5*(ZC*(SW+20)-20+64) + 4*20
    f = FB("bmc", "Step 1 · Business Model Canvas", W)
    f.header("STEP 1", "Business Model Canvas",
             sub="Every Post-it from the analysis (88), written as sub-group rank [tag] text and placed in rank order inside its sub-group. "
                 "Color shows the Step 3 tag: light yellow = O (old), light blue = N/O (some of each), orange = N (new). "
                 "A red dot marks a Post-it that rests on an untested assumption.")
    top = f.y
    p = f.pad
    SG = 20
    ZP = 32
    ZG = 20
    LABFS = 20
    c = counts()

    def zone_natural(key, C):
        bands = pack(BOXES[key]["groups"], C)
        h = ZP + 46 + 8 + 30 + 24  # title + count line
        bh = []
        for b in bands:
            lh = 0
            for (col, span, lab) in b["labels"]:
                lh = max(lh, est_text_h(f"<b>{lab}</b>", LABFS, span * (SW + SG) - SG, True))
            bh.append(lh)
            h += lh + 8 + SH + 24
        h += ZP - 24
        return h, bands, bh

    def draw_zone(key, zx, zy, zw, zh, C):
        nat, bands, bh = zone_natural(key, C)
        b = BOXES[key]
        f.rect(zx, zy, zw, zh, GREY_FAINT, eid=f"bmc-z-{key}")
        cc = c[key]
        n = sum(cc.values())
        f.textarea(f"<b>{b['title']}</b>", zx + ZP, zy + ZP - 6, zw - 2 * ZP, 33, INK, True, eid=f"bmc-zt-{key}")
        f.textarea(f"{n} Post-its · N {cc['N']} · N/O {cc['N/O']} · O {cc['O']}", zx + ZP, zy + ZP + 46 + 4, zw - 2 * ZP, 20, BODY, eid=f"bmc-zc-{key}")
        y = zy + ZP + 46 + 8 + 30 + 24
        dots = []
        for bi, band in enumerate(bands):
            for (col, span, lab) in band["labels"]:
                f.textarea(f"<b>{lab}</b>", zx + ZP + col * (SW + SG), y, span * (SW + SG) - SG, LABFS, BLUE["dark"], True,
                           eid=f"bmc-l-{key}-{bi}-{col}")
            sy = y + bh[bi] + 8
            for (col, prefix, it) in band["cells"]:
                sx = zx + ZP + col * (SW + SG)
                txt = f"<b>{prefix} {it['rank']} [{it['tag']}]</b> {md(it['text'])}"
                sid = f"bmc-s-{key}-{prefix.replace(' ', '')}-{it['rank']}"
                f.sticky(sx, sy, STICKY[it["tag"]], txt, eid=sid, w=SW, h=SH)
                if it["untested"]:
                    dots.append((sx + SW - 26, sy + 26, sid))
            y = sy + SH + 24
        for (dx, dy, sid) in dots:
            f.circle(dx, dy, 16, RED["medium"], eid=f"{sid}-dot")
        return nat

    ZW = ZC*(SW+SG)-SG+2*ZP
    xs = [p + i * (ZW + ZG) for i in range(5)]
    hKP, _, _ = zone_natural("KP", ZC)
    hKA, _, _ = zone_natural("KA", ZC)
    hKR, _, _ = zone_natural("KR", ZC)
    hVP, _, _ = zone_natural("VP", ZC)
    hCR, _, _ = zone_natural("CR", ZC)
    hCH, _, _ = zone_natural("CH", ZC)
    hCS, _, _ = zone_natural("CS", ZC)
    H = max(hKP, hKA + ZG + hKR, hVP, hCR + ZG + hCH, hCS)
    draw_zone("KP", xs[0], top, ZW, H, 4)
    draw_zone("KA", xs[1], top, ZW, hKA, 4)
    draw_zone("KR", xs[1], top + hKA + ZG, ZW, H - hKA - ZG, 4)
    draw_zone("VP", xs[2], top, ZW, H, 4)
    draw_zone("CR", xs[3], top, ZW, hCR, 4)
    draw_zone("CH", xs[3], top + hCR + ZG, ZW, H - hCR - ZG, 4)
    draw_zone("CS", xs[4], top, ZW, H, 4)
    by = top + H + ZG
    RSC = 8 if ZC == 4 else 2*ZC
    total = 5 * ZW + 4 * ZG
    rw = RSC * (SW + SG) - SG + 2 * ZP
    cw = total - ZG - rw
    ccols = (cw - 2 * ZP + SG) // (SW + SG)
    hCO, _, _ = zone_natural("CO", ccols)
    hRS, _, _ = zone_natural("RS", RSC)
    HB = max(hCO, hRS)
    draw_zone("CO", p, by, cw, HB, ccols)
    draw_zone("RS", p + cw + ZG, by, rw, HB, RSC)
    f.y = by + HB + 32
    return f.finish()


# ------------------------------------------------------------------ Step 2
CHIP2 = "STEP 2 · POINTS OF COMPARISON"


def f_2a(W):
    f = FB("s2a", "Step 2a · Next best option", W)
    f.header(CHIP2, "2a. Our customers' next best option")
    h, rows = mdt(194, 203)
    f.table(h, rows, widths([1.25, 3.1, 1.7, 3.6], f.inner))
    return f.finish()


def f_2b(W):
    f = FB("s2b", "Step 2b · Closest operations: Phreesia", W)
    f.header(CHIP2, "2b. The organization whose operations are closest to ours: Phreesia")
    f.text(md(L(207)), fs=22)
    h, rows = mdt(209, 217)
    f.table(h, rows, widths([2.3, 1.7, 1.4, 1.2, 1.4, 0.9, 1.5], f.inner), head_fills=[None, YELLOW["light"], None, None, None, None, None])
    f.panel(md(L(219)), fs=22, fill=YELLOW["light"], color=INK)
    h, rows = mdt(221, 228)
    f.table(h, rows, widths([1, 1, 1], f.inner))
    f.text(md(L(230)), fs=22)
    f.text(md(L(232)), fs=22)
    return f.finish()


def f_2c(W):
    f = FB("s2c", "Step 2c · Other industries", W)
    f.header(CHIP2, "2c. Other industries where this business model already works")
    f.panel(md(L(247)), fs=33, fill=YELLOW["light"], color=INK)
    h, rows = mdt(236, 243)
    f.table(h, rows, widths([0.9, 1.3, 1.5, 1.5, 1.8, 1.4], f.inner))
    f.text(md(L(245)), fs=22)
    return f.finish()


# ------------------------------------------------------------------ Step 3
def f_3(W):
    f = FB("s3", "Step 3 · What's new and what's old", W)
    f.header("STEP 3", "What's new and what's old")
    f.text(md(L(253)), fs=22)
    h, rows = mdt(255, 266)
    f.table(h, rows, widths([3, 1, 1, 1, 1], f.inner), fs=22, bold_rows=(len(rows) - 1,),
            head_fills=[None, SWATCH["N"], SWATCH["N/O"], SWATCH["O"], None])
    f.h2("Where the new sits")
    f.text(bullets([L(269), L(270), L(271)]), fs=22)
    f.panel(md(L(273)), fs=22, fill=YELLOW["light"], color=INK)
    return f.finish()


# ------------------------------------------------------------------ Step 4
CHIP4 = "STEP 4 · WILL PEOPLE BUY IT?"


def f_4a(W):
    f = FB("s4a", "Step 4a · Net benefit", W)
    f.header(CHIP4, "4.1 Net benefit against each stakeholder's next best option")
    h, rows = mdt(281, 286)
    f.table(h, rows, widths([1.0, 2.0, 2.7, 2.6, 1.0], f.inner))
    f.h2("4.2 Scored version (team judgment, +2 to −2 against each stakeholder's next best option)")
    h, rows = mdt(290, 299)
    f.table(h, rows, widths([2.3, 1, 1, 1.3, 1.7], f.inner), bold_rows=(6, 7))
    f.text(md(L(301)), fs=22)
    return f.finish()


def f_4b(W):
    f = FB("s4b", "Step 4b · Evidence", W)
    f.header(CHIP4, "4.3 Evidence")
    h, rows = mdt(305, 319)
    f.table(h, rows, widths([1.7, 3.6, 1.7, 1.6], f.inner), bold_rows=(len(rows) - 1,))
    f.text(md(L(321)), fs=22)
    f.text(md(L(323)), fs=22)
    return f.finish()


def f_4c(W):
    f = FB("s4c", "Step 4c · Unproven, and the tests", W)
    f.header(CHIP4, "4.4 What is still unproven, and the cheapest tests")
    f.h2("What is still unproven (ranked)")
    f.text("<br/>".join(md(L(i)) for i in range(327, 334)), fs=22)
    f.h2("Cheapest tests, in order")
    h, rows = mdt(341, 349)
    f.table(h, rows, widths([0.3, 3.8, 2.6, 1.1], f.inner), first_col_bold=True)
    return f.finish()


def f_4v(W):
    f = FB("s4v", "Step 4 · Verdict", W)
    f.header("STEP 4 · VERDICT", "Will people buy it?")
    s = L(337)
    lead = "**Use: yes, if the practice sends the link. Buy: not yet shown.** "
    rest = strip_lead(s, lead)
    f.panel("<b>Use: yes, if the practice sends the link. Buy: not yet shown.</b>", fs=67, fill=YELLOW["light"], color=INK, bold=True, label="VERDICT", pad=48)
    f.text(md(rest), fs=33, color=INK)
    # the net row of 4.2, verbatim, as the scoreboard behind the verdict
    h, rows = mdt(290, 299)
    net = rows[-1]
    f.h2("Net against the next best option (from 4.2)", fs=33)
    f.table(["Patient", "Relative", "Clinician", "Practice"], [net[1:]], widths([1, 1, 1, 1], f.inner), fs=22, first_col_bold=False, zebra=False)
    return f.finish()


# ------------------------------------------------------------------ Step 5
CHIP5 = "STEP 5 · CAN WE MAKE IT?"


def f_5a(W):
    f = FB("s5a", "Step 5a · Technical feasibility", W)
    f.header(CHIP5, "5.1 Technical feasibility")
    f.text(md(L(357)), fs=22, color=INK)
    h, rows = mdt(359, 366)
    f.table(h, rows, widths([3, 2.2], f.inner))
    f.text(md(L(368)), fs=22, color=INK)
    h, rows = mdt(370, 377)
    f.table(h, rows, widths([0.25, 2, 1.8, 2.4], f.inner))
    f.panel(md(L(379)), fs=33, fill=YELLOW["light"], color=INK)
    return f.finish()


def f_5b(W):
    f = FB("s5b", "Step 5b · Operational feasibility", W)
    f.header(CHIP5, "5.2 Operational feasibility")
    h, rows = mdt(383, 387)
    f.table(h, rows, widths([1.2, 2.2, 2.6], f.inner))
    bl = [L(i) for i in range(389, 395)]
    bl = [b.replace(' Never "HIPAA compliant" or "certified" [55][39].', '') for b in bl]
    assert not any("compliant" in b for b in bl)
    f.text(bullets(bl), fs=22)
    f.text(md(L(395).lstrip("- ")), fs=22, color=INK)
    h, rows = mdt(397, 404)
    f.table(h, rows, widths([0.6, 3, 1.3], f.inner))
    f.panel(md(L(406)), fs=33, fill=YELLOW["light"], color=INK)
    return f.finish()


def f_5c(W):
    f = FB("s5c", "Step 5c · Financials: costs and break-even", W)
    f.header(CHIP5, "5.3 Financials: revenue against operating costs")
    f.text(md(L(410)), fs=22, color=INK)
    h, rows = mdt(412, 423)
    f.table(h, rows, widths([2.6, 0.6, 0.6, 3.1], f.inner), bold_rows=(len(rows) - 1,))
    f.text(md(L(425)), fs=22)
    f.text(md(L(427)), fs=22, color=INK)
    h, rows = mdt(429, 434)
    f.table(h, rows, widths([1.7, 2.4, 1.2, 1.3], f.inner), bold_rows=(1,))
    f.text(md(L(436)), fs=22, color=INK)
    h, rows = mdt(438, 443)
    f.table(h, rows, widths([3, 1.2, 1, 1], f.inner), bold_rows=(0,))
    f.text(md(L(445)), fs=22)
    return f.finish()


def f_5d(W):
    f = FB("s5d", "Step 5d · Year 1 and market check", W)
    f.header(CHIP5, "5.3 Financials: year 1 and market check")
    f.text(md(L(447)), fs=22, color=BODY)
    h, rows = mdt(449, 453)
    f.table(h, rows, widths([0.6, 3, 1, 1.4], f.inner))
    f.text(md(L(455)), fs=22)
    f.text(md(L(457)), fs=22)
    f.panel(md(L(459)), fs=22, fill=YELLOW["light"], color=INK)
    return f.finish()


def f_5v(W):
    f = FB("s5v", "Step 5 · Verdict", W)
    f.header("STEP 5 · VERDICT", "Can we make it?")
    s = L(463)
    lead = "**Yes at pilot scale (1–3 practices, from about January 2027); not yet a business that pays salaries.** "
    rest = strip_lead(s, lead)
    f.panel("<b>Yes at pilot scale (1–3 practices, from about January 2027); not yet a business that pays salaries.</b>", fs=67, fill=YELLOW["light"], color=INK, bold=True, label="VERDICT", pad=48)
    f.text(md(rest), fs=33, color=INK)
    return f.finish()


# ------------------------------------------------------------------ conclusions
def f_logic(W):
    f = FB("logic", "Central business logic", W)
    f.header("CENTRAL BUSINESS LOGIC", "Central business logic")
    s1 = L(469).lstrip("> ").strip()
    s2 = L(471).lstrip("> ").strip()
    f.panel(md(s1), fs=67, fill=YELLOW["light"], color=INK, pad=48, gap=24)
    f.panel(md(s2), fs=67, fill=YELLOW["light"], color=INK, pad=48)
    t = L(473)
    t = t[t.index('"Take it from memory"'):]
    f.text(md(t), fs=22)
    f.h2("Each clause and its evidence")
    h, rows = mdt(475, 484)
    f.table(h, rows, widths([2, 4, 2.4], f.inner))
    return f.finish()


def f_config(W):
    f = FB("config", "Configuration most likely to succeed", W)
    f.header("CONFIGURATION", "The configuration most likely to succeed")
    h, rows = mdt(492, 502)
    f.table(h, rows, widths([1, 3.4, 2.4], f.inner))
    f.panel(md(L(504)), fs=22, fill=YELLOW["light"], color=INK)
    return f.finish()


def f_risk(W):
    f = FB("risk", "Riskiest claim and its test", W)
    f.header("RISKIEST CLAIM", "Our riskiest claim, and its test")
    f.panel("<b>A practice manager will pay.</b>", fs=67, fill=RED["faint"], color=INK, bold=True, label="RISKIEST CLAIM", label_color=RED["dark"], pad=48)
    row = L(22)
    test = row.split("| A practice manager will pay. ")[1].rstrip(" |")
    f.panel(md(test), fs=33, fill=GREY_FAINT, color=INK, label="THE TEST", label_color=INK, pad=40)
    h, rows = mdt(341, 349)
    f.h2("What we ask each manager (test 1)", fs=33)
    f.text(rows[0][1], fs=22)
    f.h2("Why this is the riskiest claim", fs=33)
    why = [
        "Step 4.4, unproven #1: " + md(L(327)[3:]),
        "Step 3: " + md("The old parts lower the risk of the business model but also mean the buyer already has cheap substitutes, which is why price is the riskiest assumption."),
        "Configuration: " + md("The weak joint is the same in every box: no practice has said it will pay."),
        "Step 5 verdict: " + md("The main risk is price, not technology."),
    ]
    f.text("<br/>".join("• " + w for w in why), fs=22)
    return f.finish()


def f_wedge(W):
    f = FB("wedge", "Wedge (now) vs vision (later)", W)
    f.header("WEDGE", "The wedge (now) is smaller than the vision (later)")
    p = f.pad
    # drawing: vision area with the wedge circle inside it
    VX, VY = p, f.y
    VW = f.inner
    VH = 1180
    f.rect(VX, VY, VW, VH, BLUE["faint"], rx=24, eid="wedge-vision")
    f.textarea("<b>VISION (LATER)</b>", VX + 48, VY + 40, 1400, 33, BLUE["dark"], True, eid="wedge-vlabel")
    h, rows = mdt(539, 545)
    stages = rows[1:]  # stages 2,3,4, side door
    sx = VX + 48 + 760 + 80
    sw = VW - (sx - VX) - 48
    yy = VY + 40 + 60
    for r in stages:
        body = f"<b>{r[0]}</b>: {r[1]}<br/>Trigger to move on: {r[2]}"
        hh = f.textarea(body, sx + 28, yy + 20, sw - 56, 22, INK, eid=f"wedge-st-{stages.index(r)}")
        f.els.insert(len(f.els) - 1, f'<rect id="wedge-stb-{stages.index(r)}" x="{sx}" y="{yy}" width="{sw}" height="{hh + 40}" fill="#ffffff" stroke="none" rx="12" />')
        yy += hh + 40 + 20
    mk = md(L(457))
    f.textarea("<b>Market check</b><br/>US independent cardiology (7,699 cardiologists in organizations of 100 or fewer clinicians, a proxy that includes some hospital practices [99]) is worth <b>$3.8M a year at $500</b>, or $9.1–13.8M at $99–149 a month [research §4.4].",
               sx, yy + 10, sw, 22, BODY, eid="wedge-mk")
    # wedge circle: visibly smaller
    R = 330
    cx, cy = VX + 48 + R + 40, VY + 120 + R + 20
    f.circle(cx, cy, R, YELLOW["light"], eid="wedge-circle")
    f.textarea(f"<b>WEDGE (NOW)</b><br/><b>1. Pilot (from about Jan 2027)</b><br/>{rows[0][1]}<br/>Trigger to move on: {rows[0][2]}<br/><br/>NYC's 285–320 independent cardiologists (re-run Oct 6 [S27]) are worth $142–160k a year at $500.",
               cx - R + 90, cy - R + 110, 2 * R - 180, 22, INK, align="center", eid="wedge-ctext")
    f.y = VY + VH + 48
    f.h2("The wedge, made specific")
    f.text(bullets([L(i) for i in range(527, 536)]), fs=22)
    return f.finish()


def f_wscore(W):
    f = FB("wscore", "Why this wedge: scoring", W)
    f.header("WEDGE", "Why this wedge: scoring")
    f.text(md(L(510).lstrip("# ")), fs=22, color=INK)
    h, rows = mdt(512, 519)
    f.table(h, rows, widths([3.2, 1, 1, 1.1, 1.1, 1, 1.1, 1.1], f.inner), fs=22, bold_rows=(0,))
    f.text(md(L(521)), fs=22)
    f.text(md(L(523)), fs=22)
    f.h2("Expansion path")
    h, rows = mdt(539, 545)
    f.table(h, rows, widths([1.5, 2.6, 2.4], f.inner), fs=22)
    return f.finish()


# ------------------------------------------------------------------ mockups
def f_mock(W):
    f = FB("mock", "Mockup screens", W)
    f.header("MOCKUP SCREENS", "Mockup screens",
             sub="Six screens from the live prototype (https://stemmahealth.vercel.app, synthetic data only) go in these slots. "
                 "The line under each screen names what it shows and the canvas Post-its it carries.")
    h, rows = mdt(553, 560)
    p = f.pad
    SWD = (f.inner - 64) // 2
    SHT = int(SWD * 0.625)
    y0 = f.y
    for i, r in enumerate(rows):
        col, rr = i % 2, i // 2
        x = p + col * (SWD + 64)
        if col == 0 and i > 0:
            y0 = ybot + 64
        y = y0
        y += f.textarea(f"<b>{r[0]} · {r[1]}</b>", x, y, SWD, 33, INK, True, eid=f"mock-lab-{i}") + 12
        f.rect(x, y, SWD, SHT, GREY_FAINT, stroke=GREY_LINE, sw=2, dash="5,5", content=f"Screenshot {r[0]}: {r[1]}", fs=22, tc=BODY, eid=f"mock-slot-{i}")
        y += SHT + 16
        y += f.textarea(r[2], x, y, SWD, 22, INK, eid=f"mock-cap-{i}") + 8
        y += f.textarea(f"<b>Shows:</b> {r[3]}", x, y, SWD, 22, BODY, eid=f"mock-shows-{i}")
        if col == 0:
            ybot_left = y
        else:
            ybot = max(ybot_left, y)
    f.y = ybot + 64
    return f.finish()


# ------------------------------------------------------------------ sources
def f_sources(W):
    f = FB("src", "Sources", W)
    f.header("SOURCES", "Sources",
             sub="Every [n] and [S#] marker on this board points to an entry below. Interview IDs (ID002, ID006, ID007, ID010, D021) match the Team Hub Interview Logs; (note) means the note-taker's wording.")
    entries = []
    entries.append(("head", md(L(596))))
    for i in range(598, 666):
        entries.append(("src", md(L(i)[2:])))
    entries.append(("head", md(L(667))))
    for i in range(669, 719):
        s = L(i)[2:]
        if s.startswith("[S28]"):
            s = s.replace("https://family-health-tree-raj-s-projects12.vercel.app", "Prototype now at https://stemmahealth.vercel.app")
            assert "stemmahealth" in s
        entries.append(("src", md(s)))
    entries.append(("head", md(L(720))))
    NC = 4
    G = 64
    cw = (f.inner - (NC - 1) * G) // NC
    # balance columns by estimated height
    hs = [est_text_h(e[1], 18, cw) + 8 for e in entries]
    total = sum(hs)
    target = total / NC
    cols = [[] for _ in range(NC)]
    ci, acc = 0, 0
    for e, h in zip(entries, hs):
        if acc + h / 2 > target * (ci + 1) and ci < NC - 1:
            ci += 1
        cols[ci].append(e)
        acc += h
    y0 = f.y
    ymax = y0
    for k, col in enumerate(cols):
        body = "<br/>".join(e[1] if e[0] == "src" else e[1] for e in col)
        hh = f.textarea(body, f.pad + k * (cw + G), y0, cw, 18, BODY, eid=f"src-col-{k}")
        ymax = max(ymax, y0 + hh)
    f.y = ymax + 32
    return f.finish()
