import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Use global crypto.randomUUID() — available in both Node.js (for drizzle-kit) and
// React Native / Expo (Hermes implements the Web Crypto API).
// Do NOT import expo-crypto here — drizzle-kit cannot process React Native imports.
// At runtime, generateId() in uuid.ts wraps expo-crypto.randomUUID() instead.
export const wins = sqliteTable("wins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  text: text("text").notNull(),
  date_key: text("date_key").notNull(),
  logged_at: text("logged_at").notNull(),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  // V2 migration columns — nullable by default (no .notNull()) — FNDTN-04
  synced_at: text("synced_at"),
  remote_id: text("remote_id"),
  category: text("category"),
});

export const dream_goal = sqliteTable("dream_goal", {
  id: text("id").primaryKey().default("singleton"),
  text: text("text").notNull().default(""),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updated_at: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const dream_goals = sqliteTable("dream_goals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  text: text("text").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completed_at: text("completed_at"),
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  // V2 migration columns
  synced_at: text("synced_at"),
  remote_id: text("remote_id"),
  category: text("category"),
});

export type Win = typeof wins.$inferSelect;
export type NewWin = typeof wins.$inferInsert;
export type DreamGoal = typeof dream_goal.$inferSelect;
export type DreamGoalItem = typeof dream_goals.$inferSelect;
export type Setting = typeof settings.$inferSelect;
