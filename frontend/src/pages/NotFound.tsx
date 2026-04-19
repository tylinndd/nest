import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("[nest] 404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl text-primary">
          That page isn't here.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be outdated, or the route hasn't been built yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
