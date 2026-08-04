import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    // Apapun hasilnya (accepted atau dismissed), prompt hanya bisa dipanggil 1 kali.
    setDeferredPrompt(null);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-bg border border-neon rounded-xl p-4 shadow-lg shadow-neon/10 z-50 flex gap-3 animate-in slide-in-from-bottom-4">
      <div className="bg-neon/10 p-2 rounded-lg text-neon self-start">
        <Download size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-text">Install Honest Games</p>
        <p className="text-xs text-muted mt-1">Tambah ke Home Screen agar bisa diakses lebih cepat layaknya aplikasi native.</p>
        <div className="mt-3 flex gap-2">
          <button onClick={handleInstall} className="flex-1 bg-neon text-black text-xs font-medium py-1.5 rounded-lg">
            Install
          </button>
          <button onClick={() => setShow(false)} className="px-3 border border-border text-text text-xs font-medium rounded-lg">
            Nanti
          </button>
        </div>
      </div>
      <button onClick={() => setShow(false)} className="absolute top-2 right-2 text-muted hover:text-text">
        <X size={14} />
      </button>
    </div>
  );
}
