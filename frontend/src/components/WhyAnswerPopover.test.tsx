import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WhyAnswerPopover } from "./WhyAnswerPopover";
import { useProfile } from "@/store/profile";

const resetProfile = (overrides: Partial<ReturnType<typeof useProfile.getState>> = {}) => {
  useProfile.setState({
    name: "",
    age: null,
    county: "",
    documentsHave: [],
    uploadedDocs: [],
    education: null,
    housing: "",
    health: [],
    completedTaskIds: [],
    trustedAdult: null,
    ...overrides,
  });
};

describe("WhyAnswerPopover", () => {
  beforeEach(() => {
    resetProfile();
  });

  it("renders a Why this? trigger button", () => {
    render(<WhyAnswerPopover />);
    const btn = screen.getByRole("button", { name: /why this answer/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent(/why this/i);
  });

  it("opens and shows age, county, and housing from the profile", () => {
    resetProfile({ age: 18, county: "Cobb", housing: "Group home" });
    render(<WhyAnswerPopover />);
    fireEvent.click(screen.getByRole("button", { name: /why this answer/i }));
    expect(screen.getByText(/18/)).toBeInTheDocument();
    expect(screen.getByText(/Cobb County/)).toBeInTheDocument();
    expect(screen.getByText(/Group home/)).toBeInTheDocument();
    expect(screen.getByText(/Nest can make mistakes/i)).toBeInTheDocument();
  });

  it("shows a fallback message when no profile details are saved", () => {
    render(<WhyAnswerPopover />);
    fireEvent.click(screen.getByRole("button", { name: /why this answer/i }));
    expect(screen.getByText(/answering generically/i)).toBeInTheDocument();
  });
});
