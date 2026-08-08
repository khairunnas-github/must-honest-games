import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Endpoint ini butuh SUPABASE_SERVICE_ROLE_KEY (server-only, JANGAN pernah
// pakai prefix VITE_ — kalau ke-expose ke client, siapa saja bisa hapus data
// siapa saja). Verifikasi dulu token akses user sebelum menghapus akunnya
// sendiri, supaya endpoint ini tidak bisa dipakai menghapus akun orang lain.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.replace("Bearer ", "");
  if (!accessToken) {
    return res.status(401).json({ error: "Tidak ada sesi login." });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(500).json({ error: "Server belum dikonfigurasi lengkap." });
  }

  const admin = createClient(url, serviceKey);

  const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return res.status(401).json({ error: "Sesi tidak valid." });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    return res.status(500).json({ error: "Gagal menghapus akun." });
  }

  return res.status(200).json({ ok: true });
}
