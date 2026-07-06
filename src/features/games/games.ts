import { supabase } from "@/lib/supabase";
import type { Game, Status, RawgResult } from "@/lib/types";

export interface GameFilters {
  status?: Status;
  platforms?: string[];
  genres?: string[];
  tagIds?: string[];
  search?: string;
  sort?: "recent" | "rating" | "hours" | "priority" | "value" | "aging";
  page?: number;
  pageSize?: number;
}

export async function fetchGames(userId: string, filters: GameFilters) {
  const pageSize = filters.pageSize ?? 12;
  const page = filters.page ?? 0;

  let query = supabase
    .from("game_list")
    .select("*, game_tags(tag_id, tags(*))", { count: "exact" })
    .eq("user_id", userId);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.platforms?.length) query = query.overlaps("platforms", filters.platforms);
  if (filters.genres?.length) query = query.overlaps("genres", filters.genres);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  switch (filters.sort) {
    case "rating":
      query = query.order("rating", { ascending: false, nullsFirst: false });
      break;
    case "hours":
      query = query.order("hours_played", { ascending: false });
      break;
    case "priority":
      query = query.order("priority", { ascending: false });
      break;
    case "aging":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const games: Game[] = (data ?? []).map((row: any) => ({
    ...row,
    tags: (row.game_tags ?? []).map((gt: any) => gt.tags).filter(Boolean),
  }));

  return { games, count: count ?? 0 };
}

export async function addGame(userId: string, input: Partial<Game>) {
  const { data, error } = await supabase
    .from("game_list")
    .insert({ user_id: userId, ...input })
    .select()
    .single();
  if (error) throw error;
  return data as Game;
}

export async function addGameFromRawg(userId: string, rawg: RawgResult, status: Status = "backlog") {
  return addGame(userId, {
    title: rawg.title,
    cover_url: rawg.cover_url,
    platforms: rawg.platforms,
    genres: rawg.genres,
    release_year: rawg.release_year,
    metacritic_score: rawg.metacritic_score,
    source: "rawg",
    external_id: rawg.external_id,
    status,
  });
}

export async function updateGame(gameId: string, patch: Partial<Game>) {
  const { data, error } = await supabase
    .from("game_list")
    .update(patch)
    .eq("id", gameId)
    .select()
    .single();
  if (error) throw error;
  return data as Game;
}

export async function deleteGame(gameId: string) {
  const { error } = await supabase.from("game_list").delete().eq("id", gameId);
  if (error) throw error;
}

export async function setGameTags(gameId: string, tagIds: string[]) {
  await supabase.from("game_tags").delete().eq("game_id", gameId);
  if (tagIds.length) {
    const rows = tagIds.map((tag_id) => ({ game_id: gameId, tag_id }));
    const { error } = await supabase.from("game_tags").insert(rows);
    if (error) throw error;
  }
}

export async function pickNextUp(userId: string) {
  const { data, error } = await supabase
    .from("game_list")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["backlog", "wishlist"]);
  if (error) throw error;
  const rows = (data ?? []) as Game[];
  if (!rows.length) return null;

  // Weighted random by priority (weight = priority + 1 so priority 0 can still be picked)
  const weights = rows.map((g) => g.priority + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < rows.length; i++) {
    r -= weights[i];
    if (r <= 0) return rows[i];
  }
  return rows[rows.length - 1];
}

export async function getStats(userId: string) {
  const { data, error } = await supabase
    .from("game_list")
    .select("status, hours_played, rating, price_paid, genres, platforms, created_at");
  if (error) throw error;
  const rows = (data ?? []) as Pick<
    Game,
    "status" | "hours_played" | "rating" | "price_paid" | "genres" | "platforms" | "created_at"
  >[];

  const byStatus: Record<string, number> = {};
  let totalHours = 0;
  let totalSpent = 0;
  let stale = 0;
  const genreCount: Record<string, number> = {};

  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    totalHours += r.hours_played ?? 0;
    totalSpent += r.price_paid ?? 0;
    if (["backlog", "wishlist"].includes(r.status)) {
      const days = (Date.now() - new Date(r.created_at).getTime()) / 86_400_000;
      if (days > 180) stale += 1;
    }
    for (const g of r.genres ?? []) genreCount[g] = (genreCount[g] ?? 0) + 1;
  }

  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  return {
    byStatus,
    totalHours: Math.round(totalHours * 10) / 10,
    totalSpent,
    staleBacklogCount: stale,
    favoriteGenre,
    avgValuePerHour:
      totalHours > 0 ? Math.round((totalSpent / totalHours) * 100) / 100 : null,
  };
}
