import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { Download, ArrowLeft, Trophy } from "lucide-react";
import { fetchYearlyWrap, fetchAllCompletedGames, type YearlyWrap } from "./wrapUp";
import { toPng } from "html-to-image";
import { useRef } from "react";

function YearCard({ 
  y, 
  games 
}: { 
  y: YearlyWrap; 
  games: { platforms: string[]; genres: string[]; completed_at: string | null }[] 
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Compute Distribution
  const platforms: Record<string, number> = {};
  const genres: Record<string, number> = {};
  
  games.forEach(g => {
    if (g.completed_at && new Date(g.completed_at).getFullYear() === y.year) {
      g.platforms.forEach(p => { platforms[p] = (platforms[p] || 0) + 1; });
      g.genres.forEach(gn => { genres[gn] = (genres[gn] || 0) + 1; });
    }
  });

  const topPlatforms = Object.entries(platforms).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topGenres = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 3);

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: "#000000" });
      const link = document.createElement("a");
      link.download = `HonestGames-Wrapped-${y.year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mendownload gambar:", err);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={cardRef} className="card p-6 relative overflow-hidden bg-background">
        <Trophy className="absolute -right-4 -top-4 text-neon/10" size={100} />
        <p className="text-xs text-muted mb-1">Honest Games Rekap</p>
        <h2 className="font-display font-bold text-3xl mb-4">{y.year}</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
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
        
        {/* Distribution Charts */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
          <div>
            <p className="text-[10px] text-muted mb-2 uppercase tracking-wider">Top Platforms</p>
            {topPlatforms.length === 0 ? <p className="text-xs text-muted">-</p> : topPlatforms.map(([name, count]) => (
              <div key={name} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate pr-2">{name}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-neon/80" style={{ width: `${(count / y.games_completed) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] text-muted mb-2 uppercase tracking-wider">Top Genres</p>
            {topGenres.length === 0 ? <p className="text-xs text-muted">-</p> : topGenres.map(([name, count]) => (
              <div key={name} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate pr-2">{name}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="h-1.5 w-full bg-blue-400/80 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400/80" style={{ width: `${(count / y.games_completed) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleDownload}
        className="self-end flex items-center gap-2 text-xs text-muted hover:text-neon transition-colors py-1"
      >
        <Download size={14} /> Download Gambar
      </button>
    </div>
  );
}

export default function WrappedPage({ user }: { user: User }) {
  const [years, setYears] = useState<YearlyWrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [games, setGames] = useState<{ platforms: string[]; genres: string[]; completed_at: string | null }[]>([]);

  useEffect(() => {
    Promise.all([
      fetchYearlyWrap(user.id),
      fetchAllCompletedGames(user.id)
    ])
      .then(([y, g]) => {
        setYears(y);
        setGames(g);
      })
      .catch(() => setError(true))
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
        {!loading && error && (
          <p className="text-sm text-danger py-10 text-center">
            Gagal memuat rekap. Cek koneksi internet kamu, lalu coba muat ulang halaman.
          </p>
        )}
        {!loading && !error && years.length === 0 && (
          <p className="text-sm text-muted py-10 text-center">
            Belum ada game yang ditandai selesai lengkap dengan tanggal penyelesaian.
            Selesaikan beberapa game dulu, rekap tahunan bakal muncul di sini.
          </p>
        )}
        {years.map((y) => (
          <YearCard key={y.year} y={y} games={games} />
        ))}
      </main>
    </div>
  );
}
