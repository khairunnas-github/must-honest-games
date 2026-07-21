import { useState } from "react";
import { pickNextUp, updateGame } from "@/features/games/games";
import type { Game } from "@/lib/types";
import { Dices, X } from "lucide-react";

export default function NextUpPicker({
  userId,
  onStarted,
}: {
  userId: string;
  onStarted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  async function rollPick() {
    setLoading(true);
    const g = await pickNextUp(userId);
    setPick(g);
    setLoading(false);
  }

  async function startPlaying() {
    if (!pick) return;
    await updateGame(pick.id, { status: "playing", started_at: new Date().toISOString().slice(0, 10) });
    setOpen(false);
    setPick(null);
    onStarted();
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          rollPick();
        }}
        className="flex items-center gap-2 bg-neon/90 hover:bg-neon text-black font-medium rounded-lg px-4 py-2 text-sm transition"
      >
        <Dices size={16} /> Pilihkan Aku Game
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-sm text-center relative">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-muted">
              <X size={18} />
            </button>
            {loading && <p className="text-muted text-sm py-8">Mengacak backlog...</p>}
            {!loading && !pick && (
              <p className="text-muted text-sm py-8">
                Backlog kamu kosong. Tambah game dulu, baru bisa diacak.
              </p>
            )}
            {!loading && pick && (
              <>
                {pick.cover_url && (
                  <img src={pick.cover_url} className="rounded-lg mb-3 h-40 w-full object-cover" />
                )}
                <h3 className="font-display font-semibold text-lg mb-1">{pick.title}</h3>
                <p className="text-xs text-muted mb-4">
                  Prioritas {pick.priority} · {pick.platforms.join(", ") || "Platform belum diisi"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={rollPick}
                    className="flex-1 border border-border rounded-lg py-2 text-sm hover:border-neon"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={startPlaying}
                    className="flex-1 bg-neon text-black rounded-lg py-2 text-sm font-medium"
                  >
                    Mulai Main
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
