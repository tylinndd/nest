import { create } from "zustand";
import { toast } from "sonner";

/**
 * Exclusive text-to-speech controller.
 *
 * Uses the Web Speech API on-device so spoken content never leaves the
 * browser. Only one utterance plays at a time — starting a new one
 * cancels the previous one. Calling `start` with the currently-speaking
 * id acts as a toggle and stops playback.
 *
 * Deliberately global (not per-component) so a "Listen" button on page A
 * can be cancelled by the same button on page B without leaking state.
 */

const synth = (): SpeechSynthesis | null => {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
};

type SpeechState = {
  speakingId: string | null;
  supported: boolean;
  start: (id: string, text: string) => void;
  stop: () => void;
};

export const useSpeech = create<SpeechState>((set, get) => ({
  speakingId: null,
  supported: synth() !== null,
  start: (id, text) => {
    const s = synth();
    if (s === null) return;
    if (!text.trim()) return;
    if (get().speakingId === id) {
      s.cancel();
      set({ speakingId: null });
      return;
    }
    s.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (get().speakingId === id) set({ speakingId: null });
    };
    utterance.onerror = (event) => {
      if (get().speakingId === id) set({ speakingId: null });
      // "interrupted" and "canceled" fire during our own s.cancel() calls —
      // not real failures, don't bother the user.
      const kind = (event as SpeechSynthesisErrorEvent).error;
      if (kind === "interrupted" || kind === "canceled") return;
      toast.error(
        "Read-aloud didn't start. Your device might be muted or the voice isn't available.",
        { id: "speech-error" },
      );
    };
    set({ speakingId: id });
    s.speak(utterance);
  },
  stop: () => {
    const s = synth();
    if (s !== null) s.cancel();
    set({ speakingId: null });
  },
}));
