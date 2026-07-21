import type { Game } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportJson(games: Game[]) {
  download(
    new Blob([JSON.stringify(games, null, 2)], { type: "application/json" }),
    "game-library.json"
  );
}

const CSV_FIELDS: (keyof Game)[] = [
  "title",
  "status",
  "rating",
  "hours_played",
  "release_year",
  "metacritic_score",
  "platforms",
  "genres",
  "price_paid",
  "source",
  "notes",
];

function csvEscape(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? v.join("; ") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCsv(games: Game[]) {
  const header = CSV_FIELDS.join(",");
  const body = games.map((g) => CSV_FIELDS.map((k) => csvEscape(g[k])).join(",")).join("\n");
  download(new Blob([header + "\n" + body], { type: "text/csv" }), "game-library.csv");
}

export function exportMarkdown(games: Game[]) {
  const grouped: Record<string, Game[]> = {};
  for (const g of games) {
    grouped[g.status] = grouped[g.status] ?? [];
    grouped[g.status].push(g);
  }
  let md = "# Honest Games\n\n";
  for (const [status, list] of Object.entries(grouped)) {
    md += `## ${STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}\n\n`;
    for (const g of list) {
      md += `- **${g.title}**${g.rating ? ` — ${g.rating}/10` : ""}${
        g.hours_played ? ` — ${g.hours_played}h` : ""
      }\n`;
    }
    md += "\n";
  }
  download(new Blob([md], { type: "text/markdown" }), "game-library.md");
}

export interface ImportRow {
  title: string;
  status?: string;
  platforms?: string;
  genres?: string;
  rating?: string;
  hours?: string;
}

const HEADER_ALIASES: Record<string, keyof ImportRow> = {
  title: "title",
  judul: "title",
  status: "status",
  platforms: "platforms",
  platform: "platforms",
  genres: "genres",
  genre: "genres",
  rating: "rating",
  hours: "hours",
  "jam main": "hours",
  jam: "hours",
};

export function parseCsvImport(text: string): ImportRow[] {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    header.forEach((h, i) => {
      const key = HEADER_ALIASES[h];
      if (key) row[key] = (cells[i] ?? "").trim();
    });
    return row as unknown as ImportRow;
  });
}
