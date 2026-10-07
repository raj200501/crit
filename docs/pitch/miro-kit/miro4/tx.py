"""Pull Miro tool results from this agent's transcript."""
import json
import os
T = os.environ.get("MIRO_TX") or "/root/.claude/projects/-home-user-crit/2d8be54e-cfae-5350-92b4-b34495ce136f/subagents/workflows/wf_53dc0c43-0b7/agent-aefa88c87c53fdbfc.jsonl"

def results(suffix):
    uses, out = {}, []
    for line in open(T):
        try: d = json.loads(line)
        except Exception: continue
        c = d.get("message", {}).get("content")
        if not isinstance(c, list): continue
        for x in c:
            if x.get("type") == "tool_use": uses[x["id"]] = (x["name"], x.get("input"))
            elif x.get("type") == "tool_result" and x.get("tool_use_id") in uses:
                nm, inp = uses[x["tool_use_id"]]
                if nm.endswith(suffix):
                    cc = x.get("content")
                    if isinstance(cc, list): cc = "".join(p.get("text", "") for p in cc if isinstance(p, dict))
                    out.append((inp, cc))
    return out
