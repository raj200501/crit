"""Content extraction from vca.md (source of truth) for the Miro board.

Only two brand edits are applied: the product name in titles becomes Stemma, and the
live prototype link becomes https://stemmahealth.vercel.app. Everything else is verbatim.
"""
import re, html

VCA = "/tmp/claude-0/-home-user-crit/2d8be54e-cfae-5350-92b4-b34495ce136f/scratchpad/pitch/vca.md"
LINES = open(VCA, encoding="utf-8").read().split("\n")
NEW_URL = "https://stemmahealth.vercel.app"


def L(n):
    """1-indexed line."""
    return LINES[n - 1]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def md(s):
    """Inline markdown -> textArea body markup (escaped text, literal <b>/<i>)."""
    s = s.strip()
    s = s.replace("`", "")
    s = esc(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w*])\*([^*\s][^*]*?)\*(?![\w*])", r"<i>\1</i>", s)
    return s


def split_row(line):
    line = line.strip()
    assert line.startswith("|") and line.endswith("|"), line
    return [c.strip() for c in line[1:-1].split("|")]


def table(a, b):
    """Parse table on lines a..b (inclusive). Returns header(list), rows(list of lists) as raw md."""
    hdr = split_row(L(a))
    rows = [split_row(L(i)) for i in range(a + 2, b + 1)]
    return hdr, rows


def para(n, strip_prefix=None):
    s = L(n)
    if strip_prefix and s.startswith(strip_prefix):
        s = s[len(strip_prefix):]
    return s


# ---------------------------------------------------------------- BMC
BOX_SECTIONS = [
    # key, title, line range, subgroup heading -> (sticky prefix, label)
    ("CS", "Customer Segments", (34, 51)),
    ("VP", "Value Propositions", (55, 74)),
    ("CH", "Channels", (78, 94)),
    ("CR", "Customer Relationships", (98, 109)),
    ("RS", "Revenue Streams", (113, 124)),
    ("KR", "Key Resources", (128, 137)),
    ("KA", "Key Activities", (141, 150)),
    ("KP", "Key Partnerships", (154, 165)),
    ("CO", "Cost Structure", (169, 185)),
]

# sub-group heading in vca.md -> (prefix written on the sticky, label shown above the group)
SUBGROUPS = {
    "Who pays (in order of preference)": ("Who pays", "Who pays (in order of preference)"),
    "Who uses it (free)": ("Who uses", "Who uses it (free)"),
    "Who validates": ("Who validates", "Who validates"),
    "Not customers": ("Not customers", "Not customers"),
    "For the patient (free)": ("Patient", "For the patient (free)"),
    "For the clinician": ("Clinician", "For the clinician"),
    "For the practice (payer)": ("Practice", "For the practice (payer)"),
    "Reach patients (in order)": ("Reach patients", "Reach patients (in order)"),
    "Reach relatives": ("Reach relatives", "Reach relatives"),
    "Get the page to the practice (in order)": ("Page to practice", "Get the page to the practice (in order)"),
    "Reach buyers (in order)": ("Reach buyers", "Reach buyers (in order)"),
    "Practice (in order)": ("Practice", "Practice (in order)"),
    "Patient and relative": ("Patient and relative", "Patient and relative"),
    "Clinician": ("Clinician", "Clinician"),
    "From practices (in order)": ("From practices", "From practices (in order)"),
    "Never": ("Never", "Never"),
    "(next 3 months first)": ("Key Activities", "Next 3 months first"),
    "(in order of preference)": ("Key Partnerships", "In order of preference"),
    "Now": ("Now", "Now"),
    "Pilot, per month once real data flows": ("Pilot", "Pilot, per month once real data flows"),
    "One-time": ("One-time", "One-time"),
    "Later": ("Later", "Later"),
}

# vca.md: dot on stickies that rest on an untested assumption
UNTESTED = {("CS", "Who pays", 1), ("CS", "Who pays", 2), ("RS", "From practices", 1),
            ("RS", "From practices", 2), ("RS", "From practices", 3), ("KP", "Key Partnerships", 1)}


def bmc():
    boxes = {}
    for key, title, (a, b) in BOX_SECTIONS:
        hdr, rows = table(a, b)
        groups = []
        cur = None
        for r in rows:
            num, text, tag = r[0], r[1], r[2]
            if num == "" and text.startswith("**"):
                h = text.strip("*").strip()
                prefix, label = SUBGROUPS[h]
                cur = {"prefix": prefix, "label": label, "items": []}
                groups.append(cur)
                continue
            if cur is None:  # Key Resources has no sub-group heading
                cur = {"prefix": "Key Resources", "label": "In order of preference", "items": []}
                groups.append(cur)
            rank = int(num)
            assert tag in ("N", "O", "N/O"), (key, r)
            cur["items"].append({"rank": rank, "tag": tag, "text": text,
                                 "untested": (key, cur["prefix"], rank) in UNTESTED})
        boxes[key] = {"title": title, "groups": groups}
    return boxes


BOXES = bmc()


def counts():
    out = {}
    for k, b in BOXES.items():
        c = {"N": 0, "N/O": 0, "O": 0}
        for g in b["groups"]:
            for it in g["items"]:
                c[it["tag"]] += 1
        out[k] = c
    return out


if __name__ == "__main__":
    tot = {"N": 0, "N/O": 0, "O": 0}
    for k, c in counts().items():
        print(k, BOXES[k]["title"], c, sum(c.values()))
        for t in c:
            tot[t] += c[t]
    print("ALL", tot, sum(tot.values()))
    for k, b in BOXES.items():
        for g in b["groups"]:
            for it in g["items"]:
                if it["untested"]:
                    print("untested:", k, g["prefix"], it["rank"], it["text"])
    print(BOXES["CS"]["groups"][0]["items"][0])
