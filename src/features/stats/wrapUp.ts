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
