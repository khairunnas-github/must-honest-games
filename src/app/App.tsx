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

function Gate({ children }: { children: (user: User) => React.ReactNode }) {
  const { user, loading } = useAuth();
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
