import { Square, Volume2 } from "lucide-react";
import { useSpeech } from "@/store/speech";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  text: string;
  className?: string;
  compact?: boolean;
};

export const SpeakButton = ({ id, text, className, compact = false }: Props) => {
  const supported = useSpeech((s) => s.supported);
  const speakingId = useSpeech((s) => s.speakingId);
  const start = useSpeech((s) => s.start);
  const stop = useSpeech((s) => s.stop);

  if (!supported) return null;
  const isSpeaking = speakingId === id;

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stop() : start(id, text))}
      aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
      aria-pressed={isSpeaking}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSpeaking
          ? "border-primary/40 text-primary"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {isSpeaking ? (
        <Square className="h-3 w-3" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {!compact && (isSpeaking ? "Stop" : "Listen")}
    </button>
  );
};
