import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSaved, type SavedAnswer } from "@/store/saved";
import { ChatMessageActions } from "@/components/ChatMessageActions";
import { SourceReveal } from "@/components/SourceReveal";
import { linkify } from "@/lib/linkify";
import { cn } from "@/lib/utils";

const formatSavedAt = (ms: number) => {
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildSmsBody = (item: SavedAnswer) => {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const lines: string[] = [];
  if (item.question?.trim()) lines.push(item.question.trim(), "");
  lines.push(item.answer.trim());
  if (item.source) lines.push("", `Source: ${item.source}`);
  lines.push("", `From Nest · ${origin}`);
  return lines.join("\n");
};

const SavedCard = ({
  item,
  onRemove,
}: {
  item: SavedAnswer;
  onRemove: (id: string) => void;
}) => {
  const smsHref = `sms:?body=${encodeURIComponent(buildSmsBody(item))}`;
  const handleRemove = () => {
    onRemove(item.id);
    toast("Removed", { id: "saved-remove", duration: 1500 });
  };
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="nest-card p-4"
    >
      {item.question && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          You asked
        </p>
      )}
      {item.question && (
        <p className="mt-1 text-sm font-semibold text-foreground">
          {item.question}
        </p>
      )}
      <p
        className={cn(
          "text-sm leading-relaxed text-foreground",
          item.question ? "mt-3" : "mt-0",
        )}
      >
        {linkify(item.answer)}
      </p>
      {item.source && (
        <SourceReveal
          source={item.source}
          showProfile={false}
          passages={item.passages}
        />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ChatMessageActions
          text={item.answer}
          source={item.source}
          share
          question={item.question}
        />
        <a
          href={smsHref}
          aria-label="Share via text message"
          className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Text
        </a>
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove from saved"
          className="ml-auto inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-nest-coral/10 hover:text-nest-coral"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">
        Saved {formatSavedAt(item.savedAt)}
      </p>
    </motion.li>
  );
};

const Saved = () => {
  const items = useSaved((s) => s.items);
  const remove = useSaved((s) => s.remove);

  return (
    <div className="px-5 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">Personal library</p>
      <h1 className="font-display text-3xl text-primary">Saved answers</h1>
      <p className="mt-2 text-muted-foreground">
        Answers you starred in Navigator, kept on this device.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 nest-card p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nest-amber/15 text-nest-amber">
            <Star className="h-6 w-6" strokeWidth={2} />
          </span>
          <h2 className="mt-4 font-display text-lg text-foreground">
            Nothing saved yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the star on any Navigator answer to keep it here. Useful for
            things you'll want to show a caseworker, landlord, or trusted
            adult later.
          </p>
          <Link
            to="/navigator"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Go to Navigator
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <SavedCard key={item.id} item={item} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Saved;
