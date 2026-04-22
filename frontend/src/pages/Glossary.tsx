import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { GLOSSARY, type GlossaryEntry } from "@/lib/glossary";

const ALL_ENTRIES: GlossaryEntry[] = Object.values(GLOSSARY).sort((a, b) =>
  a.term.localeCompare(b.term),
);

const matches = (entry: GlossaryEntry, q: string) => {
  if (q.length === 0) return true;
  const needle = q.toLowerCase();
  return (
    entry.term.toLowerCase().includes(needle) ||
    entry.expansion.toLowerCase().includes(needle) ||
    entry.definition.toLowerCase().includes(needle)
  );
};

const Glossary = () => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => ALL_ENTRIES.filter((e) => matches(e, query)),
    [query],
  );

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-5 pt-6 pb-10 space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/about"
            aria-label="Back to About"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Glossary
          </span>
          <div className="h-11 w-11" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
            <BookOpen className="h-3 w-3" /> Acronyms Nest uses
          </span>
          <h1 className="mt-3 font-display text-3xl text-primary">
            Foster-care vocabulary
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every acronym in the Nest vault, spelled out in plain English. Tap
            any of them inside the app for the quick-reference popover.
          </p>
        </motion.div>

        <label className="nest-card flex items-center gap-2 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or definitions"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search glossary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </label>

        <p className="text-xs text-muted-foreground">
          {filtered.length} of {ALL_ENTRIES.length} terms
        </p>

        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <motion.article
              key={entry.term}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="nest-card p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-display text-lg text-foreground">
                  {entry.term}
                </h2>
                {entry.source && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {entry.source}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-primary">
                {entry.expansion}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {entry.definition}
              </p>
            </motion.article>
          ))}
          {filtered.length === 0 && (
            <div className="nest-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No terms match "{query}". Try a different search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Glossary;
