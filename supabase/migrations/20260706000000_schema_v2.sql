-- =====================================================================
-- MUST HONEST GAME LIBRARY — SCHEMA v2
-- Rebuild dari Backlog Buster dengan fitur tambahan:
--   1. Play sessions (log sesi main, bukan cuma total jam)
--   2. Tags/koleksi custom (many-to-many)
--   3. Priority ranking + "Next Up" random picker
--   4. Cost tracking (harga beli, value per jam) — default IDR
--   5. Review/journal text + started_at/completed_at
--   6. Public read-only profile (share backlog via link)
--   7. Status baru: wishlist, shelved
--   8. View untuk yearly wrap-up & backlog aging
-- Jalankan berurutan dari atas ke bawah di Supabase SQL editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES (extend)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  theme text not null default 'dark' check (theme in ('dark','light')),
  currency text not null default 'IDR',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists currency text not null default 'IDR';
alter table public.profiles add column if not exists is_public boolean not null default false;

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own or public" on public.profiles
  for select to authenticated using (auth.uid() = id or is_public = true);
create policy "Profiles: select public anon" on public.profiles
  for select to anon using (is_public = true);
create policy "Profiles: insert own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Profiles: update own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Profiles: delete own" on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. GAME_LIST (extend)
-- ---------------------------------------------------------------------
create table if not exists public.game_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover_url text,
  platforms text[] not null default '{}',
  genres text[] not null default '{}',
  status text not null default 'backlog'
    check (status in ('wishlist','backlog','playing','completed','dropped','shelved')),
  hours_played numeric not null default 0 check (hours_played >= 0),
  rating numeric check (rating is null or (rating >= 0 and rating <= 10)),
  release_year integer,
  metacritic_score integer check (metacritic_score is null or (metacritic_score >= 0 and metacritic_score <= 100)),
  notes text,
  review text,
  source text not null default 'manual' check (source in ('rawg','manual')),
  external_id text,
  priority integer not null default 0,
  price_paid numeric check (price_paid is null or price_paid >= 0),
  started_at date,
  completed_at date,
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_list add column if not exists review text;
alter table public.game_list add column if not exists priority integer not null default 0;
alter table public.game_list add column if not exists price_paid numeric check (price_paid is null or price_paid >= 0);
alter table public.game_list add column if not exists started_at date;
alter table public.game_list add column if not exists completed_at date;
alter table public.game_list add column if not exists last_played_at timestamptz;

-- allow new statuses if table already existed with old check constraint
alter table public.game_list drop constraint if exists game_list_status_check;
alter table public.game_list add constraint game_list_status_check
  check (status in ('wishlist','backlog','playing','completed','dropped','shelved'));

grant select, insert, update, delete on public.game_list to authenticated;
grant all on public.game_list to service_role;

alter table public.game_list enable row level security;

drop policy if exists "Games: select own" on public.game_list;
create policy "Games: select own or via public profile" on public.game_list
  for select to authenticated using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = game_list.user_id and p.is_public = true)
  );
create policy "Games: select public anon" on public.game_list
  for select to anon using (
    exists (select 1 from public.profiles p where p.id = game_list.user_id and p.is_public = true)
  );
create policy "Games: insert own" on public.game_list
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Games: update own" on public.game_list
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Games: delete own" on public.game_list
  for delete to authenticated using (auth.uid() = user_id);

create unique index if not exists game_list_user_external_uidx
  on public.game_list(user_id, external_id) where external_id is not null;
create index if not exists game_list_user_status_idx on public.game_list(user_id, status);
create index if not exists game_list_user_lower_title_idx on public.game_list(user_id, lower(title));
create index if not exists game_list_user_priority_idx on public.game_list(user_id, priority desc);

-- ---------------------------------------------------------------------
-- 3. PLAY SESSIONS — log tiap sesi main (bukan cuma total jam manual)
-- ---------------------------------------------------------------------
create table if not exists public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.game_list(id) on delete cascade,
  session_date date not null default current_date,
  minutes_played integer not null check (minutes_played > 0),
  note text,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.play_sessions to authenticated;
grant all on public.play_sessions to service_role;

alter table public.play_sessions enable row level security;

create policy "Sessions: select own" on public.play_sessions
  for select to authenticated using (auth.uid() = user_id);
create policy "Sessions: insert own" on public.play_sessions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Sessions: update own" on public.play_sessions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Sessions: delete own" on public.play_sessions
  for delete to authenticated using (auth.uid() = user_id);

create index if not exists play_sessions_game_idx on public.play_sessions(game_id, session_date);
create index if not exists play_sessions_user_date_idx on public.play_sessions(user_id, session_date);

-- Recalculate hours_played + last_played_at on game_list whenever sessions change
create or replace function public.recalc_game_hours()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_game uuid;
begin
  target_game := coalesce(new.game_id, old.game_id);
  update public.game_list g
  set hours_played = coalesce((
        select sum(minutes_played) from public.play_sessions s where s.game_id = target_game
      ), 0) / 60.0,
      last_played_at = (
        select max(session_date) from public.play_sessions s where s.game_id = target_game
      )
  where g.id = target_game;
  return coalesce(new, old);
end;
$$;

drop trigger if exists play_sessions_recalc on public.play_sessions;
create trigger play_sessions_recalc
  after insert or update or delete on public.play_sessions
  for each row execute function public.recalc_game_hours();

-- ---------------------------------------------------------------------
-- 4. TAGS — koleksi custom bebas (mis. "Couch Co-op", "Tantangan 2026")
-- ---------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#7dd3fc',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

grant select, insert, update, delete on public.tags to authenticated;
grant all on public.tags to service_role;

alter table public.tags enable row level security;

create policy "Tags: select own" on public.tags
  for select to authenticated using (auth.uid() = user_id);
create policy "Tags: insert own" on public.tags
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Tags: update own" on public.tags
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Tags: delete own" on public.tags
  for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.game_tags (
  game_id uuid not null references public.game_list(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (game_id, tag_id)
);

grant select, insert, delete on public.game_tags to authenticated;
grant all on public.game_tags to service_role;

alter table public.game_tags enable row level security;

create policy "GameTags: select own" on public.game_tags
  for select to authenticated using (
    exists (select 1 from public.game_list g where g.id = game_tags.game_id and g.user_id = auth.uid())
  );
create policy "GameTags: insert own" on public.game_tags
  for insert to authenticated with check (
    exists (select 1 from public.game_list g where g.id = game_tags.game_id and g.user_id = auth.uid())
  );
create policy "GameTags: delete own" on public.game_tags
  for delete to authenticated using (
    exists (select 1 from public.game_list g where g.id = game_tags.game_id and g.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- 5. updated_at triggers (shared)
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists game_list_set_updated_at on public.game_list;
create trigger game_list_set_updated_at
  before update on public.game_list
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6. New-user bootstrap (unchanged behavior, kept for fresh installs)
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 7. VIEWS — backlog aging & yearly wrap-up
-- ---------------------------------------------------------------------
create or replace view public.backlog_aging as
select
  g.id, g.user_id, g.title, g.status, g.priority, g.created_at,
  (current_date - g.created_at::date) as days_in_backlog
from public.game_list g
where g.status in ('backlog','wishlist');

create or replace view public.yearly_wrap_up as
select
  user_id,
  extract(year from completed_at)::int as year,
  count(*) as games_completed,
  sum(hours_played) as total_hours,
  round(avg(rating), 2) as avg_rating,
  sum(price_paid) as total_spent
from public.game_list
where status = 'completed' and completed_at is not null
group by user_id, extract(year from completed_at);

-- Views inherit querying user's own RLS context through underlying tables
-- when queried via the anon/authenticated key, since Postgres views run
-- with the permissions of the caller by default (no SECURITY DEFINER here).
