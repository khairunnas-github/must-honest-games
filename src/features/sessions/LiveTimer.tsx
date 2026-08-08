import { useState, useEffect } from "react";
import type { Game } from "@/lib/types";
import { Play, Pause, Square, X } from "lucide-react";
import { logSession } from "./sessions";
import { useToast, runSafely } from "@/features/shared/Toast";

export default function LiveTimer({
  game,
  userId,
  onClose,
  onLogged
}: {
  game: Game;
  userId: string;
  onClose: () => void;
  onLogged: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let interval: number;
    if (running) {
      interval = window.setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  async function handleStop() {
    setRunning(false);
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) {
      toast.push("Sesi terlalu singkat (kurang dari 1 menit) tidak dicatat.", "error");
      onClose();
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    const ok = await runSafely(
      toast, 
      () => logSession(userId, game.id, minutes, date, "Live timer session").then(() => undefined),
      `Sesi ${minutes} menit disimpan.`
    );
    if (ok) {
      onLogged();
      onClose();
    }
  }

  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="fixed bottom-4 right-4 bg-surface border border-border shadow-xl rounded-xl p-3 z-50 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div>
        <p className="text-[10px] text-muted">Sedang Main</p>
        <p className="text-sm font-semibold truncate max-w-[150px]">{game.title}</p>
      </div>
      <div className="text-xl font-display font-bold text-neon w-16 text-center">
        {mins}:{secs}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="p-1.5 hover:bg-bg rounded">
          {running ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={handleStop} className="p-1.5 hover:bg-bg rounded text-amber" title="Stop & Simpan">
          <Square size={16} />
        </button>
        <button onClick={onClose} className="p-1.5 hover:bg-bg rounded text-danger" title="Batal (tanpa simpan)">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
