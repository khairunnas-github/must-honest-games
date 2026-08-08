import { describe, it, expect } from "vitest";
import { parseCsvImport } from "./exportImport";

describe("parseCsvImport", () => {
  it("parses English headers", () => {
    const rows = parseCsvImport("title,status,rating\nElden Ring,backlog,9");
    expect(rows).toEqual([{ title: "Elden Ring", status: "backlog", rating: "9" }]);
  });

  it("parses Indonesian header aliases (Judul, Platform, Genre, Jam Main)", () => {
    const rows = parseCsvImport("Judul,Platform,Genre,Jam Main\nHollow Knight,PC,Metroidvania,12");
    expect(rows[0]).toMatchObject({
      title: "Hollow Knight",
      platforms: "PC",
      genres: "Metroidvania",
      hours: "12",
    });
  });

  it("ignores unrecognized columns instead of crashing", () => {
    const rows = parseCsvImport("title,catatan_random\nCeleste,abc");
    expect(rows[0]).toEqual({ title: "Celeste" });
  });

  it("handles multiple rows", () => {
    const rows = parseCsvImport("title\nA\nB\nC");
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.title)).toEqual(["A", "B", "C"]);
  });
});
