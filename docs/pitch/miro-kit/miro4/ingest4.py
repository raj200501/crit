"""Record ids and bounds from the latest canvas_create_from_svg result of this agent."""
import json, re, os, sys
from tx import results
D = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(D, "ids4.json")
rec = json.load(open(P)) if os.path.exists(P) else {}
inp, cc = results("canvas_create_from_svg")[-1]
d = json.loads(cc)
svg = d.get("result_svg", "")
m = re.search(r'<g id="([^"]+)"[^>]*data-miro-id="(\d+)"', svg)
key, fid = m.group(1), m.group(2)
gb = re.search(r'<g id="%s"[^>]*?data-rendered-bounds="([^"]+)"' % re.escape(key), svg)
items = {}
for mm in re.finditer(r'<(\w+)\s([^>]*?)/?>', svg):
    a = dict(re.findall(r'([\w:-]+)="([^"]*)"', mm.group(2)))
    if a.get("id") and a.get("data-miro-id"):
        items[a["id"]] = [a["data-miro-id"], a.get("data-rendered-bounds")]
intended = re.search(r'translate\(([-\d.]+),([-\d.]+)\)', inp["svg"]).groups()
rec[key] = {"frame_id": fid, "bounds": gb.group(1) if gb else None, "intended": intended, "message": d.get("message"),
            "created": d.get("created_count"), "failed": d.get("failed_items"), "skipped": d.get("skipped"), "items": items}
json.dump(rec, open(P, "w"), indent=0)
links = {k: v["frame_id"] for k, v in rec.items()}
json.dump(links, open(os.path.join(D, "links.json"), "w"), indent=0)
print(key, fid, "bounds", rec[key]["bounds"], "intended", intended, "created", d.get("created_count"), "failed", d.get("failed_items"), "skipped", d.get("skipped"))
print("msg:", (d.get("message") or "")[:400])
print("items recorded", len(items))
