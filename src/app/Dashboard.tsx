import { useEffect, useState, useRef } from "react";
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
import LiveTimer from "@/features/sessions/LiveTimer";
import EditGameDialog from "@/features/games/EditGameDialog";
import Heatmap from "@/features/sessions/Heatmap";
import PwaPrompt from "@/features/shared/PwaPrompt";
import { exportJson, exportCsv, exportMarkdown } from "@/features/shared/exportImport";
import { Plus, LogOut, Gamepad2, Download, Settings, Sparkles, Upload, Menu, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast, runSafely } from "@/features/shared/Toast";

const STATUS_OPTIONS: Status[] = ["wishlist", "backlog", "playing", "completed", "dropped", "shelved"];

export default function Dashboard({ user }: { user: User }) {
  const toast = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [minPriority, setMinPriority] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [sort, setSort] = useState<GameFilters["sort"]>("recent");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [sessionGame, setSessionGame] = useState<Game | null>(null);
  const [liveTimerGame, setLiveTimerGame] = useState<Game | null>(null);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hamburger menu state (mobile)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup menu saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function load() {
    setLoading(true);
    await runSafely(toast, async () => {
      const { games, count } = await fetchGames(user.id, {
        status: statusFilter || undefined,
        platforms: platformFilter ? [platformFilter] : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        minPriority: minPriority ? Number(minPriority) : undefined,
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
  }, [
    user.id,
    page,
    statusFilter,
    platformFilter,
    minRating,
    minPriority,
    debouncedSearch,
    sort,
    refreshKey,
  ]);

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
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-neon" size={22} />
            <h1 className="font-display font-semibold">Honest Games</h1>
          </div>

          {/* Desktop nav — hidden di mobile */}
          <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2" ref={menuRef}>
            <NextUpPicker userId={user.id} onStarted={bump} />
            <button
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg border border-border text-muted hover:text-neon hover:border-neon transition-colors"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute top-14 right-4 w-48 card py-1 shadow-xl z-20 border border-border">
                <Link
                  to="/wrapped"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Sparkles size={15} className="text-muted" />
                  Rekap Tahunan
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={15} className="text-muted" />
                  Pengaturan
                </Link>
                <hr className="border-border my-1" />
                <button
                  onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut size={15} />
                  Keluar
                </button>
              </div>
            )}
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

          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setPage(0);
            }}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Platform</option>
            <option value="PC">PC</option>
            <option value="PlayStation 5">PlayStation 5</option>
            <option value="PlayStation 4">PlayStation 4</option>
            <option value="PlayStation 3">PlayStation 3</option>
            <option value="Xbox Series S/X">Xbox Series S/X</option>
            <option value="Xbox One">Xbox One</option>
            <option value="Xbox 360">Xbox 360</option>
            <option value="Nintendo Switch">Nintendo Switch</option>
            <option value="Wii U">Wii U</option>
            <option value="Wii">Wii</option>
            <option value="Nintendo 3DS">Nintendo 3DS</option>
            <option value="macOS">macOS</option>
            <option value="Linux">Linux</option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
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

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1 border rounded-lg px-3 py-2 text-sm transition ${
              showAdvanced ? "border-neon text-neon" : "border-border hover:border-neon"
            }`}
          >
            <Settings size={15} /> Advanced
          </button>

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

        {showAdvanced && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-surface/50 border border-border rounded-xl animate-in fade-in slide-in-from-top-2">
            <label className="text-xs text-muted flex flex-col gap-1">
              Min. Rating
              <input
                type="number"
                min="0"
                max="10"
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(0);
                }}
                placeholder="0-10"
                className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm w-24 outline-none focus:border-neon"
              />
            </label>
            <label className="text-xs text-muted flex flex-col gap-1">
              Min. Prioritas
              <input
                type="number"
                min="0"
                value={minPriority}
                onChange={(e) => {
                  setMinPriority(e.target.value);
                  setPage(0);
                }}
                placeholder="Angka"
                className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm w-24 outline-none focus:border-neon"
              />
            </label>
          </div>
        )}

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
          onStartTimer={(g) => {
            setLiveTimerGame(g);
            setSessionGame(null);
          }}
        />
      )}
      {liveTimerGame && (
        <LiveTimer 
          game={liveTimerGame} 
          userId={user.id} 
          onClose={() => setLiveTimerGame(null)} 
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
      <PwaPrompt />
    </div>
  );
}
