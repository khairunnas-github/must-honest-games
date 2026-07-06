# Must Honest Game Library 🎮 v2.1

Game backlog tracker jujur, dengan struktur feature-based dan fitur lengkap:
play sessions, priority backlog + random picker, tags, cost tracking,
public share link, rekap tahunan, import CSV, dan toast feedback di semua aksi.

## Setup

```bash
npm install
cp .env.example .env   # isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RAWG_API_KEY
```

Jalankan `supabase/migrations/20260706000000_schema_v2.sql` di Supabase SQL
editor (idempotent, aman dijalankan ulang di project yang sama dengan v2.0).

```bash
npm run dev
```

Buka http://localhost:8080.

## Deploy

1. Push ke GitHub (lihat bawah).
2. Import repo di Vercel, set env var yang sama dari `.env` (`RAWG_API_KEY`
   tanpa prefix `VITE_`).
3. Di Supabase → Authentication → URL Configuration, tambahkan domain Vercel
   kamu ke Site URL & Redirect URLs (dipakai untuk flow reset password).

## Push ke GitHub

```bash
git init
git add .
git commit -m "Must Honest Game Library v2.1 - restructured + new features"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## Yang baru di v2.1

- **Struktur feature-based**: `src/features/{auth,games,sessions,stats,profile,shared}`
  menggantikan flat `components/` + `lib/` — tiap fitur bawa data layer dan
  komponennya sendiri, gampang ditemukan dan di-scale.
- **Routing sungguhan** (react-router-dom): `/`, `/settings`, `/wrapped`,
  `/u/:username`, `/reset-password`.
- **Toast feedback**: semua aksi (tambah/edit/hapus/log sesi/import) sekarang
  kasih notifikasi sukses/gagal, bukan gagal diam-diam.
- **Halaman Pengaturan** (`/settings`): nama tampilan, username, mata uang,
  toggle "Public Library".
- **Public profile** (`/u/username`): siapa saja bisa lihat koleksi game kamu
  read-only kalau toggle publik dinyalakan — tanpa catatan pribadi/harga beli.
- **Rekap Tahunan** (`/wrapped`): kartu ringkasan per tahun gaya "Wrapped" —
  game selesai, total jam, rating rata-rata, total pengeluaran.
- **Heatmap aktivitas**: kalender kecil di dashboard menampilkan intensitas
  main 12 minggu terakhir dari data play sessions.
- **Import CSV**: upload file, preview dulu, baru insert massal (skip baris
  tanpa judul, status tidak dikenal otomatis jadi "backlog").

## Struktur

```
src/
├─ app/
│  ├─ App.tsx          # routing + toast provider
│  └─ Dashboard.tsx    # halaman utama
├─ features/
│  ├─ auth/            # AuthPage, ResetPasswordPage, useAuth
│  ├─ games/            # GameCard, Add/Edit/Import dialogs, data layer
│  ├─ sessions/          # SessionPanel, Heatmap, data layer
│  ├─ stats/             # StatsPanel, WrappedPage, data layer
│  ├─ profile/           # SettingsPage, PublicProfilePage, data layer
│  └─ shared/            # NextUpPicker, Toast system, export/import helpers
├─ lib/                  # supabase client, shared types
├─ hooks/                # useDebounce
api/
└─ rawg-search.ts        # Vercel serverless proxy ke RAWG API
supabase/migrations/
└─ 20260706000000_schema_v2.sql
```

## Fitur lengkap

- Auth email/password + lupa password
- Search RAWG (server-side proxy) + tambah manual + import CSV massal
- 6 status: wishlist, backlog, playing, completed, dropped, shelved
- Play sessions dengan total jam otomatis (trigger SQL)
- Priority backlog + "Pilihkan Aku Game" (random weighted)
- Badge backlog aging, tags custom berwarna, cost tracking (Rp/jam)
- Review/journal, heatmap aktivitas, rekap tahunan
- Public share link read-only
- Export JSON / CSV / Markdown
- RLS penuh di semua tabel Supabase
