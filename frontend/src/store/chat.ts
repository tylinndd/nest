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
        set((s) => ({ messages: updater(s.messages) })),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
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
