import { useEffect, useState } from "react";
import { X, Search, Plus } from "lucide-react";
import type { RawgResult, Status } from "@/lib/types";
import { addGame, addGameFromRawg } from "@/features/games/games";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast, runSafely } from "@/features/shared/Toast";

export default function AddGameDialog({
  userId,
  onClose,
  onAdded,
}: {
  userId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<"search" | "manual">("search");
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 400);
  const [results, setResults] = useState<RawgResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualTitle, setManualTitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/rawg-search?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResults(data.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  async function pickResult(r: RawgResult, status: Status) {
    const ok = await runSafely(toast, () => addGameFromRawg(userId, r, status).then(() => undefined), `${r.title} ditambahkan.`);
    if (ok) {
      onAdded();
      onClose();
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    const ok = await runSafely(
      toast,
      () => addGame(userId, { title: manualTitle.trim(), status: "backlog" }).then(() => undefined),
      "Game ditambahkan."
    );
    if (ok) {
      onAdded();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted">
          <X size={18} />
        </button>
        <h3 className="font-display font-semibold text-lg mb-4">Tambah Game</h3>

        <div className="flex gap-2 mb-4 text-sm">
          <button
            onClick={() => setTab("search")}
            className={`px-3 py-1.5 rounded-lg ${tab === "search" ? "bg-neon text-black" : "border border-border"}`}
          >
            Cari Online
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`px-3 py-1.5 rounded-lg ${tab === "manual" ? "bg-neon text-black" : "border border-border"}`}
          >
            Manual
          </button>
        </div>

        {tab === "search" && (
          <>
            <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2 mb-3">
              <Search size={15} className="text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Judul game..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
            {loading && <p className="text-xs text-muted">Mencari...</p>}
            {!loading && debounced.trim() && results.length === 0 && (
              <p className="text-xs text-muted">
                Nggak ketemu game dengan judul itu. Coba kata kunci lain, atau tambah manual
                lewat tab "Manual".
              </p>
            )}
            <div className="flex flex-col gap-2">
              {results.map((r) => (
                <div key={r.external_id} className="flex items-center gap-3 border border-border rounded-lg p-2">
                  {r.cover_url && (
                    <img src={r.cover_url} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-[11px] text-muted">
                      {r.release_year ?? "?"} · Metacritic {r.metacritic_score ?? "-"}
                    </p>
                  </div>
                  <button
                    onClick={() => pickResult(r, "backlog")}
                    className="text-xs bg-neon text-black rounded-lg px-2 py-1 flex items-center gap-1"
                  >
                    <Plus size={12} /> Backlog
                  </button>
                  <button
                    onClick={() => pickResult(r, "wishlist")}
                    className="text-xs border border-border rounded-lg px-2 py-1"
                  >
                    Wishlist
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "manual" && (
          <form onSubmit={submitManual} className="flex flex-col gap-3">
            <input
              autoFocus
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Judul game"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-neon"
            />
            <button type="submit" className="bg-neon text-black rounded-lg py-2 text-sm font-medium">
              Tambah ke Backlog
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
