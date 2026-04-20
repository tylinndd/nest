import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ONBOARDING_STEPS } from "./config";

const NUMBERED_STEPS = ONBOARDING_STEPS.slice(0, ONBOARDING_STEPS.length - 1);

export const OnboardingLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSlug =
    ONBOARDING_STEPS.find((s) => location.pathname.endsWith(`/${s}`)) ?? "name";
  const current = Math.max(0, ONBOARDING_STEPS.indexOf(activeSlug));
  const isReview = activeSlug === "review";
  const percent = isReview
    ? 100
    : Math.round(((current + 1) / NUMBERED_STEPS.length) * 100);

  return (
    <div className="min-h-full bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        <TopBar showSaveExit />
        <div className="px-5 pt-2 flex items-center gap-3">
          {current > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Go back"
              className="h-11 w-11 rounded-full"
              onClick={() => navigate(`/onboarding/${ONBOARDING_STEPS[current - 1]}`)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="h-11 w-11" />
          )}
          <div className="flex-1">
            <div
              role="progressbar"
              aria-label="Onboarding progress"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1 w-full overflow-hidden rounded-full bg-border/70"
            >
              <motion.div
                initial={false}
                animate={{ width: `${percent}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                className="h-full bg-primary"
              />
            </div>
          </div>
          <div className="h-11 w-11" />
        </div>
        <main id="main-content" className="flex-1 px-6 py-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex h-full flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
