---
status: complete
phase: 06-onboarding-copy-system
source:
  - 06-01-SUMMARY.md
  - 06-02-SUMMARY.md
  - 06-03-SUMMARY.md
  - 06-04-SUMMARY.md
started: 2026-05-14T07:20:00Z
updated: 2026-05-14T07:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Fresh install shows Welcome screen
expected: Reset app data (delete app or clear SQLite). Launch app. The Welcome screen appears before any tabs are visible. It shows the trophy, headline copy, and a "Start Winning" button.
result: pass

### 2. Start Winning opens Dream Goal setup
expected: On the Welcome screen, tap "Start Winning". The Dream Goal setup screen appears — it shows a text input, "Save Goal" button, and "Skip for now" link.
result: pass

### 3. Skip for now routes to Home
expected: On the Dream Goal screen, tap "Skip for now". The tab shell appears and you land on Home with the win input ready.
result: pass

### 4. Skipped user can set Dream Goal later
expected: After skipping Dream Goal in onboarding, open the Goals tab. You can type a goal and save it without any friction or re-entering onboarding.
result: pass

### 5. Saving Dream Goal during onboarding persists it
expected: On the Dream Goal screen, type a goal and tap "Save Goal". Success copy appears briefly. You then land on Home. Opening the Goals tab shows the saved goal text.
result: pass

### 6. No notification prompt during onboarding
expected: Complete the Welcome → Dream Goal path (save or skip) without logging a win. At no point does the OS notification permission dialog appear.
result: pass

### 7. First win triggers "First win logged" banner
expected: As a fresh user (0 prior wins), log your first win. A banner appears below the streak header reading "First win logged" with encouraging body copy.
result: pass

### 8. Normal consecutive save shows post-save banner
expected: As a user with prior wins who logged yesterday (streak intact), log a new win today. A banner appears with "Win added" title and a rotating encouraging body — no milestone or comeback copy.
result: pass

### 9. Comeback banner appears after date gap
expected: With the newest prior win dated more than one calendar day ago (streak broken), log a win today. The banner reads "You're back in motion" with forward-looking body copy.
result: skipped
reason: Can't test that today

### 10. No comeback banner on normal consecutive save
expected: With the newest prior win dated yesterday, log a win today. The banner does NOT show comeback copy — it shows the regular "Win added" post-save copy.
result: skipped
reason: Can't test that today

### 11. Copy tone is forward-looking everywhere
expected: Read through Home empty state, History empty state, Goals empty state, Settings, How It Works, and all banners. Zero shame or guilt language — no "you missed", "broken streak", "failed", or punishing tone anywhere.
result: pass

## Summary

total: 11
passed: 9
issues: 0
skipped: 2
pending: 0

## Gaps

[none yet]
