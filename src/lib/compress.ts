// Compress a JSON payload into a URL-safe string (deflate + base64url) so a whole
// summary fits in a link or QR code. Uses the browser's built-in CompressionStream.

function toB64Url(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function packJson(obj: unknown): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  return toB64Url(await pipe(raw, new CompressionStream("deflate-raw")));
}

export async function unpackJson<T>(s: string): Promise<T | null> {
  try {
    const bytes = await pipe(fromB64Url(s), new DecompressionStream("deflate-raw"));
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    return null;
  }
}
