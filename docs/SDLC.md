# SDLC — Honest Games
*(Checklist SDLC khusus app ini. Untuk tracker level ekosistem 8 app, lihat SDLC_MASTER di root project Honest Series.)*

## 📌 Honest Games 🟡 (Gim & Interaktif / Kuning-Mustard)  🟢 Live

**Metodologi yang dipakai untuk app ini:**
- [ ] Waterfall (berurutan, requirement sudah pasti/jarang berubah)
- [x] Agile/Scrum (iterasi pendek/*sprint*, requirement bisa berubah)
- [x] Lean/MVP-First (keluarkan versi minim dulu, iterasi dari *feedback* nyata)

*(Restructure ke feature-based di v2.1 dan retheme warna di v2.6 adalah bukti iterasi Agile — bukan rencana besar yang dikunci di awal.)*

### 1. Perencanaan & Riset (*Discovery*)
- [x] Validasi masalah dan penentuan target pengguna.
- [x] Penentuan tujuan utama aplikasi dalam ekosistem (kategori "gim & interaktif", tidak overlap app lain).
- [x] Riset kelayakan *tech stack* dan infrastruktur (Vite + Supabase + RAWG API).

### 2. *Requirement & Scope* (Batasan MVP)
- [x] Penentuan spesifikasi fitur MVP (backlog tracker, play sessions, cost tracking, wrapped).
- [x] Perumusan struktur basis data (profiles, game_list, play_sessions, tags) dan alur kerja.
- [x] Pemilihan arsitektur akhir (Vite + React + Supabase + Vercel serverless function).

### 3. Desain (UI/UX & Arsitektur)
- [x] Penerapan *Master Design System* & warna khas app ini (Kuning-mustard, retheme dari Red).
- [x] Skala warna untuk Dark/Light mode via CSS variable (`src/styles.css`).
- [x] Ikonografi: **Gamepad lengkap** (body + D-pad + face buttons, bukan D-pad saja).
- [x] Desain arsitektur UI/UX spesifik (Dashboard, Settings, Wrapped, Public Profile).

### 4. *Development* (Pengembangan Koding)
- [x] Inisialisasi *repository* dan konfigurasi *environment* dasar.
- [x] *Coding* fondasi aplikasi (routing react-router-dom, autentikasi).
- [x] Pembuatan fitur inti dan integrasi *database* (CRUD, play sessions trigger, tags, views).
- [x] Optimalisasi performa dan *handling* fail besar/penyimpanan luring — PWA (Level 2) sudah diimplementasikan (manifest + service worker + offline fallback + cache gambar RAWG). Belum ada IndexedDB untuk offline data penuh (di luar scope Level 2).

**✅ UPDATE — Level PWA sekarang: Level 2 (Core PWA/Installable) tercapai.** Manifest
(`site.webmanifest`) ternyata sudah ada sejak awal; Service Worker ditambahkan via
`vite-plugin-pwa`. Sekarang setara dengan Honest Watch & Honest Career. Belum ke Level 3
(Optimal/Fugu) — wajar, tidak jadi target untuk app kategori ini.

### 5. *Testing* (Pengujian)
- [ ] *Unit Testing* untuk fungsi-fungsi kritikal — **belum ada** unit test formal, padahal ada
      logika trigger (`recalc_game_hours`) dan filter kolom publik yang cukup krusial untuk diuji.
- [x] *User Acceptance Testing* (UAT) manual — tercermin dari histori v2.1 → v2.6 (restructure, retheme).
- [ ] Pengujian aksesibilitas (kontras warna WCAG, keterbacaan teks) — belum ada verifikasi eksplisit tercatat, terutama untuk kontras kuning-mustard di light mode.
- [x] Pengujian fitur spesifik perangkat (unggah berkas, kapabilitas PWA) — Import CSV (unggah berkas) sudah ada; kapabilitas PWA sudah bisa diuji sekarang (Level 2 tercapai), diverifikasi lewat build production (`dist/sw.js` ter-generate).

### 6. *Deployment* (Rilis)
- [x] Pengaturan *Environment Variables* (ENV) untuk *production*.
- [x] Konfigurasi alur kerja CI/CD (Vercel auto-deploy + `vercel.json` rewrite untuk SPA routing & API proxy).
- [x] Rilis *production* ke domain utama.
- [ ] Verifikasi kestabilan paska-rilis (pengecekan *build log*) — belum ada catatan histori bug/audit post-deploy setara CHANGELOG Honest Watch; pertimbangkan mulai mencatat di sini kalau ada insiden build/bug production.

### 7. *Maintenance* & Iterasi (Pemeliharaan)
- [x] Evaluasi rutin dan *refactoring* UI/UX (restructure feature-based di v2.1, retheme warna v2.6).
- [ ] Pemantauan *bug* atau *error* di *production* — belum ada log/catatan histori bug terpisah (tidak ada CHANGELOG.md di project ini, beda dari Honest Watch).
- [ ] Pembaruan fitur berdasarkan kebutuhan *workflow* terbaru — lihat Backlog di `Tasks.md`.
- [ ] *Upgrade dependencies* secara berkala — belum ada jadwal/catatan rutin untuk ini.

**Catatan:**
- **Versi tidak konsisten**: nama file zip yang di-upload adalah "v2.6-retheme", tapi
  `package.json` masih tertulis versi `2.1.0` dan README masih judul "v2.1". Kemungkinan
  version bump di `package.json`/README terlewat setelah kerja retheme warna — perlu
  disinkronkan.
- Tidak ada `CHANGELOG.md` di project ini (beda dari Honest Watch yang mencatat histori v1-v7
  dengan detail). Kalau mau konsisten dengan pola dokumentasi app lain di ekosistem,
  pertimbangkan menambahkannya.
- **Deviasi arsitektur yang belum diputuskan**: sama seperti Honest Watch, app ini pakai
  sign-up publik. Bedanya, di sini ada fitur privasi granular (`profiles.is_public`) yang
  membuatnya lebih terlihat seperti keputusan desain sengaja, bukan kelalaian. Lihat `PRD.md`
  dan `Rules.md` untuk detail — perlu keputusan resmi.
