import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { getPublicProfileByUsername } from "./profile";
import { STATUS_LABEL } from "@/lib/types";

export default function PublicProfilePage() {
  const { username } = useParams();
  const [state, setState] = useState<"loading" | "notfound" | "ready">("loading");
  const [data, setData] = useState<Awaited<ReturnType<typeof getPublicProfileByUsername>>>(null);

  useEffect(() => {
    if (!username) return;
    getPublicProfileByUsername(username)
      .then((res) => {
        setData(res);
        setState(res ? "ready" : "notfound");
      })
      .catch(() => setState("notfound"));
  }, [username]);

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Memuat...</div>;
  }

  if (state === "notfound" || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted text-sm">
        <p>Library ini tidak ditemukan atau tidak publik.</p>
        <Link to="/" className="text-neon">Kembali</Link>
      </div>
    );
  }

  const completed = data.games.filter((g) => g.status === "completed").length;
  const totalHours = data.games.reduce((sum, g) => sum + (g.hours_played ?? 0), 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-2">
          <Gamepad2 className="text-neon" size={22} />
          <h1 className="font-display font-semibold">
            Library {data.profile.display_name || data.profile.username}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="flex gap-4 text-sm text-muted">
          <span>{data.games.length} game</span>
          <span>{completed} selesai</span>
          <span>{Math.round(totalHours)} jam total</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.games.map((g) => (
            <div key={g.id} className="card overflow-hidden">
              <div
                className="h-28 bg-cover bg-center bg-surface"
                style={{ backgroundImage: g.cover_url ? `url(${g.cover_url})` : undefined }}
              />
              <div className="p-2">
                <p className="text-sm font-medium truncate">{g.title}</p>
                <p className="text-[11px] text-muted">
                  {STATUS_LABEL[g.status as keyof typeof STATUS_LABEL] ?? g.status}
                  {g.rating ? ` · ${g.rating}/10` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
