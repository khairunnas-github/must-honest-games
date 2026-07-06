import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  kind: "success" | "error";
}

interface ToastContextValue {
  push: (message: string, kind?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[100]">
        {items.map((t) => (
          <div
            key={t.id}
            className={`card px-3 py-2 flex items-center gap-2 text-sm shadow-lg ${
              t.kind === "error" ? "border-danger/50" : "border-emerald-500/40"
            }`}
          >
            {t.kind === "error" ? (
              <XCircle size={16} className="text-danger shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-muted ml-1"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/** Wraps an async action, shows an error toast on failure and returns whether it succeeded. */
export async function runSafely(
  toast: ToastContextValue,
  action: () => Promise<void>,
  successMessage?: string
) {
  try {
    await action();
    if (successMessage) toast.push(successMessage, "success");
    return true;
  } catch (err: any) {
    toast.push(err?.message ?? "Terjadi kesalahan. Coba lagi.", "error");
    return false;
  }
}
