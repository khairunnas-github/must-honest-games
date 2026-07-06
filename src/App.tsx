import { useAuth } from "./lib/useAuth";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted text-sm">
        Memuat...
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <Dashboard user={user} />;
}
