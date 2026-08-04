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
6. **Share link library** — bagikan koleksimu ke teman via `/u/:username` (read-only, data sensitif tersembunyi).
7. **Tema Aplikasi (Dark/Light)** — mendukung preferensi visual pengguna.

## Fitur Wajib Tapi Sering Terlewat (cek satu-satu)
- [x] CRUD lengkap (AddGameDialog, EditGameDialog, hapus)
- [x] Pencarian/filter ekstensif (search RAWG server-side proxy + filter status/platform/tag di UI)
- [x] Export/backup data (Export JSON / CSV / Markdown — lihat `src/features/shared/exportImport.ts`)
- [x] Empty state & loading state
- [x] Mekanisme keamanan akses (lihat bagian di bawah)
- [x] Hapus akun permanen (lewat `/settings` → Zona Bahaya)

## Integrasi ke App Lain
Tidak ada. Honest Games berdiri sendiri, tidak berbagi data dengan app Honest Series lain.

## Keamanan Akses — ✅ Sudah Sesuai Pola Ekosistem
Pola standar ekosistem Honest Series: **login-only, tanpa form pendaftaran publik**.
Mode `"register"` di `AuthPage.tsx` sudah dihapus — sekarang cuma `"login"` dan `"forgot"`.

App ini **single-user**: hanya satu akun yang ada, dibuat lewat Supabase Dashboard.

### Fitur Share Link (`profiles.is_public` + `/u/:username`) — ✅ DIPERTAHANKAN
Fitur ini **berbeda dari pendaftaran publik** dan tetap berguna:
- Kamu bisa berbagi link koleksi game ke teman tanpa mereka perlu login atau punya akun.
- Teman yang buka link hanya bisa membaca — tidak bisa mengubah apapun.
- Kolom sensitif (`notes`, `review`, `price_paid`) tidak ikut ditampilkan (select eksplisit).
- Dikontrol lewat toggle "Bagikan library via link publik" di `/settings`.

Ini adalah **share-link feature**, bukan signup feature. Keduanya saling independen.

## Catatan Open Question
- [x] ~~Konfirmasi: apakah sign-up publik...~~ **SUDAH DIPUTUSKAN**: mode `"register"` dihapus.
- [x] ~~Rate-limiting `/api/rawg-search`...~~ **SUDAH DIIMPLEMENTASI**: JWT verification.
- [x] ~~Hapus akun dari dalam app...~~ **SUDAH DIIMPLEMENTASI**: Zona Bahaya di Settings + `api/delete-account.ts`.

## Roadmap / Pengembangan Lanjutan
Berikut adalah usulan fitur masa depan untuk memperkaya Honest Games, diurutkan berdasarkan skala prioritas:

### 🔴 High Priority
- **Analisis Platform & Genre Breakdown**: Visualisasi data (chart/grafik) tentang persebaran waktu & uang pengguna di berbagai konsol/platform dan genre.
- **Target Jam Main / Backlog Goal**: Pengguna bisa menetapkan resolusi tahunan/bulanan (misal "150 jam main") lengkap dengan progress bar.
- **Kategori Penuntasan (100% Completionist)**: Diferensiasi *Value per Hour* berdasarkan kedalaman penuntasan game (Main Story vs 100% Platinum).

### 🟡 Medium Priority
- **Live Session Stopwatch**: Integrasi timer berjalan di Dashboard yang langsung dikonversi menjadi menit log sesi.
- **Multi-Column Filter & Sorting**: Peningkatan filter (Sorting by Value/Hour, Rating, dsb) untuk mencari game paling bernilai di backlog.
- **Log Jurnal Sesi & Gambar**: Tempat menulis rekap momen berkesan per sesi (beserta link *screenshot*).

### 🟢 Low Priority
- **Wrapped Image Generator**: Ekspor rekap tahunan bergaya retro ke gambar untuk Social Media *Share Card*.
- **CSV Converter Steam/Backloggd**: Pengonversi otomatis bagi pengguna migran dari tracker lain.
