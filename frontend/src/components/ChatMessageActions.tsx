import { useEffect, useState } from "react";
import { Copy, Check, Volume2, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = { text: string };

const supportsSpeech = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

export function ChatMessageActions({ text }: Props) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = supportsSpeech();

  useEffect(() => {
    return () => {
      if (canSpeak && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [canSpeak]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied", { id: "chat-copy", duration: 1600 });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy", { id: "chat-copy" });
    }
  };

  const handleSpeak = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.speak(utter);
    setSpeaking(true);
  };

  return (
    <div className="mt-1.5 flex items-center gap-1 pl-1">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy message"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {canSpeak && (
        <button
          type="button"
          onClick={handleSpeak}
          aria-label={speaking ? "Stop reading" : "Read aloud"}
          aria-pressed={speaking}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            speaking
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "hover:bg-muted hover:text-foreground",
          )}
        >
          {speaking ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
