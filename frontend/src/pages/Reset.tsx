import { useEffect } from "react";

export default function Reset() {
  useEffect(() => {
    (async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (err) {
        console.warn("[nest.reset] cleanup failed:", err);
      }
      window.location.replace("/");
    })();
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center text-muted-foreground"
    >
      Resetting…
    </div>
  );
}
