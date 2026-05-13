---
phase: 06-onboarding-copy-system
plan: "04"
status: complete
completed: 2026-05-13
requirements:
  - ONBD-01
  - ONBD-02
  - COPY-01
  - COPY-02
key-files:
  - .planning/phases/06-onboarding-copy-system/06-COPY-AUDIT.md
  - .planning/phases/06-onboarding-copy-system/06-HUMAN-UAT.md
---

# Plan 06-04 Summary — Copy Audit + UAT Checkpoint

## Completed

- Created `06-COPY-AUDIT.md` mapping COPY-01 states to implementation locations and recording COPY-02 no-guilt results.
- Created `06-HUMAN-UAT.md` covering fresh-install onboarding, skip/save Dream Goal paths, notification timing, milestone banners, comeback banners, and copy tone review.
- Fixed two pre-existing user-facing copy issues surfaced by the audit:
  - `src/constants/examplePrompts.ts`: replaced "broken" phrasing.
  - `app/settings/how-it-works.tsx`: replaced "Miss a day..." with forward-looking reset language.

## Verification

- `npx jest --runInBand` — PASS, 12 suites / 121 tests.
- `node node_modules/typescript/lib/tsc.js --noEmit` — PASS.
- Copy audit source checks — PASS.
- UAT checklist source checks — PASS.

## Deviations

- `npx tsc --noEmit` is blocked by a broken local `.bin/tsc` shim that requires a missing `../lib/tsc.js`. Running the actual installed compiler file directly passed.
- Manual simulator/device rows remain `pending` in `06-HUMAN-UAT.md` because no simulator/device session was run in this turn.

## Self-Check

PASSED. Automated verification is green; manual UAT is documented for the next device/simulator pass.
