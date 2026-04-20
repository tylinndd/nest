import { describe, it, expect, beforeEach } from "vitest";
import { useChat, type ChatMsg } from "./chat";

const msg = (id: string, role: "user" | "assistant" = "user"): ChatMsg => ({
  id,
  role,
  text: `text-${id}`,
});

describe("useChat", () => {
  beforeEach(() => {
    useChat.getState().clear();
  });

  it("starts with an empty message list", () => {
    expect(useChat.getState().messages).toEqual([]);
  });

  it("appends messages via addMessage", () => {
    useChat.getState().addMessage(msg("1"));
    useChat.getState().addMessage(msg("2", "assistant"));

    const { messages } = useChat.getState();
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ id: "1", role: "user" });
    expect(messages[1]).toMatchObject({ id: "2", role: "assistant" });
  });

  it("preserves optional fields on added messages", () => {
    useChat.getState().addMessage({
      id: "1",
      role: "assistant",
      text: "hi",
      source: "resource-42",
      followUps: ["what next?"],
    });
    const [m] = useChat.getState().messages;
    expect(m.source).toBe("resource-42");
    expect(m.followUps).toEqual(["what next?"]);
  });

  it("clears all messages", () => {
    useChat.getState().addMessage(msg("1"));
    useChat.getState().addMessage(msg("2"));
    useChat.getState().clear();
    expect(useChat.getState().messages).toEqual([]);
  });

  it("replaces the list via setMessages updater", () => {
    useChat.getState().addMessage(msg("1"));
    useChat.getState().setMessages(() => [msg("a"), msg("b"), msg("c")]);

    const ids = useChat.getState().messages.map((m) => m.id);
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("gives setMessages the current list for derivation", () => {
    useChat.getState().addMessage(msg("1"));
    useChat.getState().addMessage(msg("2"));
    useChat.getState().setMessages((prev) => prev.filter((m) => m.id !== "1"));

    expect(useChat.getState().messages.map((m) => m.id)).toEqual(["2"]);
  });
});
