import { useEffect, useState } from "react";
import type { Game, PlaySession } from "@/lib/types";
import { fetchSessions, logSession, deleteSession } from "@/features/sessions/sessions";
import { X, Trash2 } from "lucide-react";
import { useToast, runSafely } from "@/features/shared/Toast";

export default function SessionPanel({
  userId,
  game,
  onClose,
  onLogged,
  onStartTimer,
}: {
  userId: string;
  game: Game;
  onClose: () => void;
  onLogged: () => void;
  onStartTimer?: (game: Game) => void;
}) {
  const toast = useToast();
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [minutes, setMinutes] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function reload() {
    setSessions(await fetchSessions(game.id));
  }

  useEffect(() => {
    reload();
  }, [game.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await runSafely(
      toast,
      () => logSession(userId, game.id, minutes, date, note || undefined, imageUrl || undefined).then(() => undefined),
      "Sesi disimpan."
    );
    if (ok) {
      setNote("");
      setImageUrl("");
      await reload();
      onLogged();
    }
  }

  async function remove(id: string) {
    const ok = await runSafely(toast, () => deleteSession(id), "Sesi dihapus.");
    setConfirmDeleteId(null);
    if (ok) {
      await reload();
      onLogged();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-md max-h-[85vh] overflow-y-auto p-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted">
          <X size={18} />
        </button>
        <h3 className="font-display font-semibold text-lg mb-1">{game.title}</h3>
        <p className="text-xs text-muted mb-4">Total: {game.hours_played}h dari {sessions.length} sesi</p>

        <form onSubmit={submit} className="flex flex-col gap-2 mb-5">
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm flex-1"
            />
            <div className="flex items-center gap-1 bg-bg border border-border rounded-lg px-2 w-28">
              <input
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="bg-transparent py-1.5 text-sm w-full outline-none"
              />
              <span className="text-xs text-muted shrink-0">menit</span>
            </div>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan singkat (opsional)"
            className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL Gambar / Screenshot (opsional)"
            className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm"
          />

          {onStartTimer && (
            <button
              type="button"
              onClick={() => onStartTimer(game)}
              className="mt-2 w-full border border-neon text-neon font-medium text-sm rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-neon hover:text-black transition"
            >
              Mulai Timer Langsung
            </button>
          )}

          <button
            type="submit"
            className="w-full bg-neon text-black font-semibold text-sm rounded-lg py-2 mt-4 hover:bg-white transition"
          >
            Simpan Sesi
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2 text-sm">
              <div>
                <p>{s.session_date} — {Math.round((s.minutes_played / 60) * 10) / 10}h</p>
                {s.note && <p className="text-xs text-muted">{s.note}</p>}
                {s.image_url && (
                  <img src={s.image_url} alt="Sesi" className="w-full h-auto max-h-32 object-cover rounded mt-2" />
                )}
              </div>
              {confirmDeleteId === s.id ? (
                <button
                  onClick={() => remove(s.id)}
                  onBlur={() => setConfirmDeleteId(null)}
                  autoFocus
                  className="text-danger text-[11px] border border-danger/40 rounded px-1.5 py-0.5 shrink-0"
                >
                  Yakin hapus?
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(s.id)}
                  className="text-muted hover:text-danger"
                  title="Hapus sesi ini"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {sessions.length === 0 && <p className="text-xs text-muted">Belum ada sesi tercatat.</p>}
        </div>
      </div>
    </div>
  );
}
