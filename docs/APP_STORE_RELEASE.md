# Winny App Store Release Checklist

This checklist is for publishing Winny 1.0.0 to the Apple App Store. It is based on the current Expo/EAS setup in this repository and Apple's App Store Connect requirements for metadata, privacy, screenshots, and review.

## Status

- [x] Confirm product name and bundle ID: `Winny`, `com.robvb.winny`.
- [x] Scope iOS 1.0 to iPhone by setting `ios.supportsTablet=false`.
- [x] Confirm App Store encryption declaration: `ITSAppUsesNonExemptEncryption=false`.
- [x] Confirm privacy manifest exists: `ios/Winny/PrivacyInfo.xcprivacy`.
- [x] Add repeatable local release checks: `npm run preflight:ios`.
- [x] Remove stale Expo Dev Client local-network plist metadata from the production iOS target.
- [x] Draft App Store listing copy and privacy answers: `docs/app-store/metadata.md`.
- [x] Replace external celebration GIFs with bundled in-app artwork.
- [x] Create the App Store Connect app record for `com.robvb.winny`.
- [x] Replace `eas.json` `submit.production.ios.ascAppId` with the real App Store Connect Apple ID: `6769980813`.
- [x] Replace `src/constants/links.ts` `APP_STORE_URL` with `https://apps.apple.com/app/winny/id6769980813`.
- [ ] Publish working privacy policy, terms, and support URLs before review.
- [ ] Generate iPhone App Store screenshots from real app states. If marketing backgrounds or device-framed composites are needed, use Images 2.0 for those generated visual layers.
- [ ] Upload screenshots, metadata, age rating, privacy nutrition label, and review notes in App Store Connect.
- [ ] Run a production EAS iOS build and submit it to App Store Connect.
- [ ] Smoke test the TestFlight build before sending for review.

## App Store Connect Setup

1. Create a new iOS app in App Store Connect.
2. Use bundle ID `com.robvb.winny`.
3. Set name to `Winny`, SKU to an internal value such as `winny-ios-1`, and primary language to English.
4. Copy the generated App Store Connect Apple ID into `eas.json` at `submit.production.ios.ascAppId`.
5. Create or confirm the required URLs:
   - Privacy policy: `https://winny.app/privacy`
   - Terms of use: `https://winny.app/terms`
   - Support URL: recommended `https://winny.app/support`

## Local Preflight

Run before every release candidate:

```bash
npm run preflight:ios
```

For the first TestFlight candidate:

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Screenshot Plan

Capture real app screens first, then create App Store-ready composites only if needed. Winny 1.0 is scoped to iPhone, so iPad screenshots are intentionally out of scope unless tablet support is re-enabled.

- Onboarding welcome: trophy and "Start Winning".
- Home empty state: "What did you win today?" composer.
- Home populated state: streak header and today's wins.
- Celebration moment: post-win modal.
- Wins history: trophy room with total wins and grouped history.
- Goals/settings support screen if a fifth or sixth screenshot is useful.

Use fictional, non-personal win text in all screenshots. Apple's review guidance expects screenshots and metadata to accurately reflect the app experience.

## Review Notes Draft

Winny is a local-first daily wins habit app. Users can log short personal wins, keep a daily streak, set optional local reminders, and review their win history. No account is required. Data is stored locally on device. Push notification permission is optional and the app remains usable if notifications are denied.

## Remaining Release Risks

- Confirm `6769980813` is the App Store Connect Apple ID for the `Winny` app record before first submit.
- The public App Store URL may not resolve until Apple publishes the listing.
- `https://winny.app/privacy` and `https://winny.app/terms` must be live and accurate before review.
- Legal pages and App Store metadata should still be reviewed by a human before submission.

## Official References

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple app privacy details: https://developer.apple.com/app-store/app-privacy-details/
- App Store Connect app privacy reference: https://developer.apple.com/help/app-store-connect/reference/app-privacy/
- Apple submitting overview: https://developer.apple.com/app-store/submitting/
