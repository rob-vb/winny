# Phase 7: EAS Build + App Store Submission - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 ships the finished Winning Streak app (renamed to **Winny**) to both the iOS App Store and Google Play Store. This includes updating all app identifiers and metadata for the rename, configuring EAS Update for OTA hotfixes, building signed production binaries, preparing store listings (description, screenshots, category), ensuring legal pages are content-ready, and completing the Phase 5 EAS device notification verification that was deferred to this phase.

**In scope:**
- App rename to "Winny" — updating `app.json` (name, slug, bundle ID, package)
- EAS production build (iOS + Android)
- App Store Connect setup + iOS submission via TestFlight → Production review
- Google Play Console setup + Android submission via Internal Test → Production
- App Store and Play Store listing content (description, screenshots, category)
- Privacy policy + Terms of Use content (hosted by user; plan provides text)
- EAS Update configuration for OTA JS-only hotfixes post-launch
- Phase 5 EAS device notification verification (deferred from Phase 5)
- Updating placeholder URLs in `src/constants/links.ts` once store listings are live

**Out of scope:**
- Designing or hosting the privacy policy / terms pages (user handles hosting)
- New features or bug fixes beyond pre-submission QA
- V2 Convex backend or account system
- Marketing site or landing page

</domain>

<decisions>
## Implementation Decisions

### App Rename
- **D-01:** App display name changes from "Just Keep Winning" to **Winny**.
- **D-02:** iOS bundle identifier changes to `com.robvb.winny`.
- **D-03:** Android package name is `com.robvb.winny`.
- **D-04:** Expo slug in `app.json` should be updated to `winny` (or `winny-app` — researcher to verify EAS slug uniqueness).

### Store Metadata
- **D-05:** Primary category on both stores: **Health & Fitness**.
- **D-06:** App description and keyword set: Claude drafts for user approval in CONTEXT.md or plan artifact; user reviews before submission.
- **D-07:** Screenshots need to be generated — plan includes an EAS simulator build, capturing on required iOS device sizes (6.9" iPhone 16 Pro Max + 6.5" iPhone 11 Pro Max) and Android 16:9. Optional framing/overlay step.

### Privacy & Legal
- **D-08:** Privacy policy and Terms of Use pages do not yet exist. User will host them independently at `winningstreak.app/privacy` and `winningstreak.app/terms` (or new Winny URLs — user decides on domain).
- **D-09:** Plan provides ready-to-publish privacy policy + terms content appropriate for a local-data-only app (no account, no server-side data collection, only push notification tokens).
- **D-10:** URLs in `src/constants/links.ts` (PRIVACY_URL, TERMS_URL, APP_STORE_URL) are placeholders and must be updated once pages are live and store listings exist.

### Android Config
- **D-11:** First Play Store release targets **Internal Test track** first; promote to Production after smoke-test verification.
- **D-12:** EAS handles Android signing (managed credentials via `eas credentials`); no manually generated keystore needed.

### OTA Update Strategy
- **D-13:** EAS Update is configured for post-launch JS-only hotfixes.
- **D-14:** `runtimeVersion` policy: **managed** (Expo manages compatibility automatically based on Expo SDK version).
- **D-15:** Production EAS Update channel is named `production`; maps to the production build profile.

### Phase 5 Verification
- **D-16:** EAS device notification verification (push permission flow, 30-day queue, AppState top-up) must be completed on a physical device EAS dev build before submitting to either store. This was deferred from Phase 5.

### Claude's Discretion
- Exact Expo slug for `winny` (uniqueness check — researcher verifies)
- Whether to use Expo's screenshot tool or a custom simulator capture script
- iOS `infoPlist` permission strings for notifications (researcher verifies current App Store wording requirements)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Build Config
- `app.json` — Current Expo config; requires name, slug, bundleIdentifier, and android.package updates for the Winny rename
- `eas.json` — Existing build profiles (development, development-device, preview, production with autoIncrement: true); needs submit section and EAS Update channel additions

### App Identity & Links
- `src/constants/links.ts` — PRIVACY_URL, TERMS_URL, APP_STORE_URL placeholders; must be updated before submission
- `.planning/ROADMAP.md` §Phase 7 — Research flags: verify current EAS `runtimeVersion` docs and App Store metadata requirements (privacy policy URL, permission strings, no medical language)

### Notifications (Phase 5 verification)
- `.planning/phases/05-notifications-settings/05-PLAN.md` (or equivalent) — Contains the deferred EAS device verification checklist for push notifications

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `assets/images/icon.png` — 1024×1024 PNG, already exists and meets App Store requirements
- `assets/images/splash-icon.png` — Splash screen asset ready
- Android adaptive icon assets already configured in `app.json` (`foregroundImage`, `backgroundImage`, `monochromeImage`)

### Established Patterns
- EAS project is already linked (`projectId: 68833b07-973e-43b0-9845-8d9881301850`, `owner: robvb`) — production build can proceed once config is updated
- `expo-notifications` plugin already wired in `app.json` — notification permission strings just need App Store metadata values
- `expo-store-review` already imported in `settings.tsx` — Rate App row is functional once APP_STORE_URL is real

### Integration Points
- `src/constants/links.ts` — Single file to update all placeholder URLs post-submission
- `app.json` android section missing `package` field — must add `"package": "com.robvb.winny"` before first Android build
- `eas.json` submit section is empty `{}` — needs `appleId`, `ascAppId`, and `androidPackage` for `eas submit` to work

</code_context>

<specifics>
## Specific Ideas

- User chose `com.robvb.winny` package namespace (owner-namespaced rather than brand-namespaced) — consistent owner identity across both stores
- Rename was surfaced during Android config discussion; the name "Winny" is a deliberate brand simplification (shorter, punchier) from "Just Keep Winning"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 7 — EAS Build + App Store Submission*
*Context gathered: 2026-05-14*
