import { useState } from "react";
import { X, Upload } from "lucide-react";
import { parseCsvImport, type ImportRow } from "@/features/shared/exportImport";
import { addGame } from "@/features/games/games";
import type { Status } from "@/lib/types";
import { useToast, runSafely } from "@/features/shared/Toast";

const VALID_STATUS: Status[] = ["wishlist", "backlog", "playing", "completed", "dropped", "shelved"];

export default function ImportCsvDialog({
  userId,
  onClose,
  onImported,
}: {
  userId: string;
  onClose: () => void;
  onImported: () => void;
}) {
  const toast = useToast();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [busy, setBusy] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsvImport(String(reader.result)).filter((r) => r.title);
      if (parsed.length === 0) {
        toast.push(
          "Tidak ada baris dengan judul yang bisa dibaca. Pastikan file punya kolom 'Judul' terisi.",
          "error"
        );
        return;
      }
      setRows(parsed);
    };
    reader.onerror = () => toast.push("Gagal membaca file. Coba file lain.", "error");
    reader.readAsText(file);
  }

  async function importAll() {
    setBusy(true);
    const ok = await runSafely(
      toast,
      async () => {
        for (const row of rows) {
          const status = VALID_STATUS.includes(row.status as Status)
            ? (row.status as Status)
            : "backlog";
          await addGame(userId, {
            title: row.title,
            status,
            platforms: row.platforms ? row.platforms.split(";").map((s) => s.trim()) : [],
            genres: row.genres ? row.genres.split(";").map((s) => s.trim()) : [],
            rating: row.rating ? Number(row.rating) : null,
            hours_played: row.hours ? Number(row.hours) : 0,
          });
        }
      },
      `${rows.length} game berhasil diimport.`
    );
    setBusy(false);
    if (ok) {
      onImported();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted">
          <X size={18} />
        </button>
        <h3 className="font-display font-semibold text-lg mb-2">Import dari File CSV</h3>
        <p className="text-xs text-muted mb-4">
          Siapkan file CSV (bisa dibuat dari Excel/Google Sheets) dengan kolom: Judul (wajib
          diisi), Status, Platform, Genre, Rating, dan Jam Main. Kalau ada beberapa platform
          atau genre dalam satu game, pisahkan dengan tanda titik koma ( ; ).
        </p>

        <label className="flex items-center gap-2 border border-dashed border-border rounded-lg px-3 py-4 text-sm justify-center cursor-pointer mb-4">
          <Upload size={16} />
          Pilih file .csv
          <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </label>

        {rows.length > 0 && (
          <>
            <p className="text-xs text-muted mb-2">Preview ({rows.length} baris):</p>
            <div className="flex flex-col gap-1 mb-4 max-h-48 overflow-y-auto text-sm">
              {rows.slice(0, 20).map((r, i) => (
                <div key={i} className="border border-border rounded-lg px-2 py-1">
                  {r.title} <span className="text-muted text-xs">— {r.status || "backlog"}</span>
                </div>
              ))}
              {rows.length > 20 && (
                <p className="text-xs text-muted">...dan {rows.length - 20} lainnya</p>
              )}
            </div>
            <button
              onClick={importAll}
              disabled={busy}
              className="w-full bg-neon text-black rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {busy ? "Mengimport..." : `Import ${rows.length} Game`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
