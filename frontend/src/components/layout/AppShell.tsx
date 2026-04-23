import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";

export const AppShell = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const isEmergency = location.pathname.startsWith("/emergency");
  return (
    <div className="min-h-full bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        {!isEmergency && <TopBar />}
        <main
          id="main-content"
          className={isEmergency ? "flex-1" : "flex-1 pb-28"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        {!isEmergency && <BottomNav />}
        {!isEmergency && <InstallPrompt />}
      </div>
    </div>
  );
};
