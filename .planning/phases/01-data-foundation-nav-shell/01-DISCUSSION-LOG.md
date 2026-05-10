# Phase 1: Data Foundation + Nav Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 1-Data Foundation + Nav Shell
**Areas discussed:** Design System Setup

---

## Gray Area Selection

| Area | Selected for discussion |
|------|------------------------|
| Streak calculation | No — handled by defaults/research |
| Settings storage | No — handled by defaults/research |
| Design System Setup | ✓ |
| EAS + project setup | No — handled by defaults/research |

---

## Design System Setup

### Q1: Set up NativeWind + color tokens in Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Full theme in Phase 1 | Warm cream palette, gold/orange tokens, typography scale from day one | ✓ |
| Basic NativeWind only | Install NativeWind, defer custom tokens to Phase 6 polish | |
| Skip NativeWind for now | Plain React Native StyleSheet, add NativeWind later | |

**User's choice:** Full theme in Phase 1
**Notes:** No additional notes.

---

### Q2: Where should design tokens come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Extract from mockup image | Derive palette from provided mockup — cream bg, gold trophy, orange CTA | ✓ |
| I'll define them manually | User provides specific hex values | |
| Start with defaults, refine later | Use NativeWind defaults, adjust colors in Phase 6 | |

**User's choice:** Extract from mockup image
**Notes:** App icon (smiley trophy) also provided as reference.

---

### Q3: Font choice

| Option | Description | Selected |
|--------|-------------|----------|
| System font (SF Pro / Roboto) | Zero setup, platform-native feel | |
| Custom font (Expo Google Fonts) | Install specific font via expo-google-fonts | |
| You decide | Pick whatever fits the warm playful aesthetic best | ✓ |

**User's choice:** "You decide, but I don't want AI slop font. Pick a font that matches the app preview image and the logo."
**Notes:** User provided smiley trophy icon as reference. Claude selected **Nunito** — rounded terminals match trophy mascot's soft 3D curves. Not Poppins (too geometric), not Inter (too techy).

---

### Q4: Confirm Nunito?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, use Nunito | Rounded, warm, multiple weights — matches trophy's playful curves | ✓ |
| Try something else | User specifies alternative | |

**User's choice:** Yes, use Nunito
**Notes:** No additional notes.

---

## Claude's Discretion

- Drizzle migration runner pattern (use expo-sqlite v2 recommended approach)
- NativeWind config file details
- Tab bar icon style (Ionicons from @expo/vector-icons)
- TypeScript tsconfig and path aliases
- Streak calculated on-the-fly from wins table (no separate streak table)
- Settings stored in SQLite key-value table (not MMKV)

## Deferred Ideas

None — discussion stayed within Phase 1 scope.
