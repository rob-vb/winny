# Phase 1: Data Foundation + Nav Shell - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers: initialized Expo project with Expo Router tab navigation shell, SQLite database via Drizzle ORM with the correct migration-safe schema, and a full NativeWind design system with warm color tokens and Nunito font. This phase creates the foundation every subsequent phase builds on. No user-visible features yet — just the skeleton that works.

**In scope:**
- Expo project init (latest SDK, TypeScript, expo-router)
- 4-tab bottom navigation shell (Home, My Wins, Dream Goal, Settings) with placeholder screens
- expo-sqlite v2 + Drizzle ORM setup with migration runner
- Full SQLite schema: wins, settings, dream_goal tables
- NativeWind v4 configuration
- Design tokens: warm color palette, Nunito typography scale
- EAS project config (app.json, eas.json — dev/preview/production profiles)

**Out of scope:**
- Any user-visible features (win entry, streak display, etc.)
- Actual screen content (that's Phases 2–6)
- Push notifications (Phase 5)
- Onboarding (Phase 6)

</domain>

<decisions>
## Implementation Decisions

### Design System

- **D-01:** Set up full NativeWind v4 theme with warm color tokens in Phase 1 — all screens built on solid design foundation from day one (not deferred to polish phase)
- **D-02:** Extract color tokens from provided mockup and app icon. Palette:
  - `background`: `#FAF8F4` (warm cream — matches app icon background exactly)
  - `gold`: `#F7C217` (amber gold — trophy color)
  - `primary`: `#F5A623` (orange — CTA buttons: "Log Today's Win", "Continue", "Add Win")
  - `text`: `#1C1C1E` (near-black with warm tone)
  - `textSecondary`: `#8E8E93` (muted gray for secondary text)
  - `surface`: `#FFFFFF` (cards and input surfaces)
  - `border`: `#F0EDE8` (subtle warm border)
  - `accent`: `#FF6B6B` (red hearts, small accents)
  - Confetti palette: red `#E74C3C`, blue `#4A90E2`, yellow `#F7DC6F`, green `#2ECC71`
- **D-03:** Font: **Nunito** via `@expo-google-fonts/nunito`. Rounded terminals match the trophy mascot's soft curves. Weights used: 400 (body), 600 (labels), 700 (subheadings), 800 (streak/stat numbers), 900 (hero numbers like "12 day streak!").

### Database Schema

- **D-04:** Streak is calculated on-the-fly from the wins table (no separate streak table). Query: count consecutive distinct `date_key` values going back from today.
- **D-05:** Settings stored in a dedicated SQLite `settings` table (key-value rows), not MMKV. Keeps everything in one database, simpler migration to Convex. Schema: `(key TEXT PRIMARY KEY, value TEXT NOT NULL)`.
- **D-06:** Schema must include V2 migration columns from day one — nullable `synced_at`, `remote_id`, `category` on the wins table.

### Project Structure

- **D-07:** Expo Router file-based routing. Tab structure: `app/(tabs)/index.tsx` (Home), `app/(tabs)/wins.tsx` (My Wins), `app/(tabs)/goal.tsx` (Dream Goal), `app/(tabs)/settings.tsx` (Settings).
- **D-08:** EAS config in Phase 1 (not deferred). Set up `eas.json` with dev/preview/production profiles. Development profile targets EAS dev build (required for expo-notifications in Phase 5 — better to set up now than scramble later).

### Claude's Discretion

- Specific Drizzle migration runner pattern (use `drizzle-orm/expo-sqlite` recommended approach)
- NativeWind config file details (`tailwind.config.js` setup)
- Tab bar icon style (use Expo vector icons — `@expo/vector-icons` Ionicons — matches common RN pattern)
- TypeScript `tsconfig.json` and path aliases setup

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, V2 migration requirements, key decisions
- `.planning/REQUIREMENTS.md` — FNDTN-01–04 requirements for this phase
- `.planning/ROADMAP.md` — Phase 1 success criteria and research flags

### Research Findings
- `.planning/research/STACK.md` — Technology recommendations, versions, anti-recommendations
- `.planning/research/ARCHITECTURE.md` — SQLite schema design, Zustand pattern, folder structure, Convex migration path
- `.planning/research/PITFALLS.md` — Critical pitfalls: timezone bugs, expo-sqlite v2 API, UUID PKs, EAS runtimeVersion

### Verification Required Before Starting
- Verify current Expo SDK version: `npx create-expo-app@latest --version`
- Verify Drizzle expo-sqlite adapter: https://orm.drizzle.team/docs/get-started/expo-new
- Verify NativeWind v4 stable release: https://www.nativewind.dev/getting-started/expo-router

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (greenfield project — Phase 1 creates everything)

### Established Patterns
- None yet — Phase 1 ESTABLISHES the patterns all subsequent phases follow

### Integration Points
- Phase 2 (Core Win-Entry Loop) reads from and writes to the `wins` table created here
- Phase 3 (Win History) queries wins with date grouping using `date_key`
- Phase 4 (Dream Goal) reads/writes `dream_goal` table created here
- Phase 5 (Notifications) reads `settings` table for reminder time
- All phases use the NativeWind color tokens and Nunito font established here

</code_context>

<specifics>
## Specific Ideas

- **Color palette source:** Derived directly from provided mockup screenshot and app icon (smiley trophy on `#FAF8F4` background). Not guessed — extracted from actual assets.
- **Font:** Nunito specifically chosen because its rounded letterforms echo the trophy mascot's soft 3D curves. Not Poppins (too geometric), not Inter (too techy), not Fredoka (too childish for body text).
- **Trophy asset:** The smiley trophy PNG is available as the app icon and should be used as an image asset in the app (streak celebration screen, empty states). Save it to `assets/images/trophy.png`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. User chose only to discuss Design System; other gray areas (streak calculation, settings storage, EAS setup) were handled via defaults and research recommendations without needing user input.

</deferred>

---

*Phase: 1-Data Foundation + Nav Shell*
*Context gathered: 2026-05-08*
