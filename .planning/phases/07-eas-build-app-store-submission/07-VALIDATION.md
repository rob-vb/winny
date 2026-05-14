---
phase: 7
slug: eas-build-app-store-submission
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-14
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual + EAS CLI (no Jest test suite — this is a deployment phase) |
| **Config file** | `eas.json`, `app.json` |
| **Quick run command** | `npx expo-doctor` |
| **Full suite command** | `npx expo-doctor && eas build --platform all --profile production --dry-run` |
| **Estimated runtime** | ~30 seconds (dry-run); hours for real builds |

---

## Sampling Rate

- **After every task commit:** Run `npx expo-doctor` to catch config errors early
- **After every plan wave:** Run full suite command + manual checklist
- **Before `/gsd-verify-work`:** Both store listings live + fresh install smoke test complete
- **Max feedback latency:** Variable (App Store review 24–48h; Play review 3–7 days)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | What it validates | Automated Command | Manual Check | Status |
|---------|------|------|-------------------|-------------------|--------------|--------|
| 07-app-rename | — | 1 | app.json name/slug/bundleId/package correct | `cat app.json \| jq '.expo.name,.expo.slug,.expo.ios.bundleIdentifier,.expo.android.package'` | — | ⬜ pending |
| 07-eas-update | — | 1 | eas.json has production channel + runtimeVersion | `cat eas.json \| jq '.build.production,.channel'` | — | ⬜ pending |
| 07-legal-text | — | 1 | Privacy + terms text drafted | File exists at agreed path | Human review | ⬜ pending |
| 07-notif-verify | — | 1 | Phase 5 EAS device notification flow works | — | Physical device: push fires at scheduled time; AppState top-up confirmed | ⬜ pending |
| 07-ios-build | — | 2 | iOS production build succeeds | `eas build --platform ios --profile production` | EAS dashboard shows SUCCESS | ⬜ pending |
| 07-android-build | — | 2 | Android production build succeeds | `eas build --platform android --profile production` | EAS dashboard shows SUCCESS | ⬜ pending |
| 07-screenshots | — | 2 | Screenshots captured at required sizes | — | 1260×2736 (6.9") set present | ⬜ pending |
| 07-ios-submit | — | 3 | TestFlight build available for testing | `eas submit --platform ios` | Build appears in App Store Connect | ⬜ pending |
| 07-android-submit | — | 3 | .aab uploaded to Internal Test track | Manual first upload via Play Console | Internal tester can install | ⬜ pending |
| 07-store-review | — | 4 | App passes review on both stores | — | Status: "Ready for Sale" / "Published" | ⬜ pending |
| 07-links-update | — | 4 | links.ts URLs are live (not placeholder) | `grep -r "TODO\|placeholder\|example.com" src/constants/links.ts` | URLs return 200 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

This is a deployment phase — no test stubs needed. Wave 0 equivalent is:

- [ ] `app.json` updated (name, slug, bundleIdentifier, android.package) — verified before any build
- [ ] `eas.json` updated (submit section, EAS Update channel, runtimeVersion) — verified before any build
- [ ] `expo-updates` installed and configured

---

## Manual Verification Gates

These cannot be automated and require human sign-off:

1. **Notification device test** — Phase 5 deferred verification on physical EAS dev build
2. **Store listing content review** — App name, description, screenshots reviewed before submission
3. **Legal page review** — Privacy policy and Terms of Use content approved
4. **TestFlight smoke test** — Fresh install from TestFlight completes onboarding + logs first win
5. **Play Internal Test smoke test** — Same on Android
6. **App Store review outcome** — "Ready for Sale" status confirmed
7. **Google Play review outcome** — "Published" status confirmed (note: may require 12-tester / 14-day gate if account created after Nov 13, 2023)
