import { describe, it, expect } from "vitest";
import { chatToMarkdown, type ChatExportInput } from "./chatExport";

const fixed = new Date("2026-04-22T15:30:00Z");

describe("chatToMarkdown", () => {
  it("emits a header with Nest branding and ISO timestamp", () => {
    const input: ChatExportInput = { messages: [], exportedAt: fixed };
    const md = chatToMarkdown(input);
    expect(md).toContain("# Nest Navigator transcript");
    expect(md).toContain("2026-04-22");
    expect(md).toContain("This transcript was exported from your device");
  });

  it("shows a placeholder when there are no messages", () => {
    const md = chatToMarkdown({ messages: [], exportedAt: fixed });
    expect(md).toContain("_No messages yet._");
  });

  it("formats user and assistant turns with role labels", () => {
    const md = chatToMarkdown({
      messages: [
        { id: "1", role: "user", text: "Am I eligible for ETV?" },
        { id: "2", role: "assistant", text: "Yes, if you were in care at 14+." },
      ],
      exportedAt: fixed,
    });
    expect(md).toContain("**You:** Am I eligible for ETV?");
    expect(md).toContain("**Nest:** Yes, if you were in care at 14+.");
  });

  it("renders passages as a bulleted source list under the assistant turn", () => {
    const md = chatToMarkdown({
      messages: [
        {
          id: "2",
          role: "assistant",
          text: "ETV covers tuition up to $5,000/yr.",
          passages: [
            {
              source_name: "Embark Georgia",
              snippet: "Chafee ETV provides up to $5,000 per year...",
              url: "https://embarkgeorgia.org/about-etv/",
            },
          ],
        },
      ],
      exportedAt: fixed,
    });
    expect(md).toContain("- [Embark Georgia](https://embarkgeorgia.org/about-etv/)");
  });

  it("falls back to plain source name when passage has no url", () => {
    const md = chatToMarkdown({
      messages: [
        {
          id: "2",
          role: "assistant",
          text: "Here is an answer.",
          passages: [
            { source_name: "DFCS Division 5", snippet: "...", url: null },
          ],
        },
      ],
      exportedAt: fixed,
    });
    expect(md).toContain("- DFCS Division 5");
    expect(md).not.toContain("](null)");
  });

  it("escapes markdown control characters in message text", () => {
    const md = chatToMarkdown({
      messages: [
        { id: "1", role: "user", text: "Does `sudo` work? _maybe_ [yes]" },
      ],
      exportedAt: fixed,
    });
    expect(md).not.toContain("**You:** Does `sudo`");
    expect(md).toContain("\\`sudo\\`");
    expect(md).toContain("\\_maybe\\_");
    expect(md).toContain("\\[yes\\]");
  });

  it("adds a privacy footer reminding the reader of the on-device origin", () => {
    const md = chatToMarkdown({ messages: [], exportedAt: fixed });
    expect(md).toMatch(/generated on your device/i);
  });
});
