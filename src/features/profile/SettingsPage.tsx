import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  KeyRound,
  Mail,
  ChevronDown,
  ChevronUp,
  Trash2,
  Globe,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { getMyProfile, updateMyProfile } from "./profile";
import { supabase } from "@/lib/supabase";
import { useToast, runSafely } from "@/features/shared/Toast";

export default function SettingsPage({ user }: { user: User }) {
  const toast = useToast();

  // ── State profil ───────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isPublic, setIsPublic] = useState(false);
  const [playGoal, setPlayGoal] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  // ── State keamanan akun ────────────────────────────────────────────────
  const [showSecurity, setShowSecurity] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // ── State hapus akun ───────────────────────────────────────────────────
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setProfileLoading(true);
    getMyProfile(user.id)
      .then((p) => {
        setProfile(p);
        setDisplayName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setTheme(p.theme ?? "dark");
        setIsPublic(p.is_public);
        setPlayGoal(p.play_goal_hours ?? "");
      })
      .finally(() => setProfileLoading(false));
  }, [user.id]);

  // ── Simpan profil ──────────────────────────────────────────────────────
  async function save() {
    setSaving(true);
    await runSafely(
      toast,
      async () => {
        const updated = await updateMyProfile(user.id, {
          display_name: displayName.trim(),
          username: username.trim() || null,
          theme,
          is_public: isPublic,
          play_goal_hours: playGoal === "" ? null : Number(playGoal),
        });
        setProfile(updated);
        if (theme === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      },
      "Pengaturan disimpan."
    );
    setSaving(false);
  }

  // ── Ganti password ─────────────────────────────────────────────────────
  async function changePassword() {
    if (!newPassword) { toast.push("Password baru tidak boleh kosong.", "error"); return; }
    if (newPassword.length < 6) { toast.push("Password minimal 6 karakter.", "error"); return; }
    if (newPassword !== confirmPassword) { toast.push("Konfirmasi password tidak cocok.", "error"); return; }
    setSavingPassword(true);
    await runSafely(
      toast,
      async () => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setNewPassword("");
        setConfirmPassword("");
      },
      "Password berhasil diubah."
    );
    setSavingPassword(false);
  }

  // ── Ganti email ────────────────────────────────────────────────────────
  async function changeEmail() {
    if (!newEmail.trim()) { toast.push("Email baru tidak boleh kosong.", "error"); return; }
    if (newEmail === user.email) { toast.push("Email baru sama dengan email saat ini.", "error"); return; }
    setSavingEmail(true);
    await runSafely(
      toast,
      async () => {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) throw error;
        setNewEmail("");
      },
      "Link konfirmasi dikirim ke email lama & baru. Cek keduanya."
    );
    setSavingEmail(false);
  }

  // ── Hapus akun ─────────────────────────────────────────────────────────
  async function deleteAccount() {
    if (deleteConfirm !== "HAPUS") {
      toast.push("Ketik HAPUS untuk konfirmasi.", "error");
      return;
    }
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? "";
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal menghapus akun.");
      }
      // Sign out setelah akun dihapus
      await supabase.auth.signOut();
    } catch (err: unknown) {
      toast.push(err instanceof Error ? err.message : "Gagal menghapus akun.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const publicUrl =
    isPublic && profile?.username
      ? `${window.location.origin}/u/${profile.username}`
      : null;

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (profileLoading) {
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
          <div className="card p-4 flex flex-col gap-3 animate-pulse">
            <div className="h-3 w-16 bg-surface rounded" />
            <div className="h-9 bg-surface rounded-lg" />
            <div className="h-9 bg-surface rounded-lg" />
            <div className="h-9 bg-neon/20 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
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

        {/* ── Profil ──────────────────────────────────────────────────── */}
        <div className="card p-4 flex flex-col gap-3">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Profil</p>

          <label className="text-xs text-muted flex flex-col gap-1">
            Nama Tampilan
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon"
            />
          </label>

          <label className="text-xs text-muted flex flex-col gap-1">
            Username (untuk link share)
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              placeholder="mis. khairunnas"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon"
            />
          </label>

          {/* Toggle share publik */}
          <div className="flex flex-col gap-2">
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-0.5 accent-neon"
              />
              <span className="text-text">
                Bagikan library ini via link publik
                <span className="block text-[11px] text-muted/70 font-normal mt-0.5">
                  Siapa saja yang punya linknya bisa melihat koleksimu — catatan pribadi &
                  harga beli tetap tersembunyi.
                </span>
              </span>
            </label>

            {isPublic && !username && (
              <p className="text-[11px] text-amber">
                Isi username dulu agar link share-mu muncul.
              </p>
            )}

            {publicUrl && (
              <div className="flex items-center gap-2 text-xs bg-bg border border-border rounded-lg px-3 py-2">
                <Globe size={12} className="text-neon shrink-0" />
                <span className="truncate flex-1 text-muted">{publicUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    toast.push("Link disalin.", "success");
                  }}
                  className="text-neon shrink-0 hover:opacity-70"
                  title="Salin link"
                >
                  <Copy size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-muted flex flex-col gap-1">
            Mata Uang
            <div className="bg-bg border border-border rounded-lg px-3 py-2 text-text">
              Rupiah (Rp)
            </div>
            <span className="text-[10px] text-muted/70">
              Semua harga di aplikasi ini ditampilkan dalam Rupiah untuk saat ini.
            </span>
          </div>

          <label className="text-xs text-muted flex flex-col gap-1">
            Target Jam Main (Tahun Ini)
            <input
              type="number"
              min="0"
              value={playGoal}
              onChange={(e) => setPlayGoal(e.target.value ? Number(e.target.value) : "")}
              placeholder="mis. 150"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon"
            />
            <span className="text-[10px] text-muted/70">
              Biarkan kosong jika tidak ingin memakai target.
            </span>
          </label>

          <div className="text-xs text-muted flex flex-col gap-1">
            Tema Aplikasi
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "dark" | "light")}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon cursor-pointer appearance-none"
            >
              <option value="dark">Gelap (Dark)</option>
              <option value="light">Terang (Light)</option>
            </select>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="bg-neon text-black rounded-lg py-2 text-sm font-medium mt-1 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>

        {/* ── Keamanan Akun ───────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          <button
            onClick={() => setShowSecurity((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-surface/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <KeyRound size={15} className="text-muted" />
              Keamanan Akun
            </span>
            {showSecurity ? (
              <ChevronUp size={15} className="text-muted" />
            ) : (
              <ChevronDown size={15} className="text-muted" />
            )}
          </button>

          {showSecurity && (
            <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border pt-4">
              {/* Ganti Password */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted font-medium flex items-center gap-1">
                  <KeyRound size={12} /> Ganti Password
                </p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru (min. 6 karakter)"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon"
                />
                <button
                  onClick={changePassword}
                  disabled={savingPassword}
                  className="bg-surface border border-border rounded-lg py-2 text-sm hover:border-neon transition-colors disabled:opacity-50"
                >
                  {savingPassword ? "Menyimpan..." : "Ubah Password"}
                </button>
              </div>

              {/* Ganti Email */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted font-medium flex items-center gap-1">
                  <Mail size={12} /> Ganti Email
                </p>
                <p className="text-[11px] text-muted/70">
                  Email saat ini: <span className="text-text">{user.email}</span>
                </p>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email baru"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-neon"
                />
                <p className="text-[10px] text-muted/70 leading-relaxed">
                  ⓘ Supabase akan mengirim link konfirmasi ke email lama <em>dan</em> email baru.
                  Klik keduanya untuk menyelesaikan perubahan.
                </p>
                <button
                  onClick={changeEmail}
                  disabled={savingEmail}
                  className="bg-surface border border-border rounded-lg py-2 text-sm hover:border-neon transition-colors disabled:opacity-50"
                >
                  {savingEmail ? "Mengirim..." : "Kirim Link Konfirmasi"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Zona Bahaya: Hapus Akun ─────────────────────────────────── */}
        <div className="card overflow-hidden border-danger/30">
          <button
            onClick={() => setShowDeleteZone((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-danger/5 transition-colors"
          >
            <span className="flex items-center gap-2 text-danger">
              <Trash2 size={15} />
              Zona Bahaya
            </span>
            {showDeleteZone ? (
              <ChevronUp size={15} className="text-danger/60" />
            ) : (
              <ChevronDown size={15} className="text-danger/60" />
            )}
          </button>

          {showDeleteZone && (
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-danger/20 pt-4">
              <p className="text-sm text-danger font-medium">Hapus Akun Permanen</p>
              <p className="text-[12px] text-muted/80 leading-relaxed">
                Tindakan ini <strong className="text-text">tidak bisa dibatalkan</strong>. Semua
                data — koleksi game, sesi main, tag, dan profil — akan dihapus selamanya dari
                server. Tidak ada cara untuk memulihkannya.
              </p>
              <label className="text-xs text-muted flex flex-col gap-1">
                Ketik <strong className="text-danger">HAPUS</strong> untuk konfirmasi
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="HAPUS"
                  className="bg-bg border border-danger/40 rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-danger font-mono"
                />
              </label>
              <button
                onClick={deleteAccount}
                disabled={deleting || deleteConfirm !== "HAPUS"}
                className="bg-danger/90 hover:bg-danger text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? "Menghapus..." : "Hapus Akun Selamanya"}
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted/50 text-center">Akun: {user.email}</p>
      </main>
    </div>
  );
}
