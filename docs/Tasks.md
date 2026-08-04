# Tasks — Honest Games
Papan kerja harian. AI mengambil task dari sini, mengerjakan, self-review (lihat Rules.md), lalu update status. User menambahkan feedback visual/QA di sini setelah mencoba hasilnya.

## 📋 Backlog (Prioritas Urut)
*(semua fitur backlog telah dipindahkan ke Selesai)*

## ✅ Selesai
- [x] **Target Jam Main / Backlog Clearance Goal Tracker** — Tetapkan target (contoh: 150 jam main tahun ini) dengan progres bar visual.
- [x] **Analisis Platform & Genre Breakdown** — Grafik visual distribusi jam main & pengeluaran per platform/genre di Dashboard/Wrapped.
- [x] **Kategori Penuntasan Game** — Pilih tipe penuntasan (Main Story, Main + Extra, 100% Platinum) saat ubah status ke `completed` untuk kalkulasi *Value per Hour* yang lebih akurat.
- [x] **Session Live Timer / Stopwatch** — Stopwatch bawaan di Dashboard; ketika di-stop langsung mengisi menit log sesi secara otomatis.
- [x] **Multi-Column Advanced Filter & Sorting** — Sortir berdasarkan Value/Hour (`price_paid / hours_played`), Metacritic, rilis tahun, plus filter multi-tag bersamaan.
- [x] **Buku Catatan Sesi / Log Jurnal Game** — Catatan per sesi (boss fight, memo) dengan dukungan tautan gambar screenshot.
- [x] **Wrapped Image Generator** — Tombol Download as Image (via html-to-image) pada kartu rekap tahunan agar mudah di-share ke sosmed.
- [x] **Pengonversi CSV Steam / Backloggd** — Preset impor khusus format CSV platform lain untuk migrasi tanpa hambatan.

## 🔄 In Progress
*(kosong — pindahkan task dari Backlog ke sini saat mulai dikerjakan)*

## 🐛 Bug / Feedback dari QA Visual
*(user isi di sini setelah mencoba hasil build)*

## ✅ Selesai
- [x] **Full Bug Audit (2026-08-04)** — Memperbaiki 6 bug yang ditemukan di app:
  - `NextUpPicker`: Memperbaiki crash (TypeError) ketika property `platforms` null/undefined pada game manual.
  - `ImportCsvDialog`: Menambahkan loading state (skeleton) saat file CSV diparsing.
  - `StatsPanel`: Menambahkan skeleton animate-pulse saat stats masih dimuat.
  - `exportImport.ts`: CSV parser sekarang mendukung quoted fields (RFC 4180), memperbaiki parsing game dengan koma di judulnya.
  - `Heatmap`: Menambahkan penanganan error secara diam-diam (graceful degradation) untuk error jaringan.
  - `WrappedPage`: Menambahkan status error eksplisit jika jaringan gagal.
  - *Sisi Build:* Mengupdate `tsconfig.json` untuk mengecualikan test `.test.ts`, memperbaiki tipe error build Vite yang disebabkan oleh Supabase client.
- [x] **PWA Install Prompt** — Banner nudge "Add to Home Screen" (`PwaPrompt.tsx`) dipasang pada `Dashboard.tsx`.
- [x] **Unit test vitest setup** — `profile.test.ts` (test query filter kolom sensitif) & `trigger.test.ts` (test trigger SQL `recalc_game_hours`) hijau dan melewati pengecekan. Error missing env key di `trigger.test.ts` juga sudah ditangani.
- [x] **Theme Toggle (Dark/Light)** — Menambahkan pengaturan Tema Aplikasi di `SettingsPage.tsx` dan menerapkan tema secara global pada tag `<html>` melalui `App.tsx` (sesuai data profil pengguna).
- [x] **Platform Filter di Dashboard** — Menambahkan filter dropdown Platform di UI `Dashboard.tsx` dan menghubungkannya dengan fungsi backend `fetchGames`.
- [x] **Koreksi framing `is_public` di dokumentasi** — fitur share-link (`/u/:username`) BUKAN
      vestigial dan BUKAN bagian dari pendaftaran publik. Keduanya independen. Share link tetap
      berguna agar kamu bisa berbagi progress library ke teman tanpa mereka perlu login.
      `PRD.md` dan `Rules.md` diluruskan untuk mencerminkan ini dengan benar.
- [x] **Restore fitur share link library** — `PublicProfilePage.tsx` dan rute `/u/:username`
      dikembalikan. Toggle "Bagikan library via link publik" + URL share ada kembali di Settings.
      `getPublicProfileByUsername()` dikembalikan ke `profile.ts` dengan select eksplisit
      (kolom sensitif tetap tidak di-expose). `is_public` dikembalikan ke interface `Profile`.
- [x] **Hapus akun permanen dari dalam app** (Temuan 4) — Zona Bahaya di `SettingsPage.tsx`
      dengan konfirmasi ketik "HAPUS". API endpoint `api/delete-account.ts` menggunakan
      `SUPABASE_SERVICE_ROLE_KEY` (server-only) untuk `auth.admin.deleteUser()` — cascade
      deletes di schema membersihkan semua data (profiles, game_list, sessions, tags).
      ⚠️ **Action diperlukan**: tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke Vercel Dashboard →
      Settings → Environment Variables sebelum deploy.
- [x] **Fix loading state Settings** (Temuan 6) — halaman tidak lagi kosong sesaat. Saat
      profil belum dimuat, ditampilkan skeleton (animate-pulse) sebagai pengganti form kosong.
- [x] **Hamburger menu mobile** — Di layar < md, icon nav tersembunyi dan diganti tombol ☰/✕.
      Dropdown berisi link Wrapped, Settings, tombol Keluar. Tertutup otomatis saat klik di luar.
- [x] **Pengaturan akun: ganti password & email dari dalam app** — Section "Keamanan Akun"
      (accordion) di Settings. Ganti password dengan validasi + konfirmasi. Ganti email dengan
      info alur konfirmasi Supabase (link ke email lama & baru).
- [x] **Proteksi endpoint `/api/rawg-search`** — JWT verification via Supabase.
      `AddGameDialog.tsx` mengirim token via `supabase.auth.getSession()`.
- [x] **Kebersihan struktur — hapus dead code** — 14 file lama yang tidak diimport siapapun
      dihapus: `src/App.tsx`, `src/pages/`, `src/components/`, `src/lib/{games,sessions,exportImport,useAuth}.ts`.
- [x] **PWA manifest improvement** — tambah `scope`, `orientation`, `lang`, `description`, `categories`.
- [x] **Core PWA (Level 2)** — Service Worker, offline.html, cache cover RAWG.
- [x] Setup project, restructure feature-based, routing, skema DB + RLS, auth, RAWG search,
      6-status backlog, play sessions + trigger SQL, priority picker, backlog aging, tags,
      cost tracking, review/journal, heatmap, Wrapped, public share link, export JSON/CSV/MD,
      toast feedback, retheme ke yellow-mustard, icon/favicon.
