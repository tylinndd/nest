import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSpeech } from "./speech";

type MockUtterance = {
  text: string;
  rate: number;
  pitch: number;
  volume: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type MockSynth = {
  cancel: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
  lastUtterance: MockUtterance | null;
};

const installMockUtterance = () => {
  class U {
    text: string;
    rate = 1;
    pitch = 1;
    volume = 1;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  (globalThis as unknown as { SpeechSynthesisUtterance: typeof U }).SpeechSynthesisUtterance = U;
};

const installMockSynth = (): MockSynth => {
  const mock: MockSynth = {
    cancel: vi.fn(),
    speak: vi.fn((u: MockUtterance) => {
      mock.lastUtterance = u;
    }),
    lastUtterance: null,
  };
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: mock,
  });
  return mock;
};

const resetSpeechStore = () => {
  useSpeech.setState({ speakingId: null, supported: true });
};

describe("useSpeech", () => {
  beforeEach(() => {
    installMockUtterance();
    installMockSynth();
    resetSpeechStore();
  });

  it("starts speaking and sets speakingId", () => {
    useSpeech.getState().start("msg-1", "Hello there");
    expect(useSpeech.getState().speakingId).toBe("msg-1");
  });

  it("toggles off when start is called again with the same id", () => {
    useSpeech.getState().start("msg-1", "Hello there");
    useSpeech.getState().start("msg-1", "Hello there");
    expect(useSpeech.getState().speakingId).toBeNull();
  });

  it("switches to a new id when start is called for a different id", () => {
    useSpeech.getState().start("msg-1", "First");
    useSpeech.getState().start("msg-2", "Second");
    expect(useSpeech.getState().speakingId).toBe("msg-2");
  });

  it("ignores empty or whitespace-only text", () => {
    useSpeech.getState().start("msg-1", "   ");
    expect(useSpeech.getState().speakingId).toBeNull();
  });

  it("clears speakingId on stop", () => {
    useSpeech.getState().start("msg-1", "Hello there");
    useSpeech.getState().stop();
    expect(useSpeech.getState().speakingId).toBeNull();
  });

  it("clears speakingId when the utterance fires onend", () => {
    useSpeech.getState().start("msg-1", "Hello there");
    const u = (window.speechSynthesis as unknown as MockSynth).lastUtterance;
    u?.onend?.();
    expect(useSpeech.getState().speakingId).toBeNull();
  });
});
