"""Frame builder: stacks headings, paragraphs, tables and panels inside a Miro frame (Canvas Composer SVG)."""
import math, re, json, os

FONT = "noto_sans"
INK = "#1a1a1a"
BODY = "#595959"
BLUE = dict(faint="#f0f5fd", light="#c6dcff", medium="#659df2", dark="#305bab")
YELLOW = dict(faint="#fffbed", light="#fff6b6", medium="#ffdc4a", dark="#af7e04")
RED = dict(faint="#fff0f0", light="#ffc6c6", medium="#ff6464", dark="#bd0a0a")
GREY_FAINT = "#f7f7f7"
GREY_EDGE = "#e7e7e7"
GREY_LINE = "#b0b0b0"

# text metrics (calibrated against the board; see calib.json)
CAL_PATH = os.path.join(os.path.dirname(__file__), "calib.json")
CAL = {"cw_reg": 0.56, "cw_bold": 0.61, "lh": 1.45, "pad": 0, "wrap": 1.06}
if os.path.exists(CAL_PATH):
    CAL.update(json.load(open(CAL_PATH)))

MEAS_PATH = os.path.join(os.path.dirname(__file__), "measured.json")
MEASURED = json.load(open(MEAS_PATH)) if os.path.exists(MEAS_PATH) else {}


def strip_tags(s):
    s = re.sub(r"<[^>]+>", "", s)
    return s.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")


from measure import text_h as _mtext_h

SLACK = 0.04


def est_text_h(body, fs, width, bold=False):
    return _mtext_h(body, fs, width, bold, SLACK)[0]


def est_text_h_old(body, fs, width, bold=False):
    parts = re.split(r"<br\s*/?>", body)
    lines = 0
    for p in parts:
        t = strip_tags(p)
        nb = len(re.findall(r"<b>(.*?)</b>", p))
        btxt = "".join(strip_tags(x) for x in re.findall(r"<b>(.*?)</b>", p))
        if bold:
            w = len(t) * CAL["cw_bold"] * fs
        else:
            w = (len(t) - len(btxt)) * CAL["cw_reg"] * fs + len(btxt) * CAL["cw_bold"] * fs
        if not t.strip():
            lines += 1
            continue
        lines += max(1, math.ceil(w * CAL["wrap"] / max(width, 10)))
    return math.ceil(lines * fs * CAL["lh"] + CAL["pad"])


def attr(s):
    """escape a textArea body (already markup) for use in an attribute (sticky/shape data-content)."""
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


class FB:
    def __init__(self, key, title, w, pad=64):
        self.key, self.title, self.w, self.pad = key, title, w, pad
        self.y = pad
        self.els = []  # svg strings, relative coords, in z-order
        self.n = 0
        self.h = None
        self.inner = w - 2 * pad

    def nid(self, p):
        self.n += 1
        return f"{self.key}-{p}{self.n}"

    # ---------- primitives
    def textarea(self, body, x, y, w, fs, color=BODY, bold=False, align=None, eid=None):
        eid = eid or self.nid("t")
        est = est_text_h(body, fs, w, bold)
        h = MEASURED.get(eid, est)
        fw = ' font-weight="bold"' if bold else ""
        al = f' text-align="{align}"' if align else ""
        self.els.append(
            f'<textArea id="{eid}" x="{x}" y="{y}" width="{w}" height="{h}" font-family="{FONT}" font-size="{fs}" fill="{color}"{fw}{al}>{body}</textArea>')
        return h

    def rect(self, x, y, w, h, fill, stroke="none", rx=None, content=None, fs=None, tc=None, bold=False, eid=None, sw=None, dash=None):
        eid = eid or self.nid("r")
        s = f'<rect id="{eid}" x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}"'
        if sw:
            s += f' stroke-width="{sw}"'
        if dash:
            s += f' stroke-dasharray="{dash}"'
        if rx:
            s += f' rx="{rx}"'
        if content is not None:
            s += f' data-content="{attr(content)}" data-font-family="{FONT}"'
            if fs:
                s += f' data-font-size="{fs}"'
            if tc:
                s += f' data-text-color="{tc}"'
            if bold:
                s += ' data-font-weight="bold"'
        s += " />"
        self.els.append(s)
        return eid

    def circle(self, cx, cy, r, fill, eid=None):
        eid = eid or self.nid("c")
        self.els.append(f'<circle id="{eid}" cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="none" />')
        return eid

    def divider(self, x1, y1, x2, y2, color=GREY_EDGE, sw=2, eid=None):
        eid = eid or self.nid("d")
        self.els.append(f'<line id="{eid}" data-type="divider" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}" />')

    def sticky(self, x, y, color, content, eid=None, w=199, h=228):
        eid = eid or self.nid("s")
        self.els.append(f'<rect id="{eid}" data-type="sticky" x="{x}" y="{y}" width="{w}" height="{h}" data-color="{color}" data-content="{attr(content)}" />')
        return eid

    # ---------- flow blocks
    def space(self, v):
        self.y += v

    def text(self, body, fs=22, color=BODY, bold=False, gap=20, x=None, w=None, align=None):
        x = self.pad if x is None else x
        w = self.inner if w is None else w
        h = self.textarea(body, x, self.y, w, fs, color, bold, align)
        self.y += h + gap
        return h

    def header(self, chip, title, sub=None):
        # chip
        cw = int(len(chip) * 0.66 * 22 + 48)
        self.rect(self.pad, self.y, cw, 48, BLUE["light"], rx=24, content=f"<b>{chip}</b>", fs=22, tc=BLUE["dark"])
        self.y += 48 + 20
        self.text(f"<b>{title}</b>", fs=67, color=INK, bold=True, gap=20)
        if sub:
            self.text(sub, fs=22, color=BODY, gap=20)
        self.y += 12

    def h2(self, title, fs=33, gap=16):
        self.text(f"<b>{title}</b>", fs=fs, color=INK, bold=True, gap=gap)

    def panel(self, body, fs=33, fill=YELLOW["light"], color=INK, bold=False, pad=32, gap=32, x=None, w=None, label=None, label_color=None):
        x = self.pad if x is None else x
        w = self.inner if w is None else w
        rid = self.nid("p")
        # placeholder: we emit rect after computing height, but z-order needs rect first
        idx = len(self.els)
        self.els.append(None)
        y0 = self.y
        yy = y0 + pad
        if label:
            lh = self.textarea(f"<b>{label}</b>", x + pad, yy, w - 2 * pad, 22, label_color or YELLOW["dark"], True)
            yy += lh + 10
        th = self.textarea(body, x + pad, yy, w - 2 * pad, fs, color, bold)
        yy += th + pad
        h = yy - y0
        self.els[idx] = f'<rect id="{rid}" x="{x}" y="{y0}" width="{w}" height="{h}" fill="{fill}" stroke="none" rx="12" />'
        self.y = yy + gap
        return h

    def table(self, header, rows, widths, fs=20, x=None, bold_rows=(), first_col_bold=True, gap=32,
              head_fills=None, zebra=True, cell_pad=12, hfs=None):
        x = self.pad if x is None else x
        total = sum(widths)
        hfs = hfs or fs
        # header row
        y0 = self.y
        idx = len(self.els)
        self.els.append(None)  # header bg
        cells = []
        hh = 0
        cx = x
        head_bg = []
        for i, (c, w) in enumerate(zip(header, widths)):
            if head_fills and head_fills[i]:
                head_bg.append((cx, w, head_fills[i]))
            cx += w
        # header-specific fills drawn after base bg
        hb_idx = []
        for _ in head_bg:
            hb_idx.append(len(self.els))
            self.els.append(None)
        cx = x
        for c, w in zip(header, widths):
            h = self.textarea(f"<b>{c}</b>" if c else "", cx + cell_pad, y0 + cell_pad, w - 2 * cell_pad, hfs, INK, True) if c else 0
            hh = max(hh, h)
            cx += w
        rowh = hh + 2 * cell_pad
        self.els[idx] = f'<rect id="{self.nid("h")}" x="{x}" y="{y0}" width="{total}" height="{rowh}" fill="{BLUE["light"]}" stroke="none" />'
        for k, (bx, bw, bf) in enumerate(head_bg):
            self.els[hb_idx[k]] = f'<rect id="{self.nid("hb")}" x="{bx}" y="{y0}" width="{bw}" height="{rowh}" fill="{bf}" stroke="none" />'
        yy = y0 + rowh
        for ri, row in enumerate(rows):
            bidx = len(self.els)
            self.els.append(None)
            mh = 0
            cx = x
            for ci, (c, w) in enumerate(zip(row, widths)):
                b = (ri in bold_rows) or (ci == 0 and first_col_bold)
                body = c
                if b and body and not body.startswith("<b>"):
                    body = f"<b>{body}</b>"
                if body.strip():
                    h = self.textarea(body, cx + cell_pad, yy + cell_pad, w - 2 * cell_pad, fs, INK if b else BODY, False)
                    mh = max(mh, h)
                cx += w
            rh = mh + 2 * cell_pad
            fill = BLUE["faint"] if (zebra and ri % 2 == 1) else "#ffffff"
            if ri in bold_rows:
                fill = YELLOW["faint"]
            self.els[bidx] = f'<rect id="{self.nid("b")}" x="{x}" y="{yy}" width="{total}" height="{rh}" fill="{fill}" stroke="none" />'
            yy += rh
        # bottom rule
        self.divider(x, yy, x + total, yy, GREY_LINE, 2)
        self.y = yy + gap
        return yy - y0

    def finish(self, min_h=None):
        self.h = self.y - 32 + self.pad if self.h is None else self.h
        self.h = max(self.h, min_h or 0)
        return self

    def svg(self, tx, ty, h=None):
        h = h or self.h
        out = [f'<g id="{self.key}" transform="translate({tx},{ty})" data-frame="{attr(self.title)}">',
               f'<rect data-type="frame" x="0" y="0" width="{self.w}" height="{h}" fill="#ffffff" data-title="{attr(self.title)}" />']
        out += [e for e in self.els if e]
        out.append("</g>")
        return "\n".join(out)


_ATTR = re.compile(r'([\w:-]+)="([^"]*)"')


def el_info(e):
    tag = re.match(r"<(\w+)", e).group(1)
    attrs = dict(_ATTR.findall(e.split(">")[0] if tag != "textArea" else e[:e.index(">")]))
    return tag, attrs


def order_ids(frame):
    ids = [frame.key]
    for e in frame.els:
        if not e:
            continue
        tag, a = el_info(e)
        ids.append(a.get("id", "?divider"))
    return ids


def update_svg(frame, tx, ty, idmap, h=None, only_changed=None):
    """Geometry-only update of an already-created frame, matched by data-miro-id."""
    h = h or frame.h
    out = [f'<g transform="translate({tx},{ty})" data-miro-id="{idmap[frame.key]}">',
           f'<rect data-type="frame" x="0" y="0" width="{frame.w}" height="{h}" />']
    k = 0
    for e in frame.els:
        if not e:
            continue
        tag, a = el_info(e)
        lid = a.get("id")
        if lid is None:
            continue
        mid = idmap.get(lid)
        if not mid:
            continue
        if only_changed is not None and lid not in only_changed:
            continue
        if tag == "textArea":
            out.append(f'<textArea data-miro-id="{mid}" x="{a["x"]}" y="{a["y"]}" width="{a["width"]}" height="{a["height"]}" />')
        elif tag == "rect" and a.get("data-type") == "sticky":
            out.append(f'<rect data-type="sticky" data-miro-id="{mid}" x="{a["x"]}" y="{a["y"]}" width="{a["width"]}" height="{a["height"]}" />')
        elif tag == "rect":
            out.append(f'<rect data-miro-id="{mid}" x="{a["x"]}" y="{a["y"]}" width="{a["width"]}" height="{a["height"]}" />')
        elif tag == "circle":
            out.append(f'<circle data-miro-id="{mid}" cx="{a["cx"]}" cy="{a["cy"]}" r="{a["r"]}" />')
        elif tag == "line":
            out.append(f'<line data-type="divider" data-miro-id="{mid}" x1="{a["x1"]}" y1="{a["y1"]}" x2="{a["x2"]}" y2="{a["y2"]}" stroke="{a["stroke"]}" stroke-width="{a["stroke-width"]}" />')
    out.append("</g>")
    return "\n".join(out)
