---
phase: 06-onboarding-copy-system
plan: "01"
status: complete
completed: 2026-05-13
requirements:
  - COPY-01
  - COPY-02
key-files:
  - src/copy/catalog.ts
  - src/utils/postWinMoment.ts
  - src/utils/streakLabel.ts
  - src/notifications/notificationService.ts
  - src/__tests__/copyCatalog.test.ts
  - src/__tests__/postWinMoment.test.ts
---

# Plan 06-01 Summary — Copy Catalog + Post-Win Moment Utilities

## Completed

- Added a central typed emotional copy catalog in `src/copy/catalog.ts`.
- Added deterministic `pickCopyVariant`, catalog-backed streak copy, catalog-backed notification prompts, and post-win banner copy.
- Added `src/utils/postWinMoment.ts` for first-win, 7/30/100 milestone, comeback, and post-save moment detection.
- Updated `streakLabel()` and notification prompt selection to delegate to the catalog while preserving public exports.
- Added Jest coverage for copy state coverage, no-guilt audit, deterministic variants, milestone thresholds, and comeback date gaps.

## Verification

- `npx jest --runInBand src/__tests__/copyCatalog.test.ts src/__tests__/postWinMoment.test.ts src/__tests__/streakLabel.test.ts src/__tests__/notificationService.test.ts` — PASS, 49 tests.

## Deviations

- None.

## Self-Check

PASSED. COPY-01 and COPY-02 logic foundations are implemented and tested.
