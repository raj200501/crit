"""Overrides and additions to frames.py for the second build (layout around a central canvas)."""
from frames import *  # noqa
import frames as F0
from content import L, md, table, BOXES, counts, NEW_URL
from fb import FB, INK, BODY, BLUE, YELLOW, RED, GREY_FAINT, GREY_EDGE, GREY_LINE


def f_3w(W):
    f = FB("s3", "Step 3 · What's new and what's old", W)
    f.header("STEP 3", "What's new and what's old",
             sub="The tag on every Post-it of the canvas above, counted per box.")
    p = f.pad
    G = 64
    LW = int((f.inner - G) * 0.47)
    RW = f.inner - G - LW
    y0 = f.y
    f.text(md(L(253)), fs=22, x=p, w=LW)
    h, rows = F0.mdt(255, 266)
    f.table(h, rows, F0.widths([3, 1, 1, 1, 1], LW), fs=22, x=p, bold_rows=(len(rows) - 1,),
            head_fills=[None, F0.SWATCH["N"], F0.SWATCH["N/O"], F0.SWATCH["O"], None])
    yl = f.y
    f.y = y0
    rx = p + LW + G
    f.text("<b>Where the new sits</b>", fs=33, color=INK, bold=True, gap=16, x=rx, w=RW)
    f.text(F0.bullets([L(269), L(270), L(271)]), fs=22, x=rx, w=RW)
    f.panel(md(L(273)), fs=22, fill=YELLOW["light"], color=INK, x=rx, w=RW)
    f.y = max(yl, f.y)
    return f.finish()


def f_wedge2(W):
    f = FB("wedge", "Wedge (now) vs vision (later)", W)
    f.header("WEDGE", "The wedge (now) is smaller than the vision (later)")
    p = f.pad
    VX, VY, VW = p, f.y, f.inner
    vid = f.nid("vis")
    vidx = len(f.els)
    f.els.append(None)  # vision panel, sized below
    f.textarea("<b>VISION (LATER): where growth has to come from</b>", VX + 48, VY + 40, VW - 96, 33, BLUE["dark"], True)
    h, rows = F0.mdt(539, 545)
    top = VY + 40 + 47 + 32
    # wedge box, left
    WX, WW = VX + 48, 1040
    widx = len(f.els)
    f.els.append(None)
    yy = top + 40
    yy += f.textarea("<b>WEDGE (NOW)</b>", WX + 40, yy, WW - 80, 33, YELLOW["dark"], True) + 16
    r0 = rows[0]
    body = (f"<b>{r0[0]}</b><br/>{r0[1]}<br/>Trigger to move on: {r0[2]}<br/><br/>"
            "NYC's 285–320 independent cardiologists (re-run Oct 6 [S27]) are worth $142–160k a year at $500.")
    yy += f.textarea(body, WX + 40, yy, WW - 80, 22, INK) + 40
    wbot = yy
    f.els[widx] = f'<rect id="{f.nid("wbox")}" x="{WX}" y="{top}" width="{WW}" height="{wbot - top}" fill="{YELLOW["light"]}" stroke="none" rx="24" />'
    # stage cards, right
    SX = WX + WW + 64
    SWD = VX + VW - 48 - SX
    yy = top
    for i, r in enumerate(rows[1:]):
        cidx = len(f.els)
        f.els.append(None)
        b = f"<b>{r[0]}</b>: {r[1]}<br/>Trigger to move on: {r[2]}"
        hh = f.textarea(b, SX + 28, yy + 20, SWD - 56, 22, INK)
        f.els[cidx] = f'<rect id="{f.nid("card")}" x="{SX}" y="{yy}" width="{SWD}" height="{hh + 40}" fill="#ffffff" stroke="none" rx="12" />'
        yy += hh + 40 + 20
    mk = ("<b>Market check.</b> US independent cardiology (7,699 cardiologists in organizations of 100 or fewer clinicians, "
          "a proxy that includes some hospital practices [99]) is worth <b>$3.8M a year at $500</b>, or $9.1–13.8M at $99–149 a month "
          "[research §4.4]. NYC is a pilot market, independent cardiology is a wedge, and growth has to come from larger groups, "
          "health-system clinics and primary care.")
    yy += 12
    yy += f.textarea(mk, SX, yy, SWD, 22, INK)
    vbot = max(yy, wbot) + 48
    f.els[vidx] = f'<rect id="{vid}" x="{VX}" y="{VY}" width="{VW}" height="{vbot - VY}" fill="{BLUE["faint"]}" stroke="none" rx="24" />'
    f.y = vbot + 48
    f.h2("The wedge, made specific")
    f.text(F0.bullets([L(i) for i in range(527, 536)]), fs=22)
    return f.finish()


def f_wscore2(W):
    f = FB("wscore", "Why this wedge: scoring", W)
    f.header("WEDGE", "Why this wedge: scoring")
    f.text(md(L(510).lstrip("# ")), fs=22, color=INK)
    h, rows = F0.mdt(512, 519)
    f.table(h, rows, F0.widths([3.2, 1, 1, 1.1, 1.1, 1, 1.1, 1.1], f.inner), fs=22, bold_rows=(0,))
    f.text(md(L(521)), fs=22)
    f.text(md(L(523)), fs=22)
    return f.finish()
