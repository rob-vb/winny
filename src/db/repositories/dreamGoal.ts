import { eq } from "drizzle-orm";
import { db } from "../client";
import { dream_goal, type DreamGoal } from "../schema";

export async function getGoal(): Promise<DreamGoal | null> {
  const rows = await db
    .select()
    .from(dream_goal)
    .where(eq(dream_goal.id, "singleton"))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertGoal(text: string): Promise<void> {
  await db
    .insert(dream_goal)
    .values({ id: "singleton", text, updated_at: new Date().toISOString() })
    .onConflictDoUpdate({
      target: dream_goal.id,
      set: { text, updated_at: new Date().toISOString() },
    });
}
