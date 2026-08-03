# Tasks — Honest Games
Papan kerja harian. AI mengambil task dari sini, mengerjakan, self-review (lihat Rules.md), lalu update status. User menambahkan feedback visual/QA di sini setelah mencoba hasilnya.

## 📋 Backlog (Prioritas Urut)
- [x] ~~Hilangkan/tutup sign-up publik~~ **SELESAI** — mode `"register"` dihapus dari
      `AuthPage.tsx`. Nasib fitur `is_public`/public profile share link **belum diputuskan**
      (dipertahankan sementara sebagai fitur vestigial, lihat `PRD.md` § Keamanan Akses).
- [ ] Rate-limiting/proteksi untuk endpoint `/api/rawg-search` (saat ini proxy publik tanpa auth check)
- [ ] Verifikasi loading state konsisten di semua fitur (search RAWG, import CSV preview, dsb)
- [ ] Halaman pengaturan akun tambahan (ganti email/password, hapus akun) — cek apakah sudah ada di `/settings` atau baru sebagian
- [ ] Unit test untuk trigger `recalc_game_hours` dan query filter kolom publik profile

## 🔄 In Progress
*(kosong — pindahkan task dari Backlog ke sini saat mulai dikerjakan)*

## 🐛 Bug / Feedback dari QA Visual
*(user isi di sini setelah mencoba hasil build)*

## ✅ Selesai
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
