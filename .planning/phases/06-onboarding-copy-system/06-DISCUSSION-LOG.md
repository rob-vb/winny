# Phase 6: Onboarding + Copy System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 6-Onboarding + Copy System
**Areas discussed:** First-run path, Welcome tone, Dream Goal setup, Copy system states, Milestones + comeback behavior

---

## First-Run Path

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| For a fresh install, which flow should onboarding use? | Light gate before app; Overlay on top of app; Inline Home-first | Light gate before app |
| When should onboarding be considered complete? | After the user reaches Home; After first win logged; After app shell opens once | After the user exits Dream Goal setup |
| Should the first-run gate ever show again? | Never after completion; Only if onboarding was abandoned; Show a gentle Home prompt if skipped | Never after completion |
| Where should the completion flag live? | Settings table; New onboarding table; Local async storage | Settings table |

**Notes:** Dream Goal must be skippable. Completion is set by Save Goal or Skip, then Home opens.

---

## Welcome Tone

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| What should the first welcome screen feel like? | Calm habit invitation; Celebratory rocket/trophy energy; Method-driven intro | Celebratory rocket/trophy energy |
| How much explanation should the welcome screen include? | One-line promise; Tiny method framing; Three-point explainer | Tiny method framing |
| Which visual asset should welcome use? | Reuse trophy asset; Add rocket/astronaut asset; Use both lightly | Reuse trophy asset |
| What should the primary button say? | Start Winning; Log My First Win; Get Started | Start Winning |

**Notes:** V1 should use existing trophy visual language, with playful emotional lift but minimal explanation.

---

## Dream Goal Setup

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| How strong should the Dream Goal setup default path be? | Encourage but equal-weight skip; Strongly encourage goal entry; Almost optional | Encourage entry with visible, calm skip |
| Reuse full editor or create onboarding version? | Simplified onboarding editor; Reuse full Goal tab editor; Shared component with mode prop | Simplified onboarding editor |
| What happens with empty/invalid text? | Primary disabled until valid; Show inline guidance; Treat empty primary as skip | Primary disabled until valid |
| Show confirmation after saving? | No confirmation; Brief success state; Confirmation screen | Brief success state |

**Notes:** The onboarding editor should reuse validation and persistence, but not feel like the full Goal tab screen.

---

## Copy System States

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| How should the copy system be structured? | Central copy catalog; Utility functions by domain; Inline screen copy with tests | Central copy catalog |
| Which states should V1 cover? | Roadmap minimum; Minimum + existing empty/loading states; Full app copy audit | Minimum + existing emotional empty/loading/error/disabled states |
| Fixed strings or rotating variants? | Fixed per state; Small variant arrays; Large variant bank | Small variant arrays |
| What happens to `streakLabel()` and `COPY_POOL`? | Move into catalog; Wrap, don't move; Leave helpers separate | Wrap, don't move |

**Notes:** Use deterministic rotation by date, streak, or win count where freshness matters.

---

## Milestones + Comeback Behavior

| Question | Options Considered | User's Choice |
|----------|--------------------|---------------|
| How visible should streak milestone moments be? | Inline label only; Small celebratory banner on Home; Full celebration moment | Small celebratory banner on Home |
| When should comeback copy appear? | Only after user logs again; When Home opens after a missed day; Both | Only after user logs again |
| How should the app detect a comeback? | Compare previous streak before add; Persist last streak state; Date-key gap check | Date-key gap check |
| Where should banners live? | Home only; Home + My Wins; Global app-level banner | Home only |

**Notes:** Milestone and comeback copy are immediate post-save feedback moments tied to Home.

---

## the agent's Discretion

- Exact copy strings and variant wording, within the no-guilt/shame invariant.
- Exact file/module layout for the typed copy catalog.
- Banner visual styling and dismissal behavior.
- Exact onboarding transition timing for the brief Dream Goal saved state.

## Deferred Ideas

- New rocket/astronaut art for V1.
- Full localization or every-string extraction.
- Persistent milestone/comeback history in My Wins.
