import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import type { Profile } from "@/lib/types";
import { getMyProfile, updateMyProfile } from "./profile";
import { useToast, runSafely } from "@/features/shared/Toast";

export default function SettingsPage({ user }: { user: User }) {
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [currency, setCurrency] = useState("IDR");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile(user.id).then((p) => {
      setProfile(p);
      setDisplayName(p.display_name ?? "");
      setUsername(p.username ?? "");
      setIsPublic(p.is_public);
      setCurrency(p.currency);
    });
  }, [user.id]);

  async function save() {
    setSaving(true);
    await runSafely(
      toast,
      async () => {
        const updated = await updateMyProfile(user.id, {
          display_name: displayName || null,
          username: username || null,
          is_public: isPublic,
          currency,
        });
        setProfile(updated);
      },
      "Pengaturan disimpan."
    );
    setSaving(false);
  }

  const publicUrl = profile?.username ? `${window.location.origin}/u/${profile.username}` : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="text-muted hover:text-neon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-display font-semibold">Pengaturan</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="card p-4 flex flex-col gap-3">
          <label className="text-xs text-muted flex flex-col gap-1">
            Nama Tampilan
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs text-muted flex flex-col gap-1">
            Username (untuk link publik)
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="mis. khairunnas"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <div className="text-xs text-muted flex flex-col gap-1">
            Mata Uang
            <div className="bg-bg border border-border rounded-lg px-3 py-2 text-text">
              Rupiah (Rp)
            </div>
            <span className="text-[10px] text-muted/70">
              Semua harga di aplikasi ini ditampilkan dalam Rupiah untuk saat ini.
            </span>
          </div>

          <label className="flex items-center gap-2 text-sm mt-1">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Jadikan koleksi ini publik (orang lain bisa lihat, tapi tidak bisa mengubah;
            catatan pribadi & harga beli tetap disembunyikan)
          </label>

          {isPublic && !username && (
            <p className="text-[11px] text-amber">
              Isi username dulu di atas biar link publik kamu muncul.
            </p>
          )}

          {isPublic && publicUrl && (
            <div className="flex items-center gap-2 text-xs bg-bg border border-border rounded-lg px-3 py-2">
              <span className="truncate flex-1">{publicUrl}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.push("Link disalin.", "success");
                }}
                className="text-neon shrink-0"
              >
                <Copy size={14} />
              </button>
            </div>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="bg-neon text-black rounded-lg py-2 text-sm font-medium mt-2 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </main>
    </div>
  );
}
