# Phase 7: EAS Build + App Store Submission - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 07-eas-build-app-store-submission
**Areas discussed:** Store listings & metadata, Privacy & legal pages, Android config, OTA update strategy

---

## Store Listings & Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Health & Fitness | Best fit — habit tracking, daily wellness, journaling | ✓ |
| Lifestyle | Broader bucket, less competitive | |
| Productivity | Works if angle is "win tracking as productivity" | |

**User's choice:** Health & Fitness

---

| Option | Description | Selected |
|--------|-------------|----------|
| Need to generate them | Plan includes simulator build + screenshot capture | ✓ |
| I'll provide screenshots manually | Plan skips generation, documents sizes only | |

**User's choice:** Need to generate screenshots — include in plan

---

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts, I approve | Draft in CONTEXT.md for review before submission | ✓ |
| I'll write it myself | Plan documents limits only | |

**User's choice:** Claude drafts description + keywords, user approves before submission

---

## Privacy & Legal Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Not yet — need to create them | Plan includes creating content | ✓ |
| They exist and are live | Plan just verifies URLs resolve | |

**User's choice:** Pages don't exist yet; plan provides content

---

| Option | Description | Selected |
|--------|-------------|----------|
| Simple static page | GitHub Pages or Vercel, zero cost | |
| I'll handle hosting separately | Plan provides content only | ✓ |

**User's choice:** User handles hosting; plan provides privacy policy + terms text

---

## Android Config

| Option | Description | Selected |
|--------|-------------|----------|
| com.justkeepwinning.winningstreak | Mirrors iOS bundle ID | |
| com.robvb.winningstreak | Owner-namespaced | |
| Something else | User specifies | |

**User's choice (free text):** `com.robvb.winny` — user is renaming the app to "Winny"
**Notes:** This is a full app rename from "Just Keep Winning" to "Winny". Affects name, slug, bundle ID (iOS), package (Android), and store listing.

---

| Option | Description | Selected |
|--------|-------------|----------|
| com.robvb.winny | Mirrors Android, owner-namespaced | ✓ |
| com.justkeepwinning.winny | Brand-namespaced | |
| Keep current com.justkeepwinning.winningstreak | Display name change only | |

**User's choice:** `com.robvb.winny` for iOS bundle ID

---

| Option | Description | Selected |
|--------|-------------|----------|
| Internal test → Production | Safe: verify install before promoting | ✓ |
| Straight to Production | Faster, riskier for 1.0 | |

**User's choice:** Internal Test track first, then promote to Production

---

## OTA Update Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — set up EAS Update | JS-only fixes without App Store re-review | ✓ |
| No — every update through App Store | Simpler, but all fixes need full build+review | |

**User's choice:** Configure EAS Update for post-launch hotfixes (runtimeVersion: managed)

---

## Claude's Discretion

- Exact Expo slug for `winny` (uniqueness check)
- Screenshot capture tooling (Expo screenshot tool vs custom script)
- iOS `infoPlist` notification permission strings (researcher verifies App Store wording)

## Deferred Ideas

None — discussion stayed within phase scope.
