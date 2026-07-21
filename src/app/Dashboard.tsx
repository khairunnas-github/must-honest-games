import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { fetchGames, deleteGame, updateGame, type GameFilters } from "@/features/games/games";
import type { Game, Status } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import GameCard from "@/features/games/GameCard";
import StatsPanel from "@/features/stats/StatsPanel";
import AddGameDialog from "@/features/games/AddGameDialog";
import ImportCsvDialog from "@/features/games/ImportCsvDialog";
import NextUpPicker from "@/features/shared/NextUpPicker";
import SessionPanel from "@/features/sessions/SessionPanel";
import EditGameDialog from "@/features/games/EditGameDialog";
import Heatmap from "@/features/sessions/Heatmap";
import { exportJson, exportCsv, exportMarkdown } from "@/features/shared/exportImport";
import { Plus, LogOut, Gamepad2, Download, Settings, Sparkles, Upload } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast, runSafely } from "@/features/shared/Toast";

const STATUS_OPTIONS: Status[] = ["wishlist", "backlog", "playing", "completed", "dropped", "shelved"];

export default function Dashboard({ user }: { user: User }) {
  const toast = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [sort, setSort] = useState<GameFilters["sort"]>("recent");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [sessionGame, setSessionGame] = useState<Game | null>(null);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    await runSafely(toast, async () => {
      const { games, count } = await fetchGames(user.id, {
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        sort,
        page,
        pageSize: 12,
      });
      setGames(games);
      setCount(count);
    });
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch, sort, page, refreshKey]);

  function bump() {
    setRefreshKey((k) => k + 1);
  }

  async function handleStatusChange(id: string, status: Status) {
    const patch: Partial<Game> = { status };
    if (status === "completed") patch.completed_at = new Date().toISOString().slice(0, 10);
    if (status === "playing") patch.started_at = new Date().toISOString().slice(0, 10);
    const ok = await runSafely(
      toast,
      () => updateGame(id, patch).then(() => undefined),
      `Status diubah ke "${STATUS_LABEL[status]}".`
    );
    if (ok) bump();
  }

  async function handleDelete(id: string) {
    const ok = await runSafely(toast, () => deleteGame(id), "Game dihapus.");
    if (ok) bump();
  }

  async function fetchAllForExport() {
    const { games } = await fetchGames(user.id, { pageSize: 1000 });
    return games;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border sticky top-0 bg-bg/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-neon" size={22} />
            <h1 className="font-display font-semibold">Must Honest Games</h1>
          </div>
          <div className="flex items-center gap-2">
            <NextUpPicker userId={user.id} onStarted={bump} />
            <Link to="/wrapped" className="text-muted hover:text-neon" title="Rekap Tahunan">
              <Sparkles size={18} />
            </Link>
            <Link to="/settings" className="text-muted hover:text-neon" title="Pengaturan">
              <Settings size={18} />
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-muted hover:text-danger"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2">
            <StatsPanel userId={user.id} refreshKey={refreshKey} />
          </div>
          <Heatmap userId={user.id} />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 border border-border rounded-lg px-3 py-2 text-sm hover:border-neon"
          >
            <Plus size={15} /> Tambah
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1 border border-border rounded-lg px-3 py-2 text-sm hover:border-neon"
          >
            <Upload size={15} /> Import CSV
          </button>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as Status | "");
              setPage(0);
            }}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Cari judul..."
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as GameFilters["sort"])}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="recent">Terbaru</option>
            <option value="rating">Rating</option>
            <option value="hours">Jam Main</option>
            <option value="priority">Prioritas</option>
            <option value="aging">Paling Lama di Backlog</option>
          </select>

          <div className="flex gap-1 ml-auto">
            <button
              onClick={async () => exportJson(await fetchAllForExport())}
              className="text-xs border border-border rounded-lg px-2 py-2 flex items-center gap-1"
              title="Export JSON"
            >
              <Download size={13} /> JSON
            </button>
            <button
              onClick={async () => exportCsv(await fetchAllForExport())}
              className="text-xs border border-border rounded-lg px-2 py-2"
              title="Export CSV"
            >
              CSV
            </button>
            <button
              onClick={async () => exportMarkdown(await fetchAllForExport())}
              className="text-xs border border-border rounded-lg px-2 py-2"
              title="Export Markdown"
            >
              MD
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-muted">Memuat...</p>}
        {!loading && games.length === 0 && (
          <p className="text-sm text-muted py-10 text-center">
            Belum ada game di sini. Tambah dulu lewat tombol "Tambah" di atas.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onOpenSessions={setSessionGame}
              onEdit={setEditGame}
            />
          ))}
        </div>

        {count > 12 && (
          <div className="flex justify-center gap-2 pt-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-sm border border-border rounded-lg px-3 py-1.5 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="text-xs text-muted self-center">
              Halaman {page + 1} / {Math.ceil(count / 12)}
            </span>
            <button
              disabled={(page + 1) * 12 >= count}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </main>

      {showAdd && (
        <AddGameDialog userId={user.id} onClose={() => setShowAdd(false)} onAdded={bump} />
      )}
      {showImport && (
        <ImportCsvDialog userId={user.id} onClose={() => setShowImport(false)} onImported={bump} />
      )}
      {sessionGame && (
        <SessionPanel
          userId={user.id}
          game={sessionGame}
          onClose={() => setSessionGame(null)}
          onLogged={bump}
        />
      )}
      {editGame && (
        <EditGameDialog
          userId={user.id}
          game={editGame}
          onClose={() => setEditGame(null)}
          onSaved={bump}
        />
      )}
    </div>
  );
}
