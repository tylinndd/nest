import { ExternalLink, Phone, ShieldCheck } from "lucide-react";

export const Statewide211Card = () => (
  <section className="nest-card mt-6 p-5 border-primary/30 bg-primary/[0.04]">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Every Georgia county
        </p>
        <h2 className="mt-1 font-display text-lg text-foreground">
          Don't see your county? Call 211.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Georgia's 211 line routes you to housing, food, healthcare, and
          crisis help in every one of 159 counties — including the ones Nest
          hasn't curated yet.
        </p>
      </div>
      <span className="nest-chip bg-muted text-muted-foreground shrink-0">
        <ShieldCheck className="mr-1 h-3 w-3" strokeWidth={2.5} />
        United Way 211
      </span>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href="tel:211"
        className="nest-pill min-h-[2.5rem] bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
      >
        <Phone className="mr-1 h-4 w-4" />
        Call 211
      </a>
      <a
        href="tel:4046141000"
        className="nest-pill min-h-[2.5rem] bg-secondary text-secondary-foreground text-sm font-semibold"
      >
        <Phone className="mr-1 h-4 w-4" />
        (404) 614-1000
      </a>
      <a
        href="https://211online.unitedwayatlanta.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="nest-pill min-h-[2.5rem] bg-secondary text-secondary-foreground text-sm font-semibold"
      >
        Search online
        <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    </div>

    <p className="mt-3 text-[11px] text-muted-foreground">
      Phone hours for the Atlanta-region line: Mon-Fri 8am-5pm. 211 itself is
      24/7.
    </p>
  </section>
);
