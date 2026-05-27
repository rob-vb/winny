import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { wins, type NewWin } from "../schema";
import { generateId } from "@/src/utils/uuid";
import { toDateKey } from "@/src/utils/dateUtils";

export async function insertWin(text: string): Promise<void> {
  const now = new Date();
  await db.insert(wins).values({
    id: generateId(),
    text,
    date_key: toDateKey(now),
    logged_at: now.toISOString(),
  });
}

export async function getWins(): Promise<typeof wins.$inferSelect[]> {
  return db.select().from(wins).orderBy(desc(wins.date_key));
}

export async function deleteWin(id: string): Promise<void> {
  await db.delete(wins).where(eq(wins.id, id));
}

export async function getDistinctDateKeys(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ date_key: wins.date_key })
    .from(wins)
    .orderBy(desc(wins.date_key));
  return rows.map((r) => r.date_key);
}
