# Phase 3: Win History - Research

**Researched:** 2026-05-11
**Domain:** React Native SectionList, Reanimated 3 animations, date-fns v4 date formatting
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Date headers use relative-then-absolute labels: Today / Yesterday / `EEE, MMM d` (same year) / `MMM d, yyyy` (prior year). Computed with date-fns against device local date — never UTC.
- D-02: Right-aligned pill badge with win count; singular "1 win", plural "N wins". Tinted surface background matching warm cream/gold system.
- D-03: `stickySectionHeadersEnabled` on the SectionList. Current date label stays pinned while scrolling that group.
- D-04: Chevron-down Ionicon rotates 180° to chevron-up when collapsed. Entire header row is tappable. Use Reanimated for rotation to match Phase 2 conventions.
- D-05: Hero header = large bold total-wins number + "total wins" label + trophy image. NOT a reuse of StreakHeader.
- D-06: Streak label also shown in hero header, using `streakLabel(streak)` from Phase 2.
- D-07: Header scrolls with content — rendered via `ListHeaderComponent`. No sticky top bar, no shrink-on-scroll.
- D-08: Empty state when `totalWins === 0`: trophy centered, encouraging copy, no guilt, forward-pointing hint to Home tab. Hero header NOT rendered in empty state.
- D-09: Win rows reuse `WinCard` as-is. `isNew={false}` always in history list.
- D-10: `isNew` prop always false in history (suppresses ZoomIn entrance animation).
- D-11: Within each date group, wins sorted newest-first by `logged_at`. Sections also newest-`date_key` first.
- D-12: No delete in V1.
- D-13: No edit in V1.
- D-14: Default state: all groups expanded.
- D-15: Collapse state is local component state (`Record<string, boolean>` keyed by `date_key`). Not persisted across launches.

### Claude's Discretion
- Exact empty state copy ("Your wins will live here" or similar) — warm, no guilt, forward-looking
- Exact spacing/typography of hero header — follow Phase 1 design system
- Collapse animation timing/easing — Reanimated ~200ms ease
- Pill badge color/background — from warm cream/gold palette (Colors constants / NativeWind)
- Whether to memoize section data via `useMemo` — recommended at 100+, required at 200+

### Deferred Ideas (OUT OF SCOPE)
- Delete a past win (V2+)
- Edit a past win (V2+)
- Search / filter wins (V2+)
- Persisted collapse state across launches (future AsyncStorage)
- Scroll-to-today FAB (useful at 1000+ wins)
- Section header shrink-on-scroll animation
- Win detail screen
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HIST-01 | My Wins screen shows all wins grouped by date, newest first (SectionList) | SectionList API verified; `getWins()` returns `date_key desc`; `useMemo` grouping pattern documented; 200+ item performance addressed |
| HIST-02 | Each date group shows win count badge and is individually collapsible | Collapse via `renderItem` returning null + `extraData` pattern verified; pill badge uses existing NativeWind color tokens |
| HIST-03 | Total wins count displayed prominently at top of My Wins screen | `totalWins` already in store; `ListHeaderComponent` pattern for scrolling hero header confirmed |
</phase_requirements>

---

## Summary

Phase 3 replaces the `app/(tabs)/wins.tsx` placeholder with a fully functional history screen. The screen reads `wins[]` and `totalWins` directly from `useWinsStore` — no new store actions, no new DB queries, no new repository methods. All data infrastructure from Phases 1 and 2 is already sufficient.

The implementation centers on three technical primitives: (1) a `SectionList` with `stickySectionHeadersEnabled` displaying wins grouped by `date_key`, (2) per-section collapse state managed locally via a `Record<string, boolean>` — with collapsed sections driven by `renderItem` returning `null` — and (3) Reanimated 3 `useSharedValue` + `withTiming` rotating a chevron icon in each section header. A `ListHeaderComponent` renders the scrolling hero-stats block (total wins + streak + trophy).

The main implementation risk is a known React Native bug (issue #43597) where `stickySectionHeadersEnabled` combined with virtualization can cause visual glitches and unnecessary re-renders on RN 0.73+. The fix PR was closed without merge (March 2026). The recommended mitigation is to ensure the `extraData` prop is set correctly and section header components are memoized. At 200 wins across ~40 date groups, total items are well within SectionList's virtualization sweet spot, so performance is not a concern with standard configuration.

**Primary recommendation:** Use `SectionList` with `stickySectionHeadersEnabled`, `extraData={collapsedSections}`, and `renderItem` returning `null` for collapsed sections. Keep all state local. Memoize the grouped-sections transform with `useMemo`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Win history data | Store (Zustand) | Repository (Drizzle) | `useWinsStore.wins` is already hydrated at app boot; no new query needed |
| Date grouping / section transform | Component (useMemo) | — | Pure transform of store data; belongs co-located with the screen that uses it |
| Collapse/expand state | Component (useState) | — | Local UI state per D-15; intentionally not persisted |
| Date label formatting | Utility function | Component | Thin `formatDateKey(dateKey: string): string` utility; keeps component clean |
| Chevron animation | Component (Reanimated) | — | Per-header animation; each header owns its shared value |
| Hero stats header | Component (ListHeaderComponent) | — | Reads from store selectors; renders above the list |
| Empty state detection | Component | Store (`isHydrated`) | `totalWins === 0 && isHydrated` — must guard against hydration race |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native SectionList | 0.83.6 (RN) | Grouped, virtualized list with sticky headers | Built-in; purpose-built for date-grouped data |
| react-native-reanimated | 3.19.5 (pinned) | Chevron rotation animation | Already pinned per project invariant; matches Phase 2 animation conventions |
| date-fns | 4.1.0 | `isToday`, `isYesterday`, `isSameYear`, `format` for date labels | Already in stack per CLAUDE.md; D-01 explicitly requires it |
| zustand | 5.0.13 | Read `wins[]`, `totalWins`, `streak`, `isHydrated` from store | Already the project state layer; no new actions needed |
| nativewind | 4.2.3 | All styling via className utilities | Project convention established in Phase 1 |

[VERIFIED: node_modules inspection, package.json]

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @expo/vector-icons Ionicons | bundled with Expo 55 | `chevron-down` icon in section headers | Already used in project; matches tab bar icons |
| react-native-safe-area-context | 5.6.2 | `SafeAreaView` screen root wrapper | Project-wide convention |
| zustand/react/shallow | 5.0.13 | `useShallow` for multi-field store subscriptions | Used on Home screen; same pattern for wins screen |

[VERIFIED: package.json, existing component inspection]

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SectionList | FlashList (Shopify) | FlashList is faster for 1000+ items but requires measuring item heights and is an extra dependency; 200 wins is well within SectionList's sweet spot |
| renderItem null (collapse) | Empty section data `[]` | Both work; `renderItem null` is simpler because it avoids restructuring `sections` data; the `renderSectionHeader` still fires for empty sections (confirmed in RN docs), keeping sticky headers intact |
| useSharedValue per header | LayoutAnimation | `LayoutAnimation` is simpler but cannot be per-section; one toggle collapses all. Reanimated is required per D-04 |

---

## Architecture Patterns

### System Architecture Diagram

```
useWinsStore.wins (Win[])
        │
        ▼ (useMemo)
  groupWinsByDate(wins)
        │  → SectionList sections: { date_key, data: Win[], label }[]
        │
        ▼
  SectionList (stickySectionHeadersEnabled, extraData=collapsedSections)
   ├── ListHeaderComponent
   │     └── HeroStatsHeader (totalWins, streak, trophy)
   ├── renderSectionHeader
   │     └── DateSectionHeader
   │           ├── date label (formatDateKey → isToday/isYesterday/format)
   │           ├── win count pill ("3 wins")
   │           ├── chevron (Animated.View, rotates via useSharedValue)
   │           └── onPress → toggle collapsedSections[date_key]
   └── renderItem
         └── if collapsedSections[date_key]: return null
             else: <WinCard win={item} isNew={false} />

collapsedSections: Record<string, boolean>   ← useState, local only
```

### Recommended Project Structure
```
app/(tabs)/
└── wins.tsx             # full screen replacement (single file for MVP)

src/components/
├── WinCard.tsx          # reused as-is (no changes)
├── HistoryHeroHeader.tsx  # new: trophy + total wins + streak label (D-05, D-06)
└── DateSectionHeader.tsx  # new: date label + pill badge + chevron (D-01 through D-04)

src/utils/
├── dateUtils.ts         # add formatDateKey(dateKey: string): string (D-01 logic)
└── (all others unchanged)

src/__tests__/
└── historyUtils.test.ts # new: formatDateKey + groupWinsByDate pure unit tests
```

### Pattern 1: Section Data Grouping (useMemo)
**What:** Transform `wins[]` flat array into `SectionList`-compatible sections array, grouped by `date_key`, sorted newest first within each group by `logged_at`.
**When to use:** In the `WinsScreen` component, memoized on `wins` dependency.

```typescript
// Source: [VERIFIED: codebase inspection] + [ASSUMED: standard RN pattern]
import { useMemo } from 'react';
import type { Win } from '@/src/db/schema';

interface WinSection {
  date_key: string;
  data: Win[];
}

function groupWinsByDate(wins: Win[]): WinSection[] {
  // wins[] from store is already ordered date_key DESC (getWins uses orderBy desc)
  // Within each date group, sort by logged_at DESC (D-11)
  const map = new Map<string, Win[]>();
  for (const win of wins) {
    const group = map.get(win.date_key) ?? [];
    group.push(win);
    map.set(win.date_key, group);
  }
  // Map preserves insertion order from the DESC-sorted wins array
  return Array.from(map.entries()).map(([date_key, data]) => ({
    date_key,
    data: [...data].sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    ),
  }));
}

// In component:
const sections = useMemo(() => groupWinsByDate(wins), [wins]);
```

### Pattern 2: Collapse State with extraData
**What:** Track collapsed sections in local state; pass to `SectionList.extraData` so re-renders trigger correctly.
**When to use:** This is the only correct pattern for collapsible SectionList. Without `extraData`, SectionList (a PureComponent) will not re-render when state changes.

```typescript
// Source: [CITED: peterp.me/articles/react-native-sectionlist-expand-collapse]
// [VERIFIED: confirmed against reactnative.dev/docs/sectionlist PureComponent note]
const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

const toggleSection = (date_key: string) => {
  setCollapsedSections(prev => ({
    ...prev,
    [date_key]: !prev[date_key],
  }));
};

// In SectionList:
<SectionList
  sections={sections}
  extraData={collapsedSections}   // REQUIRED — triggers re-render on toggle
  stickySectionHeadersEnabled     // iOS default true, explicit for Android
  renderItem={({ item, section }) =>
    collapsedSections[section.date_key]
      ? null
      : <WinCard win={item} isNew={false} />
  }
  renderSectionHeader={({ section }) => (
    <DateSectionHeader
      section={section}
      isCollapsed={!!collapsedSections[section.date_key]}
      onToggle={() => toggleSection(section.date_key)}
    />
  )}
  keyExtractor={(item) => item.id}
/>
```

### Pattern 3: Reanimated Chevron Rotation
**What:** Per-section-header animated chevron using `useSharedValue` + `withTiming` + `useAnimatedStyle`.
**When to use:** Inside `DateSectionHeader` component. One shared value per header instance (React creates a new component instance per section header — this is safe).

```typescript
// Source: [CITED: docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue]
// [ASSUMED: rotation via transform, consistent with Phase 2 WinCard ZoomIn pattern]
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

function DateSectionHeader({ section, isCollapsed, onToggle }) {
  const rotation = useSharedValue(isCollapsed ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
  }, [isCollapsed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Pressable onPress={onToggle} /* ... */ >
      {/* date label + pill badge */}
      <Animated.View style={animatedStyle}>
        <Ionicons name="chevron-down" size={16} color="#8E8E93" />
      </Animated.View>
    </Pressable>
  );
}
```

### Pattern 4: Date Label Formatting (D-01)
**What:** Convert `date_key` string to human-readable relative-then-absolute label.
**When to use:** In `DateSectionHeader` or as a utility function `formatDateKey`.

```typescript
// Source: [VERIFIED: direct node execution in project, date-fns 4.1.0]
import { isToday, isYesterday, isSameYear, format } from 'date-fns';

export function formatDateKey(dateKey: string): string {
  // Noon anchor prevents DST edge-case misclassification (same pattern as computeStreak)
  const d = new Date(dateKey + 'T12:00:00');
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isSameYear(d, new Date())) return format(d, 'EEE, MMM d');  // "Sat, May 9"
  return format(d, 'MMM d, yyyy');                                 // "Dec 1, 2025"
}
```

**Verified outputs (date-fns 4.1.0 on 2026-05-11):**
- `'2026-05-11'` → `'Today'`
- `'2026-05-10'` → `'Yesterday'`
- `'2026-05-09'` → `'Sat, May 9'`
- `'2025-12-01'` → `'Dec 1, 2025'`

[VERIFIED: node execution in project]

### Pattern 5: Store Read + Hydration Guard
**What:** Read wins from store on the wins screen; guard against rendering before hydration completes.
**When to use:** At the top of `WinsScreen`. Hydration runs at app boot (Phase 2 wiring), so by the time the user navigates to the wins tab it will typically be complete — but the guard is required for correctness.

```typescript
// Source: [VERIFIED: src/stores/useWinsStore.ts inspection]
const { wins, totalWins, streak, isHydrated } = useWinsStore(
  useShallow((s) => ({
    wins: s.wins,
    totalWins: s.totalWins,
    streak: s.streak,
    isHydrated: s.isHydrated,
  }))
);

// Empty state detection (D-08): MUST check isHydrated first
if (!isHydrated) return <LoadingPlaceholder />;
if (totalWins === 0) return <EmptyState />;
```

### Anti-Patterns to Avoid
- **`extraData` omitted:** Without `extraData={collapsedSections}`, SectionList will NOT re-render when collapse state changes. Silent bug — the list appears to not respond to taps.
- **Empty array `[]` for collapsed sections data:** While technically works, it forces rebuilding the `sections` array on every toggle, which triggers a more expensive list diff. `renderItem` returning `null` is cheaper.
- **Animating `rotation` in `renderItem`:** Reanimated shared values created inside `renderItem` are re-created on each render. Chevron animation must live in the `renderSectionHeader`-rendered component.
- **`new Date(dateKey)` without noon anchor:** Parsing `'2026-05-09'` directly gives UTC midnight, which converts to the previous day in UTC+0 and similar timezones. Always use `dateKey + 'T12:00:00'` (the noon anchor pattern already established in `computeStreak`).
- **Not calling `hydrate()` in WinsScreen:** The store is already hydrated by `HomeScreen` on app boot. However, if the user navigates to wins before home finishes hydrating (race condition on cold start), `isHydrated` guards against this. Do NOT call `hydrate()` again — just guard on `isHydrated`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Grouped-by-date list | Custom ScrollView with grouped arrays | `SectionList` | Virtualization, sticky headers, section header API all built-in |
| Chevron rotation | CSS animation via Animated API (legacy) | Reanimated 3 `useSharedValue` + `withTiming` | Project has Reanimated pinned; consistent with Phase 2 conventions; runs on UI thread |
| Date parsing | Manual string slicing to get year/month/day | `date-fns` `isToday`, `isYesterday`, `isSameYear`, `format` | Already in stack; handles DST, locale edge cases |
| Win count | Counting data.length in component | `section.data.length` | The data is already there; no extra state needed |

**Key insight:** Every piece of infrastructure Phase 3 needs already exists. The entire screen is a UI composition task — no new data layer, no new utilities beyond `formatDateKey`.

---

## Common Pitfalls

### Pitfall 1: extraData Not Wired (Silent Collapse Bug)
**What goes wrong:** Tapping a section header does nothing visually — the section never collapses.
**Why it happens:** `SectionList` is a `PureComponent`. Without `extraData`, it cannot detect that `collapsedSections` state changed (it's not part of the `sections` prop reference).
**How to avoid:** Always pass `extraData={collapsedSections}` to `SectionList`.
**Warning signs:** Section header `onPress` fires (confirmed by console.log) but list does not re-render.

### Pitfall 2: Sticky Headers + Virtualization Visual Glitch (RN 0.73+ bug)
**What goes wrong:** Section items briefly disappear or flicker while scrolling when `stickySectionHeadersEnabled` is true and virtualization is active.
**Why it happens:** Known React Native bug (issue #43597, reported RN 0.73.6, affects 0.83.6 — the fix PR #47345 was closed March 2026 without merge).
**How to avoid:** Memoize section header components (`React.memo`). Ensure `keyExtractor` is stable. Test on actual device — simulator may not reproduce the glitch.
**Warning signs:** Headers "jump" or items briefly disappear when scrolling fast through a list with 10+ sections.

### Pitfall 3: Date Label UTC Midnight Bug
**What goes wrong:** Dates appear off by one day — "Monday May 9" instead of "Sunday May 8".
**Why it happens:** `new Date('2026-05-09')` parses as UTC midnight (00:00:00Z), which in negative UTC offsets (e.g. US/Pacific = UTC-7) renders as 2026-05-08 17:00:00 local time — the previous day.
**How to avoid:** Always use `new Date(dateKey + 'T12:00:00')` noon anchor (same pattern as `computeStreak` in `dateUtils.ts`).
**Warning signs:** `isToday(new Date(dateKey))` returns false for today's wins.

### Pitfall 4: Hydration Race — Empty State Flash
**What goes wrong:** Screen briefly shows empty state (zero wins) on cold launch, then wins appear as hydration completes.
**Why it happens:** `useWinsStore.wins` initializes to `[]` and `totalWins` to `0` before `hydrate()` resolves.
**How to avoid:** Gate on `isHydrated`. Show a neutral loading placeholder (`null` or a single-line skeleton) until `isHydrated === true`, then branch to empty or populated state.
**Warning signs:** Empty state flash of ~100-300ms visible on cold launch.

### Pitfall 5: useSharedValue in renderItem (Animation Memory Leak)
**What goes wrong:** Reanimated shared values leak or cause stale animation state.
**Why it happens:** Shared values created inside `renderItem` are recreated on every re-render because the function is recreated. The animation backing is on the worklet thread and may not clean up correctly.
**How to avoid:** Chevron animation belongs in `DateSectionHeader` (the `renderSectionHeader` component), not in `renderItem`.
**Warning signs:** Chevron animation runs on first collapse but gets stuck on subsequent toggles.

### Pitfall 6: Pill Badge Singular/Plural
**What goes wrong:** Badge shows "1 wins" instead of "1 win".
**Why it happens:** Forgetting the singular case when `data.length === 1`.
**How to avoid:** `const label = data.length === 1 ? '1 win' : \`${data.length} wins\``.
**Warning signs:** Caught in unit test for `formatWinCount` utility.

---

## Code Examples

### groupWinsByDate Utility
```typescript
// Source: [VERIFIED: derived from existing getWins() sort order in src/db/repositories/wins.ts]
function groupWinsByDate(wins: Win[]): WinSection[] {
  const map = new Map<string, Win[]>();
  for (const win of wins) {
    const existing = map.get(win.date_key);
    if (existing) existing.push(win);
    else map.set(win.date_key, [win]);
  }
  return Array.from(map.entries()).map(([date_key, data]) => ({
    date_key,
    data: data.sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    ),
  }));
  // Section order is preserved from `wins` which is `date_key DESC` — newest section first
}
```

### WinCount Pill Label
```typescript
// Source: [ASSUMED: standard plural handling]
const winCountLabel = (count: number) => count === 1 ? '1 win' : `${count} wins`;
```

### NativeWind Classes for Pill Badge
```typescript
// Source: [VERIFIED: tailwind.config.js color tokens]
// Pill: warm surface tint on background-colored base
// Use "bg-gold/20" (20% opacity gold) or "bg-border" depending on contrast needs
// Conservative choice matching warm cream palette: bg-[#FEF3C7] or bg-gold/20
<View className="bg-gold/20 rounded-full px-2 py-0.5">
  <Text className="font-nunito-semibold text-xs text-text-primary">
    {winCountLabel(section.data.length)}
  </Text>
</View>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SectionList collapse via empty `data: []` | `renderItem` returning `null` + `extraData` | — | Simpler data transform; no sections rebuild on toggle |
| react-native `Animated` API for chevron | Reanimated 3 `useSharedValue` | Project start (pinned Reanimated 3.19.5) | Runs on UI thread; matches project convention |
| Custom date formatting | date-fns v4 `isToday` / `isYesterday` / `format` | Project start | Handles DST, locale edge cases correctly |

**Deprecated/outdated:**
- `LayoutAnimation` for per-section collapse: Cannot be independently controlled per section; Reanimated is the correct approach when independent section animation is required.
- `extraData` as boolean toggle: A common pattern is passing `!collapsed` as `extraData`, but this fails when multiple sections exist. Use the full `collapsedSections` record object.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `renderItem` returning `null` is the preferred collapse approach (vs empty data array) | Patterns #2 | Either approach works; this choice is a minor refactor if wrong |
| A2 | Reanimated `useEffect` → `rotation.value = withTiming(...)` pattern for responding to `isCollapsed` prop changes | Pattern #3 | Might need `useDerivedValue` instead for more complex cases; low risk for simple chevron |
| A3 | `bg-gold/20` Tailwind opacity modifier works with NativeWind v4 for pill badge background | Code Examples | NativeWind v4 opacity modifier support: if missing, use explicit hex color `#FEF8DC` instead |

**Most claims in this research were verified against the project codebase directly.**

---

## Open Questions

1. **Sticky header glitch on target device**
   - What we know: RN 0.73+ has a known bug with stickySectionHeadersEnabled + virtualization (issue #43597). The fix PR was closed March 2026 without merge. RN 0.83.6 is the project version.
   - What's unclear: Whether the glitch is noticeable at the expected data scale (< 50 sections, < 200 items total).
   - Recommendation: Implement with sticky headers per D-03. Add `React.memo` to `DateSectionHeader`. Flag for UAT verification step; accept the known visual artifact if minor.

2. **NativeWind v4 opacity modifier support**
   - What we know: Standard Tailwind supports `bg-gold/20`; NativeWind v4 implements most Tailwind utilities.
   - What's unclear: Whether `bg-gold/20` opacity shorthand compiles correctly in RN's style system.
   - Recommendation: If `bg-gold/20` renders incorrectly, fall back to the explicit hex: `bg-[#FEF8DC]` or `bg-[#FEF3C7]` (warm amber tint).

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies beyond the existing project stack — Phase 3 is a pure UI composition using installed packages).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest 29.4.9 |
| Config file | `jest.config.js` (project root) |
| Quick run command | `npx jest src/__tests__/historyUtils.test.ts --no-coverage` |
| Full suite command | `npx jest --passWithNoTests` |

[VERIFIED: jest.config.js, node_modules/.bin/jest --listTests, all 30 existing tests pass]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HIST-01 | `groupWinsByDate` groups wins by `date_key` newest-first, within-group sorted by `logged_at` DESC | unit | `npx jest src/__tests__/historyUtils.test.ts -t "groupWinsByDate"` | ❌ Wave 0 |
| HIST-01 | `groupWinsByDate` handles empty array → empty sections | unit | `npx jest src/__tests__/historyUtils.test.ts -t "empty"` | ❌ Wave 0 |
| HIST-01 | `groupWinsByDate` single section for single date | unit | `npx jest src/__tests__/historyUtils.test.ts -t "single date"` | ❌ Wave 0 |
| HIST-02 | `formatWinCount` produces "1 win" (singular) and "N wins" (plural) | unit | `npx jest src/__tests__/historyUtils.test.ts -t "formatWinCount"` | ❌ Wave 0 |
| HIST-01 | `formatDateKey` returns "Today" for today's date_key | unit | `npx jest src/__tests__/historyUtils.test.ts -t "formatDateKey"` | ❌ Wave 0 |
| HIST-01 | `formatDateKey` returns "Yesterday" for yesterday's date_key | unit | `npx jest src/__tests__/historyUtils.test.ts -t "formatDateKey"` | ❌ Wave 0 |
| HIST-01 | `formatDateKey` returns `EEE, MMM d` for same-year non-recent dates | unit | `npx jest src/__tests__/historyUtils.test.ts -t "formatDateKey"` | ❌ Wave 0 |
| HIST-01 | `formatDateKey` returns `MMM d, yyyy` for prior-year dates | unit | `npx jest src/__tests__/historyUtils.test.ts -t "formatDateKey"` | ❌ Wave 0 |
| HIST-02 | Collapse toggle independently per section (state logic) | unit | `npx jest src/__tests__/historyUtils.test.ts -t "collapse"` | ❌ Wave 0 |
| HIST-03 | `totalWins === 0` → empty state, `totalWins > 0` → hero header shown | manual/smoke | Visual UAT on simulator | — |
| HIST-01/03 | 200+ wins render without visible performance degradation | manual/smoke | Generate 200 wins via test data, verify scroll smoothness | — |

**Manual-only justification for HIST-03 and 200+ performance:** React Native component rendering and scroll performance cannot be unit tested in Node.js (no native renderer in test environment). These require simulator or device verification.

### Sampling Rate
- **Per task commit:** `npx jest src/__tests__/historyUtils.test.ts --passWithNoTests`
- **Per wave merge:** `npx jest --passWithNoTests`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/historyUtils.test.ts` — covers HIST-01 (groupWinsByDate, formatDateKey) and HIST-02 (formatWinCount, collapse state logic)
- [ ] No new framework install needed — Jest already configured

---

## Security Domain

Phase 3 is a read-only UI screen. No auth, no network calls, no user input, no cryptography. ASVS categories V2, V3, V4, V6 do not apply.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | no | No user input on this screen (read-only history) |
| V2 Authentication | no | Local-only, no auth in V1 |
| V6 Cryptography | no | No crypto operations |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: direct execution] `node -e "require('date-fns')"` — date-fns 4.1.0 `isToday`, `isYesterday`, `isSameYear`, `format` verified working in project
- [VERIFIED: codebase inspection] `src/stores/useWinsStore.ts` — `wins[]`, `totalWins`, `streak`, `isHydrated` confirmed present, no new store actions needed
- [VERIFIED: codebase inspection] `src/db/repositories/wins.ts` — `getWins()` returns `date_key DESC`; sufficient for Phase 3
- [VERIFIED: codebase inspection] `src/components/WinCard.tsx` — reusable as-is; `isNew={false}` suppresses ZoomIn
- [VERIFIED: node_modules] react-native-reanimated 3.19.5, react-native 0.83.6, date-fns 4.1.0, zustand 5.0.13
- [VERIFIED: jest run] All 30 existing tests pass; test framework operational

### Secondary (MEDIUM confidence)
- [CITED: reactnative.dev/docs/sectionlist] SectionList `stickySectionHeadersEnabled`, `extraData`, `initialNumToRender` defaults, `keyExtractor` requirements, PureComponent re-render behaviour
- [CITED: peterp.me/articles/react-native-sectionlist-expand-collapse] `extraData` + `renderItem null` collapse pattern with `Set`-based state
- [CITED: blog.date-fns.org/v40-with-time-zone-support] v4 breaking changes are minimal; `isToday`/`isYesterday`/`format` API unchanged
- [CITED: docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue] `useSharedValue` + `withTiming` API confirmed in v3 docs

### Tertiary (LOW confidence)
- [CITED: github.com/facebook/react-native/issues/43597] Sticky header + virtualization visual glitch in RN 0.73+; affects 0.83.6 (no fix merged as of May 2026)
- [CITED: github.com/facebook/react-native/pull/47345] Fix PR closed March 2026 without merge

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in project node_modules and package.json
- Architecture: HIGH — pattern derived from existing codebase conventions; no new patterns introduced
- Date-fns API: HIGH — verified via direct execution in project
- Pitfalls: MEDIUM — RN sticky header bug is documented but severity at project scale is unverified
- Collapse pattern: MEDIUM — `renderItem null` approach is widely cited; `extraData` requirement is documented

**Research date:** 2026-05-11
**Valid until:** 2026-08-11 (stable stack; no fast-moving dependencies)
