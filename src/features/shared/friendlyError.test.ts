import { describe, it, expect } from "vitest";
import { friendlyError } from "./friendlyError";

describe("friendlyError", () => {
  it("translates invalid login credentials", () => {
    expect(friendlyError(new Error("Invalid login credentials"))).toBe(
      "Email atau password salah. Coba periksa lagi."
    );
  });

  it("translates duplicate username constraint", () => {
    expect(
      friendlyError(new Error('duplicate key value violates unique constraint "profiles_username_key"'))
    ).toContain("Username ini sudah dipakai");
  });

  it("translates network errors", () => {
    expect(friendlyError(new Error("Failed to fetch"))).toContain("Koneksi bermasalah");
  });

  it("falls back to a generic Indonesian message for unknown errors", () => {
    expect(friendlyError(new Error("some_weird_postgres_code_42P01"))).toBe(
      "Terjadi kesalahan. Coba lagi sebentar."
    );
  });

  it("never leaks raw technical text for unknown errors", () => {
    const result = friendlyError(new Error("relation \"public.foo\" does not exist"));
    expect(result).not.toContain("relation");
    expect(result).not.toContain("public.foo");
  });
});
