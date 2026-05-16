---
name: Winny
description: A daily-wins habit app with a kinetic, badge-like celebration identity built on the "Just Keep Winning" trophy metaphor.
colors:
  sunlit-cream: "#FAF8F4"
  trophy-gold: "#F1AF2E"
  trophy-gold-pure: "#F7C217"
  active-orange: "#F5A623"
  victory-coral: "#FF6B6B"
  share-blue: "#3B82F6"
  badge-ink: "#17130A"
  warm-paper: "#FFF7E8"
  sticker-shadow: "#B87413"
  ink: "#1C1C1E"
  ink-soft: "#6B6B6F"
  graphite: "#8E8E93"
  cloud: "#C7C7CC"
  surface-white: "#FFFDF8"
  border-warm: "#F0EDE8"
  win-check-green: "#4CAF50"
  confetti-red: "#E74C3C"
  confetti-blue: "#4A90E2"
  confetti-yellow: "#F7DC6F"
  confetti-green: "#2ECC71"
brand:
  strategy: "Full palette for brand, social, and celebration surfaces; restrained cream/gold for steady-state product UI."
  workingName: "Winny"
  namingStatus: "Keep for now, but watch sweetness. The brand voice must make Winny feel confident and energetic, not cute."
  mascot: "assets/images/trophy.png"
  direction: "Kinetic achievement badges: Strava finish-line confidence, Nike Run Club achievement moments, Mailchimp warmth."
  socialMotto: "Just Keep Winning"
typography:
  hero:
    fontFamily: "Nunito_900Black, Nunito, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 900
    lineHeight: "80px"
    letterSpacing: "-0.01em"
  display:
    fontFamily: "Nunito_800ExtraBold, Nunito, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: "28px"
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Nunito_700Bold, Nunito, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "24px"
    letterSpacing: "normal"
  body:
    fontFamily: "Nunito_400Regular, Nunito, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  body-muted:
    fontFamily: "Nunito_400Regular, Nunito, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "normal"
  label:
    fontFamily: "Nunito_700Bold, Nunito, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
    letterSpacing: "normal"
  caption:
    fontFamily: "Nunito_600SemiBold, Nunito, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.trophy-gold}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: "44px"
  button-primary-disabled:
    backgroundColor: "{colors.trophy-gold}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: "44px"
  card-win:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card-celebration:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px 28px"
    width: "80%"
  input-win:
    backgroundColor: "{colors.sunlit-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  chip-count:
    backgroundColor: "{colors.trophy-gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  tab-bar-active:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.active-orange}"
    typography: "{typography.caption}"
  tab-bar-inactive:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.graphite}"
    typography: "{typography.caption}"
---

# Design System: Winny

## 1. Overview

**Creative North Star: "Just Keep Winning"**

Winny is a mobile habit app built around a single emotional beat: the moment you log a win and feel pride. Every visual decision serves that beat. The system is light, warm, and confidently colored. A cream substrate (`#FAF8F4`, "Sunlit Cream") carries the whole app like a notebook page warmed by afternoon sun. Bold rounded type (Nunito, 700–900 weights at headline scale) does the heavy lifting. A saturated gold-orange family ("Trophy Gold") owns primary action, selected state, and the moment of celebration. The trophy mascot in `assets/images/trophy.png` is the identity anchor: proud, competitive, and slightly mischievous, never babyish.

This system explicitly rejects three traps. It is not a streak-punisher: no red X marks, no broken-chain iconography, no "you lost your streak" copy. It is not a generic SaaS journal: no cold neutral grays, no serif-on-white, no productivity-tool restraint. It is not a meditation app: no soft gradient skies, no hushed type, no slow ethereal motion. Winny celebrates; it does not soothe or scold.

Winny's aesthetic is Strava-confident applied to gentle mobile UX: bold without shouting, momentum-visible without nag-energy. The approved brand direction is kinetic and badge-like, closer to an achievement tile a user would want to share than to a quiet journal entry. The steady-state product remains simple and fast, while celebration and social surfaces may use the full palette, sticker-like shapes, and stronger type rhythm.

**Key Characteristics:**
- Cream substrate, not white; warm, not neutral.
- Trophy Gold is the core voice: primary CTAs, selected tabs, active checkmarks, accent fills, count chips.
- Brand and social surfaces may expand into coral and blue accents when the surface is explicitly celebratory or shareable.
- Hero numbers oversized (64px black weight) so streak and total wins read before chrome.
- Flat by default; celebration lifts.
- Nunito at heavy weights (700/800/900) does the work display fonts would in a brand surface.
- Badge and sticker language are reserved for share tiles, streak achievements, and post-win moments.
- Mobile-only; iOS and Android via Expo. Native touch targets, native tab bar.

## 1.5 Brand Toolkit Direction

**Approved direction: kinetic achievement badges.** The internal brand toolkit plate should use Direction B from the shape review, with the name **Winny** retained for now. The name has a sweetness risk, so the surrounding system must add confidence: heavier type, competitive achievement language, a proud trophy mascot, and fewer soft/cute gestures.

**Reference mix:**
- **Strava finish-line confidence:** progress feels earned, public, and energetic.
- **Nike Run Club achievement moments:** badges, streak pride, motion, and short declarative copy.
- **Mailchimp warmth:** friendly enough for everyday use without becoming juvenile.

**Identity:**
- Working name: **Winny**.
- Motto: **Just Keep Winning**.
- Mascot: `assets/images/trophy.png`, used as a bold identity anchor at meaningful scale. Do not redraw it into a softer mascot unless a future naming/identity review explicitly asks for that.
- Wordmark direction: heavy rounded sans, compact, confident, and slightly athletic. Avoid bubble-letter sweetness.

**Brand plate requirements:**
- One reviewable plate, not a long guidelines document.
- Must show identity, palette, type, icon language, applications, social tiles, and UI direction at a glance.
- Must include at least one square social/share tile and one small mobile UI sample.
- Must show the trophy mascot as a real asset, not a placeholder.

**Applications:**
- Social tiles can use full-palette backgrounds, sticker-like badges, angled achievement labels, and oversized streak numbers.
- Product UI should keep the logging path calmer: cream substrate, ink text, gold action, and restrained accents.
- Celebration moments connect the two worlds: they may use the full palette, confetti, badge shapes, and share prompts.

## 2. Colors: The Trophy Room Palette

A warm cream-and-gold system with a controlled full-palette extension for brand, social, and celebration surfaces. Trophy Gold remains the core identity color in steady-state UI. Coral and blue are approved for moments that are explicitly celebratory, shareable, or badge-led.

### Primary
- **Trophy Gold** (`#F1AF2E`, `oklch(78% 0.15 75)`): the one voice. Used on primary button backgrounds, tab-bar active indicator (`#F5A623` rendering variant), selected-goal checkmarks, count-chip fills, the side accent of the post-win banner, and as the color of the hero total-wins number on the My Wins screen. Never decorative; always meaningful.
- **Trophy Gold (Pure)** (`#F7C217`, `oklch(82% 0.16 85)`): brighter sibling reserved for the trophy-icon highlight tint and high-emphasis future surfaces. Use sparingly; `#F1AF2E` is the default ink-on-cream gold.
- **Active Orange** (`#F5A623`, `oklch(76% 0.16 70)`): rendering variant used in `Tabs` and goal-checkmark contexts where the platform color tint reads slightly warmer. Treat as the same role as Trophy Gold; consolidate to `#F1AF2E` whenever practical.

### Secondary
- **Victory Coral** (`#FF6B6B`, `oklch(70% 0.20 25)`): celebration and social accent. Use for confetti, sticker backs, celebratory marks, and share tiles. Never used for destructive actions; destruction is conveyed by iconography (`trash-outline` in graphite), not by red.
- **Share Blue** (`#3B82F6`, `oklch(62% 0.20 260)`): social/share accent. Use to cool down gold/coral compositions, support share tiles, and add motion-sport energy. Do not use as the primary CTA color in product UI.

### Neutral
- **Sunlit Cream** (`#FAF8F4`, `oklch(98% 0.006 80)`): the page substrate. Everywhere. Replaces white as the app background.
- **Warm Paper** (`#FFF7E8`, `oklch(97% 0.03 82)`): brand/social surface variant. Use when a tile needs warmer poster energy than Sunlit Cream.
- **Surface White** (`#FFFDF8`): elevated cards (WinCard, GoalCard) and the celebration modal. This is a warm near-white, not pure white. The contrast against Sunlit Cream is what makes cards read as cards without needing shadows.
- **Ink** (`#1C1C1E`, `oklch(20% 0.002 280)`): primary text on cream and white surfaces.
- **Badge Ink** (`#17130A`, `oklch(18% 0.02 75)`): warmer near-black for brand plates, social tiles, and badge typography.
- **Ink Soft** (`#6B6B6F`): muted body inside the celebration modal where pure graphite reads cold.
- **Graphite** (`#8E8E93`, `oklch(60% 0.003 280)`): secondary text, inactive tab labels, placeholder text, chevron icons.
- **Cloud** (`#C7C7CC`, `oklch(81% 0.003 280)`): tertiary text, dismiss-affordance icons, low-emphasis hints.
- **Border Warm** (`#F0EDE8`): 1px hairlines on cards and tab-bar tops. The border carries the tonal layer between cream and white.

### Tertiary / Functional
- **Win-Check Green** (`#4CAF50`): the WinCard checkmark icon, exclusively. Confirms the win was saved. Never expands beyond that role.
- **Confetti Palette** (`#E74C3C`, `#4A90E2`, `#F7DC6F`, `#2ECC71`, plus 12 extended colors in the WinCelebration component): rendered only inside the celebration modal animation. Never appears in steady-state UI.
- **Sticker Shadow** (`#B87413`): brand/social-only support color for illustrated badge depth, trophy rim details, and non-interactive sticker shadowing. Do not use for text.

### Named Rules

**The Core Gold Rule.** Trophy Gold (any variant) is the core chromatic identity color in steady-state UI. Anything that isn't an action, a selected state, a count, or a mascot tint stays neutral. The product's confidence comes from gold's scarcity, not from gold's volume.

**The Full-Palette Moment Rule.** Coral and blue are approved when the surface is a celebration, achievement badge, share tile, or brand toolkit application. They are not general decoration for normal settings, history, or logging screens.

**The No-Red Rule.** Red is forbidden in steady-state UI. No red X marks, no red error states for missed days, no red destructive-action buttons. Confirmation dialogs handle destruction (`Alert.alert` with `destructive` style is the OS pattern, which is allowed); the design system never originates red. Reds in the confetti palette live exclusively inside celebration animations.

**The Cream-Not-White Rule.** The app background is `#FAF8F4`, never pure white. Warm near-white is reserved for elevated surfaces (cards, modal). New screens default to cream.

**The Badge Contrast Rule.** Social tiles and achievement badges must pass a squint test: the streak number, win phrase, or mascot should be readable before any supporting copy. Do not let confetti or color patches compete with the main win.

## 3. Typography

**Display & Body Font:** Nunito (loaded via `@expo-google-fonts/nunito`), weights 400 / 600 / 700 / 800 / 900. System fallback: `system-ui, sans-serif`.

**Character:** Nunito is a rounded humanist sans with soft terminals. At black weight (900) it reads like a confident sports broadcast graphic; at regular weight (400) it reads warm and friendly. The system uses both ends of that range deliberately: heavy weights carry hero numbers and titles, regular carries body. There is no display/body pairing because Nunito's weight range *is* the pairing.

For brand and social applications, Nunito should be pushed harder before introducing a second family: black-weight numbers, compact labels, tighter wordmarks, and larger scale jumps. The approved direction is punchy and athletic, not sweet. A future type review may explore a more condensed display face, but the current approved system keeps Nunito as the source of truth.

### Hierarchy
- **Hero** (Nunito_900Black, 64px / 80px line-height): the total-wins counter on the My Wins screen. Set in Trophy Gold. The largest typographic element in the system; it is the win count that matters most.
- **Display** (Nunito_800ExtraBold, 22px / 28px): celebration modal titles. The voice of the moment.
- **Headline** (Nunito_700Bold, 20px / 24px): streak label on the home header ("You're on a 7-day streak!"), post-win banner titles.
- **Body** (Nunito_400Regular, 16px / 24px): the user's win text on cards, win composer input, primary read-state copy. The user's words are this weight, because the user's words are the hero of the screen, not the chrome.
- **Body-Muted** (Nunito_400Regular, 15px / 22px): celebration modal body copy on the post-win Ink-Soft.
- **Label** (Nunito_700Bold, 14px): "total wins" sublabel, secondary header text, button labels.
- **Caption** (Nunito_600SemiBold, 12px): tab-bar labels, count-chip text, modal hint ("Tap anywhere to continue").

### Named Rules

**The Words-Are-The-Hero Rule.** When displaying the user's win text, body (16px, regular) is the floor and is non-negotiable. App chrome (headers, nav, hints) may be smaller; the user's words may not.

**The Heavy-Number Rule.** Streak counts and total-wins counts are set in Nunito_900Black, never lighter. Numbers carry the momentum signal; thin numbers undercut the message.

**The No-Display-Font Rule.** No serifs, no scripts, no display fonts. Nunito's weight range covers display register at heavy weights. Adding a second family dilutes the voice.

**The Not-Too-Sweet Rule.** Because "Winny" can read cute, brand typography must counterbalance it with weight, compactness, and achievement language. Avoid bubbly lettering, soft pastel pairings, and childish outline effects.

## 4. Elevation

**Flat by default; lifted only at the moment of celebration.**

Steady-state UI relies on three depth tools, in this priority order: (1) the tonal step between Sunlit Cream substrate and Surface White cards, (2) 1px Border Warm hairlines, (3) `shadow-sm` (a barely-perceptible default Tailwind shadow on win cards). There are no large diffuse shadows in steady-state UI. There is no glassmorphism. There is no blur.

The single exception is the WinCelebration modal, which floats above a 40% black-tinted backdrop and casts a real shadow (`offset: 0, 8`, `opacity: 0.25`, `radius: 16`). This shadow exists specifically because the celebration is the only true moment of elevation in the app: the win happened, the modal lifts off the page, the confetti falls.

### Shadow Vocabulary
- **Card-resting** (`shadow-sm` Tailwind default, roughly `0 1px 2px rgba(0,0,0,0.05)`): WinCard and similar list items. Almost imperceptible; exists only to keep the card from disappearing into Sunlit Cream when the border alone is insufficient.
- **Celebration-lifted** (`shadowOffset: { width: 0, height: 8 }`, `shadowOpacity: 0.25`, `shadowRadius: 16`, `elevation: 10`): the WinCelebration modal only. Forbidden elsewhere.

### Named Rules

**The Celebration-Only Lift Rule.** Real shadows (offset ≥ 4px, opacity ≥ 0.15) belong to the celebration modal and to nothing else. New surfaces default to flat with a Border Warm hairline.

**The Tonal-Step-First Rule.** When you need to separate a card from its substrate, use the cream-to-white tonal step before reaching for a shadow. The substrate is cream specifically so white cards have somewhere to read against.

## 5. Components

### Buttons
- **Shape:** Gentle 8px rounded corners (`rounded.sm`). No pill buttons in primary action surfaces.
- **Primary:** Trophy Gold background, Surface White text, Nunito_700Bold 14px label, minimum 44×44pt touch target. Internal padding 12px vertical × 16px horizontal. Used on "Add Win" submit, "I'm done for today", primary onboarding CTAs.
- **Disabled state:** Same Trophy Gold fill at 50% opacity. The system never greys out a primary action; it dims gold. The action retains its identity color even when unavailable.
- **Hover / Pressed:** No hover (mobile). Pressed state via React Native's default opacity dip on `Pressable`. Native and quiet.
- **Secondary / Ghost:** None defined in the current system. Inline icon-buttons (close, delete) substitute when needed. If a true secondary button is added later, it should use Surface White fill + Trophy Gold text + 1px Trophy Gold border at `rounded.sm` (never grey, never coral).

### Cards
- **WinCard / GoalCard:** Surface White background, `rounded.md` (12px), 1px Border Warm, padding 12px vertical × 16px horizontal, `shadow-sm` (Card-resting). The win text is body (16px regular Ink); the confirmation checkmark is a 16px Win-Check Green icon aligned top-right.
- **Celebration Card:** Surface White, `rounded.lg` (24px), 80% screen width, padding 24px vertical × 28px horizontal, Celebration-lifted shadow, contains a 200px-tall GIF, then Display title + Body-Muted copy + 12px Cloud hint.
- **Nested cards are forbidden.** A card may contain text, icons, and a chip; it may not contain another card.

### Inputs
- **Win Composer (TextInput):** Sunlit Cream fill (`#FAF8F4`), 1px Border Warm, `rounded.sm` (8px), Body typography, Graphite placeholder text, 200-character maxLength, autofocus on screen entry. Sits inside a Surface White footer container with a top 1px Border Warm divider. The submit button to its right is a Primary button.
- **Focus state:** native iOS/Android keyboard-driven; no custom focus ring. The keyboard appearing is the focus affordance.
- **Error state:** the submit button disables (opacity 0.5) when validation fails. No red, no inline error text in the V1 input. Validation is dichotomous: typeable or not.

### Chips
- **Count chip:** Trophy Gold fill at 20% opacity (`bg-gold/20`), `rounded.pill`, padding 0.5 × 2 (2px × 8px), Caption typography in Ink. Used inside DateSectionHeader to display win count per date. The pill never appears outside count contexts.

### Achievement Badges
- **Purpose:** Share tiles, post-win recaps, streak milestones, and brand toolkit applications.
- **Shape:** Sticker-like circles, medallions, ribbons, or compact lockups. Use substantial fills and clean silhouettes, not thin outlines.
- **Color:** Trophy Gold as the base, with Victory Coral and Share Blue as supporting accents. Keep steady-state product UI out of this full-palette mode unless the user has just completed a win.
- **Typography:** Oversized Nunito_900Black numerals, short uppercase or title-case labels, and no long prose.
- **Mascot:** Trophy mascot can overlap or anchor the badge when space allows. It should look proud and competitive, not decorative.

### Tab Bar
- **Style:** Native Expo Router `<Tabs>` with `borderTopWidth: 0` (the border is removed; Sunlit Cream-to-Surface White tonal step handles separation).
- **Active state:** Active Orange `#F5A623` icon + label.
- **Inactive state:** Graphite `#8E8E93` icon + label.
- **Typography:** Caption (Nunito_600SemiBold, 12px).
- **Icons:** Ionicons solid fills (`home`, `trophy`, `star`, `settings`), 24px default size.

### Signature Components

- **WinCelebration modal.** The product's signature moment. A fade-in transparent modal with 40% black backdrop, 50 falling confetti pieces in the extended palette, a centered 80%-width Surface White card containing a randomized celebration GIF (200px tall), a Display-sized contextual title, Body-Muted encouragement copy, and a Caption-sized dismiss hint. Auto-dismisses at 4000ms; tappable anywhere to dismiss earlier. Spring-in (tension 90, friction 7) for the card; per-piece confetti animation with randomized delay, duration, sway, and rotation. This component is intentionally the only large-shadow, multi-color, motion-heavy surface in the app. **Match prefers-reduced-motion: skip confetti and spring; fade content in over 200ms.**

- **HistoryHeroHeader.** The Hero (64px black) total-wins counter in Trophy Gold, with a 64px trophy mascot above and a Label sublabel below. This is the largest single statement in the product and exists to make progress unmissable.

- **PostWinBanner.** A Surface White card with a 4px Trophy Gold side-stripe accent. **Note:** this side-stripe is a legacy pattern present in current code. The system's go-forward rule (see Do's and Don'ts) is to express banner accent through full Trophy Gold borders, leading iconography, or background tinting. Existing PostWinBanner usage stays; new banners follow the new rule.

- **Share Tile.** A square or story-format achievement surface for "I won today" and streak moments. Use Full Palette mode: Warm Paper or Trophy Gold base, Badge Ink type, Victory Coral and Share Blue accents, and the trophy mascot at meaningful scale. The tile should read in one second and should never include guilt, loss, or broken-streak framing.

## 6. Do's and Don'ts

### Do:
- **Do** put Sunlit Cream (`#FAF8F4`) as the screen background on every new screen. White is for elevated surfaces only.
- **Do** keep Trophy Gold (`#F1AF2E`) as the single identity color for primary action, selected state, and counts. One voice.
- **Do** use the full palette on social tiles, achievement badges, and post-win celebration surfaces.
- **Do** size streak and total-win numbers at Hero (64px Nunito_900Black) when they're the focus of a screen. Heavy and proud.
- **Do** make share surfaces feel like achievement memorabilia: badge, sticker, ribbon, trophy, or race-finish energy.
- **Do** keep cards flat (1px Border Warm + `shadow-sm` at most). Lift only the WinCelebration modal.
- **Do** display the user's win text at Body (16px regular) minimum. Their words outrank app chrome.
- **Do** respect `prefers-reduced-motion` on the celebration: skip confetti and spring, fade content in over 200ms instead.
- **Do** use Nunito at heavy weights (700/800/900) anywhere display register is needed. The weight range is the pairing.
- **Do** use the trophy mascot as an identity anchor at scale (48–64px in product UI, larger on social or brand surfaces), not as inline decoration.

### Don't:
- **Don't** introduce red, broken-chain, or X iconography for missed days, reset streaks, or any negative state. Reset messaging reframes ("Today's a fresh start"), never punishes.
- **Don't** use generic SaaS journaling chrome: cold neutral grays, serif body, hushed productivity-tool restraint. Winny's voice is bold, not quiet.
- **Don't** drift toward meditation-app aesthetics: gradient skies, ethereal motion, hushed type. We celebrate; we don't soothe.
- **Don't** mimic Duolingo-loud streak nag UI: oversized mascot screaming, neon greens, aggressive shame loops. Charlie Rocket energy, not nag energy.
- **Don't** make Winny sweeter to compensate for the name. The visual system should add confidence, not cuteness.
- **Don't** add a side-stripe border greater than 1px as a colored accent on new cards, list items, or banners. The PostWinBanner is a legacy exception; new banners use full Trophy Gold borders, leading icons, or background tints.
- **Don't** introduce a second type family. No serif display, no script accent, no monospace. Nunito at 400–900 is the whole system.
- **Don't** ship a shadow heavier than `shadow-sm` outside the celebration modal. Real elevation belongs to the moment.
- **Don't** use gradient text, glassmorphism, or `background-clip: text`. Confidence comes from solid color + weight, not from decoration.
- **Don't** nest cards. A WinCard inside a GoalCard is wrong; both inside a wrapper is doubly wrong.
- **Don't** introduce a "hero metric" SaaS template (big number, small label, four supporting stats in a row). The Hero number is the streak or total wins, alone. Supporting context lives elsewhere on the screen.
- **Don't** use pure white as a screen background. Cream substrate, always.
- **Don't** color destructive actions red. The OS confirmation dialog (Alert.alert with `destructive` style) handles destruction; the design system itself never originates red.
- **Don't** use heavy gold fills on inactive states. Inactive tab labels are Graphite; disabled primary buttons keep gold but drop to 50% opacity.
- **Don't** use coral or blue as everyday navigation accents. They belong to celebration, social, and badge applications.
