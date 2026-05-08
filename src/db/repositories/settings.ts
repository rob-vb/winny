import { eq } from "drizzle-orm";
import { db } from "../client";
import { settings } from "../schema";

export async function getSetting(key: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value, updated_at: new Date().toISOString() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updated_at: new Date().toISOString() },
    });
}
