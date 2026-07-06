import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Game, Tag } from "@/lib/types";
import { updateGame, setGameTags } from "@/features/games/games";
import { fetchTags, createTag } from "@/features/sessions/sessions";
import { useToast, runSafely } from "@/features/shared/Toast";

export default function EditGameDialog({
  userId,
  game,
  onClose,
  onSaved,
}: {
  userId: string;
  game: Game;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [rating, setRating] = useState(game.rating ?? "");
  const [priority, setPriority] = useState(game.priority);
  const [pricePaid, setPricePaid] = useState(game.price_paid ?? "");
  const [notes, setNotes] = useState(game.notes ?? "");
  const [review, setReview] = useState(game.review ?? "");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    (game.tags ?? []).map((t) => t.id)
  );
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    fetchTags(userId).then(setAllTags);
  }, [userId]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function addNewTag() {
    if (!newTagName.trim()) return;
    const colors = ["#7dd3fc", "#f5bf42", "#a78bfa", "#4ade80", "#f472b6"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const tag = await createTag(userId, newTagName.trim(), color);
    setAllTags((prev) => [...prev, tag]);
    setSelectedTagIds((prev) => [...prev, tag.id]);
    setNewTagName("");
  }

  async function save() {
    const ok = await runSafely(
      toast,
      async () => {
        await updateGame(game.id, {
          rating: rating === "" ? null : Number(rating),
          priority,
          price_paid: pricePaid === "" ? null : Number(pricePaid),
          notes: notes || null,
          review: review || null,
        });
        await setGameTags(game.id, selectedTagIds);
      },
      "Perubahan disimpan."
    );
    if (ok) {
      onSaved();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted">
          <X size={18} />
        </button>
        <h3 className="font-display font-semibold text-lg mb-4">{game.title}</h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="text-xs text-muted flex flex-col gap-1">
            Rating (0-10)
            <input
              type="number"
              min={0}
              max={10}
              value={rating}
              onChange={(e) => setRating(e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text"
            />
          </label>
          <label className="text-xs text-muted flex flex-col gap-1">
            Prioritas Backlog
            <input
              type="number"
              min={0}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text"
            />
          </label>
          <label className="text-xs text-muted flex flex-col gap-1 col-span-2">
            Harga Beli (Rp)
            <input
              type="number"
              min={0}
              value={pricePaid}
              onChange={(e) => setPricePaid(e.target.value === "" ? "" : Number(e.target.value))}
              className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text"
            />
          </label>
        </div>

        <label className="text-xs text-muted flex flex-col gap-1 mb-3">
          Catatan singkat
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text"
          />
        </label>

        <label className="text-xs text-muted flex flex-col gap-1 mb-3">
          Review / Journal
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            placeholder="Kesan setelah main..."
            className="bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text"
          />
        </label>

        <div className="mb-4">
          <p className="text-xs text-muted mb-2">Tags</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className="chip"
                style={{
                  borderColor: t.color,
                  color: t.color,
                  opacity: selectedTagIds.includes(t.id) ? 1 : 0.4,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag baru..."
              className="bg-bg border border-border rounded-lg px-2 py-1 text-xs flex-1"
            />
            <button onClick={addNewTag} className="text-xs border border-border rounded-lg px-2 py-1">
              Tambah
            </button>
          </div>
        </div>

        <button onClick={save} className="w-full bg-neon text-black rounded-lg py-2 text-sm font-medium">
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
