import { eq } from "drizzle-orm";
import { db } from "../client";
import { dream_goals, type DreamGoalItem } from "../schema";
import { generateId } from "@/src/utils/uuid";

export async function getGoals(): Promise<DreamGoalItem[]> {
  return db.select().from(dream_goals).orderBy(dream_goals.created_at);
}

export async function addGoal(text: string): Promise<void> {
  await db.insert(dream_goals).values({
    id: generateId(),
    text,
    created_at: new Date().toISOString(),
  });
}

export async function toggleGoalComplete(id: string, completed: boolean): Promise<void> {
  await db
    .update(dream_goals)
    .set({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .where(eq(dream_goals.id, id));
}

export async function deleteGoal(id: string): Promise<void> {
  await db.delete(dream_goals).where(eq(dream_goals.id, id));
}
