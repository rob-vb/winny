# Phase 07: EAS Build + App Store Submission - Research

**Researched:** 2026-05-14
**Domain:** EAS Build, EAS Submit, EAS Update, iOS App Store, Google Play Store
**Confidence:** MEDIUM-HIGH

---

## Summary

Phase 7 deploys the finished Winny app (renamed from "Just Keep Winning") to both stores. The code is complete; this phase is pure build, config, and submission work. Research covers the complete EAS Build → EAS Submit pipeline, app.json rename requirements, EAS Update OTA setup, App Store metadata requirements, and the Google Play 12-tester production-access gate.

**Critical finding:** The `runtimeVersion` policy `"managed"` does not exist in Expo SDK 55. The CONTEXT.md D-14 decision references an invalid policy name. Valid policies are `appVersion`, `nativeVersion`, and `fingerprint`. For this managed-workflow app with no custom native code, `"appVersion"` is the correct choice and maps cleanly to version "1.0.0".

**Primary recommendation:** Sequence work as: (1) app.json rename + eas.json wiring → (2) EAS dev build for Phase 5 notification verification on physical device → (3) EAS production builds (iOS + Android) → (4) iOS TestFlight smoke test → (5) Android Internal Test → (6) store listing + legal pages → (7) submit for review.

The Google Play production-access gate (12 testers, 14 continuous days of closed testing) applies to personal Play Console accounts created after November 13, 2023. If the robvb account was created after that date, the planner must account for this 14-day mandatory wait in the phase timeline.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** App display name changes to **Winny**
- **D-02:** iOS bundle identifier: `com.robvb.winny`
- **D-03:** Android package name: `com.robvb.winny`
- **D-04:** Expo slug: `winny` (researcher to verify uniqueness — see Open Questions)
- **D-05:** Primary category on both stores: **Health & Fitness**
- **D-06:** App description and keyword set drafted by Claude, user reviews before submission
- **D-07:** Screenshots captured from EAS simulator build; required iOS sizes: 6.9" iPhone 16 Pro Max + 6.5" iPhone 11 Pro Max; Android 16:9
- **D-08:** Privacy policy and Terms of Use hosted by user at their domain
- **D-09:** Plan provides ready-to-publish privacy policy + terms content (local-data-only app, no server-side collection, push tokens only)
- **D-10:** URLs in `src/constants/links.ts` updated once pages are live and store listings exist
- **D-11:** First Play Store release targets Internal Test track; promote to Production after smoke-test
- **D-12:** EAS handles Android signing (managed credentials via `eas credentials`)
- **D-13:** EAS Update configured for post-launch JS-only hotfixes
- **D-14:** runtimeVersion policy: "managed" — **INVALID; correct policy is "appVersion"** (see Critical Finding below)
- **D-15:** Production EAS Update channel named `production`; maps to production build profile
- **D-16:** EAS device notification verification (NOTF-01 through NOTF-04, SET-01 through SET-03) must be completed on physical device EAS dev build before store submission

### Claude's Discretion
- Exact Expo slug for `winny` (uniqueness check)
- Whether to use Expo's screenshot tool or a custom simulator capture script
- iOS `infoPlist` permission strings for notifications

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Critical Finding: runtimeVersion Policy "managed" Does Not Exist

**CONTEXT.md D-14 specifies policy "managed" — this is incorrect.** [VERIFIED: docs.expo.dev/versions/v55.0.0/sdk/updates]

Valid `runtimeVersion` policies in Expo SDK 55:
| Policy | Description |
|--------|-------------|
| `appVersion` | Runtime version = project's `version` field (e.g., "1.0.0") |
| `nativeVersion` | Runtime version = `version(buildNumber\|versionCode)` (e.g., "1.0.0(1)") |
| `fingerprint` | Hash of native layer; changes when any native dependency changes |

**Neither "managed" nor "sdkVersion" appear in current documentation.** [VERIFIED: docs.expo.dev/versions/latest/sdk/updates/#automatic-configuration-using-runtime-version-policies]

**Correct choice for Winny:** `"appVersion"` — simple, no custom native code, ties OTA update compatibility to the app version string. When version is "1.0.0", the runtime version is "1.0.0". An OTA update sent to the `production` channel will be delivered to any build that also has runtimeVersion "1.0.0".

```json
// app.json (correct)
"runtimeVersion": { "policy": "appVersion" }
```

The planner must update D-14 silently (the user chose "managed" based on a label they heard; `appVersion` achieves the same intent).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| App identity / bundle ID / package | Build config (app.json) | EAS (eas.json) | Expo CNG generates native projects from app.json |
| iOS production binary | EAS Build (cloud) | Xcode signing | EAS manages certificates and provisioning profiles |
| Android production binary (.aab) | EAS Build (cloud) | Android signing | EAS manages keystore via `eas credentials` |
| iOS TestFlight delivery | App Store Connect | EAS Submit | EAS Submit uploads; ASC distributes to TestFlight |
| Android Internal Test delivery | Google Play Console | EAS Submit | EAS Submit uploads .aab to specified track |
| OTA JS update delivery | EAS Update (cloud) | expo-updates (client) | expo-updates checks EAS Update service on launch |
| Notification permission strings | app.json infoPlist | expo-notifications plugin | Plugin injects into native Info.plist at build time |
| Store listing metadata | App Store Connect / Play Console | — | Manual or Fastlane; EAS does not manage store metadata |
| Screenshots | EAS simulator build + capture | — | Must be done on correct device size (6.9" primary) |
| Privacy / Terms pages | User's hosting domain | links.ts (client) | App links to external pages via expo-web-browser |

---

## Standard Stack

### Core (already installed or EAS-managed)
| Tool / Library | Version | Purpose | Status |
|----------------|---------|---------|--------|
| eas-cli | 18.12.2 (installed) / 18.12.3 (latest) | Build, submit, update commands | Installed globally [VERIFIED: `eas --version`] |
| expo-updates | 55.0.22 | OTA update client in the app binary | NOT in package.json — must install [VERIFIED: npm registry] |
| expo | ~55.0.23 | Expo SDK | Already installed [VERIFIED: package.json] |
| expo-notifications | ~55.0.23 | Notification support (native, already wired) | Already installed [VERIFIED: package.json] |

**Installation needed:**
```bash
npx expo install expo-updates
```
Then run `eas update:configure` to add `runtimeVersion` and `updates.url` to app.json, and `channel` to eas.json build profiles.

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `eas build` | Create signed native binaries | Before every store submission |
| `eas submit` | Upload binary to App Store Connect or Google Play | After production build |
| `eas update` | Push JS-only OTA update | Post-launch hotfixes |
| `eas credentials` | Manage signing certificates and keystores | Before first iOS/Android production build |
| App Store Connect web UI | App metadata, screenshots, review submission | After TestFlight smoke test |
| Google Play Console web UI | App metadata, store listing, track promotion | After Android Internal Test |

---

## app.json Changes Required

Current state has three problems that will block the first build:

| Field | Current Value | Required Value | Blocker? |
|-------|---------------|----------------|---------|
| `name` | "Just Keep Winning" | "Winny" | No (cosmetic), but must change |
| `slug` | "just-keep-winning" | "winny" | Yes — EAS OTA routing uses slug |
| `ios.bundleIdentifier` | "com.justkeepwinning.winningstreak" | "com.robvb.winny" | Yes — must match provisioning profile |
| `android.package` | missing | "com.robvb.winny" | Yes — required for Android build |
| `runtimeVersion` | not set | `{ "policy": "appVersion" }` | Yes (for EAS Update) |
| `updates.url` | not set | set by `eas update:configure` | Yes (for EAS Update) |

**Also update in `src/constants/links.ts`:**
- `SHARE_MESSAGE` — replace "Just Keep Winning" with "Winny"
- All four constants need final values once store listings exist

---

## eas.json Changes Required

### Current state
```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "ios": { "simulator": true } },
    "development-device": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

### Required additions

**Missing `cli.appVersionSource: "remote"`** — required for `autoIncrement: true` to work. Without it, autoIncrement silently falls back to local versioning. [VERIFIED: docs.expo.dev/build-reference/app-versions/]

**Missing `channel` on build profiles** — required for EAS Update to route OTA updates to the correct builds.

**Missing submit section fields** — `eas submit` will prompt interactively without them, but having them in eas.json is required for unattended CI submission.

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "development-device": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "rbvbaaren@gmail.com",
        "ascAppId": "<from App Store Connect after app created>",
        "companyName": "Rob van Baaren"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

**`ascAppId` is found in App Store Connect:** Apps → select app → App Information (left sidebar under General) → "Apple ID" field. This ID only exists after you create the app record in App Store Connect. [VERIFIED: docs.expo.dev/eas/json, docs.expo.dev/submit/ios]

---

## Architecture Patterns

### EAS Build → Submit Pipeline

```
app.json (Winny config)
    ↓
eas build --platform ios --profile production
    → EAS cloud: installs deps, runs CNG, signs with cert + provisioning profile
    → produces .ipa
    ↓
eas submit --platform ios
    → uploads .ipa to App Store Connect
    → appears in TestFlight within 10–15 min
    ↓
TestFlight internal testing → smoke test
    ↓
App Store Connect: submit for App Review
    → Apple review (1–3 days)
    ↓
App Store: Released

(Android path is parallel with .aab + Google Play)
```

### EAS Update (OTA) Architecture

```
eas update --channel production --message "fix X"
    ↓
EAS Update service stores new JS bundle
    ↓
Production builds (channel: "production") check for updates on next launch
    ↓
expo-updates downloads + applies compatible update
    (compatible = same runtimeVersion, i.e., same "version" field in app.json)
```

### Recommended Project Structure (no new folders needed)

Existing structure is correct. Phase 7 adds only:
- `google-service-account.json` — Android Play Console service account key (add to `.gitignore`)

---

## EAS Build Commands Reference

```bash
# Phase 5 notification verification (physical device)
eas build --profile development-device --platform ios
# → produces .ipa for ad-hoc distribution; install on device via EAS dashboard

# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores (after builds exist on EAS dashboard)
eas submit --platform ios --profile production
eas submit --platform android --profile production

# OTA update post-launch
eas update --channel production --message "fix: <description>"
```

---

## iOS App Store Requirements (2025)

### Screenshot Sizes [VERIFIED: developer.apple.com/help/app-store-connect/reference/screenshot-specifications]

| Display | Resolution (portrait) | Status | Device example |
|---------|----------------------|--------|----------------|
| **6.9"** | **1260 × 2736 px** | **Required (primary)** | iPhone 16 Pro Max |
| 6.5" | 1284 × 2778 px | Required if 6.9" not provided | iPhone 11 Pro Max |
| Others | various | Auto-scaled from 6.9" or 6.5" | — |

**Minimum 1 screenshot, maximum 10 per localization. Format: JPEG or PNG, RGB, no transparency.**

Provide 6.9" screenshots. The 6.5" set is only needed as a fallback if 6.9" is not supplied. For a new submission in 2026, just doing 6.9" is sufficient and recommended.

### Privacy Policy Requirements [VERIFIED: developer.apple.com/app-store/review/guidelines]
- Must provide a privacy policy URL in App Store Connect metadata field AND inside the app
- Policy must identify: what data is collected, how, all uses, third-party recipients, retention/deletion
- Winny collects no personal data server-side; push notification tokens are the only data leaving the device. The privacy policy should explicitly state this.

### Notification Permission (infoPlist) [VERIFIED: docs.expo.dev/versions/latest/sdk/notifications]
- `expo-notifications` does **not** require `NSUserNotificationsUsageDescription` in the infoPlist — the plugin handles this automatically
- The plugin adds the required APNs entitlement; Xcode changes it from development to production on release builds automatically
- No additional `ios.infoPlist` entries are needed for notifications in app.json

### Health & Fitness Category — Language Rules [VERIFIED: developer.apple.com/app-store/review/guidelines §1.4, §5.1.3]
- "Winny" is NOT a medical app — it logs personal wins, not health metrics
- Acceptable: "well-being", "habit", "daily wins", "motivation", "positive mindset"
- Avoid: any claim to measure, diagnose, or treat health conditions; any reference to clinical outcomes
- No HealthKit usage, so §5.1.3 (health data) does not apply
- The app description and keyword field should frame Winny as a **motivation/habit-building** tool, not a health measurement tool

### App Review Common Rejection Reasons (relevant to Winny)
1. **No privacy policy URL** — link must work and be accessible before submission
2. **Broken links in metadata** — stub URLs (winningstreak.app) must be live at review time
3. **Crashes on reviewer device** — complete Phase 5 device verification before submitting
4. **Incomplete metadata / empty About pages** — all linked pages must return real content
5. **Notification permission presented at wrong time** — reviewer will verify NOTF-01 (permission only after first win, not on cold open)

---

## Google Play Store Requirements

### New Account Production Access Gate [VERIFIED: support.google.com/googleplay/android-developer/answer/14151465]
**If the robvb Play Console account was created after November 13, 2023:**
- Must complete closed testing with **12 testers opted-in for 14 continuous days**
- After requirement met, apply for production access; Google reviews within ~7 days
- **Total minimum timeline: ~21 days from first internal build to production**

**If account was created before November 13, 2023:** No tester requirement; can submit directly to production after internal test smoke test.

**Planner action:** Add a task to confirm account creation date. If post-Nov 2023, the 14-day closed test period must be a explicit wave in the plan.

### Android Submission Flow
1. Create app in Google Play Console (first upload must be done manually via web UI — API cannot create new apps)
2. Create a Google Service Account key (Google Cloud Console → IAM → Service Accounts → create JSON key)
3. Grant service account "Release manager" permission in Play Console → Users and permissions
4. First release: upload .aab manually to Internal Testing track in the Play Console web UI
5. Subsequent releases: `eas submit --platform android` uses the service account key
6. After Internal Test smoke test: Promote release → Closed testing → (if new account: wait 14 days with 12 testers) → Apply for production → Production

### Track options in eas.json: `internal`, `alpha`, `beta`, `production` [VERIFIED: docs.expo.dev/eas/json]
D-11 specifies `internal` as the initial track — this is correct.

### Android screenshot requirements [ASSUMED]
Google Play accepts: 2 to 8 screenshots per device type. Recommended size: 1080 × 1920 px (portrait, 16:9). Minimum: 320px on any side. Maximum: 3840px on any side. JPG or PNG.

---

## EAS Update (OTA) Configuration

### What to install
```bash
npx expo install expo-updates
eas update:configure
```

`eas update:configure` adds to app.json:
- `runtimeVersion` (will prompt for policy; choose `appVersion`)
- `updates.url` (set to EAS Update endpoint for this project)

And adds `channel` to each build profile in eas.json.

### How it works post-launch
- Any push of `eas update --channel production` delivers the JS bundle to production users on next launch
- Only affects JS/assets — no native code changes possible via OTA
- Compatible when `runtimeVersion` matches (both sides must have "1.0.0" if using `appVersion` policy)
- Breaking native change (new native module, SDK upgrade) requires a new binary → new App Store submission

### Correct runtimeVersion policy for Winny
```json
// app.json — correct configuration
{
  "expo": {
    "runtimeVersion": { "policy": "appVersion" }
  }
}
```
When `version` is "1.0.0" in app.json, the runtimeVersion for all builds is "1.0.0". OTA updates sent to the `production` channel reach all "1.0.0" builds. [VERIFIED: docs.expo.dev/versions/v55.0.0/sdk/updates]

---

## Phase 5 Deferred Verification — What Was Deferred

The full Phase 5 verification checklist (from 05-04-PLAN.md Task 3) requires a physical device EAS dev build. The 8 items to verify:

1. **NOTF-01** — Permission prompt does NOT appear on cold open; DOES appear immediately after first win is saved
2. **NOTF-02** — Set reminder time to 2 min from now → background app → notification arrives with correct title ("Just Keep Winning" — will be "Winny" after rename) and one of the 5 copy pool strings as body
3. **NOTF-03** — After granting permission, iOS Settings shows ≤ 30 scheduled notifications
4. **NOTF-04** — Background then foreground app → no crash, silent operation
5. **SET-01** — Time picker works: opens sheet, selection updates row, toast confirms
6. **SET-02** — Display name: inline edit, persist on restart
7. **SET-03** — All 5 About rows work: How It Works screen, Privacy Policy (in-app browser), Terms of Use (in-app browser), Rate App (review sheet or URL), Share App (native share sheet)
8. **No-guilt audit** — All notification copy strings contain no shame/punishment language

**Build command for device verification:**
```bash
eas build --profile development-device --platform ios
```
Install on physical iPhone via EAS dashboard link or QR code.

**Note:** The notification title in the verification build will be "Just Keep Winning" (the old name in app.json). This is acceptable for the dev build verification. The production build will have "Winny". Verify functional behavior, not the title text.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| iOS code signing | Manual cert + provisioning profile management | `eas credentials` | EAS manages cert rotation, expiry, team membership |
| Build number incrementing | Script to edit app.json | `autoIncrement: true` + `appVersionSource: "remote"` | Race conditions in CI; EAS handles atomically |
| Android keystore | Manual `keytool` + upload | `eas credentials` (managed) | Loss of keystore = app unpublishable; EAS backs up securely |
| Binary upload to stores | Transporter / manual Play Console upload | `eas submit` | EAS Submit handles auth, retry, and platform API differences |
| OTA bundle delivery | Custom update server | EAS Update + expo-updates | CDN, signing, rollback, channel routing all handled |

---

## Common Pitfalls

### Pitfall 1: Slug Change Breaks Existing OTA Updates
**What goes wrong:** Changing slug from "just-keep-winning" to "winny" changes the EAS project URL. Any existing OTA update channel associations may break.
**Why it happens:** The slug is baked into the `updates.url` in app.json by `eas update:configure`.
**How to avoid:** Re-run `eas update:configure` after updating the slug, and verify the new URL is correct. Since no OTA updates have been published yet (pre-launch), this is a clean slate.
**Warning signs:** `eas update` command returns "project not found" or wrong channel errors.

### Pitfall 2: Missing `cli.appVersionSource: "remote"` for autoIncrement
**What goes wrong:** `autoIncrement: true` in the production profile does nothing; each build reuses build number 1, causing App Store rejection ("version already uploaded").
**Why it happens:** `autoIncrement` requires `appVersionSource: "remote"` in the `cli` section to use EAS-managed remote versioning. Without it, it reads from local app.json.
**How to avoid:** Always pair `autoIncrement: true` with `"cli": { "appVersionSource": "remote" }`.
**Warning signs:** Build succeeds but `eas submit` fails with "build number already used".

### Pitfall 3: ascAppId Not Available Until After App Created in App Store Connect
**What goes wrong:** The `eas.json` submit section `ascAppId` field is left empty; `eas submit` prompts interactively or fails.
**Why it happens:** The ASC App ID only exists after you manually create the app record in App Store Connect. It cannot be pre-populated.
**How to avoid:** Plan sequence: (1) create app in App Store Connect web UI, (2) copy the numeric Apple ID from App Information, (3) add to eas.json. The planner must split "configure eas.json submit" into a wave that happens after "create app in App Store Connect".
**Warning signs:** `eas submit` fails with "application not found" or prompts for ascAppId every run.

### Pitfall 4: Google Play First Upload Must Be Manual
**What goes wrong:** `eas submit --platform android` fails on the very first submission for a new app.
**Why it happens:** Google Play API does not allow creating new apps programmatically. The first upload must be done through the Play Console web UI.
**How to avoid:** First .aab upload is always manual. After the app record exists in Play Console, `eas submit` works for all subsequent builds.
**Warning signs:** `eas submit` returns "app not found" for a new package name.

### Pitfall 5: "managed" runtimeVersion Policy Causes Build Failure
**What goes wrong:** If "managed" is set as the runtimeVersion policy in app.json, EAS Build will fail with a configuration validation error.
**Why it happens:** "managed" is not a valid policy value in Expo SDK 55. Valid: `appVersion`, `nativeVersion`, `fingerprint`.
**How to avoid:** Use `{ "policy": "appVersion" }` — achieves the same intent (automatic versioning for managed workflow apps).

### Pitfall 6: Stub URLs in links.ts Cause App Store Rejection
**What goes wrong:** App is rejected because the Privacy Policy and Terms URLs return 404 (currently pointing to winningstreak.app).
**Why it happens:** App Store reviewers test every link in the metadata and in the app itself. A 404 on Privacy Policy is an automatic rejection.
**How to avoid:** Legal pages must be live at the exact URLs set in `links.ts` before submitting for review. The plan must have a task to verify URL reachability before triggering `eas submit`.

### Pitfall 7: Google Play 14-Day Closed Test Gate (New Accounts)
**What goes wrong:** Developer completes Android Internal Test, tries to promote to Production, but the Production option is grayed out.
**Why it happens:** Google requires new personal accounts (created after Nov 13, 2023) to complete closed testing with 12 testers for 14 continuous days before production access is granted.
**How to avoid:** Start the closed test on day 1 of the Android submission wave. The 14-day timer cannot be shortened. Plan for this as a blocking wait period.
**Warning signs:** Play Console shows "Apply for production access" greyed out or an eligibility check link.

### Pitfall 8: Bundle ID Cannot Be Changed After First TestFlight Build
**What goes wrong:** Developer creates production build with the old bundle ID, uploads to TestFlight, then realizes the bundle ID needs to change.
**Why it happens:** Once a bundle ID is registered in App Store Connect, it is permanent for that app record.
**How to avoid:** Verify `app.json ios.bundleIdentifier` is "com.robvb.winny" before the first production build. No recovery path exists; you'd need a new app record.

---

## Code Examples

### Complete app.json after rename + EAS Update setup
```json
{
  "expo": {
    "name": "Winny",
    "slug": "winny",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "winny",
    "userInterfaceStyle": "automatic",
    "runtimeVersion": { "policy": "appVersion" },
    "updates": {
      "url": "https://u.expo.dev/68833b07-973e-43b0-9845-8d9881301850"
    },
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FAF8F4"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.robvb.winny"
    },
    "android": {
      "package": "com.robvb.winny",
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "expo-font",
      "expo-notifications",
      "expo-image"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "68833b07-973e-43b0-9845-8d9881301850"
      }
    },
    "owner": "robvb"
  }
}
```
[ASSUMED: `updates.url` path suffix — verified format from EAS Update docs, but exact URL must be confirmed by `eas update:configure` output]

### Complete eas.json after updates
```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "development-device": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "rbvbaaren@gmail.com",
        "ascAppId": "<numeric-id-from-app-store-connect>",
        "companyName": "Rob van Baaren"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```
[VERIFIED: docs.expo.dev/eas/json — all field names confirmed]

### Updated src/constants/links.ts (post-rename, pre-store-submission)
```typescript
// Update immediately on rename; update URLs again once store listings are live
export const PRIVACY_URL = "https://winny.app/privacy"; // placeholder — update to real URL
export const TERMS_URL = "https://winny.app/terms";     // placeholder — update to real URL
export const APP_STORE_URL = "https://apps.apple.com/app/winny"; // update after App Store approval
export const SHARE_MESSAGE =
  "I've been using Winny to log my daily wins — it's quietly great.";
```
[ASSUMED: final domain; user decides in D-08 between winningstreak.app/... and new Winny domain]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| runtimeVersion policy "sdkVersion" | `"appVersion"`, `"nativeVersion"`, or `"fingerprint"` | SDK 50-51 era | "sdkVersion" no longer documented; use `appVersion` for managed apps |
| runtimeVersion policy "managed" | Does not exist | Never existed in current docs | CONTEXT.md D-14 uses an invalid policy name |
| fingerprintExperimental | `fingerprint` | SDK 51 | Promoted from experimental to stable |
| Google Play: 20 testers required | 12 testers required | December 2024 | Reduced requirement, same 14-day duration |
| Manual Xcode submission (Transporter) | `eas submit --platform ios` | EAS Submit GA | EAS handles auth and upload |

---

## Runtime State Inventory

This phase renames the app, so runtime state beyond the codebase must be audited.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | No user data carries the app name as a key. Zustand store keys and SQLite table/column names don't use the app name. | None — code edit only |
| Live service config | EAS project (projectId: 68833b07-973e-43b0-9845-8d9881301850) linked under owner "robvb". Slug change from "just-keep-winning" to "winny" changes the project URL on expo.dev but the projectId stays the same. | Update slug in app.json; re-run `eas update:configure` to update `updates.url` |
| OS-registered state | No scheduled tasks, no launchd plists, no pm2 processes. Push notifications scheduled on device include the old app name in the title ("Just Keep Winning") — they will be cleared and rescheduled when the new production build is installed (different bundle ID = fresh install). | None — fresh install replaces all device-local notification queue |
| Secrets / env vars | EAS project is linked by projectId (UUID), not by app name. No env vars reference the old name. | None |
| Build artifacts | Any existing EAS dev builds under the old bundle ID ("com.justkeepwinning.winningstreak") are now orphaned. They should not be used for the Phase 5 verification — build fresh with the new bundle ID. | Build new dev build after app.json rename |

**The old app name "Just Keep Winning" appears in three places that need updating:**
1. `app.json` → `name`, `slug`, `ios.bundleIdentifier` (code change)
2. `src/constants/links.ts` → `APP_STORE_URL`, `SHARE_MESSAGE` (code change)
3. The EAS notification permission dialog text on iOS shows the app name — this is auto-derived from `app.json name` at build time, no extra change needed

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| eas-cli | All EAS commands | ✓ | 18.12.2 (latest: 18.12.3) | None — required |
| expo-updates | EAS Update OTA | ✓ (npm) | 55.0.22 | Skip OTA setup (not recommended) |
| Apple Developer account | iOS build + submit | ✓ (assumed — project linked) | — | None |
| Google Play Developer account | Android submit | ✓ (assumed) | — | None |
| Physical iOS device | Phase 5 NOTF verification | Assumed ✓ | — | Simulator for some checks (NOTF-02 not testable on simulator) |
| App Store Connect app record | `ascAppId` for submit | ✗ | — | Must create before submit wave |
| Google Play app record | First .aab upload | ✗ | — | Must create before submit wave |
| Google Service Account JSON key | `eas submit --platform android` | ✗ | — | Manual Play Console upload (for first build only) |

**Missing dependencies with no fallback:** Apple Developer account (assumed active — verify), Google Play Developer account (assumed active — verify).

**Missing dependencies with fallback:** App Store Connect record (must create; fallback is interactive `eas submit` prompts), Google Play record (must create manually), Google Service Account key (fallback is manual upload only).

---

## Validation Architecture

### What Can Be Verified Automatically (pre-submit CI checks)

| Check | Automated Command | What It Verifies |
|-------|-------------------|-----------------|
| app.json fields complete | `node -e "const c=require('./app.json').expo; console.log(c.name, c.slug, c.ios?.bundleIdentifier, c.android?.package)"` | Rename fields present |
| runtimeVersion policy set | `node -e "const c=require('./app.json').expo; console.log(JSON.stringify(c.runtimeVersion))"` | Not "managed" |
| expo-updates in package.json | `node -e "const p=require('./package.json'); console.log(p.dependencies['expo-updates'])"` | Package installed |
| EAS channel in production profile | `node -e "const e=require('./eas.json'); console.log(e.build.production.channel)"` | "production" set |
| appVersionSource remote set | `node -e "const e=require('./eas.json'); console.log(e.cli.appVersionSource)"` | "remote" |
| Links.ts no "Just Keep Winning" | `grep -n "Just Keep Winning" src/constants/links.ts` | Should return nothing |
| Privacy URL reachability | `curl -I <PRIVACY_URL>` | 200 OK before submission |
| Terms URL reachability | `curl -I <TERMS_URL>` | 200 OK before submission |
| App icon exists + is 1024×1024 | `file assets/images/icon.png` | Already verified |
| TypeScript compile clean | `npx tsc --noEmit` | No type errors |

### What Requires Manual / Device Verification

| Item | Method | Requirement |
|------|--------|-------------|
| Phase 5 NOTF-01–04 | EAS dev build on physical iPhone | NOTF-02 (notification delivery) requires real device — simulator cannot receive push |
| Phase 5 SET-01–03 | EAS dev build | Settings UI behaviors |
| Screenshot capture | Simulator or device at exact pixel size | Must be 1260×2736 for 6.9" |
| iOS TestFlight install + smoke test | TestFlight app on iPhone | Full flow: onboarding → first win → settings |
| Android Internal Test install | Play Store testing track link on Android device | Full flow: onboarding → first win → settings |
| App Store Connect metadata review | Human review in App Store Connect web UI | Description, keywords, screenshots before submit |
| Google Play store listing review | Human review in Play Console | Description, screenshots, rating questionnaire |

### What Requires Human Sign-Off (blocking gates)

| Gate | Who Signs Off | Blocks |
|------|--------------|--------|
| Phase 5 device verification (all 8 items) | User ("approved" signal) | Production build creation |
| App description / keyword copy | User review | App Store Connect metadata entry |
| Privacy policy page content | User review + publish | Submit for App Review |
| Terms of Use page content | User review + publish | Submit for App Review |
| iOS TestFlight smoke test | User passes 3-step test | Submit for App Review |
| Android Internal Test smoke test | User passes 3-step test | Play Console track promotion |
| App Store review outcome | Apple | Go live on iOS |
| Google Play review outcome | Google | Go live on Android |

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7 (existing, from Phases 1–6) |
| Config file | `jest.config.js` (existing) |
| Quick run command | `npx jest --testPathPattern="<specific test file>"` |
| Full suite command | `npx jest` |

### Phase 7 Test Scope

Phase 7 does not add new application logic. No new Jest tests are needed. Validation is structural (config file checks) and manual (device + store verification). The existing test suite should remain green throughout.

**Quick sanity before builds:**
```bash
npx jest      # all 12 suites green (Phase 6 baseline)
npx tsc --noEmit  # TypeScript compile clean
```

### Wave 0 Gaps

None — existing test infrastructure covers all application logic. This phase requires no new test files. Config validation is done via one-liner node commands (see automated checks table above).

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | App has no user accounts in V1 |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No server-side access control |
| V5 Input Validation | Minimal | Store listing text is human-written, not app code |
| V6 Cryptography | Partial | EAS manages signing keys; don't hand-roll |
| V13 API / Service | Partial | EAS Update: verify HTTPS-only update URL |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Keystore/cert loss | Repudiation | EAS managed credentials backs up automatically; do not store keystore locally |
| Google Service Account key leakage | Information Disclosure | Add `google-service-account.json` to `.gitignore` immediately; never commit |
| EAS Update delivering malicious JS bundle | Tampering | EAS Update bundles are signed; expo-updates verifies signature |
| Links.ts stub URLs going live with 404 | Denial of service (store rejection) | Verify URL reachability before submission |

**Security action for plan:** Add `google-service-account.json` to `.gitignore` as first task in the Android submission wave.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The robvb Play Console account creation date is unknown — planner must ask user whether it was created before or after Nov 13, 2023 to determine if 12-tester/14-day gate applies | Google Play Requirements | If post-Nov 2023, Android production launch is delayed minimum 21 days |
| A2 | The `updates.url` path in the app.json example uses the format `https://u.expo.dev/<projectId>` — actual URL set by `eas update:configure` may differ | Code Examples | Wrong URL = OTA updates never delivered |
| A3 | Expo slug "winny" is not taken on expo.dev — cannot verify without logging into expo.dev | app.json Changes | If taken, slug must be "winny-app" or similar; affects `updates.url` |
| A4 | Google Play screenshot minimum size 1080×1920 — sourced from general knowledge, not verified against current Play Console help for 2025 | Google Play Requirements | Wrong dimensions = rejected screenshot upload |
| A5 | Apple Developer account for robvb is active and has iOS distribution capability — assumed based on EAS project already being linked | Environment Availability | If expired, cannot build or submit to iOS |
| A6 | Android adaptive icon assets (foreground, background, monochrome PNGs) are still present and correct after rename — they are not app-name-dependent | Runtime State Inventory | If missing, Android build fails |

---

## Open Questions

1. **Was the robvb Google Play Console account created before or after November 13, 2023?**
   - What we know: If after, 12-tester + 14-day closed test is mandatory before production
   - What's unclear: Account creation date
   - Recommendation: User confirms at start of Phase 7. If post-Nov 2023, plan must include a "closed testing wave" with explicit 14-day hold before production promotion.

2. **What domain will the privacy policy and terms be hosted at?**
   - What we know: User hosts them independently (D-08). Old URLs point to `winningstreak.app`. D-08 mentions "winningstreak.app/privacy" or "new Winny URLs — user decides".
   - What's unclear: Whether user is registering a new domain (winny.app) or using existing (winningstreak.app)
   - Recommendation: User decides at start of Phase 7. Plan defers URL update in `links.ts` to a late wave once pages are live. The legal page text content can be drafted immediately regardless of domain.

3. **Is Expo slug "winny" available on expo.dev?**
   - What we know: Slug must be URL-friendly and unique per Expo account. CONTEXT.md D-04 says "winny or winny-app — researcher to verify".
   - What's unclear: Cannot verify without authenticated access to expo.dev
   - Recommendation: User verifies by attempting `eas update:configure` or checking expo.dev/accounts/robvb/projects. If taken, use "winny-app". The planner can document both options; the user selects during app.json update task.

4. **What is the robvb Apple Developer Team ID?**
   - What we know: Needed for `eas.json` submit `appleTeamId` field (optional but prevents prompts)
   - What's unclear: Not in any project file
   - Recommendation: `eas credentials` will prompt for it interactively; not blocking.

---

## Sources

### Primary (HIGH confidence)
- [docs.expo.dev/versions/v55.0.0/sdk/updates](https://docs.expo.dev/versions/v55.0.0/sdk/updates/) — runtimeVersion policies (confirmed appVersion, nativeVersion, fingerprint; "managed" absent)
- [docs.expo.dev/versions/latest/sdk/updates/#automatic-configuration](https://docs.expo.dev/versions/latest/sdk/updates/#automatic-configuration-using-runtime-version-policies) — confirmed valid policies
- [docs.expo.dev/eas/json](https://docs.expo.dev/eas/json/) — submit section fields for iOS and Android
- [docs.expo.dev/submit/ios](https://docs.expo.dev/submit/ios/) — ascAppId location + iOS submit workflow
- [docs.expo.dev/build-reference/app-versions](https://docs.expo.dev/build-reference/app-versions/) — autoIncrement + appVersionSource: remote
- [docs.expo.dev/versions/latest/sdk/notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — no infoPlist changes needed for notifications
- [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/) — health/fitness rules, privacy policy requirements
- [developer.apple.com/help/app-store-connect/reference/screenshot-specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/) — 6.9" = 1260×2736 px (primary/required)
- [support.google.com/googleplay/android-developer/answer/14151465](https://support.google.com/googleplay/android-developer/answer/14151465) — 12 testers, 14 days closed test for new personal accounts
- npm registry: `eas-cli` 18.12.3, `expo-updates` 55.0.22

### Secondary (MEDIUM confidence)
- [docs.expo.dev/submit/introduction](https://docs.expo.dev/submit/introduction/) — EAS Submit workflow, TestFlight timing (10–15 min)
- [docs.expo.dev/eas-update/getting-started](https://docs.expo.dev/eas-update/getting-started/) — eas update:configure steps, channel configuration
- [docs.expo.dev/deploy/submit-to-app-stores](https://docs.expo.dev/deploy/submit-to-app-stores/) — Google first manual upload requirement
- GitHub expo/fyi first-android-submission — Google Play first upload steps

### Tertiary (LOW confidence / ASSUMED)
- Google Play Android screenshot minimum size 1080×1920 — [ASSUMED] from general knowledge, not verified against current Play Console docs
- Final `updates.url` format — [ASSUMED] based on documented pattern; `eas update:configure` will set the real value

---

## Metadata

**Confidence breakdown:**
- App.json / eas.json changes required: HIGH — verified against current docs
- runtimeVersion policy: HIGH — confirmed "managed" invalid; "appVersion" is correct
- iOS App Store requirements: HIGH — verified against Apple official guidelines
- Screenshot sizes: HIGH — verified against Apple official docs (6.9" = 1260×2736)
- Google Play submission flow: HIGH — verified first upload must be manual
- Google Play 12-tester requirement: HIGH — verified from Google support page
- Android screenshot requirements: LOW — assumed, not verified against current Play Console docs
- Expo slug uniqueness: LOW — cannot verify without authenticated expo.dev access

**Research date:** 2026-05-14
**Valid until:** 2026-06-14 (App Store guidelines, EAS CLI — stable; Google Play policy — stable)
