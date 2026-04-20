import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/safeStorage";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: string;
  followUps?: string[];
};

export const CHAT_MESSAGE_CAP = 200;

const cap = (messages: ChatMsg[]): ChatMsg[] =>
  messages.length > CHAT_MESSAGE_CAP
    ? messages.slice(messages.length - CHAT_MESSAGE_CAP)
    : messages;

type ChatState = {
  messages: ChatMsg[];
  setMessages: (updater: (m: ChatMsg[]) => ChatMsg[]) => void;
  addMessage: (msg: ChatMsg) => void;
  clear: () => void;
};

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (updater) =>
        set((s) => ({ messages: cap(updater(s.messages)) })),
      addMessage: (msg) =>
        set((s) => ({ messages: cap([...s.messages, msg]) })),
      clear: () => set({ messages: [] }),
    }),
    {
      name: "nest.chat",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ messages: s.messages }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            "[nest.chat] rehydrate failed, starting fresh:",
            error,
          );
        }
      },
    },
  ),
);
