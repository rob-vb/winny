# Winning Streak — Project Guide

## Project Context

See `.planning/PROJECT.md` for full project context, requirements, and key decisions.
See `.planning/ROADMAP.md` for phase structure and success criteria.
See `.planning/STATE.md` for current phase and progress.

**Core value:** A frictionless daily habit of noticing wins — the streak counter and history prove you're already winning.

## GSD Workflow

This project uses the Get Shit Done (GSD) workflow.

### Phase Commands

```bash
/gsd-discuss-phase N   # Gather context, clarify approach
/gsd-plan-phase N      # Create execution plan for a phase
/gsd-execute-phase N   # Execute the plan
/gsd-verify-work N     # Verify phase deliverables
/gsd-progress          # Show current status
```

### Config

- **Mode:** YOLO (auto-approve)
- **Granularity:** Standard
- **Research:** Yes (before each phase)
- **Plan Check:** Yes
- **Verifier:** Yes
- **Model:** Balanced (Sonnet)

## Tech Stack

- **Framework:** Expo (latest, managed workflow)
- **Navigation:** Expo Router (file-based)
- **Local Storage:** expo-sqlite v2 + Drizzle ORM
- **State:** Zustand
- **Styling:** NativeWind v4
- **Notifications:** expo-notifications
- **Dates:** date-fns

## Critical Invariants

These must never be violated:

1. **Timezone-safe dates:** All date_key values stored as `YYYY-MM-DD` in device LOCAL time, never UTC. Streak logic depends on this.
2. **UUID PKs:** All table primary keys are UUID strings (never integer auto-increment). Required for future Convex migration.
3. **No in-app AI calls:** V1 is a free app. No API calls that incur per-request costs.
4. **No guilt language:** Zero shame/punishment copy anywhere. All miss/reset states are encouraging.
5. **30-day notification window:** Never schedule all future notifications at once (iOS limit = 64). Use rolling 30-day window with AppState top-up.

## V2 Migration Notes

V1 schema pre-includes nullable columns for Convex sync: `synced_at`, `remote_id`, `category`. Do not remove these. They make the local→cloud migration additive (no breaking schema changes).

## Platform

iOS + Android via Expo managed workflow. EAS Build required for notifications testing (not Expo Go).
