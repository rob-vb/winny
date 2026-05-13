---
phase: 5
slug: notifications-settings
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest (jest-expo preset) |
| **Config file** | jest.config.js (or `package.json` "jest" key — Wave 0 confirms) |
| **Quick run command** | `npm test -- --findRelatedTests` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick test command (related-tests only)
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green + EAS dev build manual verification log attached
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | NOTF-01..04, SET-01..03 | — | N/A (no auth/data exfil surface) | unit + manual | `npm test` + EAS dev build | ❌ W0 | ⬜ pending |

*Planner fills concrete rows per task. Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/notifications/copyPool.test.ts` — deterministic hash selection (NOTF-02 copy seeding)
- [ ] `src/notifications/scheduler.test.ts` — 30-day window date math (NOTF-03)
- [ ] `src/notifications/permissions.test.ts` — `notification_permission_status` guard logic (NOTF-01)
- [ ] Verify `jest-expo` preset installed; install if missing (no test infra detected in Phase 1-4)
- [ ] Mock `expo-notifications` module surface for scheduler unit tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Notification actually fires at configured time | NOTF-02 | Requires native OS scheduler + real device clock | EAS dev build → set reminder time to 2 min from now → background app → wait → notification appears with correct title/body |
| Permission dialog appears after first win save (iOS + Android 13+) | NOTF-01 | OS-level dialog cannot be unit tested | Fresh install on EAS dev build → first launch (no prompt) → log first win → dialog appears |
| AppState top-up runs on foreground transition | NOTF-04 | Requires real foreground/background lifecycle | EAS dev build → check scheduled count = 30 → background → wait → foreground → scheduled count still = 30 (cancel-all+reschedule fired) |
| iOS 64-cap headroom | NOTF-03 | Real `getAllScheduledNotificationsAsync()` count after 30+ days | After multi-day usage, query scheduled count via debug log — must remain ≤ 30 |
| Time picker modal: iOS spinner vs Android dialog | SET-01 | Platform-native widget rendering | EAS dev build on both platforms → tap time row → confirm native picker UX |
| `expo-store-review` in-app prompt + fallback URL | SET-03 | OS-throttled, requires production-like context | EAS dev build → Settings → Rate App → either native sheet shows or Linking opens App Store stub URL |
| `expo-web-browser` Privacy/Terms opens in-app browser | SET-03 | Real browser surface | EAS dev build → Settings → Privacy → in-app browser opens stubbed URL |
| RN Share API sheet | SET-03 | Native share sheet | EAS dev build → Share App → native share sheet renders message + URL |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (test infra install + scheduler/copyPool/permissions mocks)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] Manual-only EAS verifications logged before `/gsd-verify-work`
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
