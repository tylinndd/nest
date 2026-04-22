export type ContextHint = {
  id: "morning" | "evening" | "late-night" | "weekend";
  eyebrow: string;
  message: string;
};

export const getContextHint = (now: Date = new Date()): ContextHint | null => {
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  if (hour >= 5 && hour < 11) {
    return {
      id: "morning",
      eyebrow: "Good morning",
      message: "Two minutes with your documents before the day kicks off?",
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      id: "evening",
      eyebrow: "Evening check-in",
      message: "Snap a photo of any missing doc while you're home.",
    };
  }
  if (hour >= 21 || hour < 5) {
    return {
      id: "late-night",
      eyebrow: "Late and thinking",
      message: "Nest is here when you want to plan tomorrow.",
    };
  }
  if (isWeekend) {
    return {
      id: "weekend",
      eyebrow: "Weekend",
      message: "Offices are closed — good day to gather paperwork.",
    };
  }
  return null;
};
