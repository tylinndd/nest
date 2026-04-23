import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderLock,
  Keyboard,
  Mic,
  Paperclip,
  Plus,
  Send,
  SquarePen,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { buildChatSeed } from "@/data/placeholder";
import { useProfile } from "@/store/profile";
import { useChat, type ChatMsg } from "@/store/chat";
import { useSaved } from "@/store/saved";
import { useSpeech } from "@/store/speech";
import { usePreferences } from "@/store/preferences";
import { DOCUMENT_CATALOG } from "@/lib/personalize";
import { pickStarterChips } from "@/lib/starterChips";
import { suggestFollowUps } from "@/lib/followUps";
import { linkify } from "@/lib/linkify";
import { postChat, ApiError } from "@/lib/api";
import { toBackendProfile } from "@/lib/profileMap";
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
import { SourceReveal } from "@/components/SourceReveal";
import { ChatMessageActions } from "@/components/ChatMessageActions";
import { SpeakButton } from "@/components/SpeakButton";
import { CorpusBadge } from "@/components/CorpusBadge";
import { ChatExportButton } from "@/components/ChatExportButton";
import { ShortcutCheatsheet } from "@/components/ShortcutCheatsheet";
import { cn } from "@/lib/utils";

type Msg = ChatMsg;


const formatReceipt = (
  elapsedMs: number | undefined,
  passages: { source_name: string }[] | undefined,
): string | null => {
  if (elapsedMs === undefined || !passages || passages.length === 0) {
    return null;
  }
  const seconds = (elapsedMs / 1000).toFixed(1);
  const passageCount = passages.length;
  const sourceCount = new Set(passages.map((p) => p.source_name)).size;
  const passageWord = passageCount === 1 ? "passage" : "passages";
  const sourceWord = sourceCount === 1 ? "source" : "sources";
  return `Answered in ${seconds}s from ${passageCount} ${passageWord} across ${sourceCount} ${sourceWord}.`;
};

const CLIENT_CRISIS_RE =
  /(suicide|kill myself|hurt myself|self harm|\bunsafe\b|\babuse\b|homeless tonight|need help right now|i am not safe)/i;

const CRISIS_REPLY = {
  text:
    "You deserve immediate human support right now. Call 988 for crisis help, or 211 Georgia for urgent housing, food, and support.",
  source: "988 · 211 Georgia",
};

const NETWORK_FALLBACK = {
  text:
    "I'm having trouble reaching Navigator right now. For urgent help, call 211 Georgia: dial 2-1-1.",
  source: "211 Georgia",
};

const OFFLINE_FALLBACK = {
  text:
    "You're offline, so I can't look anything up right now — but Nest still works. Your task list is on the Path page. Your documents are in the Vault. For urgent help, the Emergency page has every number you need: 988 for crisis, 211 for Georgia help, 911 for emergencies. Reconnect and ask me again whenever you're ready.",
  source: "Nest · offline mode",
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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const askFiredRef = useRef(false);
  const profileName = useProfile((s) => s.name);
  const profileAge = useProfile((s) => s.age);
  const profileHousing = useProfile((s) => s.housing);
  const profileEducation = useProfile((s) => s.education);
  const profileDocs = useProfile((s) => s.documentsHave);
  const profileHealth = useProfile((s) => s.health);
  const uploadedDocs = useProfile((s) => s.uploadedDocs);
  const messages = useChat((s) => s.messages);
  const setMessages = useChat((s) => s.setMessages);
  const addMessage = useChat((s) => s.addMessage);
  const clearChat = useChat((s) => s.clear);
  const savedCount = useSaved((s) => s.items.length);
  const hasSeenListenHint = usePreferences((s) => s.hasSeenListenHint);
  const markListenHintSeen = usePreferences((s) => s.markListenHintSeen);
  const speechSupported = useSpeech((s) => s.supported);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(() => useChat.persist.hasHydrated());

  const attachableDocs = useMemo(
    () =>
      DOCUMENT_CATALOG.filter((d) => uploadedDocs.includes(d.id)).map((d) => ({
        id: d.id,
        title: d.title,
      })),
    [uploadedDocs],
  );
  const suggestionChips = useMemo(
    () =>
      pickStarterChips({
        name: profileName,
        age: profileAge,
        county: "",
        documentsHave: profileDocs,
        uploadedDocs,
        education: profileEducation,
        housing: profileHousing,
        health: profileHealth,
        completedTaskIds: [],
      }),
    [
      profileName,
      profileAge,
      profileHousing,
      profileEducation,
      profileDocs,
      profileHealth,
      uploadedDocs,
    ],
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const crisisRedirectRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isComposingRef = useRef(false);
  const voiceSupported = useMemo(() => getSpeechRecognition() !== null, []);

  // Crisis route handoff. Delay ~1.8s so the CRISIS_REPLY message lands on
  // screen before we swap to /emergency — otherwise the router change
  // eats the only moment the user sees the "call 988 / 211" text, and the
  // hand-off feels like the app flinched instead of routing them.
  const CRISIS_HANDOFF_MS = 1800;
  const scheduleCrisisHandoff = () => {
    if (crisisRedirectRef.current !== null) {
      window.clearTimeout(crisisRedirectRef.current);
    }
    crisisRedirectRef.current = window.setTimeout(() => {
      crisisRedirectRef.current = null;
      navigate("/emergency", { state: { fromCrisis: true } });
    }, CRISIS_HANDOFF_MS);
  };

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

  const realAssistantReplies = useMemo(
    () => messages.filter((m) => m.role === "assistant").length - 1,
    [messages],
  );

  useEffect(() => {
    if (hasSeenListenHint) return;
    if (!speechSupported) return;
    if (realAssistantReplies < 1) return;
    const t = window.setTimeout(() => {
      toast("Tip: tap Listen on any answer", {
        description: "Nest can read replies out loud.",
        duration: 6000,
      });
      markListenHintSeen();
    }, 900);
    return () => window.clearTimeout(t);
  }, [hasSeenListenHint, markListenHintSeen, realAssistantReplies, speechSupported]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      if (crisisRedirectRef.current !== null) {
        window.clearTimeout(crisisRedirectRef.current);
        crisisRedirectRef.current = null;
      }
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

  const handleNewChat = () => {
    if (messages.length === 0) return;
    abortRef.current?.abort();
    abortRef.current = null;
    clearChat();
    setInput("");
    setTyping(false);
    setAttachOpen(false);
    toast.success("New chat started", { id: "chat-clear", duration: 1500 });
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;

    const userMsg: Msg = { id: safeId(), role: "user", text };
    addMessage(userMsg);
    setInput("");

    if (CLIENT_CRISIS_RE.test(text)) {
      addMessage({
        id: safeId(),
        role: "assistant",
        text: CRISIS_REPLY.text,
        source: CRISIS_REPLY.source,
        fallback: true,
      });
      scheduleCrisisHandoff();
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      addMessage({
        id: safeId(),
        role: "assistant",
        text: OFFLINE_FALLBACK.text,
        source: OFFLINE_FALLBACK.source,
        fallback: true,
      });
      return;
    }

    setTyping(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const backendProfile = toBackendProfile(useProfile.getState());
      const t0 = performance.now();
      const res = await postChat(text, backendProfile, controller.signal);
      const elapsedMs = performance.now() - t0;

      const followUps = suggestFollowUps(text, res.answer);
      const reply: Msg = {
        id: safeId(),
        role: "assistant",
        text: res.answer,
        elapsedMs,
        ...(res.sources.length > 0
          ? { source: res.sources.join(" · ") }
          : {}),
        ...(res.passages.length > 0 ? { passages: res.passages } : {}),
        ...(followUps.length > 0 ? { followUps } : {}),
      };
      addMessage(reply);

      if (res.route_to_emergency) scheduleCrisisHandoff();
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof DOMException && err.name === "AbortError") return;

      const detail =
        err instanceof ApiError && err.status === 503
          ? "The Navigator AI is not configured yet. Call 211 Georgia for urgent help."
          : "Check your connection or call 211 Georgia: dial 2-1-1.";

      toast.error("Can't reach Navigator right now", {
        id: "navigator-api-error",
        description: detail,
      });

      addMessage({
        id: safeId(),
        role: "assistant",
        text: NETWORK_FALLBACK.text,
        source: NETWORK_FALLBACK.source,
        fallback: true,
      });
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setTyping(false);
      }
    }
  };

  useEffect(() => {
    if (askFiredRef.current) return;
    if (!hydrated) return;
    if (messages.length === 0) return;
    const s = location.state as { askPrompt?: string } | null;
    if (!s?.askPrompt) return;
    askFiredRef.current = true;
    const prompt = s.askPrompt;
    navigate(".", { replace: true, state: null });
    void send(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, messages.length, location.state]);

  useEffect(() => {
    if (askFiredRef.current) return;
    if (!hydrated) return;
    if (messages.length === 0) return;
    const raw = searchParams.get("ask");
    if (!raw) return;
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1f\x7f]/.test(raw)) return;
    const prompt = raw.slice(0, 500).trim();
    if (!prompt) return;
    askFiredRef.current = true;
    setSearchParams({}, { replace: true });
    void send(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, messages.length, searchParams]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox")
      ) {
        return;
      }
      const ta = textareaRef.current;
      if (!ta) return;
      e.preventDefault();
      ta.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.altKey || e.shiftKey) return;
      e.preventDefault();
      setCheatsheetOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col">
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Always on · private</p>
            <h1 className="font-display text-3xl text-primary">Ask Navigator</h1>
            <div className="mt-1.5">
              <CorpusBadge />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <>
                  <ChatExportButton />
                  <button
                    type="button"
                    onClick={handleNewChat}
                    aria-label="Start a new chat"
                    title="Start a new chat"
                    className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <SquarePen className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setCheatsheetOpen(true)}
                aria-label="Show keyboard shortcuts"
                title="Keyboard shortcuts (Cmd+/)"
                className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Keyboard className="h-3.5 w-3.5" />
              </button>
              <Link
                to="/how-it-works"
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                How does Nest answer?
              </Link>
            </div>
            {savedCount > 0 && (
              <Link
                to="/saved"
                aria-label={`${savedCount} saved ${savedCount === 1 ? "answer" : "answers"}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <Star className="h-3 w-3" fill="currentColor" strokeWidth={0} />
                Saved · {savedCount}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            const priorUser = !isUser
              ? [...messages.slice(0, idx)]
                  .reverse()
                  .find((p) => p.role === "user")?.text
              : undefined;
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
                    <SourceReveal
                      source={m.source}
                      showProfile={!m.fallback}
                      passages={m.passages}
                    />
                  )}
                </div>
                {!isUser && (
                  <div className="flex flex-wrap items-center gap-2">
                    <SpeakButton id={`nav-${m.id}`} text={m.text} />
                    <ChatMessageActions
                      text={m.text}
                      source={m.source}
                      share={!m.fallback}
                      question={priorUser}
                      messageId={m.id}
                      passages={m.passages}
                    />
                  </div>
                )}
                {!isUser && (() => {
                  const receipt = formatReceipt(m.elapsedMs, m.passages);
                  return receipt ? (
                    <p className="px-1 text-[10px] text-muted-foreground">
                      {receipt}
                    </p>
                  ) : null;
                })()}
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
          <textarea
            ref={textareaRef}
            id="navigator-query"
            name="query"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={(e) => {
              const composing =
                isComposingRef.current ||
                e.nativeEvent.isComposing ||
                e.keyCode === 229;
              if (composing) return;
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void send();
                return;
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            aria-label="Ask Nest anything"
            placeholder={listening ? "Listening…" : "Ask Nest anything…"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="flex-1 resize-none bg-transparent outline-none text-base placeholder:text-muted-foreground leading-[1.45] max-h-[120px] overflow-y-auto"
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
            type="button"
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

      <ShortcutCheatsheet
        open={cheatsheetOpen}
        onOpenChange={setCheatsheetOpen}
      />
    </div>
  );
};

export default Navigator;
