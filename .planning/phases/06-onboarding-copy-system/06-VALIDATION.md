---
phase: 6
slug: onboarding-copy-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x with ts-jest |
| **Config file** | `jest.config.js` |
| **Quick run command** | `npx jest --runInBand --findRelatedTests` |
| **Full suite command** | `npx jest --runInBand` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --runInBand --findRelatedTests` against modified source/test files where applicable
- **After every plan wave:** Run `npx jest --runInBand`
- **Before `$gsd-verify-work`:** Full suite must be green, plus manual fresh-install onboarding path checked
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | COPY-01, COPY-02 | T-06-01 / T-06-02 | No guilt/shame terms in cataloged emotional states | unit | `npx jest --runInBand src/__tests__/copyCatalog.test.ts src/__tests__/streakLabel.test.ts src/__tests__/notificationService.test.ts` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 1 | COPY-01, COPY-02 | T-06-03 | Milestone/comeback helpers use local date keys only | unit | `npx jest --runInBand src/__tests__/postWinMoment.test.ts` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 2 | ONBD-01, ONBD-02 | T-06-04 | Onboarding completion stored only after Save Goal or Skip | unit + manual | `npx jest --runInBand src/__tests__/onboardingSettings.test.ts` | ❌ W0 | ⬜ pending |
| 06-04-01 | 04 | 3 | ONBD-01, ONBD-02, COPY-01 | T-06-05 | Fresh-install path hides tabs until completion and preserves post-first-win notification timing | manual + full suite | `npx jest --runInBand` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/copyCatalog.test.ts` — required catalog keys, deterministic variants, no-guilt invariant
- [ ] `src/__tests__/postWinMoment.test.ts` — milestone thresholds and comeback date-gap detection
- [ ] `src/__tests__/onboardingSettings.test.ts` — onboarding completion helper reads/writes `settings.onboarding_completed`, if a helper is added
- [ ] Update existing `src/__tests__/streakLabel.test.ts` to confirm compatibility wrapper still satisfies threshold behavior
- [ ] Update existing `src/__tests__/notificationService.test.ts` to confirm notification prompts delegate to catalog-backed copy

*Existing Jest infrastructure covers the phase; no framework install should be needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Fresh-install onboarding route gate | ONBD-01 | Requires app navigation state and persisted SQLite settings reset | Clear app data or reset SQLite → launch app → confirm Welcome appears before tabs → tap Start Winning → Dream Goal setup appears → Skip routes to Home |
| Dream Goal onboarding save path | ONBD-01, ONBD-02 | Requires route transition plus persisted goal read from tab screen | Fresh install → Welcome → enter valid Dream Goal → Save Goal → confirm success state briefly appears → Home opens → Dream Goal tab shows saved goal |
| Notification permission timing unchanged | NOTF-01 regression guard | OS permission dialog cannot be fully unit tested | Fresh install → complete onboarding without logging a win → confirm no notification prompt → log first win → permission prompt timing matches Phase 5 behavior |
| Home milestone banner | COPY-01 | Requires seeded win history or manual DB setup | Seed wins so next save reaches 7, 30, and 100 day streaks → log win → Home shows milestone banner with encouraging copy |
| Home comeback banner | COPY-01, COPY-02 | Requires seeded date gap | Seed newest prior win more than one local calendar day before today → log win → Home shows comeback copy with no guilt/shame language |
| No-guilt copy audit | COPY-02 | Human tone review catches wording tests may miss | Read all miss/reset/comeback/empty/error copy surfaces touched in the phase; verify no blame, punishment, shame, or scolding tone |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] Fresh-install onboarding manual verification completed
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
