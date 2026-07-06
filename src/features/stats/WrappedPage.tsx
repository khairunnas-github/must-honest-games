import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { fetchYearlyWrap, type YearlyWrap } from "./wrapUp";

export default function WrappedPage({ user }: { user: User }) {
  const [years, setYears] = useState<YearlyWrap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYearlyWrap(user.id)
      .then(setYears)
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="text-muted hover:text-neon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display font-semibold">Tahun Ini di Backlog</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        {loading && <p className="text-sm text-muted">Memuat...</p>}
        {!loading && years.length === 0 && (
          <p className="text-sm text-muted py-10 text-center">
            Belum ada game yang ditandai selesai dengan tanggal completed. Selesaikan
            beberapa game dulu, rekap tahunan bakal muncul di sini.
          </p>
        )}
        {years.map((y) => (
          <div key={y.year} className="card p-6 relative overflow-hidden">
            <Trophy className="absolute -right-4 -top-4 text-neon/10" size={100} />
            <p className="text-xs text-muted mb-1">Rekap {y.year}</p>
            <h2 className="font-display font-bold text-3xl mb-4">{y.year}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-muted">Game Selesai</p>
                <p className="font-display font-semibold text-xl">{y.games_completed}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Total Jam</p>
                <p className="font-display font-semibold text-xl">{Math.round(y.total_hours)}h</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Rating Rata-rata</p>
                <p className="font-display font-semibold text-xl">{y.avg_rating ?? "-"}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Total Pengeluaran</p>
                <p className="font-display font-semibold text-xl">
                  Rp {(y.total_spent ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
