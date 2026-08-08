-- =====================================================================
-- MUST HONEST GAMES / HONEST GAMES — MIGRATION v3
-- Tambahan ringan (bukan sistem achievement penuh, sengaja simple):
--   1. completion_percent — progres penyelesaian game (0-100), opsional.
--      Cukup buat nunjukkin "udah sejauh mana", tanpa perlu tabel
--      achievements terpisah yang jauh lebih berat untuk maintain.
-- =====================================================================

alter table public.game_list
  add column if not exists completion_percent integer
  check (completion_percent is null or (completion_percent >= 0 and completion_percent <= 100));
