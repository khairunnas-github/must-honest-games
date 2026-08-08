# Tasks — Honest Games
Papan kerja harian. AI mengambil task dari sini, mengerjakan, self-review (lihat Rules.md), lalu update status. User menambahkan feedback visual/QA di sini setelah mencoba hasilnya.

## 📋 Backlog (Prioritas Urut)
*(kosong — semua item prioritas High & Medium dari audit terakhir sudah dieksekusi, lihat ✅ Selesai)*

## 🔄 In Progress
*(kosong — pindahkan task dari Backlog ke sini saat mulai dikerjakan)*

## 🐛 Bug / Feedback dari QA Visual
*(user isi di sini setelah mencoba hasil build)*

## ⏭️ Sengaja Ditunda (Low Priority, alasan dicatat)
- **Import/sync Steam/PSN**: butuh OAuth per-user + kredensial API pihak ketiga per platform —
  bukan tugas "cepat & simple", perlu sesi terpisah kalau mau dieksekusi.
- **Multi-currency sungguhan**: sempat ada toggle IDR/USD di Settings tapi ternyata tidak
  benar-benar mengonversi tampilan harga di manapun (janji palsu ke user) — sudah dicabut
  duluan (lihat riwayat retheme). Kalau mau multi-currency asli, perlu rancang ulang semua
  komponen yang menampilkan harga, bukan cuma ganti label.

## ✅ Selesai
- [x] **Audit fitur menyeluruh + eksekusi semua prioritas (High/Medium/Low yang masuk akal)**:
  - Hapus kode mati sisa sebelum restrukturisasi v2.1 (`src/App.tsx`, `src/pages/`,
    `src/components/`, 4 file `src/lib/*` lama) — nol referensi tersisa, dikonfirmasi via grep.
  - Rate limiting in-memory per-IP untuk `/api/rawg-search` (20 req/menit, best-effort).
  - Halaman Settings: ganti password, ganti email, **hapus akun** (via `api/delete-account.ts`
    baru, pakai `SUPABASE_SERVICE_ROLE_KEY` server-only + verifikasi token akses user).
  - Loading state untuk halaman Settings (sebelumnya form kosong sesaat sebelum data masuk).
  - Koreksi dokumentasi `PRD.md` soal `is_public`/public share-link — bukan fitur vestigial,
    independen dari keputusan hapus pendaftaran publik.
  - `completion_percent` (0-100) — progres penyelesaian game ringan, tanpa perlu tabel
    achievements terpisah yang berat (migration `20260721000000_completion_percent.sql`).
  - Banner "backlog basi" di dashboard (pengganti reminder/notifikasi push yang lebih berat).
  - Unit test (vitest, 14 test lolos): `parseCsvImport` (termasuk alias kolom Indonesia),
    `friendlyError`, dan `weightedPick` (logika inti "Pilihkan Aku Game", diekstrak jadi
    fungsi murni supaya testable tanpa mock Supabase).
- [x] ~~Hilangkan/tutup sign-up publik~~ **SELESAI** — mode `"register"` dihapus dari
      `AuthPage.tsx`.
- [x] **Core PWA (Level 2) diimplementasikan** — manifest (`site.webmanifest`) ternyata
      sudah ada sejak awal (icons 192/512/maskable lengkap); yang ditambahkan adalah
      Service Worker via `vite-plugin-pwa` (`manifest: false`, pakai manifest statis yang
      sudah ada, hindari duplikasi), halaman `public/offline.html` sebagai navigateFallback,
      dan runtime caching CacheFirst untuk gambar cover RAWG (`rawg.io`/`media.rawg.io`,
      30 hari). Diverifikasi lewat `npm run build` — `dist/sw.js` + `registerSW.js`
      ter-generate, `dist/index.html` cuma satu link manifest (tidak dobel).
- [x] Setup project (Vite + React + TypeScript + Tailwind + Supabase)
- [x] Restructure ke feature-based (`src/features/{auth,games,sessions,stats,profile,shared}`) — v2.1
- [x] Routing sungguhan dengan react-router-dom (`/`, `/settings`, `/wrapped`, `/u/:username`, `/reset-password`)
- [x] Skema database lengkap (profiles, game_list, play_sessions, tags, game_tags) + RLS penuh
- [x] Auth email/password + lupa password
- [x] Search RAWG (server-side proxy) + tambah manual + import CSV massal
- [x] 6 status backlog (wishlist, backlog, playing, completed, dropped, shelved)
- [x] Play sessions dengan total jam otomatis via trigger SQL
- [x] Priority backlog + "Pilihkan Aku Game" (random weighted picker)
- [x] Badge backlog aging (view `backlog_aging`), tags custom berwarna, cost tracking (Rp/jam)
- [x] Review/journal per game, heatmap aktivitas 12 minggu, rekap tahunan ("Wrapped")
- [x] Public share link read-only dengan filter kolom sensitif (tidak expose notes/review/price_paid)
- [x] Export JSON / CSV / Markdown
- [x] Toast feedback untuk semua aksi (tambah/edit/hapus/log sesi/import)
- [x] Retheme warna primer Red → Yellow-mustard sesuai Honest Series Design System v2
- [x] Icon/favicon lengkap dengan bentuk gamepad utuh (bukan D-pad saja)
