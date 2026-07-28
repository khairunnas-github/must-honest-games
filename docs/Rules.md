# Rules — Honest Games
*(Sumber utama aturan main AI. CLAUDE.md di root cuma pointer tipis ke file ini — edit di sini, bukan di CLAUDE.md.)*

Referensi lengkap: lihat `docs/PRD.md` (visi & fitur) dan `docs/System.md` (desain + skema + arsitektur).

## Hukum Mutlak: Self-Review Sebelum Lapor Selesai
**Sebelum menyatakan fitur selesai, wajib:**
1. Analisis mandiri (self-review) kode yang baru ditulis
2. Cek potensi bug dan edge case
3. Tangani error umum (koneksi terputus, input kosong, race condition)
4. Tulis/jalankan unit test minimal untuk logika inti (bukan cuma UI) — belum ada unit test
   di project ini sejauh ini; kalau tetap dilewati untuk area tertentu, catat alasannya di
   `Tasks.md` per fitur. Prioritaskan logika kritikal seperti trigger `recalc_game_hours`
   dan filter kolom di public profile query (`profile.ts`) — dua area ini paling sensitif
   kalau salah (data jam main korup, atau data privat ke-expose ke publik)
5. Laporkan hasil self-review secara ringkas sebelum meminta QA visual dari user

Ini penting karena user adalah desainer, bukan programmer — QA dari sisi user akan fokus ke
visual/UX, bukan level kode. AI bertanggung jawab penuh atas kualitas teknis.

## Tech Stack
- Vite + React 18 + TypeScript + Tailwind CSS (bukan Next.js)
- react-router-dom untuk routing
- Supabase (Postgres + RLS + Auth) — akses lewat `src/lib/supabase.ts`
- Vercel serverless function (`api/rawg-search.ts`) untuk proxy RAWG, bukan Next.js API route

## Konvensi Kode
- Struktur **feature-based**: `src/features/{auth,games,sessions,stats,profile,shared}` —
  tiap fitur bawa data layer (`*.ts`) dan komponennya sendiri. **Jangan** balik ke pola flat
  `components/`+`lib/` lama.
- Hindari `any` — selalu deklarasikan tipe eksplisit di TypeScript (lihat `src/lib/types.ts`)
- API key (`RAWG_API_KEY`) **tidak boleh** dipanggil langsung dari client — wajib lewat
  `api/rawg-search.ts`
- Query kolom publik (public profile) wajib eksplisit `select("kolom_a, kolom_b, ...")` —
  **jangan pernah** pakai `select("*")` untuk data yang bisa diakses `anon`/publik, supaya
  kolom sensitif (notes, review, price_paid) tidak ikut ter-expose tanpa sadar
- Toast feedback wajib untuk semua aksi tulis (tambah/edit/hapus/log sesi/import) — pakai
  `src/features/shared/Toast.tsx`, jangan gagal diam-diam

## Yang TIDAK Boleh Dilakukan
- Jangan expose credential/connection string/API key ke client-side
- Jangan edit `game_list.hours_played` secara manual dari UI — nilai ini dikelola sepenuhnya
  oleh trigger `recalc_game_hours` berdasarkan data `play_sessions`
- Jangan gunakan nada menghakimi di microcopy, terutama untuk badge backlog aging (jangan
  terasa seperti menegur user karena "menumpuk" backlog)
- ⚠️ **Soal form/tombol signup publik**: aturan standar ekosistem Honest Series melarang ini.
  **Honest Games saat ini melanggar aturan ini** (mode `"register"` aktif di `AuthPage.tsx`),
  dengan tambahan fitur privasi granular (`profiles.is_public`) yang mengindikasikan ini
  desain yang disengaja. Status: **belum diputuskan resmi**. Jangan hapus/ubah fitur ini
  secara sepihak — lihat `PRD.md` Open Question.

## Commit Convention
- Format: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `chore:` (Conventional Commits)

## Alur Kerja dengan Tasks.md
- Ambil task dari `Tasks.md`, kerjakan, self-review (lihat Hukum Mutlak di atas), lalu update status task
- Kalau user memberi feedback visual/UX di `Tasks.md`, prioritaskan perbaikan itu sebelum lanjut task baru
