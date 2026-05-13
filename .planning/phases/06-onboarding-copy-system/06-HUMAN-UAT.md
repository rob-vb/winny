# Phase 6 — Human UAT

**Date:** 2026-05-13
**Status:** Pending simulator/device verification

This checklist covers the Phase 6 roadmap success criteria. Automated tests passed during implementation, but the navigation and native permission timing checks require a simulator, device, or EAS dev build.

## Automated Test Caveats

- None currently recorded. Full suite must be run before final phase verification.

## Checklist

| Check | Requirement | Status | Notes |
|-------|-------------|--------|-------|
| Fresh install shows Welcome before tabs | ONBD-01 | pending | Reset local SQLite/app data, launch app, confirm Welcome appears before tab shell. |
| Start Winning opens Dream Goal setup | ONBD-01 | pending | Tap `Start Winning`, confirm `Set a Dream Goal` screen appears. |
| Skip for now routes Home | ONBD-02 | pending | Tap `Skip for now`, confirm Home win entry appears. |
| Skipped user can set Dream Goal later | ONBD-02 | pending | After skip, open Dream Goal tab and save a goal without friction. |
| Saving Dream Goal during onboarding persists it | ONBD-01, ONBD-02 | pending | Enter valid goal, tap `Save Goal`, confirm success copy, then Home; later Dream Goal tab shows saved text. |
| No notification prompt during onboarding | ONBD-01 regression guard | pending | Complete Welcome/Dream Goal path without logging a win; confirm no OS notification permission prompt appears. |
| First win prompt appears on Home after onboarding | ONBD-01 | pending | Confirm Home shows `What was your win today?` and input is usable after onboarding. |
| First win banner appears after first saved win | COPY-01 | pending | Log first win; confirm `First win logged` banner appears below StreakHeader. |
| 7-day milestone banner appears at threshold | COPY-01 | pending | Seed wins so next save reaches 7-day streak; confirm `7 days of wins` banner. |
| 30-day milestone banner appears at threshold | COPY-01 | pending | Seed wins so next save reaches 30-day streak; confirm `30 days strong` banner. |
| 100-day milestone banner appears at threshold | COPY-01 | pending | Seed wins so next save reaches 100-day streak; confirm `100 days of proof` banner. |
| Comeback banner appears only after date gap | COPY-01, COPY-02 | pending | Seed newest prior win more than one local calendar day before today; log win; confirm `You're back in motion` banner. |
| Normal consecutive save does not show comeback | COPY-01 | pending | Seed newest prior win as yesterday; log win; confirm no comeback banner. |
| Miss/reset/comeback copy is forward-looking | COPY-02 | pending | Read Home, History, Dream Goal, Settings, How It Works, and banner copy; confirm no shame/guilt tone. |

## Success Criteria Mapping

| Roadmap Success Criterion | Checklist Rows |
|---------------------------|----------------|
| Fresh install shows welcome -> Dream Goal setup -> win entry in max 3 taps | Fresh install, Start Winning, Skip/Save routes Home, first win prompt |
| Skipping Dream Goal works and user can set it later | Skip for now routes Home, skipped user can set Dream Goal later |
| Streak milestone messages appear at 7, 30, 100 | 7-day, 30-day, 100-day milestone rows |
| Streak reset triggers comeback message with no guilt language | Comeback banner, normal consecutive save, forward-looking copy audit |
