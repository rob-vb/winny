# Product

## Register

product

## Users

People building a daily habit of noticing their wins, inspired by Charlie Rocket's "Winning Streak" method. The app is branded **Winny** (the repo directory is `winning-streak` for legacy reasons; the shipped product name is Winny). Used in spare moments — morning coffee, evening wind-down, post-workout, walking. The user opens the app to answer one question ("What was your win today?") and leave feeling like they're already winning. Mobile-first (iOS + Android). No account, no friction. The job-to-be-done is emotional: prove to themselves that progress is happening, even on hard days.

## Product Purpose

Winny turns the act of noticing a win into a frictionless daily ritual. Type one thing. Watch the streak grow. The streak counter and accumulating history are the product — visible proof of momentum. V1 is local-first and free. Success looks like: a user opens the app, logs a win in under 10 seconds, and feels a small jolt of pride. They come back tomorrow because the streak makes them want to.

## Brand Personality

**Bold, energetic, rocket-fueled.** Charlie Rocket energy translated to a mobile habit app: punchy typography, saturated gold/orange, momentum-driven motion. Voice is confident and celebratory, never therapeutic or sleepy. Closer to a Strava finish-line splash than a meditation app. The astronaut mascot is present but is not the personality — the personality is the user being told *yes, you did it, again*.

## Anti-references

- **Streak/habit punishers (Streaks, Habitica, classic Duolingo nag patterns):** red X marks, broken-chain shame, "you lost your streak" copy, gamified guilt loops. Winny resets the counter mechanically but never punishes verbally.
- **Generic SaaS journaling (Day One, Journey):** cold neutral grays, serif-on-white, productivity-tool restraint. Too quiet. The win deserves volume.
- **Meditation/calm apps (Calm, Headspace):** soft gradient skies, hushed type, slow ethereal motion. Wrong energy — we celebrate, we don't soothe.

## Design Principles

1. **Momentum visible.** Streak + total wins are one glance away on every primary surface. Progress is the dopamine; never bury it.
2. **Celebrate, never scold.** Every state — including missed days and reset streaks — uses encouraging framing. No red, no X, no broken-chain iconography. Reset language reframes ("Today's a fresh start").
3. **The win is the hero.** The user's own words are the largest, most prominent element when displayed. App chrome (nav, headers, controls) recedes so the win can sing.
4. **Bold without shouting.** Saturated color and confident type carry energy; we don't need flashing, neon, or aggressive nags. Strava-confident, not Duolingo-loud.
5. **One tap to log.** Friction is the enemy of habit. From cold app open to win-saved is two taps maximum. Every screen optimizes for speed-to-write.

## Accessibility & Inclusion

- **WCAG AA** contrast across all text, including warm cream-on-gold combinations (verify gold CTAs against cream background; lean toward orange `#F1AF2E` for text-on-cream where contrast risks AA).
- **Reduced motion** respected: `prefers-reduced-motion` disables confetti, streak-count spring animations, and celebratory transitions; preserve fades and instant state changes.
- **Dynamic type** scales up to iOS XXL / Android large fonts without breaking layouts; the win composer must accommodate larger system font without overflowing the 200-char counter.
- **Touch targets** ≥44pt iOS / 48dp Android on all interactive elements, including the bottom tab bar and "I'm done for today" CTA.
- **Screen reader**: streak counter announces semantically ("7 day winning streak"), not just the number. Win history dates announced in long form.
- **Color is never the only signal**: success/celebration states pair color with iconography or copy.
