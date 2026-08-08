import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import type { Profile } from "@/lib/types";
import { getMyProfile, updateMyProfile } from "./profile";
import { supabase } from "@/lib/supabase";
import { useToast, runSafely } from "@/features/shared/Toast";
import { friendlyError } from "@/features/shared/friendlyError";

export default function SettingsPage({ user }: { user: User }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    getMyProfile(user.id)
      .then((p) => {
        setProfile(p);
        setDisplayName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setIsPublic(p.is_public);
      })
      .finally(() => setLoading(false));
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
        });
        setProfile(updated);
      },
      "Pengaturan disimpan."
    );
    setSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordBusy(true);
    const ok = await runSafely(
      toast,
      async () => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      },
      "Password berhasil diganti."
    );
    setPasswordBusy(false);
    if (ok) setNewPassword("");
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailBusy(true);
    const ok = await runSafely(
      toast,
      async () => {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
      },
      "Cek email lama & baru kamu untuk konfirmasi perubahan."
    );
    setEmailBusy(false);
    if (ok) setNewEmail("");
  }

  async function deleteAccount() {
    setDeleteBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("no session");
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("delete failed");
      await supabase.auth.signOut();
      navigate("/");
    } catch (err) {
      toast.push(friendlyError(err), "error");
    } finally {
      setDeleteBusy(false);
    }
  }

  const publicUrl = profile?.username ? `${window.location.origin}/u/${profile.username}` : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Memuat pengaturan...
      </div>
    );
  }

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
          <p className="text-sm font-medium">Profil & Koleksi</p>
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
            Jadikan koleksi ini publik (orang lain bisa lihat via link, tidak bisa mengubah;
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

        <div className="card p-4 flex flex-col gap-3">
          <p className="text-sm font-medium">Akun</p>

          <form onSubmit={changePassword} className="flex flex-col gap-2">
            <label className="text-xs text-muted flex flex-col gap-1">
              Ganti Password
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password baru (minimal 6 karakter)"
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text"
              />
            </label>
            <button
              type="submit"
              disabled={passwordBusy}
              className="border border-border rounded-lg py-2 text-sm hover:border-neon disabled:opacity-50 w-fit px-4"
            >
              {passwordBusy ? "Menyimpan..." : "Ganti Password"}
            </button>
          </form>

          <form onSubmit={changeEmail} className="flex flex-col gap-2">
            <label className="text-xs text-muted flex flex-col gap-1">
              Ganti Email ({user.email})
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email baru"
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text"
              />
            </label>
            <button
              type="submit"
              disabled={emailBusy}
              className="border border-border rounded-lg py-2 text-sm hover:border-neon disabled:opacity-50 w-fit px-4"
            >
              {emailBusy ? "Menyimpan..." : "Ganti Email"}
            </button>
          </form>
        </div>

        <div className="card p-4 flex flex-col gap-3 border-danger/30">
          <p className="text-sm font-medium text-danger">Zona Berbahaya</p>
          <p className="text-xs text-muted">
            Menghapus akun akan menghapus seluruh koleksi game, sesi main, dan data kamu secara
            permanen. Tidak bisa dibatalkan.
          </p>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Ketik "HAPUS" untuk konfirmasi'
            className="bg-bg border border-danger/40 rounded-lg px-3 py-2 text-sm text-text"
          />
          <button
            onClick={deleteAccount}
            disabled={deleteConfirm !== "HAPUS" || deleteBusy}
            className="bg-danger/90 hover:bg-danger text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40 w-fit px-4"
          >
            {deleteBusy ? "Menghapus..." : "Hapus Akun Permanen"}
          </button>
        </div>
      </main>
    </div>
  );
}
