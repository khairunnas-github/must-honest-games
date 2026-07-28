# System — Honest Games 🟡
*(Gabungan Design + Schema + Architecture — AI membaca satu file ini untuk memahami skema database sekaligus aturan visual/komponen sekaligus)*

---

## 🎨 Bagian Desainer (Visual & UX)

### Identitas Visual
| Elemen | Nilai |
|---|---|
| Warna Primer (App) | `#FACC15` (Kuning-mustard — CSS var `--neon`, dark mode) |
| Warna Primer (Light mode) | `#CA8A04` (Brand/Logo shade — kontras cukup di atas putih) |
| Warna Aksen | `#D97706` Amber Hangat (dark) / `#854D0E` (light — Dark Mode shade dipakai untuk kontras) |
| Gaya Visual | *Retro* & Nostalgic — nuansa koin arcade klasik/8-bit |
| Ikon | 🎮 Gamepad lengkap (body + D-pad + face buttons), bukan D-pad berdiri sendiri |
| Warna netral UI | `bg`/`surface`/`border`/`text`/`muted` via CSS var, dark & light mode masing-masing didefinisikan terpisah di `src/styles.css` |
| Font | Display: Space Grotesk · Body: Inter |
| Warna danger | `#EF6262` (dark) / rgb(200,50,50) (light) |

**Catatan retheme**: warna primer app ini pernah ditukar dari Red → Yellow-mustard mengikuti
keputusan final "Honest Series Design System v2" (Games & Tunes ditukar posisi warna dari draf
awal). Token CSS di `src/styles.css` sudah mencerminkan hasil final ini (lihat komentar inline
`--neon` di file tersebut).

### UX Writing / Microcopy
| Konteks | Gunakan | Hindari |
|---|---|---|
| Berhasil simpan/log sesi/import | Toast sukses (lihat `src/features/shared/Toast.tsx`) | gagal diam-diam tanpa feedback |
| Gagal simpan/koneksi hilang | Pesan ramah via `src/features/shared/friendlyError.ts` | error code mentah dari Supabase/RAWG |
| Backlog lama tidak disentuh | Badge "backlog aging" (dari view `backlog_aging`) | nada menghakimi soal "menumpuk"/"malas main" |
| Data kosong | Ajakan ramah untuk mulai tambah game | "No data found" |

**Prinsip:** Nada selalu netral-mengamati/ramah, sesuai filosofi "catat apa adanya" Honest
Series — penting khususnya untuk badge backlog aging, supaya tidak terasa menghakimi kebiasaan main user.

### Tampilan Responsif
| Breakpoint | Layout |
|---|---|
| Mobile (<768px) | Grid kartu game 1-2 kolom, panel sesi/stats jadi collapsible |
| Tablet (768–1023px) | Grid kartu 3 kolom |
| Desktop (≥1024px) | Grid kartu 4+ kolom, Dashboard dengan panel samping (StatsPanel, Heatmap) |

### UI Detail
- Loading state: perlu dicek konsisten di semua fitur (search RAWG, import CSV preview, dsb) — belum ada skeleton loader terdokumentasi eksplisit
- Dark mode: `darkMode: 'class'` + toggle tersimpan di `profiles.theme` (`'dark'`/`'light'`) — sudah persist per user, bukan cuma preferensi sistem
- Heatmap aktivitas: kalender kecil 12 minggu terakhir dari data `play_sessions`

---

## 🗄️ Bagian AI (Database & Arsitektur Teknis)

### Skema Database (Supabase)
```sql
-- Table: profiles
id            uuid primary key references auth.users(id)
display_name  text
username      text unique
avatar_url    text
theme         text default 'dark' check in ('dark','light')
currency      text default 'IDR'
is_public     boolean default false   -- kontrol privasi granular per user
created_at    timestamptz
updated_at    timestamptz

-- Table: game_list
id                uuid primary key default gen_random_uuid()
user_id           uuid references auth.users(id)
title             text not null
cover_url         text
platforms         text[]
genres            text[]
status            text check in ('wishlist','backlog','playing','completed','dropped','shelved')
hours_played      numeric        -- AUTO-CALCULATED dari play_sessions via trigger, jangan diedit manual
rating            numeric(check 0-10)
release_year      integer
metacritic_score  integer (0-100)
notes             text
review            text
source            text check in ('rawg','manual')
external_id       text           -- unique per user (partial index, where not null)
priority          integer default 0
price_paid        numeric
started_at        date
completed_at      date
last_played_at    timestamptz    -- AUTO dari play_sessions
created_at        timestamptz
updated_at        timestamptz

-- Table: play_sessions
id               uuid primary key
user_id          uuid
game_id          uuid references game_list(id)
session_date     date default current_date
minutes_played   integer not null (>0)
note             text
created_at       timestamptz

-- Table: tags / game_tags (many-to-many)
tags: id, user_id, name, color (default '#7dd3fc'), unique(user_id, name)
game_tags: game_id, tag_id (composite primary key)

-- Views:
backlog_aging     -- days_in_backlog per game berstatus backlog/wishlist
yearly_wrap_up    -- games_completed, total_hours, avg_rating, total_spent per user per tahun
```

**Trigger penting**: `play_sessions_recalc` — setiap insert/update/delete di `play_sessions`
otomatis menghitung ulang `game_list.hours_played` dan `last_played_at`. **Jangan pernah edit
`hours_played` secara manual** dari UI — itu akan langsung ketimpa oleh trigger begitu ada
perubahan sesi.

RLS: semua tabel RLS penuh (`auth.uid() = user_id`), kecuali `profiles` dan `game_list` yang
punya policy tambahan untuk akses `anon`/publik kalau `profiles.is_public = true` (lihat
catatan Keamanan Akses di `PRD.md`).

### Tech Stack
- Frontend: Vite + React 18 + TypeScript + Tailwind CSS (bukan Next.js — beda dari Honest Watch)
- Routing: react-router-dom (`/`, `/settings`, `/wrapped`, `/u/:username`, `/reset-password`)
- Database: Supabase (Postgres + RLS + Auth)
- Struktur: feature-based (`src/features/{auth,games,sessions,stats,profile,shared}`), bukan flat `components/`+`lib/`

### Backend
- `api/rawg-search.ts` — Vercel serverless function, proxy ke RAWG API supaya `RAWG_API_KEY`
  tidak pernah sampai ke browser bundle
- Sisanya (CRUD game_list, play_sessions, tags) langsung client → Supabase lewat RLS

### Deploy
- Vercel, ENV: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client-side), `RAWG_API_KEY` (server-only, tanpa prefix `VITE_`)
- `vercel.json` — rewrite `/api/*` ke serverless function, semua route lain fallback ke `index.html` (SPA routing)
- Setelah deploy: tambahkan domain ke Supabase → Authentication → URL Configuration (untuk reset password)

### Alur Data
```
Tambah game (search RAWG atau manual)
  → AddGameDialog → /api/rawg-search (proxy, key aman di server)
  → insert game_list (client → Supabase, RLS)

Log sesi main
  → SessionPanel → insert play_sessions
  → trigger play_sessions_recalc → update game_list.hours_played + last_played_at otomatis

Import CSV
  → ImportCsvDialog → preview dulu → insert massal ke game_list
    (skip baris tanpa judul, status tidak dikenal → default 'backlog')

Public profile (/u/:username)
  → cek profiles.is_public = true → tampilkan game_list read-only
    (query eksplisit hanya select title, cover_url, platforms, genres, status,
    hours_played, rating, release_year — TIDAK termasuk notes/review/price_paid/
    external_id, lihat src/features/profile/profile.ts baris ~34)
```
