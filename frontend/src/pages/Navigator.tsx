import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FolderLock, Mic, Paperclip, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { buildChatSeed } from "@/data/placeholder";
import { useProfile } from "@/store/profile";
import { useChat, type ChatMsg } from "@/store/chat";
import { DOCUMENT_CATALOG } from "@/lib/personalize";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKIFY_RE =
  /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(\(\d{3}\)\s?\d{3}[-.\s]?\d{4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)|(\b(?:211|988|911)\b)/g;

const linkify = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIdx = 0;
  for (const m of text.matchAll(LINKIFY_RE)) {
    const start = m.index ?? 0;
    if (start > lastIdx) nodes.push(text.slice(lastIdx, start));
    const [full, email, phone, shortCode] = m;
    const key = `${start}-${full}`;
    const linkClass =
      "underline decoration-current/40 underline-offset-2 hover:decoration-current";
    if (email) {
      nodes.push(
        <a key={key} href={`mailto:${email}`} className={linkClass}>
          {email}
        </a>,
      );
    } else if (phone) {
      nodes.push(
        <a key={key} href={`tel:${phone.replace(/\D/g, "")}`} className={linkClass}>
          {phone}
        </a>,
      );
    } else if (shortCode) {
      nodes.push(
        <a key={key} href={`tel:${shortCode}`} className={linkClass}>
          {shortCode}
        </a>,
      );
    }
    lastIdx = start + full.length;
  }
  if (lastIdx < text.length) nodes.push(text.slice(lastIdx));
  return nodes;
};

type Msg = ChatMsg;

const suggestionChips = [
  "I might be couch-surfing this weekend",
  "What docs do I need for KSU ASCEND?",
  "Can I keep Medicaid after I turn 18?",
];

type CannedReply = { text: string; source?: string; followUps?: string[] };

const matchCanned = (input: string): CannedReply => {
  const q = input.toLowerCase();
  if (/(couch|shelter|homeless|housing|bed tonight|211|tlp|transitional)/.test(q)) {
    return {
      text:
        "211 Georgia can find you a bed tonight — call or text 211 for shelter, food, or utilities. For a longer stay, ask your DFCS worker about approved transitional living programs (TLPs) in your county. Tour at least two before you pick one.",
      source: "211 Georgia · Georgia DFCS",
      followUps: [
        "How do I find a TLP near me?",
        "What if I just need one night?",
      ],
    };
  }
  if (/(ascend|kennesaw|ksu)/.test(q)) {
    return {
      text:
        "KSU ASCEND supports foster, former foster, and unstably housed students with housing, books, and a coach. Email careservices@kennesaw.edu or call 470-578-6777 to schedule an intake. Bring any foster-care documentation you have.",
      source: "Kennesaw State University · CARE Services",
      followUps: [
        "What documents will ASCEND need?",
        "Does ASCEND cover housing year-round?",
      ],
    };
  }
  if (/(chafee|etv|tuition|scholarship|hb\s*136|college)/.test(q)) {
    return {
      text:
        "Chafee ETV covers up to $5,000 a year through age 26 for tuition, books, housing, or transportation. Your DFCS worker or ILP coordinator submits it for you with proof of enrollment. The Georgia Post-Secondary Tuition Waiver (from HB 136) also covers tuition and fees at eligible public colleges and tech schools.",
      source: "Georgia DFCS · Chafee ETV · Post-Secondary Tuition Waiver",
      followUps: [
        "How do I prove enrollment?",
        "Can I use Chafee for a trade school?",
      ],
    };
  }
  if (/(medicaid|health|insurance|doctor|therapist|medical)/.test(q)) {
    return {
      text:
        "You're still covered — Georgia automatically keeps former foster youth on Medicaid until age 26 with no income test. If your card hasn't arrived, call the Georgia Gateway helpline at 877-423-4746 and ask for your Former Foster Care member ID.",
      source: "Georgia DFCS · Former Foster Care Medicaid",
      followUps: [
        "Find me a Medicaid doctor",
        "What if I move out of Georgia?",
      ],
    };
  }
  if (/(transcript|high school|diploma|graduation)/.test(q)) {
    return {
      text:
        "For an official transcript, contact your high school's registrar or guidance office. Georgia foster youth often qualify for a fee waiver — ask whether your DFCS letter covers it. Most schools can send sealed transcripts electronically in 3–5 business days.",
      source: "Your school registrar",
      followUps: [
        "How do I reach my old high school?",
        "What if I got my GED instead?",
      ],
    };
  }
  if (/(birth certificate|\bid\b|ssn|social security|document|docs|vital records)/.test(q)) {
    return {
      text:
        "For a Georgia birth certificate, ask your DFCS caseworker for the foster-care fee-waiver letter, then apply through Vital Records with your photo ID. Social Security cards are free — your caseworker can start that request with you.",
      source: "Georgia DPH · Vital Records",
      followUps: [
        "I don't have a caseworker anymore",
        "How long does Vital Records take?",
      ],
    };
  }
  return {
    text:
      "I can help with housing, benefits, school, health, or documents. Tell me what's most urgent.",
    followUps: [
      "I might be couch-surfing this weekend",
      "Can I keep Medicaid after I turn 18?",
      "What docs do I need for KSU ASCEND?",
    ],
  };
};

type SRConstructor = new () => SpeechRecognition;
type SpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionEvent = {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};
type SpeechRecognitionErrorEvent = { error: string };

const safeId = (): string => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // crypto.randomUUID is gated on a secure context; fall through
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getSpeechRecognition = (): SRConstructor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const TypingDots = () => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.18 }}
    className="flex justify-start"
  >
    <div className="flex items-center gap-1 rounded-3xl rounded-bl-md bg-card border border-border px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
          animate={{ y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
      <span className="sr-only">Navigator is typing</span>
    </div>
  </motion.div>
);

const Navigator = () => {
  const profileName = useProfile((s) => s.name);
  const uploadedDocs = useProfile((s) => s.uploadedDocs);
  const messages = useChat((s) => s.messages);
  const setMessages = useChat((s) => s.setMessages);
  const addMessage = useChat((s) => s.addMessage);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [hydrated, setHydrated] = useState(() => useChat.persist.hasHydrated());

  const attachableDocs = useMemo(
    () =>
      DOCUMENT_CATALOG.filter((d) => uploadedDocs.includes(d.id)).map((d) => ({
        id: d.id,
        title: d.title,
      })),
    [uploadedDocs],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingTimers = useRef<Set<number>>(new Set());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceSupported = useMemo(() => getSpeechRecognition() !== null, []);

  useEffect(() => {
    if (hydrated) return;
    return useChat.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (messages.length === 0) {
      const seed: Msg[] = buildChatSeed(profileName).map((m) => ({
        ...m,
        id: safeId(),
      }));
      setMessages(() => seed);
    }
  }, [hydrated, messages.length, profileName, setMessages]);

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].id;
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    const timers = pendingTimers.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) {
      toast.error("Voice input not supported", {
        id: "navigator-voice-unsupported",
        description: "Try Chrome, Edge, or Safari on iOS 14.5+.",
      });
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      const transcript = result[0].transcript;
      setInput(transcript);
      if (result.isFinal) {
        recognition.stop();
        send(transcript);
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast.error("Microphone blocked", {
          id: "navigator-voice-error",
          description: "Allow microphone access in your browser settings.",
        });
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        toast.error("Voice input failed", {
          id: "navigator-voice-error",
          description: e.error,
        });
      }
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const attachDoc = (title: string) => {
    setAttachOpen(false);
    send(`Looking at my ${title.toLowerCase()} — what do I do next?`);
  };

  const send = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;
    const userMsg: Msg = { id: safeId(), role: "user", text };
    const canned = matchCanned(text);
    const reply: Msg = {
      id: safeId(),
      role: "assistant",
      text: canned.text,
      source: canned.source,
      followUps: canned.followUps,
    };
    addMessage(userMsg);
    setInput("");
    setTyping(true);
    const id = window.setTimeout(() => {
      addMessage(reply);
      pendingTimers.current.delete(id);
      if (pendingTimers.current.size === 0) setTyping(false);
    }, 750);
    pendingTimers.current.add(id);
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      <div className="px-5 pt-5">
        <p className="text-sm text-muted-foreground">Always on · private</p>
        <h1 className="font-display text-3xl text-primary">Ask Navigator</h1>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            const showFollowUps =
              !isUser &&
              m.id === lastAssistantId &&
              !typing &&
              !!m.followUps?.length;
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={
                  isUser
                    ? "flex justify-end"
                    : "flex flex-col items-start gap-2"
                }
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm",
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md",
                  )}
                >
                  <p className="leading-relaxed">{linkify(m.text)}</p>
                  {m.source && (
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Source · {m.source}
                    </span>
                  )}
                </div>
                {showFollowUps && (
                  <div className="flex max-w-[85%] gap-2 overflow-x-auto no-scrollbar">
                    {(m.followUps ?? []).map((f) => (
                      <button
                        key={f}
                        onClick={() => send(f)}
                        className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
          {typing && <TypingDots key="typing" />}
        </AnimatePresence>
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {suggestionChips.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-full bg-nest-cream border border-border px-2 py-2 transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          <button
            type="button"
            aria-label="Attach a document from your vault"
            onClick={() => setAttachOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary"
          >
            <Plus className="h-5 w-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            aria-label="Ask Nest anything"
            placeholder={listening ? "Listening…" : "Ask Nest anything…"}
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleListening}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition",
                listening
                  ? "bg-nest-coral text-white"
                  : "bg-secondary text-primary",
              )}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => send()}
            aria-label="Send"
            disabled={!input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Drawer open={attachOpen} onOpenChange={setAttachOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl text-primary">
              Attach from your vault
            </DrawerTitle>
            <DrawerDescription>
              Navigator will frame its answer around the document you pick.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-2">
            {attachableDocs.length > 0 ? (
              attachableDocs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => attachDoc(d.title)}
                  className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 text-left transition hover:border-primary/40 min-h-[3.5rem]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Paperclip className="h-5 w-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {d.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Secured in your vault
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <Link
                to="/vault"
                onClick={() => setAttachOpen(false)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-4 py-3 transition hover:border-primary/40 min-h-[3.5rem]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <FolderLock className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">
                    No documents yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Secure one in your vault first, then attach it here.
                  </p>
                </div>
              </Link>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Navigator;
