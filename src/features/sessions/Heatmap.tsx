import { useEffect, useState } from "react";
import { fetchHeatmap } from "@/features/sessions/sessions";

export default function Heatmap({ userId }: { userId: string }) {
  const [byDay, setByDay] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchHeatmap(userId, 12).then(setByDay);
  }, [userId]);

  const days: string[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  function levelFor(minutes: number) {
    if (minutes <= 0) return "bg-surface border border-border";
    if (minutes < 30) return "bg-neon/20";
    if (minutes < 60) return "bg-neon/45";
    if (minutes < 120) return "bg-neon/70";
    return "bg-neon";
  }

  return (
    <div className="card p-4">
      <p className="text-xs text-muted mb-2">Aktivitas main 12 minggu terakhir</p>
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
        {days.map((d) => (
          <div
            key={d}
            title={`${d}: ${byDay[d] ?? 0} menit`}
            className={`w-3 h-3 rounded-sm ${levelFor(byDay[d] ?? 0)}`}
          />
        ))}
      </div>
    </div>
  );
}
