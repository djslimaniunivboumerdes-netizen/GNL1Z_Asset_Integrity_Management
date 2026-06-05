// functions/api/search-manual.ts
//
// Cloudflare Pages Function — auto-deploys on every git push.
// Route: POST /api/search-manual
//
// Uses only Web-standard APIs (DecompressionStream, DataView, fetch).
// No npm packages, no CLI deploy needed.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

interface ManualMeta { id: string; title: string; driveId: string }
interface SearchHit  { id: string; title: string; driveId: string; count: number; snippets: string[] }

// ── Entry points ──────────────────────────────────────────────────────────────
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost(ctx: { request: Request }): Promise<Response> {
  let query = "", manuals: ManualMeta[] = [];
  try {
    const body = await ctx.request.json() as { query: string; manuals: ManualMeta[] };
    query   = (body.query   ?? "").trim();
    manuals = body.manuals  ?? [];
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400, headers: CORS });
  }

  if (!query || !manuals.length) {
    return Response.json({ results: [] }, { headers: CORS });
  }

  // Search all manuals concurrently; each has a 14-second deadline
  const settled = await Promise.allSettled(
    manuals.map(m =>
      race(searchManual(m, query), 14_000, { ...m, count: 0, snippets: [] })
    )
  );

  const results = settled
    .map(r => (r.status === "fulfilled" ? r.value : null))
    .filter((r): r is SearchHit => r !== null && r.count > 0)
    .sort((a, b) => b.count - a.count);

  return Response.json({ results }, { headers: CORS });
}

// ── Search one manual ─────────────────────────────────────────────────────────
async function searchManual(m: ManualMeta, query: string): Promise<SearchHit> {
  const text     = await fetchDocxAsText(m.driveId);
  const snippets = findSnippets(text, query, 200, 5);
  return { ...m, count: snippets.length, snippets };
}

// ── Fetch a Google Drive file and extract plain text ──────────────────────────
async function fetchDocxAsText(driveId: string): Promise<string> {
  const buf = await downloadFromDrive(driveId);
  return extractDocxText(buf);
}

async function downloadFromDrive(driveId: string): Promise<ArrayBuffer> {
  const url  = `https://drive.google.com/uc?export=download&id=${driveId}`;
  const hdrs = { "User-Agent": "Mozilla/5.0 (compatible; GNL1Z-Search/1.0)" };

  let res = await fetch(url, { redirect: "follow", headers: hdrs });
  if (!res.ok) throw new Error(`Drive ${res.status}`);

  // Large files trigger a scan-warning HTML page — retry with &confirm=t
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/html")) {
    res = await fetch(`${url}&confirm=t`, { redirect: "follow", headers: hdrs });
    if (!res.ok) throw new Error(`Drive confirm ${res.status}`);
  }

  return res.arrayBuffer();
}

// ── Parse .docx (ZIP) and return plain text using only Web APIs ───────────────
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const xml = await unzipEntry(buffer, "word/document.xml");
  if (!xml) return "";

  // Pull text from <w:t> elements (Word text runs)
  const parts: string[] = [];
  const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m[1]) parts.push(m[1]);
  }
  return parts.join(" ").replace(/\s{2,}/g, " ").trim();
}

// ── Minimal ZIP reader (Web APIs only — no npm) ───────────────────────────────
async function unzipEntry(buffer: ArrayBuffer, target: string): Promise<string | null> {
  const bytes = new Uint8Array(buffer);
  const view  = new DataView(buffer);
  let   pos   = 0;

  while (pos + 30 < bytes.length) {
    // Local File Header signature: PK\x03\x04
    if (view.getUint32(pos, true) !== 0x04034b50) { pos++; continue; }

    const method    = view.getUint16(pos + 8,  true);
    const cSize     = view.getUint32(pos + 18, true);
    const nameLen   = view.getUint16(pos + 26, true);
    const extraLen  = view.getUint16(pos + 28, true);
    const name      = new TextDecoder().decode(bytes.subarray(pos + 30, pos + 30 + nameLen));
    const dataStart = pos + 30 + nameLen + extraLen;
    const dataEnd   = dataStart + cSize;

    if (name === target) {
      const chunk = bytes.subarray(dataStart, dataEnd);
      if (method === 0) {
        return new TextDecoder().decode(chunk);           // stored
      }
      if (method === 8) {
        return inflate(chunk);                            // DEFLATE
      }
      return null;                                        // unsupported
    }
    pos = dataEnd;
  }
  return null;
}

// ── DEFLATE decompression via DecompressionStream ─────────────────────────────
async function inflate(data: Uint8Array): Promise<string> {
  const ds     = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();

  await writer.write(data);
  await writer.close();

  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const total  = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let   off    = 0;
  for (const c of chunks) { merged.set(c, off); off += c.length; }

  return new TextDecoder().decode(merged);
}

// ── Find context snippets around each occurrence ──────────────────────────────
function findSnippets(text: string, query: string, ctx = 180, max = 5): string[] {
  const lc   = text.toLowerCase();
  const lcQ  = query.toLowerCase();
  const out: string[] = [];
  let   pos  = 0;

  while (out.length < max) {
    const idx = lc.indexOf(lcQ, pos);
    if (idx === -1) break;
    const s = Math.max(0, idx - ctx);
    const e = Math.min(text.length, idx + query.length + ctx);
    out.push((s > 0 ? "…" : "") + text.slice(s, e) + (e < text.length ? "…" : ""));
    pos = idx + query.length;
  }
  return out;
}

// ── Timeout race ──────────────────────────────────────────────────────────────
function race<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(res => setTimeout(() => res(fallback), ms)),
  ]);
    }
