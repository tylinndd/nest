import { BookOpenCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { CORPUS_SIZE, formatVerifiedDate } from "@/lib/corpus";

export const CorpusBadge = () => (
  <Link
    to="/how-it-works"
    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/15 transition-colors"
    aria-label={`${CORPUS_SIZE} Georgia sources, verified ${formatVerifiedDate()}. See how Nest answers.`}
  >
    <BookOpenCheck className="h-3 w-3" aria-hidden />
    <span>
      {CORPUS_SIZE} Georgia sources · verified {formatVerifiedDate()}
    </span>
  </Link>
);
