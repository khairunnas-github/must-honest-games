import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Server-side proxy so RAWG_API_KEY never reaches the browser bundle.
// Endpoint ini dilindungi: caller wajib kirim "Authorization: Bearer <supabase_access_token>".
// Token diverifikasi langsung ke Supabase — siapa yang bukan user terotentikasi dapat 401.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── 1. Verifikasi JWT Supabase ──────────────────────────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Konfigurasi Supabase server belum diset." });
  }

  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Tidak terotorisasi. Login dulu." });
  }

  // Buat client server-side untuk verifikasi JWT tanpa service role key.
  // getUser(token) mem-verifikasi signature JWT ke Supabase Auth server.
  const serverSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error: authErr } = await serverSupabase.auth.getUser(token);

  if (authErr || !user) {
    return res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa." });
  }

  // ── 2. Validasi parameter query ─────────────────────────────────────────────
  const q = (req.query.q as string) || "";
  if (!q.trim()) {
    return res.status(200).json({ results: [] });
  }

  // ── 3. Panggil RAWG API ─────────────────────────────────────────────────────
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

    const results = (data.results || []).map((g: {
      id: number;
      name: string;
      background_image: string | null;
      released: string | null;
      metacritic: number | null;
      platforms: { platform: { name: string } }[];
      genres: { name: string }[];
    }) => ({
      external_id: String(g.id),
      title: g.name,
      cover_url: g.background_image || null,
      release_year: g.released ? Number(g.released.slice(0, 4)) : null,
      metacritic_score: g.metacritic ?? null,
      platforms: (g.platforms || []).map((p) => p.platform.name),
      genres: (g.genres || []).map((genre) => genre.name),
    }));

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menghubungi RAWG API." });
  }
}
