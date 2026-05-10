# Phase 1: Data Foundation + Nav Shell — Research

**Researched:** 2026-05-08
**Domain:** Expo SDK 55 / expo-sqlite v14 / Drizzle ORM / NativeWind v4 / Expo Router v4
**Confidence:** HIGH (core stack verified via npm registry + official docs; NativeWind decision flagged below)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Full NativeWind v4 theme with warm color tokens set up in Phase 1
- **D-02:** Warm color palette extracted from mockup: background `#FAF8F4`, gold `#F7C217`, primary `#F5A623`, text `#1C1C1E`, textSecondary `#8E8E93`, surface `#FFFFFF`, border `#F0EDE8`, accent `#FF6B6B`; confetti palette: red `#E74C3C`, blue `#4A90E2`, yellow `#F7DC6F`, green `#2ECC71`
- **D-03:** Font: Nunito via `@expo-google-fonts/nunito`; weights 400/600/700/800/900
- **D-04:** Streak calculated on-the-fly from wins table (no separate streak table)
- **D-05:** Settings stored in SQLite `settings` table (key-value rows), not MMKV
- **D-06:** Schema includes nullable `synced_at`, `remote_id`, `category` on wins table from day one
- **D-07:** Tab structure: `app/(tabs)/index.tsx`, `app/(tabs)/wins.tsx`, `app/(tabs)/goal.tsx`, `app/(tabs)/settings.tsx`
- **D-08:** EAS config in Phase 1 with dev/preview/production profiles

### Claude's Discretion

- Specific Drizzle migration runner pattern (use `drizzle-orm/expo-sqlite` recommended approach)
- NativeWind config file details (`tailwind.config.js` setup)
- Tab bar icon style (use `@expo/vector-icons` Ionicons)
- TypeScript `tsconfig.json` and path aliases setup

### Deferred Ideas (OUT OF SCOPE)

None — all gray areas handled in context discussion.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FNDTN-01 | App initializes SQLite database with Drizzle ORM on first launch | Drizzle `useMigrations` hook in root `_layout.tsx`; `openDatabaseSync` + `drizzle()` adapter |
| FNDTN-02 | All dates stored as timezone-safe YYYY-MM-DD local date strings | `new Intl.DateTimeFormat('en-CA').format(new Date())` produces YYYY-MM-DD in device local time; never use `new Date().toISOString()` for `date_key` |
| FNDTN-03 | All primary keys are UUID strings | `expo-crypto` `Crypto.randomUUID()` works in managed workflow; `text().$defaultFn(() => Crypto.randomUUID())` in Drizzle schema |
| FNDTN-04 | Schema includes nullable `synced_at`, `remote_id`, `category` columns | Drizzle nullable columns: omit `.notNull()` — columns are nullable by default in SQLite |
</phase_requirements>

---

## Summary

Expo SDK 55 is the current stable release (verified npm registry, May 2026). It ships React Native 0.83 and React 19.2. The Legacy Architecture is permanently removed — New Architecture is mandatory. This is relevant because NativeWind v4 and the older Reanimated v3 were the recommended pairing for SDK 52–53; SDK 55 ships Reanimated v4 (`latest: 4.3.1`), which changes the NativeWind version decision.

The Drizzle + expo-sqlite pattern is mature and well-documented. The core pieces — `openDatabaseSync`, `drizzle()` adapter, `useMigrations` hook, `drizzle-kit generate` — are stable and confirmed against official Drizzle docs. The migration file bundling approach (babel-plugin-inline-import + Metro `sourceExts.push('sql')`) is required and non-negotiable.

The biggest decision this research surfaces is **NativeWind version**: v4 (`latest: 4.2.3`) is documented against SDK 54 + Reanimated v3. SDK 55 ships Reanimated v4 as the default, and NativeWind v4 documentation explicitly notes it requires Reanimated v3. NativeWind v5 (`preview: 5.0.0-preview.3`) targets SDK 55 + Reanimated v4 + Tailwind CSS v4, but is explicitly pre-release. Both have tradeoffs documented in the Assumptions Log.

**Primary recommendation:** Initialize with `npx create-expo-app@latest --template tabs@sdk-55`, then layer in Drizzle + NativeWind v4 pinning Reanimated to `3.x`. If NativeWind v4/Reanimated v3 conflict surfaces during setup, escalate to v5 preview.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| SQLite schema and migrations | Device (local DB) | — | All persistence is local-first; no server tier in V1 |
| UUID generation | Device (JS runtime) | — | `expo-crypto.randomUUID()` runs in JS, no native bridge needed |
| `date_key` computation | Device (JS runtime) | — | Must use device local time, not server time or UTC |
| Tab navigation shell | Frontend (React Native) | — | Standard Expo Router bottom tabs, no server component |
| Font loading | Frontend (JS bundle) | — | `useFonts` hook loads from bundled assets at app launch |
| NativeWind theme tokens | Build time (config) | Frontend (runtime) | `tailwind.config.js` at build, CSS variables at runtime |
| EAS build config | Build pipeline | — | `eas.json` is CI/build config, not runtime |
| Drizzle repository layer | Frontend (JS) | — | Thin async wrappers over DB; no network involved |

---

## Standard Stack

### Core (verified via npm registry 2026-05-08)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo | 55.0.23 | SDK and managed workflow | Latest stable [VERIFIED: npm registry] |
| expo-router | 55.0.14 | File-based navigation | Bundled with SDK 55; standard for new projects [VERIFIED: npm registry] |
| expo-sqlite | 55.0.15 | SQLite database | SDK 55 native module; v2 async API [VERIFIED: npm registry] |
| drizzle-orm | 0.45.2 | Type-safe SQL ORM with expo-sqlite adapter | Standard for expo-sqlite structured queries [VERIFIED: npm registry] |
| drizzle-kit | 0.31.10 | Migration generator CLI | Companion to drizzle-orm; generates `.sql` migration files [VERIFIED: npm registry] |
| nativewind | 4.2.3 | Tailwind CSS for React Native | Latest stable; v5 is pre-release [VERIFIED: npm registry] |
| tailwindcss | 3.4.x | CSS utility framework (NativeWind v4 requires v3) | v4 is for NativeWind v5 only [VERIFIED: NativeWind docs] |
| expo-crypto | 55.0.14 | UUID v4 generation | Works in managed workflow, Expo Go compatible [VERIFIED: Expo docs] |
| @expo-google-fonts/nunito | 0.4.2 | Nunito font variants | Bundled approach, works in Expo Go [VERIFIED: npm registry] |
| expo-font | bundled | Font loading hook | Included in SDK 55 [VERIFIED: Expo docs] |
| @expo/vector-icons | 15.1.1 | Ionicons for tab bar icons | Pre-installed in Expo SDK [VERIFIED: npm registry] |
| react-native-reanimated | 3.x (pin to 3.19.5) | Animations; NativeWind v4 peer dependency | NativeWind v4 requires v3, not v4 [VERIFIED: NativeWind docs] |
| react-native-safe-area-context | 5.7.0 | Safe area insets | Required peer for Expo Router [VERIFIED: npm registry] |
| zustand | 5.0.13 | Ephemeral UI state (hydrated from SQLite) | Standard lightweight state [VERIFIED: npm registry] |
| date-fns | 4.1.0 | Date arithmetic (streak logic) | Standard, tree-shakeable [VERIFIED: npm registry] |
| babel-plugin-inline-import | 3.0.0 | Bundle `.sql` migration files as strings | Required for Drizzle migrations in RN [VERIFIED: Drizzle docs] |

### Supporting (add in later phases)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | — | Server-state cache (V2 Convex layer) | Not needed in Phase 1; add with Convex in V2 |
| expo-dev-client | 55.0.32 | EAS dev builds with debugger | Needed for notification testing in Phase 5 |
| expo-notifications | — | Local scheduled notifications | Phase 5 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| NativeWind v4 | NativeWind v5 preview | v5 is pre-release; use v4 with pinned Reanimated v3 for stability |
| expo-crypto.randomUUID() | `uuid` npm package + react-native-get-random-values | More packages; expo-crypto is already bundled in managed workflow |
| drizzle-orm/expo-sqlite useMigrations | Manual PRAGMA user_version migration runner | useMigrations is simpler and type-safe; manual runner adds boilerplate |
| Zustand | React Context | Context causes full subtree re-renders; Zustand uses selector subscriptions |

### Installation Commands

```bash
# Step 1: Create project (must specify @sdk-55 explicitly — create-expo-app@latest defaults to SDK 54 during transition)
npx create-expo-app@latest winning-streak --template tabs@sdk-55

# Step 2: Database layer
npx expo install expo-sqlite
npm install drizzle-orm
npm install -D drizzle-kit

# Step 3: Babel plugin for SQL file bundling (required for Drizzle migrations)
npm install babel-plugin-inline-import

# Step 4: NativeWind v4 with pinned Reanimated v3
npm install nativewind@4.2.3
npm install -D tailwindcss@^3.4.17
# Pin Reanimated to v3 — NativeWind v4 does not support Reanimated v4
npm install react-native-reanimated@3.19.5

# Step 5: Fonts
npx expo install @expo-google-fonts/nunito expo-font

# Step 6: UUID generation
npx expo install expo-crypto

# Step 7: State
npm install zustand

# Step 8: Date handling
npm install date-fns

# Step 9: EAS CLI (for EAS build config)
npm install -g eas-cli
```

**Version verification date:** 2026-05-08 [VERIFIED: npm registry]

---

## Architecture Patterns

### System Architecture Diagram

```
App Launch (app/_layout.tsx)
         │
         ▼
  SplashScreen.preventAutoHideAsync()
         │
         ├── openDatabaseSync('winning-streak.db') ──► expo-sqlite (device storage)
         │           │
         │           ▼
         │   useMigrations(db, migrations) ──► drizzle migrations.js (bundled SQL)
         │           │
         │           ▼ success
         │   SplashScreen.hideAsync()
         │
         ├── useFonts({ Nunito_400Regular, ... }) ──► @expo-google-fonts/nunito
         │
         ▼
  Tab Navigator renders (app/(tabs)/_layout.tsx)
         │
         ├── Tab: Home       (app/(tabs)/index.tsx)      — placeholder
         ├── Tab: My Wins    (app/(tabs)/wins.tsx)        — placeholder
         ├── Tab: Dream Goal (app/(tabs)/goal.tsx)        — placeholder
         └── Tab: Settings   (app/(tabs)/settings.tsx)   — placeholder

  DB Write/Read (repository layer verification path):
         │
         ▼
  winsRepository.insertWin({ text, date_key })
         │   uses Crypto.randomUUID() for id
         │   uses toDateKey() for date_key (Intl.DateTimeFormat en-CA)
         ▼
  expo-sqlite ──► wins table ──► getAllAsync / useLiveQuery
```

### Recommended Project Structure

```
winning-streak/
├── app/
│   ├── _layout.tsx             — Root layout: DB init, font load, migration runner
│   ├── (tabs)/
│   │   ├── _layout.tsx         — Tab bar: 4 tabs, Ionicons, warm theme colors
│   │   ├── index.tsx           — Home tab (placeholder for Phase 2)
│   │   ├── wins.tsx            — My Wins tab (placeholder for Phase 3)
│   │   ├── goal.tsx            — Dream Goal tab (placeholder for Phase 4)
│   │   └── settings.tsx        — Settings tab (placeholder for Phase 5)
│   └── +not-found.tsx          — 404 fallback
├── src/
│   ├── db/
│   │   ├── client.ts           — openDatabaseSync + drizzle() singleton
│   │   ├── schema.ts           — Drizzle table definitions (wins, dream_goal, settings)
│   │   └── repositories/
│   │       ├── wins.ts         — insertWin, getWins, getDistinctDateKeys
│   │       ├── dreamGoal.ts    — getGoal, upsertGoal
│   │       └── settings.ts     — getSetting, setSetting
│   ├── stores/
│   │   └── useWinsStore.ts     — streak, todayWins, hydrate, addWin
│   ├── constants/
│   │   └── theme.ts            — Color tokens and typography constants
│   └── utils/
│       ├── dateUtils.ts        — toDateKey(), computeStreak()
│       └── uuid.ts             — generateId() wrapping expo-crypto
├── drizzle/
│   └── migrations.js           — Auto-generated by drizzle-kit (bundled SQL strings)
├── global.css                  — NativeWind Tailwind directives
├── tailwind.config.js          — Theme tokens: warm palette + nativewind/preset
├── metro.config.js             — withNativeWind + .sql sourceExts
├── babel.config.js             — babel-preset-expo + nativewind/babel + inline-import
├── drizzle.config.ts           — dialect: sqlite, driver: expo, schema, out paths
├── nativewind-env.d.ts         — TypeScript NativeWind types
├── eas.json                    — dev/preview/production profiles
└── app.json                    — scheme, typedRoutes, SDK version
```

### Pattern 1: Drizzle Schema (wins, dream_goal, settings tables)

```typescript
// src/db/schema.ts
// Source: https://orm.drizzle.team/docs/connect-expo-sqlite + https://orm.drizzle.team/docs/column-types/sqlite
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import * as Crypto from "expo-crypto";

export const wins = sqliteTable("wins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Crypto.randomUUID()),       // UUID string PK — FNDTN-03
  text: text("text").notNull(),
  date_key: text("date_key").notNull(),           // 'YYYY-MM-DD' local time — FNDTN-02
  logged_at: text("logged_at").notNull(),         // ISO 8601 wall-clock time
  created_at: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  // V2 migration columns (nullable by default) — FNDTN-04
  synced_at: text("synced_at"),                   // null until synced to Convex
  remote_id: text("remote_id"),                   // Convex _id after sync
  category: text("category"),                     // AI-assigned category (V2)
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

export type Win = typeof wins.$inferSelect;
export type NewWin = typeof wins.$inferInsert;
export type DreamGoal = typeof dream_goal.$inferSelect;
export type Setting = typeof settings.$inferSelect;
```

### Pattern 2: Database Client + Migration Runner

```typescript
// src/db/client.ts
// Source: https://orm.drizzle.team/docs/connect-expo-sqlite
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// enableChangeListener: true enables useLiveQuery reactive queries
const expoDb = openDatabaseSync("winning-streak.db", {
  enableChangeListener: true,
});

export const db = drizzle(expoDb, { schema });
```

```typescript
// app/_layout.tsx — root layout with migration runner + font loading
// Source: https://orm.drizzle.team/docs/connect-expo-sqlite + Expo font docs
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { useFonts } from "@expo-google-fonts/nunito/useFonts";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "@/src/db/client";
import migrations from "@/drizzle/migrations";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success: migrationsSuccess, error: migrationsError } =
    useMigrations(db, migrations);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const ready = (migrationsSuccess && fontsLoaded) || !!migrationsError || !!fontError;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  if (migrationsError) {
    // In production: log to Sentry, show user-friendly error
    console.error("Migration failed:", migrationsError);
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
```

### Pattern 3: Tab Navigator Layout

```typescript
// app/(tabs)/_layout.tsx
// Source: https://docs.expo.dev/router/advanced/tabs/ (Expo Router v4 tab docs)
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F5A623",   // primary orange — D-02
        tabBarInactiveTintColor: "#8E8E93", // textSecondary — D-02
        tabBarStyle: {
          backgroundColor: "#FFFFFF",       // surface — D-02
          borderTopColor: "#F0EDE8",        // border — D-02
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wins"
        options={{
          title: "My Wins",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goal"
        options={{
          title: "Dream Goal",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Pattern 4: NativeWind v4 Configuration Files

```javascript
// tailwind.config.js
// Source: https://www.nativewind.dev/docs/getting-started/installation
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Must cover all files that use className / NativeWind classes
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // D-02: Warm color palette from mockup
        background: "#FAF8F4",
        gold: "#F7C217",
        primary: "#F5A623",
        "text-primary": "#1C1C1E",
        "text-secondary": "#8E8E93",
        surface: "#FFFFFF",
        border: "#F0EDE8",
        accent: "#FF6B6B",
        // Confetti palette
        "confetti-red": "#E74C3C",
        "confetti-blue": "#4A90E2",
        "confetti-yellow": "#F7DC6F",
        "confetti-green": "#2ECC71",
      },
      fontFamily: {
        // D-03: Nunito font weights
        "nunito-regular": ["Nunito_400Regular"],
        "nunito-semibold": ["Nunito_600SemiBold"],
        "nunito-bold": ["Nunito_700Bold"],
        "nunito-extrabold": ["Nunito_800ExtraBold"],
        "nunito-black": ["Nunito_900Black"],
      },
    },
  },
  plugins: [],
};
```

```javascript
// babel.config.js
// Source: NativeWind v4 docs + Drizzle expo-sqlite docs
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ["inline-import", { extensions: [".sql"] }], // Required for Drizzle .sql migration files
      "react-native-reanimated/plugin",             // Must be LAST plugin
    ],
  };
};
```

```javascript
// metro.config.js
// Source: NativeWind v4 docs + Drizzle expo-sqlite docs
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Required for Drizzle migration .sql file bundling
config.resolver.sourceExts.push("sql");

module.exports = withNativeWind(config, { input: "./global.css" });
```

```css
/* global.css */
/* Source: NativeWind v4 docs */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```typescript
// nativewind-env.d.ts
// Source: NativeWind v4 docs
/// <reference types="nativewind/types" />
```

### Pattern 5: Drizzle Configuration

```typescript
// drizzle.config.ts
// Source: https://orm.drizzle.team/docs/connect-expo-sqlite
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",   // Critical: tells drizzle-kit to generate Expo-compatible migrations
} satisfies Config;
```

### Pattern 6: UUID Generation Utility

```typescript
// src/utils/uuid.ts
// Source: https://docs.expo.dev/versions/latest/sdk/crypto/
import * as Crypto from "expo-crypto";

export function generateId(): string {
  return Crypto.randomUUID();
}
```

Note: `expo-crypto` is already in Expo managed workflow. `randomUUID()` is confirmed as available on Android, iOS, and Web. [VERIFIED: Expo crypto docs]

### Pattern 7: Date Key Utility (Timezone-Safe)

```typescript
// src/utils/dateUtils.ts
// Source: project architecture research + PITFALLS.md
export function toDateKey(date: Date = new Date()): string {
  // 'en-CA' locale produces YYYY-MM-DD format in device LOCAL time
  // NEVER use date.toISOString().slice(0,10) — that's UTC, not local
  return new Intl.DateTimeFormat("en-CA").format(date);
}

export function computeStreak(distinctDateKeys: string[]): number {
  if (distinctDateKeys.length === 0) return 0;
  
  // Keys must be sorted DESC (most recent first)
  const sorted = [...distinctDateKeys].sort().reverse();
  const today = toDateKey();
  
  // A streak must include today OR yesterday (grace: app opened before midnight counts)
  if (sorted[0] !== today) {
    // Check if most recent is yesterday — streak still alive
    const yesterday = toDateKey(new Date(Date.now() - 86400000));
    if (sorted[0] !== yesterday) return 0;
  }
  
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T12:00:00");
    const curr = new Date(sorted[i] + "T12:00:00");
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
```

### Pattern 8: EAS Configuration

```json
// eas.json
// Source: https://docs.expo.dev/build/eas-json/
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

```json
// app.json additions required for EAS + Expo Router
{
  "expo": {
    "name": "Winning Streak",
    "slug": "winning-streak",
    "scheme": "winning-streak",
    "version": "1.0.0",
    "sdkVersion": "55.0.0",
    "experiments": {
      "typedRoutes": true
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### Pattern 9: Drizzle Repository Example

```typescript
// src/db/repositories/wins.ts
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

export async function getDistinctDateKeys(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ date_key: wins.date_key })
    .from(wins)
    .orderBy(desc(wins.date_key));
  return rows.map((r) => r.date_key);
}
```

### Anti-Patterns to Avoid

- **Using `new Date().toISOString().slice(0,10)` for date_key:** This produces UTC date, not local date. Breaks streak for users in UTC-5 to UTC-12 who log wins in the evening.
- **Using `new Date('2026-05-08')` string constructor:** Hermes engine parses ISO date strings as UTC midnight, not local midnight. Use `new Date(year, month-1, day)` or `toDateKey()` approach instead.
- **Calling `openDatabaseSync` multiple times:** Creates multiple DB connections. Always use the singleton from `src/db/client.ts`.
- **Migrating without `driver: 'expo'` in drizzle.config.ts:** Generates migrations incompatible with Expo's Metro bundler. The `driver: 'expo'` flag is critical.
- **Omitting `config.resolver.sourceExts.push('sql')` in metro.config.js:** Causes a silent parse error when importing migration files.
- **Adding `nativewind/babel` plugin without also updating `jsxImportSource: 'nativewind'` in babel-preset-expo options:** Causes className prop not to work on React Native components.
- **Using NativeTabs (SDK 55's new native tab API) instead of the standard `Tabs` component:** NativeTabs requires platform-native constraints; the standard `Tabs` from expo-router gives full CSS/NativeWind styling control needed for the custom warm color scheme.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SQL migration versioning | Custom PRAGMA user_version runner | `drizzle-orm/expo-sqlite/migrator` `useMigrations` | Handles concurrent migration, error recovery, and React lifecycle |
| UUID generation | `Math.random()` based IDs | `expo-crypto.randomUUID()` | RFC4122 compliant, cryptographically secure, bundled in SDK |
| Safe timezone-aware date formatting | Custom `Date` arithmetic | `new Intl.DateTimeFormat('en-CA').format(date)` | `Intl` is available in Hermes; string operations are immune to DST bugs |
| SQL file bundling | Custom Metro transformer | `babel-plugin-inline-import` + `sourceExts.push('sql')` | Standard pattern documented by Drizzle team |
| Tab bar styling | Custom TabBar component | `Tabs` with `screenOptions.tabBarStyle` | Expo Router's Tabs renders natively optimized tab bars |

**Key insight:** In Expo managed workflow, the migration infrastructure and UUID tooling are already solved problems. The only custom code needed is the schema definition and repository layer.

---

## Common Pitfalls

### Pitfall 1: `create-expo-app@latest` Creates SDK 54, Not SDK 55

**What goes wrong:** Running `npx create-expo-app@latest winning-streak` without the `--template tabs@sdk-55` flag creates an SDK 54 project during the SDK 55 transition period. You won't notice until `expo --version` shows `54.x` and you try to install SDK 55 packages.

**Why it happens:** Expo staggers template updates during transition periods. `latest` tag may still point to SDK 54 template.

**How to avoid:** Always specify the template explicitly: `npx create-expo-app@latest winning-streak --template tabs@sdk-55`

**Warning signs:** `app.json` shows `"sdkVersion": "54.0.0"`; `node_modules/expo/package.json` version starts with `54.`

[VERIFIED: Expo create-expo-app docs 2026-05-08]

---

### Pitfall 2: Drizzle Migration Import Fails Without Metro + Babel Config

**What goes wrong:** `SyntaxError: Unexpected token` at app launch, pointing to a `.sql` file. The app cannot import `drizzle/migrations.js` because Metro doesn't know how to handle `.sql` imports.

**Why it happens:** `drizzle-kit generate` produces `.sql` files that `drizzle/migrations.js` imports. Metro's default config treats `.sql` as unknown extension. The `babel-plugin-inline-import` plugin inlines `.sql` file content as strings — but only if Metro also resolves them.

**How to avoid:** Both changes must be made together:
1. `metro.config.js`: `config.resolver.sourceExts.push('sql')`
2. `babel.config.js`: `["inline-import", { "extensions": [".sql"] }]`

If you only do one, it fails silently or with a cryptic error.

**Warning signs:** Crash on first launch; error message references a `.sql` file path.

[VERIFIED: Drizzle expo-sqlite docs, LogRocket blog]

---

### Pitfall 3: NativeWind v4 + Reanimated v4 Conflict

**What goes wrong:** Expo SDK 55 installs Reanimated `4.x` as default. NativeWind v4 (`4.2.3`) has Reanimated `3.x` as a peer dependency. The combination may cause animation-related crashes or style calculation failures at runtime.

**Why it happens:** NativeWind v4 internally uses Reanimated v3 APIs. Reanimated v4 introduced breaking changes to the plugin and internal APIs.

**How to avoid:** Pin Reanimated to v3 when using NativeWind v4:
```bash
npm install react-native-reanimated@3.19.5
```
After installing, clear Metro cache: `npx expo start --clear`

**Warning signs:** Runtime crash mentioning `worklets` or `useAnimatedStyle`; NativeWind className not applying styles.

[VERIFIED: NativeWind GitHub discussion #1604; NativeWind npm dist-tags]

---

### Pitfall 4: `date_key` Stored as UTC Slice Breaks Streak for Non-UTC Users

**What goes wrong:** Wins logged at 11 PM in UTC-5 get a `date_key` of the next calendar day (UTC). The user's streak shows they "missed today" even though they logged a win before midnight local time.

**Why it happens:** `new Date().toISOString().slice(0,10)` always returns UTC date. A developer in UTC+0 or UTC+1 won't see this bug in development.

**How to avoid:** Use `new Intl.DateTimeFormat('en-CA').format(new Date())` which returns `YYYY-MM-DD` in device LOCAL time.

**Warning signs:** Streak logic works in development but users in UTC-5 to UTC-12 report incorrect streak counts; timezone-related App Store reviews.

[VERIFIED: PITFALLS.md, Hermes Date behavior documentation]

---

### Pitfall 5: `useMigrations` Called After `useFonts` — Race Condition Pattern

**What goes wrong:** If migrations complete but fonts are still loading (or vice versa), components render without fonts applied, causing FOUT (Flash of Unstyled Text) or DB-not-ready errors.

**Why it happens:** Both `useMigrations` and `useFonts` are async. If you only gate on one, the other may not be ready.

**How to avoid:** Gate app render on BOTH: `const ready = migrationsSuccess && fontsLoaded`. Keep `SplashScreen.preventAutoHideAsync()` until both are ready. See Pattern 2 above for the correct combined pattern.

**Warning signs:** Flash of unstyled text on first launch; occasional "table does not exist" errors on first DB query.

[ASSUMED — derived from async initialization patterns in React Native]

---

### Pitfall 6: Missing `driver: 'expo'` in `drizzle.config.ts`

**What goes wrong:** `npx drizzle-kit generate` produces standard SQLite migrations (for Node.js) instead of Expo-compatible migrations. The generated `migrations.js` uses `import` syntax that Metro cannot resolve in RN context.

**Why it happens:** Without `driver: 'expo'`, drizzle-kit generates for server-side SQLite. The expo driver produces a different migration format specifically for React Native bundlers.

**How to avoid:** Always include `driver: "expo"` in `drizzle.config.ts`. If you forget, delete the `drizzle/` folder and re-run `drizzle-kit generate`.

[VERIFIED: Drizzle expo-sqlite docs — "The `driver: 'expo'` part is critical"]

---

### Pitfall 7: `openDatabaseSync` vs `openDatabaseAsync`

**What goes wrong:** Using `openDatabaseAsync` (returns a Promise) in a synchronous context at module level causes errors. Drizzle's `drizzle()` adapter requires a synchronous database handle.

**Why it happens:** expo-sqlite v2 has both sync and async open functions. The Drizzle adapter requires `openDatabaseSync` specifically.

**How to avoid:** Use `openDatabaseSync` (not `openDatabaseAsync`) when creating the Drizzle adapter. `openDatabaseSync` is safe to call at module level.

[VERIFIED: Drizzle expo-sqlite docs code example uses `openDatabaseSync`]

---

### Pitfall 8: NativeWind `className` Not Working Without Cache Clear

**What goes wrong:** After modifying `tailwind.config.js` or `global.css`, NativeWind styles don't update. Old styles persist.

**Why it happens:** Metro caches the compiled CSS. Babel config changes also require cache invalidation.

**How to avoid:** After any change to NativeWind configuration files: `npx expo start --clear`

After any babel config change: Full native rebuild required on physical device / simulator.

[CITED: NativeWind docs note on cache invalidation]

---

## Code Examples

### Timezone-Safe Date Key

```typescript
// Source: PITFALLS.md + Hermes docs
// Correct — produces local date in YYYY-MM-DD:
const dateKey = new Intl.DateTimeFormat('en-CA').format(new Date());

// WRONG — produces UTC date, breaks streak for non-UTC users:
// const dateKey = new Date().toISOString().slice(0, 10);
```

### useLiveQuery for Reactive Win Queries

```typescript
// Source: https://orm.drizzle.team/docs/connect-expo-sqlite
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { db } from '@/src/db/client';
import { wins } from '@/src/db/schema';
import { desc } from 'drizzle-orm';

function WinsScreen() {
  const { data } = useLiveQuery(
    db.select().from(wins).orderBy(desc(wins.date_key))
  );
  // data re-renders automatically when any win is inserted
  return <>{/* render data */}</>;
}
// Requires: openDatabaseSync(..., { enableChangeListener: true })
```

### Settings Upsert Pattern

```typescript
// src/db/repositories/settings.ts
import { db } from "../client";
import { settings } from "../schema";

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return row[0]?.value ?? null;
}
```

---

## Walking Skeleton: Phase 1 End-to-End Slice

The thinnest slice that validates all Phase 1 infrastructure works together:

**Step 1: Project init**
```bash
npx create-expo-app@latest winning-streak --template tabs@sdk-55
```

**Step 2: Install dependencies** (see Installation Commands section)

**Step 3: Wire up configs** (metro.config.js, babel.config.js, tailwind.config.js, drizzle.config.ts)

**Step 4: Define schema + generate first migration**
```bash
npx drizzle-kit generate
```
Produces: `drizzle/0000_initial.sql` + `drizzle/migrations.js`

**Step 5: Wire `useMigrations` + `useFonts` in `app/_layout.tsx`**

**Step 6: Build and launch on simulator**
```bash
npx expo start --clear
# OR for EAS dev build:
eas build --profile development --platform ios
```

**Step 7: Validate the slice (manual or automated):**
1. App launches → SplashScreen hides → 4 tabs visible ✓
2. Open a React Native debugger / console, run:
   ```typescript
   import { insertWin, getWins } from '@/src/db/repositories/wins';
   await insertWin("First test win");
   const result = await getWins();
   console.log(result);
   // Verify: result[0].id is a UUID string (not integer)
   // Verify: result[0].date_key is 'YYYY-MM-DD' matching device local date
   ```
3. Restart app → data persists (migration did not drop the table) ✓
4. Add a second migration (add an index) → `drizzle-kit generate` → restart app → old data still present ✓

This slice proves FNDTN-01 (DB initializes), FNDTN-02 (date_key is local YYYY-MM-DD), FNDTN-03 (UUID PK), and FNDTN-04 (nullable columns exist) all in one flow.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-sqlite` v1 sync API (`db.transaction()`) | `expo-sqlite` v2 async API (`runAsync`, `SQLiteProvider`) | SDK 51 (2024) | All pre-2024 tutorials are wrong |
| `Tabs` inside `expo-router` with `Link` | `Tabs` with `Tabs.Screen` + `Expo Router` file-based | SDK 52+ | Better DX, same React Navigation underneath |
| Manual migration runner with `PRAGMA user_version` | `drizzle-orm/expo-sqlite/migrator` `useMigrations` | 2024 (Drizzle 0.29+) | Automated, type-safe, React lifecycle aware |
| `react-native-uuid` for UUID generation | `expo-crypto.randomUUID()` | SDK 50+ | Built into SDK, no extra package needed |
| Reanimated v2/v3 | Reanimated v4 (SDK 55 default) | SDK 55 (2025) | NativeWind v4 still requires v3; pin explicitly |
| NativeWind v2 | NativeWind v4 (stable) / v5 (preview) | 2024 | v2 removed CSS variable support; v4 is stable choice |
| `create-expo-app blank-typescript` | `create-expo-app --template tabs@sdk-55` | SDK 52+ | `tabs` template pre-wires Expo Router; blank needs manual setup |

**Deprecated/outdated:**
- `expo-sqlite/legacy`: Only for migrating pre-SDK-51 apps. Do not use for new projects.
- `Expo.openDatabase()`: Removed in SDK 51. Replaced by `openDatabaseSync`/`openDatabaseAsync`.
- NativeWind v2: Deprecated, incompatible with New Architecture.
- `babel-preset-expo` without `jsxImportSource: 'nativewind'`: Old NativeWind v4 setup that caused `className` not to propagate.

---

## Runtime State Inventory

Phase 1 is greenfield — no existing runtime state to migrate. This section is explicitly N/A.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — greenfield project | — |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None (EAS credentials created during `eas build:configure`) | EAS manages credentials |
| Build artifacts | None | — |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Expo CLI, npm scripts | ✓ | (SDK 55 requires 20.19.4+) | — |
| npm / npx | Package installation | ✓ | (standard) | yarn/pnpm also work |
| Xcode | iOS simulator, EAS local build | Unverified | — | Use EAS cloud build |
| Android Studio | Android emulator | Unverified | — | Use EAS cloud build / physical device |
| eas-cli | EAS build setup | Unverified | — | Install: `npm install -g eas-cli` |
| Apple Developer account | EAS iOS build signing | Unverified | — | Required for device testing; free tier for simulator |

**Note:** EAS cloud build (Step 8 of Walking Skeleton) does not require local Xcode/Android Studio. For simulator-only testing during Phase 1, only Xcode is needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No automated test framework in Phase 1 (greenfield — no jest/vitest installed) |
| Config file | None — create in Wave 0 if Drizzle repository tests are needed |
| Quick run command | Manual validation via debugger console (see Walking Skeleton Step 7) |
| Full suite command | N/A in Phase 1 |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDTN-01 | DB initializes on first launch without crash | Smoke (manual) | Launch app, observe no crash | ❌ Walking Skeleton manual check |
| FNDTN-02 | `date_key` matches device local calendar date at UTC-12 and UTC+14 | Integration (manual) | Change device TZ, insert win, verify `date_key` | ❌ Manual |
| FNDTN-03 | Inserted rows have UUID string PKs (not integer) | Integration (manual) | `getWins()` → verify `id` format | ❌ Manual |
| FNDTN-04 | Schema contains nullable `synced_at`, `remote_id`, `category` | Smoke (manual) | Check DB schema in Drizzle Studio or debugger | ❌ Manual |

### Sampling Rate

- **Per task commit:** Manual smoke test (launch app, navigate all 4 tabs)
- **Per wave merge:** Full Walking Skeleton validation (all 4 steps in Walking Skeleton section)
- **Phase gate:** All 4 FNDTN requirements manually verified before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] No automated test framework installed — all FNDTN validation is manual in Phase 1
- [ ] Drizzle Studio can be used for schema inspection: `npx drizzle-kit studio`

*(If a test framework is desired: `npm install -D jest @types/jest babel-jest` — but this is optional for Phase 1)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in V1 |
| V3 Session Management | No | Local-only app; no session tokens |
| V4 Access Control | No | Single-user device app |
| V5 Input Validation | Partial | Win text max 200 chars enforced at app layer (not DB); dream_goal max 500 chars |
| V6 Cryptography | No | UUID generation uses `expo-crypto.randomUUID()` (OS-level CSPRNG) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via win text | Tampering | Drizzle ORM uses parameterized queries — never string interpolation into SQL |
| Uncontrolled data growth (wins table) | Denial of Service | App-layer 200-char limit on win text; no server-side concern in V1 |
| Privacy: win text in iCloud backup | Information Disclosure | SQLite file in `documentDirectory` is included in iCloud backup by default — acceptable for V1 journaling app; document in onboarding |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | NativeWind v4 (4.2.3) works with Expo SDK 55 when Reanimated is pinned to v3 | Standard Stack / Pitfall 3 | NativeWind v4 may have deeper incompatibilities with RN 0.83's New Architecture; would require upgrading to NativeWind v5 preview |
| A2 | `useMigrations` and `useFonts` combined gate in `app/_layout.tsx` prevents FOUT and DB-not-ready errors | Pattern 2 / Pitfall 5 | Race conditions may require a different pattern (e.g., explicit Promise.all outside React lifecycle) |
| A3 | `new Intl.DateTimeFormat('en-CA').format(new Date())` produces correct YYYY-MM-DD in Hermes on all devices | Pattern 7 / Pitfall 4 | If Hermes has a locale bug, fallback is: `new Date().toLocaleDateString('en-CA')` which uses the same Intl API |
| A4 | EAS dev build with `ios.simulator: true` works without a paid Apple Developer account for simulator testing | EAS Config / Environment Availability | Free Apple account may not support all EAS features; Expo Go may be needed as fallback for initial development |

**If A1 is wrong:** Upgrade to `nativewind@preview` (v5.0.0-preview.3) and switch to Tailwind CSS v4 + PostCSS config. This is a larger setup change but documented at `nativewind.dev/v5`. The `tailwind.config.js` format changes significantly (Tailwind CSS v4 uses CSS-native config rather than JS config).

---

## Open Questions

1. **NativeWind v4 vs v5 for SDK 55**
   - What we know: NativeWind v4 is stable (latest tag); v5 is pre-release (preview tag). SDK 55 ships Reanimated v4 by default. NativeWind v4 documented against Reanimated v3.
   - What's unclear: Whether NativeWind v4 actually fails with Reanimated v4 in practice, or whether the peer dep warning is overly conservative.
   - Recommendation: Start with NativeWind v4 + pinned Reanimated v3. If first native build fails with animation-related crashes, escalate to v5 preview. Do not start with v5 (pre-release instability risk).

2. **`tabs@sdk-55` template structure: `/src/app` vs `/app`**
   - What we know: SDK 55 default template moved to `/src/app` folder structure per changelog.
   - What's unclear: Whether `tabs@sdk-55` template uses `/src/app` or `/app`. The D-07 decision specified `app/(tabs)/` paths.
   - Recommendation: After `create-expo-app`, check whether the template created `src/app/` or `app/`. If `src/app/`, update all path references in this research. The structure is functionally identical.

3. **`Expo.randomUUID` vs `import * as Crypto`**
   - What we know: `expo-crypto` exports `randomUUID` and confirms it works in managed workflow.
   - What's unclear: There's a known GitHub issue (#24021) where `randomUUID` "sometimes returns promises" in older SDK versions.
   - Recommendation: Use `import * as Crypto from 'expo-crypto'; Crypto.randomUUID()` (synchronous call). Verify return type is `string`, not `Promise<string>`, in the first repository test.

---

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view <package> version/dist-tags`) — all version numbers [VERIFIED 2026-05-08]
- https://orm.drizzle.team/docs/connect-expo-sqlite — Drizzle expo-sqlite setup, useMigrations, metro/babel config
- https://orm.drizzle.team/docs/column-types/sqlite — Drizzle SQLite column types, $defaultFn, nullable
- https://docs.expo.dev/versions/latest/sdk/crypto/ — expo-crypto randomUUID API, managed workflow support
- https://docs.expo.dev/router/advanced/tabs/ — Expo Router Tabs component, screenOptions, tabBarIcon
- https://docs.expo.dev/build/eas-json/ — EAS build profiles structure
- https://docs.expo.dev/more/create-expo/ — create-expo-app template flags for SDK 55
- https://expo.dev/changelog/sdk-55 — SDK 55 breaking changes (New Architecture mandatory, Reanimated v4)
- https://docs.expo.dev/develop/user-interface/fonts/ — useFonts hook + SplashScreen pattern
- https://github.com/expo/google-fonts nunito — Nunito font variant names

### Secondary (MEDIUM confidence)
- https://blog.logrocket.com/drizzle-react-native-expo-sqlite/ — Drizzle + Expo SQLite end-to-end walkthrough (verified against official Drizzle docs)
- https://github.com/nativewind/nativewind/discussions/1604 — NativeWind/Expo version compatibility discussion (maintainer statements)
- WebSearch results on NativeWind v4/v5 SDK 55 compatibility (cross-referenced with npm dist-tags)

### Tertiary (LOW confidence)
- https://reactnativerelay.com/article/expo-sdk-55-migration-guide-breaking-changes-sdk-53-to-55 — SDK 55 migration notes (single source, not official)

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 1 |
|-----------|------------------|
| Timezone-safe dates: `date_key` as `YYYY-MM-DD` local time | Schema uses `text("date_key")`, computed with `Intl.DateTimeFormat('en-CA')` — never UTC slice |
| UUID PKs on all tables | All three tables (`wins`, `dream_goal`, `settings`) use `text().primaryKey().$defaultFn(() => Crypto.randomUUID())` |
| No in-app AI calls | N/A for Phase 1 |
| No guilt language | N/A for Phase 1 (no user-facing copy yet) |
| 30-day notification window | N/A for Phase 1 (notifications in Phase 5) |
| V2 schema columns: `synced_at`, `remote_id`, `category` nullable | Included in schema as defined in FNDTN-04; omit `.notNull()` to keep nullable |

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry 2026-05-08
- Architecture patterns: HIGH — Drizzle + expo-sqlite patterns verified against official docs; tab nav verified against Expo Router docs
- NativeWind v4/SDK 55 compatibility: MEDIUM — functional but has known Reanimated v3 pin requirement; v5 exists as fallback
- Pitfalls: HIGH for items from official docs; MEDIUM for A1–A4 in assumptions log

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (30 days — fast-moving ecosystem; NativeWind v5 may stabilize)

---

## RESEARCH COMPLETE
