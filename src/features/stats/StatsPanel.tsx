import { useEffect, useState } from "react";
import { getStats } from "@/features/games/games";
import { getMyProfile } from "@/features/profile/profile";
import { fetchThisYearTotalHours } from "@/features/sessions/sessions";
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
  const [playGoal, setPlayGoal] = useState<number | null>(null);
  const [thisYearHours, setThisYearHours] = useState<number>(0);

  useEffect(() => {
    runSafely(toast, async () => {
      const [s, p, h] = await Promise.all([
        getStats(userId),
        getMyProfile(userId),
        fetchThisYearTotalHours(userId)
      ]);
      setStats(s);
      setPlayGoal(p.play_goal_hours);
      setThisYearHours(h);
    });
  }, [userId, refreshKey]);

  if (!stats) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-2 bg-surface rounded w-3/4" />
              <div className="h-5 bg-surface rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-surface rounded-full w-16" />
          <div className="h-5 bg-surface rounded-full w-20" />
          <div className="h-5 bg-surface rounded-full w-14" />
        </div>
      </div>
    );
  }

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
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(stats.byStatus).map(([status, count]) => (
          <span key={status} className="chip">
            {STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}: {count}
          </span>
        ))}
      </div>
      
      {playGoal && (
        <div className="border-t border-border pt-4 mt-2">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Target Jam Main Tahun Ini</span>
            <span>{thisYearHours}h / {playGoal}h</span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon/80 transition-all duration-500" 
              style={{ width: `${Math.min((thisYearHours / playGoal) * 100, 100)}%` }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
