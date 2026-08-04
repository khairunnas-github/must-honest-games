import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * DELETE /api/delete-account
 *
 * Menghapus akun pengguna secara permanen.
 * Membutuhkan:
 *   - Header "Authorization: Bearer <supabase_access_token>" (sama seperti rawg-search)
 *   - Env var SUPABASE_SERVICE_ROLE_KEY di Vercel (service role — jangan expose ke client!)
 *
 * Alur:
 *   1. Verifikasi JWT caller → dapat user.id
 *   2. Panggil auth.admin.deleteUser(user.id) via service role
 *   3. Cascade deletes di DB berjalan otomatis (profiles → game_list → play_sessions → tags)
 *   4. Client kemudian sign out
 *
 * CATATAN: SUPABASE_SERVICE_ROLE_KEY WAJIB ditambahkan di Vercel Dashboard →
 *   Settings → Environment Variables. JANGAN pernah expose key ini ke client-side.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method tidak diizinkan." });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: "Konfigurasi Supabase server belum diset." });
  }
  if (!serviceRoleKey) {
    return res.status(500).json({
      error: "SUPABASE_SERVICE_ROLE_KEY belum diset di Vercel env vars.",
    });
  }

  // ── 1. Verifikasi JWT ────────────────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Tidak terotorisasi. Login dulu." });
  }

  const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: authErr,
  } = await anonClient.auth.getUser(token);

  if (authErr || !user) {
    return res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa." });
  }

  // ── 2. Hapus akun via admin client ───────────────────────────────────────
  // auth.admin.deleteUser() akan menghapus baris di auth.users → cascade ke
  // profiles (ON DELETE CASCADE) → game_list → play_sessions, tags, game_tags.
  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menghapus akun.";
    return res.status(500).json({ error: message });
  }
}
