import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { InstallPrompt } from "./InstallPrompt";
import { useInstallPrompt } from "@/lib/installPromptStore";

class MockPromptEvent extends Event {
  public userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  public prompt: () => Promise<void>;
  constructor(outcome: "accepted" | "dismissed" = "accepted") {
    super("beforeinstallprompt");
    this.userChoice = Promise.resolve({ outcome });
    this.prompt = () => Promise.resolve();
  }
}

const renderAt = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <InstallPrompt />
    </MemoryRouter>,
  );

describe("InstallPrompt", () => {
  beforeEach(() => {
    useInstallPrompt.setState({ visits: 0, dismissed: false });
  });

  it("does not render on the first visit", () => {
    renderAt("/");
    expect(screen.queryByRole("region", { name: /install nest/i })).toBeNull();
  });

  it("does not render on sensitive routes even after two visits", () => {
    useInstallPrompt.setState({ visits: 1 });
    act(() => {
      window.dispatchEvent(new MockPromptEvent());
    });
    renderAt("/onboarding/1");
    expect(screen.queryByRole("region", { name: /install nest/i })).toBeNull();
  });

  it("renders on second visit when the beforeinstallprompt event fires, and dismisses persistently", () => {
    useInstallPrompt.setState({ visits: 1 });
    renderAt("/");
    act(() => {
      window.dispatchEvent(new MockPromptEvent());
    });
    const banner = screen.getByRole("region", { name: /install nest/i });
    expect(banner).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /dismiss install prompt/i }));
    expect(screen.queryByRole("region", { name: /install nest/i })).toBeNull();
    expect(useInstallPrompt.getState().dismissed).toBe(true);
  });

  it("does not re-render once the user has dismissed it", () => {
    useInstallPrompt.setState({ visits: 5, dismissed: true });
    renderAt("/");
    act(() => {
      window.dispatchEvent(new MockPromptEvent());
    });
    expect(screen.queryByRole("region", { name: /install nest/i })).toBeNull();
  });
});
