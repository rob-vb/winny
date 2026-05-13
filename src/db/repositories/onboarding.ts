import { getSetting, setSetting } from "@/src/db/repositories/settings";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";
type OnboardingCompletionListener = () => void;

const listeners = new Set<OnboardingCompletionListener>();

export async function hasCompletedOnboarding(): Promise<boolean> {
  return (await getSetting(ONBOARDING_COMPLETED_KEY)) === "true";
}

export async function completeOnboarding(): Promise<void> {
  await setSetting(ONBOARDING_COMPLETED_KEY, "true");
  listeners.forEach((listener) => listener());
}

export function subscribeOnboardingCompleted(
  listener: OnboardingCompletionListener
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
