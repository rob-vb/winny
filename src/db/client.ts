import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// NEVER call openDatabaseSync more than once — singleton pattern (RESEARCH anti-pattern)
// enableChangeListener: true required for useLiveQuery in Phase 2+
const expoDb = openDatabaseSync("winning-streak.db", {
  enableChangeListener: true,
});

export const db = drizzle(expoDb, { schema });
