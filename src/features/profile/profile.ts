import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export async function getMyProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function updateMyProfile(userId: string, patch: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Public lookup by username — relies on RLS allowing anon select when is_public = true. */
export async function getPublicProfileByUsername(username: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, is_public")
    .eq("username", username)
    .eq("is_public", true)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const { data: games, error: gamesError } = await supabase
    .from("game_list")
    .select("id, title, cover_url, platforms, genres, status, hours_played, rating, release_year")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  if (gamesError) throw gamesError;

  return { profile: profile as Profile, games: games ?? [] };
}
