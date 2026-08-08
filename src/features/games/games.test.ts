import { describe, it, expect } from "vitest";
import { weightedPick } from "./games";

describe("weightedPick", () => {
  it("returns null for empty list", () => {
    expect(weightedPick([], () => 1)).toBeNull();
  });

  it("returns the only item when list has one element", () => {
    expect(weightedPick(["a"], () => 1)).toBe("a");
  });

  it("never returns items outside the input list", () => {
    const items = ["a", "b", "c"];
    for (let i = 0; i < 200; i++) {
      expect(items).toContain(weightedPick(items, () => 1));
    }
  });

  it("heavily favors items with much higher weight over many draws", () => {
    const items = ["low", "high"];
    const weight = (x: string) => (x === "high" ? 100 : 1);
    let highCount = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      if (weightedPick(items, weight) === "high") highCount++;
    }
    // Dengan bobot 100:1, "high" seharusnya kepilih hampir selalu (>90%).
    expect(highCount / trials).toBeGreaterThan(0.9);
  });

  it("still picks zero-weight-adjacent items sometimes (priority 0 = weight 1, not excluded)", () => {
    const items = [0, 0, 0]; // priority 0 semua -> weight 1 semua (priority + 1)
    const weight = (p: number) => p + 1;
    const result = weightedPick(items, weight);
    expect(result).toBe(0);
  });
});
