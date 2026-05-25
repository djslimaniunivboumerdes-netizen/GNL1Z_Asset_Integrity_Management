// detect-dcs-instruments edge function — Gemini Flash vision (aligned with news-feed)
// Set GEMINI_API_KEY as Supabase secret. No Lovable gateway needed.
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ReqBody {
  panel_id: string;
  image_url: string; // public Drive thumbnail
  force?: boolean;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { panel_id, image_url, force }: ReqBody = await req.json();
    if (!panel_id || !image_url) {
      return json({ error: "panel_id and image_url required" }, 400);
    }

    // Cache check
    if (!force) {
      const cached = await fetch(`${SUPABASE_URL}/rest/v1/dcs_detected_instruments?panel_id=eq.${encodeURIComponent(panel_id)}&select=*`, {
        headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      }).then((r) => r.json());
      if (Array.isArray(cached) && cached.length && Array.isArray(cached[0].tags) && cached[0].tags.length) {
        return json({ tags: cached[0].tags, cached: true });
      }
    }

    // Fetch the image as base64
    let imageBase64: string;
    try {
      const imgRes = await fetch(image_url, { redirect: "follow" });
      if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
      const imgBuffer = await imgRes.arrayBuffer();
      imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
    } catch (imgErr) {
      return json({ error: `Failed to fetch image: ${(imgErr as Error).message}` }, 400);
    }

    // Try Gemini (same approach as news-feed)
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return json({ error: "GEMINI_API_KEY not configured" }, 500);
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are an industrial DCS screenshot reader. Extract every visible instrument tag.
Tags follow patterns like FT-1234, PIC-501A, TT-22, LV-100, FIC-1503, PT-501, XV-22, AS-100, HS-200, etc.
Return ONLY a strict JSON array of unique uppercase tag strings, no prose, no code fences.
Example: ["FT-1503","PIC-501A","TT-22"]. If none, return [].`,
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 1024,
            temperature: 0.1,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const t = await geminiRes.text();
      return json({ error: `Gemini ${geminiRes.status}: ${t.slice(0, 400)}` }, 500);
    }

    const geminiJson = await geminiRes.json();
    const raw = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    let tags: string[] = [];
    try {
      const cleaned = String(raw).replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\[[\s\S]*\]/);
      tags = JSON.parse(match ? match[0] : cleaned);
      tags = [...new Set(tags.filter((t: unknown) => typeof t === "string" && t.length > 1).map((t: string) => t.toUpperCase().trim()))];
    } catch {
      tags = [];
    }

    // Cache result
    await fetch(`${SUPABASE_URL}/rest/v1/dcs_detected_instruments`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ panel_id, tags, model: "gemini-1.5-flash" }),
    });

    return json({ tags, cached: false });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
