export type Status =
  | "wishlist"
  | "backlog"
  | "playing"
  | "completed"
  | "dropped"
  | "shelved";

export const STATUS_LABEL: Record<Status, string> = {
  wishlist: "Wishlist",
  backlog: "Backlog",
  playing: "Sedang Main",
  completed: "Selesai",
  dropped: "Berhenti",
  shelved: "Ditunda",
};

export const STATUS_TONE: Record<Status, string> = {
  wishlist: "bg-surface text-muted border border-border",
  backlog: "bg-surface text-text border border-border",
  playing: "bg-neon/20 text-neon border border-neon/40",
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  dropped: "bg-danger/15 text-danger border border-danger/30",
  shelved: "bg-amber/15 text-amber border border-amber/30",
};

export interface Game {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  platforms: string[];
  genres: string[];
  status: Status;
  hours_played: number;
  rating: number | null;
  release_year: number | null;
  metacritic_score: number | null;
  notes: string | null;
  review: string | null;
  source: "rawg" | "manual";
  external_id: string | null;
  priority: number;
  price_paid: number | null;
  started_at: string | null;
  completed_at: string | null;
  last_played_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

export interface PlaySession {
  id: string;
  user_id: string;
  game_id: string;
  session_date: string;
  minutes_played: number;
  note: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  theme: "dark" | "light";
  currency: string;
  is_public: boolean;
}

export interface RawgResult {
  external_id: string;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  metacritic_score: number | null;
  platforms: string[];
  genres: string[];
}
