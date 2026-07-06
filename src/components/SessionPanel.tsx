import { useEffect, useState } from "react";
import type { Game, PlaySession } from "../lib/types";
import { fetchSessions, logSession, deleteSession } from "../lib/sessions";
import { X, Trash2 } from "lucide-react";

export default function SessionPanel({
  userId,
  game,
  onClose,
  onLogged,
}: {
  userId: string;
  game: Game;
  onClose: () => void;
  onLogged: () => void;
}) {
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [minutes, setMinutes] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  async function reload() {
    setSessions(await fetchSessions(game.id));
  }

  useEffect(() => {
    reload();
  }, [game.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await logSession(userId, game.id, minutes, date, note || undefined);
    setNote("");
    await reload();
    onLogged();
  }

  async function remove(id: string) {
    await deleteSession(id);
    await reload();
    onLogged();
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
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm flex-1"
            />
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm w-24"
              placeholder="Menit"
            />
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan singkat (opsional)"
            className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm"
          />
          <button type="submit" className="bg-neon text-black rounded-lg py-2 text-sm font-medium">
            Simpan Sesi
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between border border-border rounded-lg px-3 py-2 text-sm">
              <div>
                <p>{s.session_date} — {Math.round((s.minutes_played / 60) * 10) / 10}h</p>
                {s.note && <p className="text-xs text-muted">{s.note}</p>}
              </div>
              <button onClick={() => remove(s.id)} className="text-muted hover:text-danger">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-xs text-muted">Belum ada sesi tercatat.</p>}
        </div>
      </div>
    </div>
  );
}
