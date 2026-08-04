import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import AuthPage from "@/features/auth/AuthPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import Dashboard from "@/app/Dashboard";
import SettingsPage from "@/features/profile/SettingsPage";
import WrappedPage from "@/features/stats/WrappedPage";
import PublicProfilePage from "@/features/profile/PublicProfilePage";
import { ToastProvider } from "@/features/shared/Toast";
import type { User } from "@supabase/supabase-js";
import { getMyProfile } from "@/features/profile/profile";

// /u/:username — halaman read-only untuk share library ke teman via link.
// Ini TERPISAH dari fitur sign-up publik (yang memang sudah dihapus).
// Kamu tetap bisa share progress library-mu ke siapa saja tanpa mereka perlu login.

function Gate({ children }: { children: (user: User) => React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      getMyProfile(user.id)
        .then((profile) => {
          if (profile.theme === "light") {
            document.documentElement.classList.add("light");
          } else {
            document.documentElement.classList.remove("light");
          }
        })
        .catch(() => {});
    } else {
      document.documentElement.classList.remove("light"); // default dark jika belum login
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Memuat...
      </div>
    );
  }
  if (!user) return <AuthPage />;
  return <>{children(user)}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/settings" element={<Gate>{(user) => <SettingsPage user={user} />}</Gate>} />
          <Route path="/wrapped" element={<Gate>{(user) => <WrappedPage user={user} />}</Gate>} />
          <Route path="/" element={<Gate>{(user) => <Dashboard user={user} />}</Gate>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
