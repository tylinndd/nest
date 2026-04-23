import { NavLink } from "react-router-dom";
import { LayoutGroup, motion } from "framer-motion";
import {
  Home as HomeIcon,
  Compass,
  Coins,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: HomeIcon, end: true, tone: "primary" as const },
  { to: "/path", label: "Path", icon: Compass, tone: "primary" as const },
  { to: "/benefits", label: "Benefits", icon: Coins, tone: "primary" as const },
  { to: "/navigator", label: "Navigator", icon: MessageCircle, tone: "primary" as const },
  { to: "/emergency", label: "Emergency", icon: LifeBuoy, tone: "coral" as const },
];

const pillSpring = { type: "spring" as const, stiffness: 380, damping: 32 };

export const BottomNav = () => (
  <nav
    className="no-print fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur"
    aria-label="Primary"
  >
    <div className="mx-auto max-w-md px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <LayoutGroup>
        <ul className="flex h-16 items-center justify-between">
          {tabs.map(({ to, label, icon: Icon, end, tone }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end ?? false}
                aria-label={label}
                className={({ isActive }) =>
                  cn(
                    "group flex min-h-[3rem] flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition-colors",
                    isActive
                      ? tone === "coral"
                        ? "text-nest-coral"
                        : "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative flex h-9 w-14 items-center justify-center">
                      {isActive && (
                        <motion.span
                          layoutId={
                            tone === "coral"
                              ? "bottomnav-pill-coral"
                              : "bottomnav-pill"
                          }
                          transition={pillSpring}
                          aria-hidden
                          className={cn(
                            "absolute inset-0 rounded-full",
                            tone === "coral" ? "bg-nest-coral" : "bg-primary",
                          )}
                        />
                      )}
                      <Icon
                        className={cn(
                          "relative h-5 w-5",
                          isActive &&
                            (tone === "coral"
                              ? "text-white"
                              : "text-primary-foreground"),
                        )}
                        strokeWidth={2}
                      />
                    </span>
                    <span className="leading-none">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </LayoutGroup>
    </div>
  </nav>
);
