import re, math
from PIL import ImageFont
FD = "/tmp/claude-0/-home-user-crit/2d8be54e-cfae-5350-92b4-b34495ce136f/scratchpad/fonts/"
_cache = {}
def font(bold, size):
    k = (bold, size)
    if k not in _cache:
        _cache[k] = ImageFont.truetype(FD + ("NotoSans-Bold.ttf" if bold else "NotoSans-Regular.ttf"), size * 4)
    return _cache[k]

def unesc(s):
    return s.replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').replace("&amp;", "&")

def runs(par, bold_all=False):
    """split a paragraph markup into (text, bold) runs"""
    out = []
    pos = 0
    bold = False
    for m in re.finditer(r"<(/?)(b|strong|i|em|a[^>]*)>", par):
        t = par[pos:m.start()]
        if t:
            out.append((unesc(t), bold or bold_all))
        tag = m.group(2)
        if tag in ("b", "strong"):
            bold = (m.group(1) == "")
        pos = m.end()
    t = par[pos:]
    if t:
        out.append((unesc(t), bold or bold_all))
    return out

def width_of(text, bold, fs):
    return font(bold, fs).getlength(text) / 4.0

def count_lines(body, fs, width, bold_all=False, slack=0.0):
    pars = re.split(r"<br\s*/?>", body)
    total = 0
    for p in pars:
        rs = runs(p, bold_all)
        # tokens: words with trailing spaces, keeping bold flag
        toks = []
        for t, b in rs:
            for w in re.findall(r"\S+\s*|\s+", t):
                toks.append((w, b))
        if not toks:
            total += 1
            continue
        lines = 1
        cur = 0.0
        avail = width * (1 - slack)
        for w, b in toks:
            core = w.rstrip()
            wc = width_of(core, b, fs)
            ws = width_of(w, b, fs)
            if cur > 0 and cur + wc > avail:
                lines += 1
                cur = 0.0
                # word longer than line: break by characters
            while wc > avail:
                lines += 1
                wc -= avail
            cur += ws if cur + ws <= avail else wc
        total += lines
    return total

def text_h(body, fs, width, bold_all=False, slack=0.0):
    n = count_lines(body, fs, width, bold_all, slack)
    return round(n * 1.43 * fs), n
