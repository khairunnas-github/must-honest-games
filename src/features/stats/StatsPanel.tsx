import { useEffect, useState } from "react";
import { getStats } from "@/features/games/games";
import { STATUS_LABEL } from "@/lib/types";
import { useToast, runSafely } from "@/features/shared/Toast";

interface Stats {
  byStatus: Record<string, number>;
  totalHours: number;
  totalSpent: number;
  staleBacklogCount: number;
  favoriteGenre: string;
  avgValuePerHour: number | null;
}

export default function StatsPanel({ userId, refreshKey }: { userId: string; refreshKey: number }) {
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    runSafely(toast, async () => {
      setStats(await getStats(userId));
    });
  }, [userId, refreshKey]);

  if (!stats) return null;

  const items = [
    { label: "Total Jam Main", value: `${stats.totalHours}h` },
    { label: "Genre Favorit", value: stats.favoriteGenre },
    { label: "Total Uang", value: `Rp ${stats.totalSpent.toLocaleString("id-ID")}` },
    {
      label: "Rata-rata Rp/Jam",
      value: stats.avgValuePerHour != null ? `Rp ${stats.avgValuePerHour.toLocaleString("id-ID")}` : "-",
    },
    { label: "Backlog Basi (>180 hari)", value: `${stats.staleBacklogCount}` },
  ];

  return (
    <div className="card p-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {items.map((it) => (
          <div key={it.label}>
            <p className="text-[11px] text-muted">{it.label}</p>
            <p className="font-display font-semibold text-lg">{it.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <span key={status} className="chip">
            {STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}
