---
phase: 4
slug: dream-goal
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-12
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 + ts-jest |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npx jest src/__tests__/goalValidation.test.ts --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~5 seconds (quick) / ~15 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `npx jest src/__tests__/goalValidation.test.ts --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | GOAL-01 | — | maxLength 500 enforced via validateGoalText | unit | `npx jest src/__tests__/goalValidation.test.ts -t "validateGoalText"` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 0 | GOAL-01 | — | isDirty trim comparison | unit | `npx jest src/__tests__/goalValidation.test.ts -t "isDirty"` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 0 | GOAL-01 | — | character counter visibility threshold | unit | `npx jest src/__tests__/goalValidation.test.ts -t "counter"` | ❌ W0 | ⬜ pending |
| 4-XX-XX | UI components/screen | 1+ | GOAL-01/02/03 | — | UI interaction behaviors | manual UAT | — | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Note: UI task IDs assigned during planning; this row is a placeholder reminding the planner that all UI tasks rely on Wave 0 utilities for their automated test coverage.*

---

## Wave 0 Requirements

- [ ] `src/utils/goalValidation.ts` — exports `validateGoalText(text)`, `isDirty(current, saved)`, `shouldShowCounter(text, maxLen)` (mirrors `winValidation.ts` pattern)
- [ ] `src/__tests__/goalValidation.test.ts` — covers all three utilities and edge cases (empty, whitespace-only, exactly 500, ≤100 remaining)

*Existing Jest infrastructure (jest.config.js, ts-jest preset) covers everything else.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Motivational copy renders in empty + view + edit states | GOAL-02 | Copy presence + placement is a visual concern; unit tests would assert against literal strings and over-couple to copy | 1) Launch app, navigate to Goal tab with no goal set → see "You're building your dream one win at a time" above input. 2) Save a goal → return to view mode → see the same copy below the goal text. |
| Edit flow end-to-end (pencil → edit → save → view) | GOAL-03 | Reanimated transitions + keyboard + tab navigation are full-stack interactions; no Detox/E2E framework installed | 1) View existing goal. 2) Tap pencil icon top-right → editor appears with text loaded. 3) Modify text → Save enabled. 4) Tap Save → returns to view mode with updated text. 5) Force-quit + relaunch → goal persists. |
| Empty-state first save | GOAL-01 | TextInput + keyboard + DB write is a full-stack interaction | 1) Fresh install / clear DB. 2) Open Goal tab → empty-state editor visible. 3) Type "Run a marathon" → tap Save → view mode renders the goal. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
