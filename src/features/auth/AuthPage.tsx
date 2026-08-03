import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gamepad2 } from "lucide-react";
import { friendlyError } from "@/features/shared/friendlyError";

// Sengaja cuma "login" dan "forgot" — tanpa mode "register"/publik. App ini
// single-user, akun dibuat sekali lewat Supabase Dashboard (Authentication >
// Users > Add user), bukan lewat form pendaftaran publik yang bisa diakses
// siapa aja yang tahu URL app. Lihat docs/PRD.md bagian "Keamanan Akses".
type Mode = "login" | "forgot";

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
          <h1 className="font-display font-semibold text-lg">Honest Games</h1>
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
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-neon"
            />
          )}

          {error && <p className="text-danger text-xs">{error}</p>}
          {info && <p className="text-neon text-xs">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="bg-neon/90 hover:bg-neon text-black font-medium rounded-lg py-2 text-sm transition disabled:opacity-50"
          >
            {mode === "login" ? "Masuk" : "Kirim link reset"}
          </button>
        </form>

        <div className="flex justify-end mt-4 text-xs text-muted">
          {mode === "forgot" ? (
            <button onClick={() => setMode("login")}>Kembali ke halaman masuk</button>
          ) : (
            <button onClick={() => setMode("forgot")}>Lupa password?</button>
          )}
        </div>
      </div>
    </div>
  );
}
