import type { VercelRequest, VercelResponse } from "@vercel/node";

// Rate limit sederhana per IP, in-memory (best-effort — reset saat cold start,
// tidak akurat kalau ada banyak instance serverless paralel). Cukup untuk
// menahan abuse/scraping kasar tanpa perlu tambah service eksternal seperti
// Upstash Redis. Kalau traffic app ini besar nanti, upgrade ke rate limiter
// berbasis Redis/KV yang konsisten lintas instance.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

// Server-side proxy so RAWG_API_KEY never reaches the browser bundle.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi sebentar." });
  }

  const q = (req.query.q as string) || "";
  if (!q.trim()) {
    return res.status(200).json({ results: [] });
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RAWG_API_KEY belum diset di Vercel env vars." });
  }

  try {
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(
      q
    )}&page_size=10`;
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(r.status).json({ error: "RAWG API error" });
    }
    const data = await r.json();

    const results = (data.results || []).map((g: any) => ({
      external_id: String(g.id),
      title: g.name,
      cover_url: g.background_image || null,
      release_year: g.released ? Number(g.released.slice(0, 4)) : null,
      metacritic_score: g.metacritic ?? null,
      platforms: (g.platforms || []).map((p: any) => p.platform.name),
      genres: (g.genres || []).map((genre: any) => genre.name),
    }));

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menghubungi RAWG API." });
  }
}
