// The relative flow's own return point for the SMART round trip (src/lib/smart.ts keeps its key; this one is ours).
// InviteFlow saves the exact /invite URL and its invite key before leaving for the sandbox. /connect/callback's "Go back"
// uses it instead of history.back() (which lands on the sandbox's consent page), and a second approval after the lib has
// already consumed its own return key still lands on the right invite.

export const INVITE_RETURN_KEY = "fht:invite:return";

export function saveInviteReturn(href: string, owner: string): void {
  try {
    sessionStorage.setItem(INVITE_RETURN_KEY, JSON.stringify({ href, owner }));
  } catch {}
}

export function readInviteReturn(): { href: string; owner: string } | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(INVITE_RETURN_KEY) || "null") as { href?: unknown; owner?: unknown } | null;
    if (!v || typeof v.href !== "string") return null;
    const u = new URL(v.href, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    return { href: u.href, owner: typeof v.owner === "string" ? v.owner : "" };
  } catch {
    return null;
  }
}
