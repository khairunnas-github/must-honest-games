/**
 * Menerjemahkan pesan error teknis dari Supabase/Postgres jadi bahasa yang
 * dimengerti pengguna biasa. Kalau tidak ada padanan, kembalikan pesan umum
 * yang tetap sopan (bukan raw error dari database).
 */
export function friendlyError(err: unknown): string {
  const raw = (err as any)?.message ?? String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email atau password salah. Coba periksa lagi.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "Email ini sudah terdaftar. Coba masuk, atau pakai email lain.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email kamu belum diverifikasi. Cek kotak masuk untuk link verifikasi.";
  }
  if (lower.includes("password should be at least")) {
    return "Password minimal 6 karakter.";
  }
  if (lower.includes("duplicate key") && lower.includes("username")) {
    return "Username ini sudah dipakai orang lain. Coba nama lain.";
  }
  if (lower.includes("duplicate key")) {
    return "Data ini sepertinya sudah ada sebelumnya.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Koneksi bermasalah. Cek internet kamu dan coba lagi.";
  }
  if (lower.includes("jwt") || lower.includes("session")) {
    return "Sesi login kamu berakhir. Coba masuk lagi.";
  }

  return "Terjadi kesalahan. Coba lagi sebentar.";
}
