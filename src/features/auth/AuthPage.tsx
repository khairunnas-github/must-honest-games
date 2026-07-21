import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gamepad2 } from "lucide-react";
import { friendlyError } from "@/features/shared/friendlyError";

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Akun berhasil dibuat. Cek email kamu untuk melanjutkan, lalu masuk di sini.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setInfo("Link reset password sudah dikirim ke email kamu.");
      }
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm card p-6">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Gamepad2 className="text-neon" size={28} />
          <h1 className="font-display font-semibold text-lg">Must Honest Games</h1>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-neon"
          />
          {mode !== "forgot" && (
            <div className="flex flex-col gap-1">
              <input
                type="password"
                required
                minLength={mode === "register" ? 6 : undefined}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-neon"
              />
              {mode === "register" && (
                <p className="text-[11px] text-muted">Minimal 6 karakter.</p>
              )}
            </div>
          )}

          {error && <p className="text-danger text-xs">{error}</p>}
          {info && <p className="text-neon text-xs">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="bg-neon/90 hover:bg-neon text-black font-medium rounded-lg py-2 text-sm transition disabled:opacity-50"
          >
            {mode === "login" ? "Masuk" : mode === "register" ? "Daftar" : "Kirim link reset"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-xs text-muted">
          {mode !== "login" ? (
            <button onClick={() => setMode("login")}>Sudah punya akun? Masuk</button>
          ) : (
            <button onClick={() => setMode("register")}>Belum punya akun? Daftar</button>
          )}
          {mode !== "forgot" && (
            <button onClick={() => setMode("forgot")}>Lupa password?</button>
          )}
        </div>
      </div>
    </div>
  );
}
