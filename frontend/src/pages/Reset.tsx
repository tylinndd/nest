import { useEffect } from "react";
import { useProfile } from "@/store/profile";
import { useChat } from "@/store/chat";
import { DEMO_SESSION_KEY, isDemoPersona, profileFor } from "@/lib/demo";

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

      const persona = new URLSearchParams(window.location.search).get("as");
      if (isDemoPersona(persona)) {
        // Seeding after the clear writes a fresh persisted snapshot; the
        // reload below rehydrates from it. Chat is left empty so Navigator
        // seeds its greeting against the freshly-named profile. The
        // sessionStorage flag drives the demo badge in TopBar — scoped to
        // this tab so real users never see it.
        useProfile.setState(profileFor(persona));
        useChat.setState({ messages: [] });
        try {
          window.sessionStorage.setItem(DEMO_SESSION_KEY, persona);
        } catch (err) {
          console.warn("[nest.reset] session flag failed:", err);
        }
        window.location.replace("/navigator");
        return;
      }

      try {
        window.sessionStorage.removeItem(DEMO_SESSION_KEY);
      } catch {
        // ignore
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
