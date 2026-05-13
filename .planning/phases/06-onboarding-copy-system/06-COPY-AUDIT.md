# Phase 6 — Copy Audit

**Date:** 2026-05-13
**Scope:** COPY-01, COPY-02
**Result:** PASS

## Files Audited

| File | Surface | Result |
|------|---------|--------|
| `src/copy/catalog.ts` | Central emotional copy catalog | PASS |
| `src/utils/streakLabel.ts` | Streak label compatibility wrapper | PASS |
| `src/notifications/notificationService.ts` | Notification prompt compatibility wrapper | PASS |
| `app/onboarding/welcome.tsx` | Welcome onboarding copy | PASS |
| `app/onboarding/dream-goal.tsx` | Dream Goal onboarding copy | PASS |
| `src/components/PostWinBanner.tsx` | Banner rendering path | PASS |
| `app/(tabs)/index.tsx` | Home empty state and banner placement | PASS |
| `app/(tabs)/goal.tsx` | Dream Goal empty/save/load states | PASS |
| `app/(tabs)/settings.tsx` | Notification disabled and load error copy | PASS |
| `app/settings/how-it-works.tsx` | Streak explanation copy | PASS |
| `src/constants/examplePrompts.ts` | Daily example prompt pool | PASS |

## COPY-01 Coverage

| Required State | Implementation Location | Result |
|----------------|-------------------------|--------|
| First win ever | `src/copy/catalog.ts` -> `firstWin`; rendered by `PostWinBanner` | PASS |
| 7-day milestone | `src/copy/catalog.ts` -> `milestone7`; detected by `getStreakMilestone(7)` | PASS |
| 30-day milestone | `src/copy/catalog.ts` -> `milestone30`; detected by `getStreakMilestone(30)` | PASS |
| 100-day milestone | `src/copy/catalog.ts` -> `milestone100`; detected by `getStreakMilestone(100)` | PASS |
| Comeback after a gap | `src/copy/catalog.ts` -> `comeback`; detected by `isComebackWin()` | PASS |
| Generic post-save/session moment | `src/copy/catalog.ts` -> `postSave` | PASS |
| Long streak | `src/copy/catalog.ts` -> `longStreak`; `streakLabel()` delegates to catalog helper | PASS |
| Home empty | Existing `app/(tabs)/index.tsx` plus `homeEmpty` catalog state | PASS |
| History empty | Existing History screen plus `historyEmpty` catalog state | PASS |
| Dream Goal empty | Existing `app/(tabs)/goal.tsx` plus `dreamGoalEmpty` catalog state | PASS |
| Notification disabled | Existing Settings copy plus `notificationDisabled` catalog state | PASS |
| Save/load errors | Existing app copy plus `saveError` / `loadError` catalog states | PASS |
| Notification prompts | `notificationPrompts` catalog variants exported as `COPY_POOL` | PASS |

## COPY-02 Banned-Term Audit

Regex used:

```text
/missed|forgot|failed|failure|broke|broken|lost|punish|shame|guilt|sorry|oops|should have|don't break/i
```

Automated coverage:

- `src/__tests__/copyCatalog.test.ts` audits every string in `COPY_CATALOG`.
- `src/__tests__/notificationService.test.ts` audits every string in `COPY_POOL`.
- `src/__tests__/streakLabel.test.ts` audits the zero-streak label.

Manual source scan found and fixed two pre-existing user-facing strings:

- `src/constants/examplePrompts.ts`: changed "I fixed something that was broken" to "I fixed something that needed attention".
- `app/settings/how-it-works.tsx`: changed "Miss a day and it resets..." to forward-looking reset copy.

## Tone Finding

PASS. Miss/reset/comeback language is forward-looking. Comeback copy appears after action and says, "Today counts. Start from this win and keep going." It does not shame the user or foreground the missed day before the user logs again.
