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

## Keamanan Akses — ✅ Sudah Sesuai Pola Ekosistem (diperbaiki)
Pola standar ekosistem Honest Series: **login-only, tanpa form pendaftaran publik**. Mode
`"register"` di `AuthPage.tsx` sudah dihapus — sekarang cuma `"login"` dan `"forgot"`.

**Catatan soal `profiles.is_public`**: kolom ini (kontrol privasi granular untuk share backlog
lewat `/u/:username`) **bukan fitur vestigial** — ini independen dari keputusan menghapus
pendaftaran publik. Pendaftaran publik dan share-link itu dua hal berbeda: yang pertama soal
"siapa yang bisa punya akun di app ini" (sekarang: cuma 1 user, dibuat manual), yang kedua
soal "apakah user yang sudah ada mau nunjukkin koleksinya ke orang lain lewat link read-only"
(mis. untuk pamer progress ke teman). Fitur ini tetap berguna dan aktif dipakai, toggle-nya
ada di Settings, default `false`.

## Catatan Open Question
- [x] ~~Konfirmasi: apakah sign-up publik...~~ **SUDAH DIPUTUSKAN & DIEKSEKUSI**: mode
      `"register"` dihapus dari `AuthPage.tsx`, kembali ke pola single-user ekosistem.
- [ ] Kalau tetap multi-user: apakah perlu rate-limiting/moderasi untuk mencegah abuse pada
      endpoint `/api/rawg-search` (proxy publik ke RAWG, saat ini tanpa auth check)?
