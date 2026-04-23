import { BookOpenCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CORPUS_SIZE,
  formatVerifiedDate,
  formatVerifiedDateShort,
} from "@/lib/corpus";

export const CorpusBadge = () => (
  <Link
    to="/how-it-works"
    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors whitespace-nowrap"
    aria-label={`${CORPUS_SIZE} Georgia sources, verified ${formatVerifiedDate()}. See how Nest answers.`}
  >
    <BookOpenCheck className="h-3 w-3 shrink-0" aria-hidden />
    <span>
      {CORPUS_SIZE} sources · verified {formatVerifiedDateShort()}
    </span>
  </Link>
);
