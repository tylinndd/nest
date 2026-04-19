import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { buildChatSeed } from "@/data/placeholder";
import { useProfile } from "@/store/profile";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; text: string; source?: string };

const suggestionChips = [
  "I might be couch-surfing this weekend",
  "What docs do I need for KSU ASCEND?",
  "Can I keep Medicaid after I turn 18?",
];

type CannedReply = { text: string; source?: string };

const matchCanned = (input: string): CannedReply => {
  const q = input.toLowerCase();
  if (/(couch|shelter|homeless|housing|bed tonight|211|wellroot)/.test(q)) {
    return {
      text:
        "211 Georgia can find you a bed tonight — call or text 211 for shelter, food, or utilities. For a longer stay, Wellroot Family Services at (404) 876-6878 runs transitional housing for Georgia youth aging out.",
      source: "211 Georgia · Wellroot Family Services",
    };
  }
  if (/(ascend|kennesaw|ksu)/.test(q)) {
    return {
      text:
        "KSU ASCEND supports foster, former foster, and unstably housed students with housing, books, and a coach. Email ascend@kennesaw.edu or call 470-578-5260 to schedule an intake. Bring any foster-care documentation you have.",
      source: "Kennesaw State University · ASCEND",
    };
  }
  if (/(chafee|etv|tuition|scholarship|hb\s*136|college)/.test(q)) {
    return {
      text:
        "Chafee ETV covers up to $5,000 a year through age 26 for tuition, books, housing, or transportation. Your DFCS worker or ILP coordinator submits it for you with proof of enrollment. HB 136 also waives tuition at Georgia public colleges.",
      source: "Georgia DFCS · Chafee ETV · HB 136",
    };
  }
  if (/(medicaid|health|insurance|doctor|therapist|medical)/.test(q)) {
    return {
      text:
        "You're still covered — Georgia automatically keeps former foster youth on Medicaid until age 26 with no income test. If your card hasn't arrived, call the Georgia Gateway helpline at 877-423-4746 and ask for your Former Foster Care member ID.",
      source: "Georgia DFCS · Former Foster Care Medicaid",
    };
  }
  if (/(birth certificate|\bid\b|ssn|social security|document|vital records)/.test(q)) {
    return {
      text:
        "For a Georgia birth certificate, ask your DFCS caseworker for the foster-care fee-waiver letter, then apply through Vital Records with your photo ID. Social Security cards are free — your caseworker can start that request with you.",
      source: "Georgia DPH · Vital Records",
    };
  }
  return {
    text:
      "I can help with housing, benefits, school, health, or documents. Try one of the suggestions above, or tell me what's most urgent.",
  };
};

const Navigator = () => {
  const profileName = useProfile((s) => s.name);
  const [messages, setMessages] = useState<Msg[]>(() =>
    buildChatSeed(profileName).map((m) => ({ ...m, id: crypto.randomUUID() })),
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    const canned = matchCanned(text);
    const reply: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: canned.text,
      source: canned.source,
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
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
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={isUser ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-3xl px-4 py-3 text-sm",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border text-foreground rounded-bl-md",
                )}
              >
                <p className="leading-relaxed">{m.text}</p>
                {m.source && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Source · {m.source}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
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
        <div className="flex items-center gap-2 rounded-full bg-nest-cream border border-border px-2 py-2">
          <button
            type="button"
            aria-label="Attach a document"
            onClick={() =>
              toast.info("Attach a document", {
                id: "navigator-attach",
                description: "Pulling from your Vault lands in the next build.",
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary"
          >
            <Plus className="h-5 w-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask Nest anything…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
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
    </div>
  );
};

export default Navigator;
