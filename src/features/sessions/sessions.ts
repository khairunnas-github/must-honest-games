import { supabase } from "@/lib/supabase";
import type { PlaySession, Tag } from "@/lib/types";

export async function fetchSessions(gameId: string) {
  const { data, error } = await supabase
    .from("play_sessions")
    .select("*")
    .eq("game_id", gameId)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PlaySession[];
}

export async function logSession(
  userId: string,
  gameId: string,
  minutes: number,
  date: string,
  note?: string
) {
  const { data, error } = await supabase
    .from("play_sessions")
    .insert({
      user_id: userId,
      game_id: gameId,
      minutes_played: minutes,
      session_date: date,
      note: note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PlaySession;
}

export async function deleteSession(sessionId: string) {
  const { error } = await supabase.from("play_sessions").delete().eq("id", sessionId);
  if (error) throw error;
}

export async function fetchHeatmap(userId: string, weeks = 12) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  const { data, error } = await supabase
    .from("play_sessions")
    .select("session_date, minutes_played")
    .eq("user_id", userId)
    .gte("session_date", since.toISOString().slice(0, 10));
  if (error) throw error;

  const byDay: Record<string, number> = {};
  for (const row of data ?? []) {
    byDay[row.session_date] = (byDay[row.session_date] ?? 0) + row.minutes_played;
  }
  return byDay;
}

export async function fetchTags(userId: string) {
  const { data, error } = await supabase.from("tags").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export async function createTag(userId: string, name: string, color: string) {
  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: userId, name, color })
    .select()
    .single();
  if (error) throw error;
  return data as Tag;
}
