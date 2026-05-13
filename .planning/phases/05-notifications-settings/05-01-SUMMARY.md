---
phase: 05-notifications-settings
plan: "01"
subsystem: notifications
tags: [expo-notifications, local-notifications, settings, appstate]
requires:
  - phase: 02-core-win-entry-loop
    provides: useWinsStore.addWin hook point
provides:
  - Notification service with permission, scheduling, prompt selection, and time helpers
  - First-win notification permission hook
  - AppState/cold-start notification queue top-up
affects: [phase-05, settings, notifications]
tech-stack:
  added: [expo-notifications, "@react-native-community/datetimepicker", expo-store-review]
  patterns: [rolling-30-day-notification-window, first-win-permission-prompt]
key-files:
  created:
    - src/notifications/notificationService.ts
    - src/constants/links.ts
    - src/__tests__/notificationService.test.ts
  modified:
    - app.json
    - app/_layout.tsx
    - src/stores/useWinsStore.ts
    - package.json
    - package-lock.json
key-decisions:
  - "Use 30 one-shot DATE notifications instead of a repeating trigger so per-day copy can rotate deterministically."
  - "Request permission only after first win save, never on first app open."
patterns-established:
  - "Notification queue refresh is idempotent: cancel all scheduled notifications, then schedule next 30 future slots."
  - "Prompt copy is picked deterministically from date_key via hash modulo copy pool length."
requirements-completed: [NOTF-01, NOTF-02, NOTF-03, NOTF-04]
duration: inline
completed: 2026-05-13
---

# Plan 05-01: Notification Foundation Summary

**Expo notification service with first-win permission prompt, 30-day rolling schedule, and AppState top-up**

## Performance

- **Tasks:** 4
- **Files modified:** 8
- **Verification:** `npx jest --testPathPattern notificationService` passed; full suite passed later in phase

## Accomplishments

- Added `notificationService.ts` with handler init, permission request, deterministic copy pool, time helpers, scheduling, and cancel-all.
- Added first-win permission flow to `useWinsStore.addWin()`.
- Added cold-start and foreground AppState queue refresh in `app/_layout.tsx`.
- Added native deps and `expo-notifications` plugin entry.

## Task Commits

1. **Notification foundation** - `b77df2a` (`feat(05-01): implement notification foundation`)

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

- `npx expo install` could not run because local Expo CLI resolution was broken. Resolved by installing the exact SDK-compatible packages with npm.

## User Setup Required

- New EAS dev build required because `expo-notifications` and `app.json` plugin changed native config.

## Next Phase Readiness

Settings UI can call `scheduleNext30Days`, `cancelAll`, and time helper exports.

