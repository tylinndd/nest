import { useEffect, useState } from "react";
import {
  Copy,
  Check,
  Volume2,
  Square,
  Mail,
  Printer,
  ListChecks,
  UserCheck,
  Star,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSaved } from "@/store/saved";
import { WhyAnswerPopover } from "@/components/WhyAnswerPopover";
import { openPrintWindow, escapeHtml } from "@/lib/print";
import type { Passage } from "@/lib/api";

type Props = {
  text: string;
  source?: string;
  share?: boolean;
  question?: string;
  messageId?: string;
  passages?: Passage[];
};

const supportsSpeech = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  typeof window.SpeechSynthesisUtterance === "function";

const buildShareBody = (text: string, source: string | undefined) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines = [text.trim()];
  if (source) lines.push("", `Source: ${source}`);
  lines.push("", `Shared from Nest · ${origin}`);
  return lines.join("\n");
};

const buildConfirmBody = (
  answer: string,
  source: string | undefined,
  question: string | undefined,
) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines: string[] = [
    "Hi — I'm using Nest (a transition tool built for Georgia foster youth) and I want to make sure this is right before I act on it. Could you confirm?",
    "",
  ];
  if (question && question.trim()) {
    lines.push("My question:", question.trim(), "");
  }
  lines.push("What Nest told me:", answer.trim(), "");
  if (source) lines.push(`Source cited by Nest: ${source}`, "");
  lines.push(
    "Is this still accurate for my situation? Anything I should do differently?",
    "",
    `Sent from Nest · ${origin}`,
  );
  return lines.join("\n");
};

const splitIntoSteps = (text: string): string[] => {
  const clean = text.trim();
  if (!clean) return [];
  const bySentence = clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20);
  if (bySentence.length >= 2) return bySentence.slice(0, 12);
  const byPara = clean
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  return (byPara.length >= 2 ? byPara : [clean]).slice(0, 12);
};

const printAnswer = (text: string, source: string | undefined) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const body = escapeHtml(text.trim()).replace(/\n/g, "<br />");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>From Nest</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
         color: #1a1a1a; margin: 0; padding: 48px; line-height: 1.55;
         font-size: 14px; }
  .wordmark { font-weight: 700; color: #2f5d3a; font-size: 18px;
              letter-spacing: 0.02em; }
  h1 { font-size: 22px; font-weight: 700; margin: 8px 0 24px; color: #2f5d3a; }
  p { margin: 0 0 16px; }
  .answer { white-space: pre-wrap; border-left: 3px solid #2f5d3a;
            padding: 4px 0 4px 16px; margin: 0 0 24px; color: #1a1a1a; }
  .source { display: inline-block; font-size: 11px; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.1em;
            color: #555; background: #eee; padding: 4px 10px; border-radius: 999px; }
  footer { margin-top: 40px; font-size: 11px; color: #777; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="wordmark">Nest</div>
  <h1>From Nest</h1>
  <div class="answer">${body}</div>
  ${source ? `<span class="source">Source &middot; ${escapeHtml(source)}</span>` : ""}
  <footer>Shared from Nest &middot; ${escapeHtml(origin)}</footer>
</body>
</html>`;

  openPrintWindow(html);
};

const printAnswerAsChecklist = (
  text: string,
  source: string | undefined,
  question: string | undefined,
) => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const steps = splitIntoSteps(text);
  const stepsHtml = steps
    .map(
      (step) =>
        `<li><input type="checkbox" disabled /><span>${escapeHtml(step).replace(/\n/g, "<br />")}</span></li>`,
    )
    .join("");
  const questionHtml =
    question && question.trim()
      ? `<p class="question"><strong>Asked:</strong> ${escapeHtml(question.trim())}</p>`
      : "";
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Checklist from Nest</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
         color: #1a1a1a; margin: 0; padding: 48px; line-height: 1.55;
         font-size: 14px; }
  .wordmark { font-weight: 700; color: #2f5d3a; font-size: 18px;
              letter-spacing: 0.02em; }
  h1 { font-size: 22px; font-weight: 700; margin: 8px 0 20px; color: #2f5d3a; }
  .question { margin: 0 0 20px; padding: 10px 14px; background: #f5efe2;
              border-radius: 8px; font-size: 13px; color: #3a3a3a; }
  .steps { list-style: none; padding: 0; margin: 0 0 24px; counter-reset: step; }
  .steps li { display: flex; gap: 12px; padding: 12px 0;
              border-bottom: 1px solid #eee; counter-increment: step; }
  .steps li::before { content: counter(step) "."; font-weight: 700;
                      color: #2f5d3a; flex-shrink: 0; min-width: 20px; }
  .steps li span { flex: 1; }
  input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px;
                           flex-shrink: 0; accent-color: #2f5d3a; }
  .source { display: inline-block; font-size: 11px; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.1em;
            color: #555; background: #eee; padding: 4px 10px; border-radius: 999px; }
  footer { margin-top: 40px; font-size: 11px; color: #777; }
  @media print {
    body { padding: 24px; }
    input[type="checkbox"] { border: 1.5px solid #2f5d3a; appearance: none;
                             -webkit-appearance: none; border-radius: 3px; }
  }
</style>
</head>
<body>
  <div class="wordmark">Nest</div>
  <h1>Your checklist from Nest</h1>
  ${questionHtml}
  <ol class="steps">${stepsHtml}</ol>
  ${source ? `<span class="source">Source &middot; ${escapeHtml(source)}</span>` : ""}
  <footer>Generated from Nest &middot; ${escapeHtml(origin)}</footer>
</body>
</html>`;

  openPrintWindow(html);
};

export function ChatMessageActions({
  text,
  source,
  share = true,
  question,
  messageId,
  passages,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const canSpeak = supportsSpeech();
  const saved = useSaved((s) =>
    messageId ? s.items.some((x) => x.id === messageId) : false,
  );
  const addSaved = useSaved((s) => s.add);
  const removeSaved = useSaved((s) => s.remove);

  const handleSaveToggle = () => {
    if (!messageId) return;
    if (saved) {
      removeSaved(messageId);
      toast("Removed from saved", { id: "chat-save", duration: 1500 });
      return;
    }
    addSaved({
      id: messageId,
      answer: text,
      source,
      question,
      savedAt: Date.now(),
      passages,
    });
    toast.success("Saved", { id: "chat-save", duration: 1500 });
  };

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

  const handleCopyLink = async () => {
    if (!question) return;
    const trimmed = question.slice(0, 500).trim();
    if (!trimmed) return;
    try {
      const url = `${window.location.origin}/navigator?ask=${encodeURIComponent(trimmed)}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", {
        id: "chat-share",
        description: "Paste anywhere to re-run this question.",
        duration: 2000,
      });
    } catch {
      toast.error("Couldn't copy link", { id: "chat-share" });
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

  const mailHref = `mailto:?subject=${encodeURIComponent(
    "From Nest",
  )}&body=${encodeURIComponent(buildShareBody(text, source))}`;

  const confirmHref = `mailto:?subject=${encodeURIComponent(
    "Can you confirm this for me?",
  )}&body=${encodeURIComponent(buildConfirmBody(text, source, question))}`;

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
      {question && (
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy a shareable link to this question"
          title="Copy link to this question"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      )}
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
      {share && messageId && (
        <button
          type="button"
          onClick={handleSaveToggle}
          aria-label={saved ? "Remove from saved" : "Save this answer"}
          aria-pressed={saved}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            saved
              ? "text-nest-amber hover:bg-nest-amber/10"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Star
            className="h-3.5 w-3.5"
            fill={saved ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      )}
      <WhyAnswerPopover />
      {share && (
        <>
          <a
            href={mailHref}
            aria-label="Email this answer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
          <a
            href={confirmHref}
            aria-label="Ask a caseworker or trusted adult to confirm"
            title="Ask a caseworker or trusted adult to confirm"
            className="inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Ask a human
          </a>
          <button
            type="button"
            onClick={() => printAnswer(text, source)}
            aria-label="Print this answer"
            title="Print this answer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => printAnswerAsChecklist(text, source, question)}
            aria-label="Print as numbered checklist"
            title="Print as numbered checklist"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ListChecks className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
