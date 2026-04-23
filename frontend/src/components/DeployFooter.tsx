import { Link } from "react-router-dom";
import { GitCommitVertical } from "lucide-react";

const formatBuildTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const DeployFooter = () => (
  <footer className="no-print mt-6 pt-4 border-t border-border/60">
    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 text-center">
      Built from{" "}
      <a
        href={`https://github.com/tylinndd/nest/commit/${__COMMIT_SHA__}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-mono font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <GitCommitVertical className="h-3 w-3" aria-hidden />
        {__COMMIT_SHA__}
      </a>
      {" · "}
      <time dateTime={__BUILD_TIME__}>{formatBuildTime(__BUILD_TIME__)}</time>
      {" · "}
      <Link
        to="/team"
        className="font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        The team
      </Link>
    </p>
  </footer>
);
