import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LifeBuoy, MessageSquare } from "lucide-react";

const DESTINATIONS = [
  {
    to: "/",
    label: "Home",
    description: "Your task list and plan.",
    Icon: Home,
    tone: "bg-secondary text-primary",
  },
  {
    to: "/navigator",
    label: "Ask Navigator",
    description: "Questions about benefits, housing, or school.",
    Icon: MessageSquare,
    tone: "bg-secondary text-primary",
  },
  {
    to: "/emergency",
    label: "Urgent help",
    description: "988, 211, Crisis Text, 911.",
    Icon: LifeBuoy,
    tone: "bg-nest-coral/15 text-nest-coral",
  },
] as const;

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("[nest] 404:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm">
        <p
          aria-hidden
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          404
        </p>
        <h1 className="mt-2 font-display text-3xl text-primary">
          <span className="sr-only">404 — </span>That page isn't here.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be outdated, or the page isn't available. Try one of
          these:
        </p>
        <ul className="mt-6 space-y-3">
          {DESTINATIONS.map(({ to, label, description, Icon, tone }) => (
            <li key={to}>
              <Link
                to={to}
                className="nest-card flex items-center gap-4 p-4 transition hover:bg-secondary/40"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-base text-primary">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default NotFound;
