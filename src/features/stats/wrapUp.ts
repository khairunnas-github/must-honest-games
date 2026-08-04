import { supabase } from "@/lib/supabase";

export interface YearlyWrap {
  year: number;
  games_completed: number;
  total_hours: number;
  avg_rating: number | null;
  total_spent: number | null;
}

export async function fetchYearlyWrap(userId: string) {
  const { data, error } = await supabase
    .from("yearly_wrap_up")
    .select("*")
    .eq("user_id", userId)
    .order("year", { ascending: false });
  if (error) throw error;
  return (data ?? []) as YearlyWrap[];
}

export async function fetchAllCompletedGames(userId: string) {
  const { data, error } = await supabase
    .from("game_list")
    .select("platforms, genres, hours_played, price_paid, completed_at")
    .eq("user_id", userId)
    .eq("status", "completed");
  if (error) throw error;
  return (data ?? []) as {
    platforms: string[];
    genres: string[];
    hours_played: number;
    price_paid: number | null;
    completed_at: string | null;
  }[];
}
