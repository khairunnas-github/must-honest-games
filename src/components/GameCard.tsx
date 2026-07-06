import { useState } from "react";
import type { Game, Status } from "../lib/types";
import { STATUS_LABEL, STATUS_TONE } from "../lib/types";
import { Clock, Star, Trash2, PlayCircle, Tag as TagIcon } from "lucide-react";

interface Props {
  game: Game;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
  onOpenSessions: (game: Game) => void;
  onEdit: (game: Game) => void;
}

const STATUSES: Status[] = ["wishlist", "backlog", "playing", "completed", "dropped", "shelved"];

export default function GameCard({ game, onStatusChange, onDelete, onOpenSessions, onEdit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const daysInBacklog = Math.floor(
    (Date.now() - new Date(game.created_at).getTime()) / 86_400_000
  );
  const isStale = ["backlog", "wishlist"].includes(game.status) && daysInBacklog > 180;
  const valuePerHour =
    game.price_paid && game.hours_played > 0
      ? Math.round((game.price_paid / game.hours_played) * 100) / 100
      : null;

  return (
    <div className="card overflow-hidden flex flex-col">
      <div
        className="h-36 bg-cover bg-center bg-surface"
        style={{ backgroundImage: game.cover_url ? `url(${game.cover_url})` : undefined }}
      />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => onEdit(game)}
            className="font-display font-medium text-sm text-left hover:text-neon transition"
          >
            {game.title}
          </button>
          <button
            onClick={() => (confirmDelete ? onDelete(game.id) : setConfirmDelete(true))}
            className="text-muted hover:text-danger shrink-0"
            title="Hapus"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <select
          value={game.status}
          onChange={(e) => onStatusChange(game.id, e.target.value as Status)}
          className={`text-xs rounded-full px-2 py-1 w-fit ${STATUS_TONE[game.status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {game.hours_played}h
          </span>
          {game.rating != null && (
            <span className="flex items-center gap-1">
              <Star size={12} /> {game.rating}/10
            </span>
          )}
          {valuePerHour != null && <span>Rp {valuePerHour.toLocaleString("id-ID")}/jam</span>}
        </div>

        {isStale && (
          <span className="chip border-amber/40 text-amber w-fit">
            {daysInBacklog} hari di backlog
          </span>
        )}

        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.tags.map((t) => (
              <span
                key={t.id}
                className="chip"
                style={{ borderColor: t.color, color: t.color }}
              >
                <TagIcon size={10} /> {t.name}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onOpenSessions(game)}
          className="mt-auto flex items-center justify-center gap-1 text-xs border border-border rounded-lg py-1.5 hover:border-neon hover:text-neon transition"
        >
          <PlayCircle size={14} /> Log Sesi
        </button>
      </div>
    </div>
  );
}
