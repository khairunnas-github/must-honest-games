import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { friendlyError } from "@/features/shared/friendlyError";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(friendlyError(error));
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/"), 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-sm">
        <h1 className="font-display font-semibold text-lg mb-4">Atur Password Baru</h1>
        {done ? (
          <p className="text-neon text-sm">Password diperbarui. Mengalihkan...</p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-neon"
            />
            <p className="text-[11px] text-muted -mt-2">Minimal 6 karakter.</p>
            {error && <p className="text-danger text-xs">{error}</p>}
            <button type="submit" className="bg-neon text-black rounded-lg py-2 text-sm font-medium">
              Simpan Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
