# PRD — Honest Games 🟡
**Game backlog tracker jujur — play sessions, prioritas, cost tracking, dan rekap tahunan.** — Status: 🟢 Live

## Ringkasan
Aplikasi pencatat koleksi & backlog game (wishlist/backlog/playing/completed/dropped/shelved)
dengan log sesi main sungguhan (bukan cuma total jam manual), pelacakan biaya (harga beli vs
jam main), dan rekap tahunan gaya "Wrapped". Berdiri sendiri di ekosistem Honest Series
sebagai satu-satunya app kategori "gim & interaktif" — tidak overlap dengan app lain manapun.

## Fitur Utama (MVP)
1. **Backlog tracker 6-status** (wishlist, backlog, playing, completed, dropped, shelved) dengan priority ranking.
2. **Play sessions** — log tiap sesi main (tanggal + durasi), total jam dihitung otomatis via trigger SQL, bukan input manual.
3. **"Pilihkan Aku Game"** — random picker berbobot dari backlog, membantu keputusan mulai main apa.
4. **Cost tracking** — harga beli vs jam main (value per jam), mata uang default IDR.
5. **Rekap Tahunan ("Wrapped")** — game selesai, total jam, rating rata-rata, total pengeluaran per tahun.

## Fitur Wajib Tapi Sering Terlewat (cek satu-satu)
- [x] CRUD lengkap (AddGameDialog, EditGameDialog, hapus)
- [x] Pencarian/filter dasar (search RAWG server-side proxy + filter status/tag di UI)
- [x] Export/backup data (Export JSON / CSV / Markdown — lihat `src/features/shared/exportImport.ts`)
- [x] Empty state & loading state
- [x] Mekanisme keamanan akses (lihat bagian di bawah — **dengan catatan penting**, sama seperti Honest Watch)

## Integrasi ke App Lain
Tidak ada. Honest Games berdiri sendiri, tidak berbagi data dengan app Honest Series lain.

## Keamanan Akses — ⚠️ CATATAN PENYIMPANGAN DARI POLA EKOSISTEM
Pola standar ekosistem Honest Series adalah **login-only, tanpa form pendaftaran publik**
(akun dibuat manual lewat provider auth/database console). **Honest Games saat ini TIDAK
sepenuhnya mengikuti pola itu** — sama seperti yang sudah dicatat di Honest Watch:
- `AuthPage.tsx` punya mode `"register"` yang aktif dan bisa diakses siapa saja
  ("Belum punya akun? Daftar").
- Berbeda dari Honest Watch, di sini ada mekanisme **kontrol granular per-user**: kolom
  `profiles.is_public` (default `false`) yang menentukan apakah backlog seorang user bisa
  dilihat publik lewat halaman `/u/:username` (read-only, tanpa catatan pribadi/harga beli).
  Jadi secara desain, app ini memang dipikirkan untuk skenario "banyak user, sebagian mau share
  publik" — bukan cuma kebetulan sign-up-nya lupa ditutup.
- Ini kemungkinan **pengecualian yang lebih disengaja** dibanding Honest Watch (ada fitur
  privasi granular yang dibangun khusus untuk itu), tapi tetap belum ada keputusan tertulis
  yang mengonfirmasi ini sebagai pengecualian resmi dari filosofi single-user ekosistem.

## Catatan Open Question
- [x] ~~Konfirmasi: apakah sign-up publik...~~ **SUDAH DIPUTUSKAN**: sign-up publik akan
      dihilangkan/ditutup, kembali ke pola single-user ekosistem. Lihat `Tasks.md` Backlog.
- [ ] Kalau tetap multi-user: apakah perlu rate-limiting/moderasi untuk mencegah abuse pada
      endpoint `/api/rawg-search` (proxy publik ke RAWG, saat ini tanpa auth check)?
