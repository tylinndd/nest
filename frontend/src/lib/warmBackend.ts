import { getHealth, postChat, postIntake } from "@/lib/api";
import { toBackendProfile } from "@/lib/profileMap";
import { useProfile } from "@/store/profile";

export type WarmupResult = {
  healthMs: number;
  chatMs: number;
  intakeMs: number;
  errors: string[];
};

export const warmBackend = async (): Promise<WarmupResult> => {
  const profile = toBackendProfile(useProfile.getState());
  const errors: string[] = [];

  const t0 = performance.now();
  try {
    await getHealth();
  } catch (e) {
    errors.push(`health: ${(e as Error).message}`);
  }
  const t1 = performance.now();

  try {
    await postChat("What is EYSS?", profile);
  } catch (e) {
    errors.push(`chat: ${(e as Error).message}`);
  }
  const t2 = performance.now();

  try {
    await postIntake(profile);
  } catch (e) {
    errors.push(`intake: ${(e as Error).message}`);
  }
  const t3 = performance.now();

  return {
    healthMs: Math.round(t1 - t0),
    chatMs: Math.round(t2 - t1),
    intakeMs: Math.round(t3 - t2),
    errors,
  };
};
