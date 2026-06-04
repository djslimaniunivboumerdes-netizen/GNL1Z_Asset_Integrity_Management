// supabase/functions/search-manual/index.ts
//
// Searches the text content of one or all GNL1Z operational manuals
// stored as .docx files on Google Drive.
//
// POST body:
//   { query: string, manuals: { id, title, driveId }[] }
//
// Returns:
//   { results: { id, title, driveId, count, snippets: string[] }[] }

import JSZip from "npm:jszip@3.10.1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Content-Type": "application/json",
};

interface ManualMeta { id: string; title: string; driveId: string }
interface SearchHit  { id: string; title: string; driveId: string; count: number; snippets: string[] }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST")  return new Response("Method not allowed", { status: 405 });

  let query = "", manuals: ManualMeta[] = [];
  try {
    const body = await req.json();
    query   = (body.query ?? "").trim();
    manuals = body.manuals ?? [];
  } catch {
    return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400, headers: CORS });
  }

  if (!query || !manuals.length) {
    return new Response(JSON.stringify({ results: [] }), { headers: CORS });
  }

  // Search each manual concurrently, with per-file timeout
  const settled = await Promise.allSettled(
    manuals.map(m => Promise.race([
      searchManual(m, query),
      timeout(12_000, m),          // 12 s per file
    ]))
  );

  const results: SearchHit[] = settled
    .map(r => r.status === "fulfilled" ? r.value : null)
    .filter((r): r is SearchHit => r !== null && r.count > 0)
    .sort((a, b) => b.count - a.count);   // most hits first

  return new Response(JSON.stringify({ results }), { headers: CORS });
});

// ─── Search a single manual ───────────────────────────────────────────────────
async function searchManual(m: ManualMeta, query: string): Promise<SearchHit> {
  const text    = await fetchDocxText(m.driveId);
  const snippets = findSnippets(text, query, 200, 5);
  return { id: m.id, title: m.title, driveId: m.driveId, count: snippets.length, snippets };
}

// ─── Fetch .docx from Google Drive and extract plain text ────────────────────
async function fetchDocxText(driveId: string): Promise<string> {
  // Primary: direct file download (works for uploaded .docx)
  const url = `https://drive.google.com/uc?export=download&id=${driveId}`;
  const res  = await fetch(url, {
    redirect: "follow",
    headers:  { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) throw new Error(`Drive fetch failed: ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "";

  // If the server returns plain text (Google Docs export), use it directly
  if (contentType.includes("text/plain")) {
    return await res.text();
  }

  // Otherwise assume .docx (ZIP with XML inside)
  const buffer = await res.arrayBuffer();
  return extractTextFromDocx(buffer);
}

// ─── Extract plain text from a .docx binary ──────────────────────────────────
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);

  const docFile = zip.file("word/document.xml");
  if (!docFile) return "";

  const xml = await docFile.async("string");

  // Extract text runs (<w:t> elements) preserving spaces
  const parts: string[] = [];
  const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const chunk = m[1];
    if (chunk) parts.push(chunk);
  }

  return parts.join(" ").replace(/\s{2,}/g, " ").trim();
}

// ─── Find context snippets around every occurrence of query ──────────────────
function findSnippets(text: string, query: string, ctx = 180, max = 5): string[] {
  const lc    = text.toLowerCase();
  const lcQ   = query.toLowerCase();
  const snips: string[] = [];
  let pos = 0;

  while (snips.length < max) {
    const idx = lc.indexOf(lcQ, pos);
    if (idx === -1) break;

    const start = Math.max(0, idx - ctx);
    const end   = Math.min(text.length, idx + query.length + ctx);
    snips.push(
      (start > 0 ? "…" : "") +
      text.slice(start, end) +
      (end < text.length ? "…" : "")
    );
    pos = idx + query.length;
  }

  return snips;
}

// ─── Timeout helper ───────────────────────────────────────────────────────────
function timeout(ms: number, m: ManualMeta): Promise<SearchHit> {
  return new Promise(resolve =>
    setTimeout(() => resolve({ ...m, count: 0, snippets: [] }), ms)
  );
}
