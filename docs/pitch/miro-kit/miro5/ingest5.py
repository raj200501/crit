"""Record ids and bounds from canvas_create_from_svg results of this pass (ids5.json, links5.json).

MIRO_TX must point at the agent transcript that made the calls (see miro4/tx.py).
"""
import json, re, os, sys
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(D, "..", "miro4"))
from tx import results
P = os.path.join(D, "ids5.json")
rec = json.load(open(P)) if os.path.exists(P) else {}
for inp, cc in results("canvas_create_from_svg"):
    try:
        d = json.loads(cc)
    except Exception:
        continue
    svg = d.get("result_svg", "")
    m = re.search(r'<g id="([^"]+)"[^>]*data-miro-id="(\d+)"', svg)
    if not m or not m.group(1).endswith(("5", "hdrv3")):
        continue
    key, fid = m.group(1), m.group(2)
    items = {}
    for mm in re.finditer(r'<(\w+)\s([^>]*?)/?>', svg):
        a = dict(re.findall(r'([\w:-]+)="([^"]*)"', mm.group(2)))
        if a.get("id") and a.get("data-miro-id"):
            items[a["id"]] = a["data-miro-id"]
    pos = re.search(r'translate\(([-\d.]+),([-\d.]+)\)', inp["svg"]).groups()
    h = re.search(r'data-type="frame" x="0" y="0" width="(\d+)" height="(\d+)"', inp["svg"]).groups()
    rec[key] = {"frame_id": fid, "created_at": [int(float(pos[0])), int(float(pos[1]))], "size": [int(h[0]), int(h[1])],
                "message": d.get("message"), "created": d.get("created_count"), "failed": d.get("failed_items"),
                "skipped": d.get("skipped"), "items": items}
json.dump(rec, open(P, "w"), indent=1)
json.dump({k: v["frame_id"] for k, v in rec.items()}, open(os.path.join(D, "links5.json"), "w"), indent=1)
for k, v in rec.items():
    print(k, v["frame_id"], v["created_at"], v["size"], v["created"], v["failed"], v["skipped"], (v["message"] or "")[:200])
