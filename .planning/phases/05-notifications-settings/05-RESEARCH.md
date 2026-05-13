# Phase 5: Notifications + Settings — Research

**Researched:** 2026-05-13
**Domain:** expo-notifications (local scheduling), @react-native-community/datetimepicker, expo-store-review, AppState listener, Settings screen patterns
**Confidence:** HIGH (core scheduling API), MEDIUM (Android 13 permission nuances), HIGH (all other areas)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Permission prompt fires inline immediately after the first win save. Hook in `useWinsStore.addWin` or `WinInputArea`. Gates on `notification_permission_status === "undetermined"`.
- **D-02:** Silent deny path. If user denies, no retry, no nag. Settings reminder section greys out time row with "Notifications disabled — Enable in iOS Settings" affordance → `Linking.openSettings()`.
- **D-03:** Rotating pool of 5–8 encouraging prompts. Deterministic: `pool[hash(date_key) % pool.length]`.
- **D-04:** Title = `"Just Keep Winning"`, body = pool prompt. Project-wide rename is Phase 7; notification title constant uses new name in Phase 5.
- **D-05:** No name personalization in V1 notification body.
- **D-06:** Window depth = exactly 30 days. Schedules today's reminder (if still in future) + next 29 days.
- **D-07:** Top-up trigger = AppState `'active'`. Listener attached at root layout.
- **D-08:** Cancel-all + reschedule next 30 on every top-up. Idempotent. `Notifications.cancelAllScheduledNotificationsAsync()` then schedule loop.
- **D-09:** Reminder time change → same cancel+reschedule path. Show toast/inline confirmation "Reminders set for {time}".
- **D-10:** First-time defaults after permission grant: `reminder_enabled = "true"`, `reminder_time = "20:00"`. Trigger initial schedule immediately.
- **D-11:** Sectioned list (Reminders / Profile / About). `label + value + chevron` pattern.
- **D-12:** Time picker = `@react-native-community/datetimepicker` in `'time'` mode as modal bottom sheet. Display 12h locale; store 24h `HH:mm`.
- **D-13:** Display name = inline-editable row. Tap → TextInput focuses in place, save on blur/return. Mirrors Phase 4 GoalEditor aesthetic.
- **D-14:** How It Works → in-app screen (sub-route `settings/how-it-works` or modal stack).
- **D-15:** Privacy Policy + Terms → `expo-web-browser` `WebBrowser.openBrowserAsync`. Stub URLs this phase.
- **D-16:** Rate App = `expo-store-review`. `StoreReview.requestReview()` on iOS + fallback to App Store URL via `Linking`.
- **D-17:** Share App = React Native `Share` API. Share content: short message + stub App Store URL.

### Claude's Discretion
- Exact 5–8 notification copy strings (warm, forward-looking, no guilt)
- Visual style of Settings row (height, divider, chevron icon — match iOS Settings feel with warm palette)
- How It Works copy outline (5 sections already specified in UI-SPEC)
- Whether to add a master "Reminders" toggle row above the time row (recommended: yes)
- Share App message text
- Time picker locale handling (use device locale via DateTimePicker default behavior)
- AppState listener placement (`app/_layout.tsx`)
- Storage key naming conventions for new settings rows

### Deferred Ideas (OUT OF SCOPE)
- Project-wide rename "Winning Streak" → "Just Keep Winning" (Phase 7)
- Notification body with display name personalization (Phase 6+)
- Notification deeplink / tap-to-route (V2)
- Real Privacy Policy + Terms of Use content + hosting (Phase 7)
- App Store rating prompt frequency tuning
- Encouragement copy system (Phase 6)
- Reminder snooze / pause
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NOTF-01 | App requests notification permission after user logs first win (never on first open) | Permission API verified; `useWinsStore.addWin` hook point identified; `notification_permission_status` key pattern confirmed |
| NOTF-02 | Daily push reminder fires at user-configurable time (default 8:00 PM local) | `SchedulableTriggerInputTypes.DATE` trigger shape confirmed; 30× one-shot scheduling verified |
| NOTF-03 | Notification queue uses rolling 30-day scheduling window (avoids iOS 64-notification ceiling) | iOS 64 local notification cap confirmed (hardware-level limit); cancel+reschedule algorithm specified |
| NOTF-04 | App refreshes notification queue every time it foregrounds (AppState listener) | `AppState.addEventListener('change', handler)` pattern confirmed; `'active'` event fires on cold start and foreground transitions |
| SET-01 | User can set and update daily reminder time | `@react-native-community/datetimepicker` v9.1.0 API confirmed; `onChange` pattern documented |
| SET-02 | User can set a display name | `EditableNameRow` pattern confirmed; `getSetting`/`setSetting` for `display_name` key |
| SET-03 | Settings includes About section: How It Works, Privacy Policy, Terms of Use, Rate App, Share App | `expo-store-review`, `expo-web-browser`, RN `Share` API all confirmed |
</phase_requirements>

---

## Summary

Phase 5 introduces the two most technically complex pieces of the V1 app: the local notification system and the Settings screen. The notification system uses `expo-notifications` SDK 55 (v55.0.23) for local scheduling, with a rolling 30-day window of one-shot DATE-triggered notifications to stay under iOS's 64-notification cap. The Settings screen is a full replacement of the 15-line placeholder with a sectioned ScrollView managing four settings keys via the existing `getSetting`/`setSetting` repository.

The core scheduling decision — 30 individual one-shot DATE notifications rather than one DAILY repeating trigger — is the correct choice for this use case. A DAILY repeating trigger would consume only 1 of the 64 slots but cannot rotate notification copy per day. The 30 one-shot approach consumes 30 slots (47% of the cap), gives per-day copy rotation, and is idempotent on cancel+reschedule. The cancel-all-and-reschedule-30 pattern runs on every foreground (AppState `'active'`) and on any settings change, keeping the queue always fresh.

Android requires setup before permissions: `setNotificationChannelAsync` must be called before `requestPermissionsAsync` for the POST_NOTIFICATIONS dialog to appear on Android 13+ devices. The `SCHEDULE_EXACT_ALARM` permission for Android 12+ is automatically added by the expo-notifications config plugin during prebuild — no manual AndroidManifest.xml edit is needed in managed workflow. The `expo-notifications` plugin must be added to `app.json`.

**Primary recommendation:** Wire the complete notification service module (`src/notifications/notificationService.ts`) in Slice A before building Settings UI. The AppState listener in `_layout.tsx` is the only global system-level integration; everything else is contained in the settings screen and the notification service module.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Notification scheduling | Native module (expo-notifications) | JS service module | Scheduling happens in the OS; JS only calls the API |
| Permission request flow | Native OS dialog | useWinsStore hook trigger | OS presents dialog; JS triggers at right moment |
| AppState top-up listener | Root layout (_layout.tsx) | notificationService module | Root layout owns global app lifecycle listeners |
| Settings persistence | SQLite (settings k/v table) | getSetting/setSetting repo | Already established pattern from Phase 1 |
| Settings screen UI | Frontend (React Native) | — | Screen-level component, local state + useEffect |
| Time picker display | Native UI (DateTimePicker module) | TimePickerRow component | Platform-native picker; JS provides value and onChange |
| Display name editing | Frontend (EditableNameRow) | — | In-place single-field edit, no server/store needed |
| About section navigation | Expo Router | expo-web-browser, expo-store-review | In-app routing for How It Works; external for the rest |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-notifications | 55.0.23 | Local notification scheduling, permissions, channel setup | Official Expo SDK module for SDK 55; replaces direct UNUserNotification/Android APIs |
| @react-native-community/datetimepicker | 9.1.0 | Time/date picker modal | Official React Native Community module; only mature option for native picker |
| expo-store-review | 55.0.14 | In-app rating prompt | Official Expo SDK module; wraps StoreKit (iOS) / Play Core (Android) |
| expo-web-browser | 55.0.15 (already in package.json) | In-app browser for Privacy/Terms links | Already installed Phase 1; Expo standard for external URLs keeping user in-app |

[VERIFIED: npm registry — expo-notifications latest=55.0.23, @react-native-community/datetimepicker latest=9.1.0, expo-store-review latest=55.0.14]

### Supporting (built-in, no new deps)
| API | Source | Purpose |
|-----|--------|---------|
| `AppState` | react-native core | Foreground/background transition detection |
| `Share` | react-native core | Share App sheet |
| `Linking` | react-native core (expo-linking already in package.json) | openSettings(), App Store fallback URL |
| `Platform` | react-native core | iOS vs Android branching in DateTimePicker |

### Alternatives Considered
| Instead of | Could Use | Why We Don't |
|------------|-----------|--------------|
| 30× one-shot DATE triggers | Single DAILY repeating trigger | DAILY gives no per-day copy rotation; copy pool requires per-date deterministic pick |
| 30× one-shot DATE triggers | CALENDAR trigger (iOS only) | DATE trigger is cross-platform; CALENDAR is iOS-only |
| @react-native-community/datetimepicker | react-native-modal-datetime-picker | Wrapper adds no value over direct usage; extra dep |
| expo-store-review | Direct StoreKit import | Not available in managed workflow |

**Installation (net new):**
```bash
npx expo install expo-notifications @react-native-community/datetimepicker expo-store-review
```

**app.json plugin update required** (see Pitfall 1):
```json
{
  "expo": {
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "expo-font",
      ["expo-notifications", {
        "icon": "./assets/images/notification_icon.png",
        "color": "#F5A623"
      }]
    ]
  }
}
```

The icon path is optional. The plugin entry itself is mandatory for Android channel and SCHEDULE_EXACT_ALARM permission injection.

---

## Architecture Patterns

### System Architecture Diagram

```
First win saved
      │
      ▼
useWinsStore.addWin()
      │
      ├─ [notification_permission_status === "undetermined"]
      │         │
      │         ▼
      │   requestPermission()
      │   ┌──────────────────┐
      │   │ Android path:    │
      │   │ setChannelAsync  │
      │   │ → requestAsync   │
      │   └──────────────────┘
      │         │
      │    granted? ──YES──▶ setSetting(status, "granted")
      │         │             setSetting(reminder_enabled, "true")
      │         │             setSetting(reminder_time, "20:00")
      │         │             scheduleNext30Days("20:00")
      │         │                       │
      │        NO                       ▼
      │         │             cancelAllScheduledNotificationsAsync()
      │         ▼                       │
      │   setSetting(status, "denied")  ▼
      │   [no retry, silent]   for day 0..29:
      │                          scheduleNotificationAsync({
      │                            content: {title, body: pool[hash(dateKey)%5]},
      │                            trigger: {type: DATE, date: dateObj}
      │                          })
      │
      └─ [already granted/denied] — no-op
      
App foreground (AppState 'active')
      │
      ├─ [reminder_enabled === "true" AND status === "granted"]
      │         │
      │         ▼
      │   scheduleNext30Days(reminder_time)   ← idempotent cancel+reschedule
      │
      └─ [else] — no-op

Settings: reminder time changed
      │
      ▼
setSetting("reminder_time", newHHmm)
scheduleNext30Days(newHHmm)
show inline "Reminders set for {time}" (2000ms)
```

### Recommended Project Structure (Phase 5 additions)

```
src/
├── notifications/
│   └── notificationService.ts     # requestPermission(), scheduleNext30Days(), cancelAll(), pickPromptForDate()
├── constants/
│   ├── links.ts                   # PRIVACY_URL, TERMS_URL, APP_STORE_URL (stubs)
│   └── theme.ts                   # (existing — no changes)
├── components/
│   └── settings/
│       ├── SettingsRow.tsx         # icon + label + value + chevron, Pressable
│       ├── SettingsSection.tsx     # section header + bg-surface card with dividers
│       ├── TimePickerRow.tsx       # SettingsRow subtype: opens DateTimePicker modal
│       └── EditableNameRow.tsx     # SettingsRow subtype: inline TextInput toggle
└── db/
    └── repositories/
        └── settings.ts            # (existing — no changes; new keys only)

app/
├── (tabs)/
│   └── settings.tsx               # FULL REPLACEMENT — sectioned ScrollView
└── settings/
    └── how-it-works.tsx            # new in-app sub-screen (Expo Router stack route)
```

### Pattern 1: expo-notifications — Full Permission + Channel Setup

```typescript
// Source: docs.expo.dev/versions/v55.0.0/sdk/notifications/ [VERIFIED]
// src/notifications/notificationService.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set handler ONCE at app startup (call from _layout.tsx before any scheduling)
export function initNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,   // use shouldShowBanner NOT deprecated shouldShowAlert
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestPermission(): Promise<'granted' | 'denied'> {
  // Android 13+: channel must exist BEFORE requestPermissionsAsync for dialog to appear
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return 'granted';

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });

  return status === 'granted' ? 'granted' : 'denied';
}
```

### Pattern 2: 30-Day Rolling Window — scheduleNext30Days()

```typescript
// Source: expo-notifications DATE trigger shape [VERIFIED: docs.expo.dev]
// [ASSUMED]: Algorithm design — correctness verified by logic, not a documented pattern

import { toDateKey } from '@/src/utils/dateUtils'; // existing utility

const NOTIFICATION_TITLE = 'Just Keep Winning';   // D-04: use new name in notification only

const COPY_POOL = [
  "What was your win today?",
  "One small win counts. Log it.",
  "Time to notice what's working.",
  "Your dream is built one win at a time.",
  "Add one win — that's enough.",
] as const;

// Deterministic hash: same date_key always picks same prompt
export function pickPromptForDate(dateKey: string): string {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return COPY_POOL[hash % COPY_POOL.length];
}

export async function scheduleNext30Days(reminderTimeHHmm: string): Promise<void> {
  // 1. Cancel all existing (idempotent)
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hours, minutes] = reminderTimeHHmm.split(':').map(Number);
  const now = new Date();

  // 2. Schedule today + next 29 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    targetDate.setHours(hours, minutes, 0, 0);

    // Skip if this slot is in the past (today's reminder time already passed)
    if (targetDate <= now) continue;

    const dateKey = toDateKey(targetDate); // 'YYYY-MM-DD' in LOCAL time
    const body = pickPromptForDate(dateKey);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TITLE,
        body,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
        channelId: 'daily-reminder', // Android only; ignored on iOS
      },
    });
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

**Edge cases handled:**
- Today's reminder in the past: `if (targetDate <= now) continue` skips it. The queue starts from tomorrow in that case — acceptable (user missed today's prompt already).
- DST transitions: `targetDate.setHours(hours, minutes, 0, 0)` uses local time, which automatically adjusts for DST via JS `Date` semantics. `8:00 PM` remains `8:00 PM` local regardless of DST change.
- Permission revoked mid-window: `scheduleNext30Days` will silently fail if called when permission is denied. Caller (AppState listener) must gate on `notification_permission_status === "granted"`.
- 30 slots = 47% of iOS 64 cap. No headroom risk.

### Pattern 3: AppState Listener in _layout.tsx

```typescript
// Source: react-native docs AppState API [ASSUMED — training knowledge, standard RN pattern]
// Placement: app/_layout.tsx, inside RootLayout component

import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { getSetting } from '@/src/db/repositories/settings';
import { scheduleNext30Days } from '@/src/notifications/notificationService';

// Inside RootLayout, after existing useEffect for splash:
const appState = useRef(AppState.currentState);

useEffect(() => {
  const subscription = AppState.addEventListener(
    'change',
    async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        // Cold start: currentState starts as 'active', no change event fires on mount.
        // Background→foreground: fires 'active' event.
        const [enabled, status, time] = await Promise.all([
          getSetting('reminder_enabled'),
          getSetting('notification_permission_status'),
          getSetting('reminder_time'),
        ]);
        if (enabled === 'true' && status === 'granted' && time) {
          await scheduleNext30Days(time);
        }
      }
    }
  );

  return () => subscription.remove();
}, []); // only once on mount
```

**Cold-start coverage:** AppState listener fires only on *changes* to AppState. On cold start, `AppState.currentState` is already `'active'` so no `'change'` event fires. To cover cold start, call `scheduleNext30Days` directly in the mount effect (alongside the existing migrations/fonts gate), guarded by the same `enabled === 'true' && status === 'granted'` check.

### Pattern 4: First-Win Permission Hook in useWinsStore

```typescript
// Source: CONTEXT.md D-01; existing useWinsStore.addWin [VERIFIED: read from codebase]
// Modification to src/stores/useWinsStore.ts

import { getSetting, setSetting } from '@/src/db/repositories/settings';
import { requestPermission, scheduleNext30Days } from '@/src/notifications/notificationService';

// Inside addWin(), AFTER insertWin() and state update:
const permStatus = await getSetting('notification_permission_status');
if (permStatus === null || permStatus === 'undetermined') {
  const result = await requestPermission();
  await setSetting('notification_permission_status', result);
  if (result === 'granted') {
    await setSetting('reminder_enabled', 'true');
    await setSetting('reminder_time', '20:00');
    await scheduleNext30Days('20:00');
  }
  // If 'denied': silent. No retry. Settings section shows disabled notice.
}
```

**One-shot guard:** The `null || 'undetermined'` check ensures this fires exactly once. After the first call, status is either `'granted'` or `'denied'` and the block never re-executes.

### Pattern 5: @react-native-community/datetimepicker Modal Pattern

```typescript
// Source: github.com/react-native-datetimepicker/datetimepicker [VERIFIED: WebFetch]
// Note: callback is onChange (event, date) NOT onValueChange — library docs show both spellings;
// v8+ uses onChange. [ASSUMED: verify against installed v9.1.0 — watch for renamed prop]

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Modal, View, Pressable, Text } from 'react-native';

// Inside TimePickerRow component:
const [showPicker, setShowPicker] = useState(false);
const [pickerDate, setPickerDate] = useState<Date>(parseHHmmToDate(reminderTime));

const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
  if (Platform.OS === 'android') {
    // Android DateTimePicker dismisses automatically; event.type === 'set' or 'dismissed'
    setShowPicker(false);
    if (selected && _event.type === 'set') {
      onTimeSelected(selected);
    }
  } else {
    // iOS spinner: picker stays visible until user taps Done
    if (selected) setPickerDate(selected);
  }
};

// iOS: wrap in Modal + Done button
// Android: show directly (dismisses after selection)
return (
  <>
    {/* Row tap target */}
    {Platform.OS === 'ios' && showPicker && (
      <Modal transparent animationType="slide" visible>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-surface rounded-t-2xl px-4 pb-6 pt-4">
            <View className="flex-row justify-between mb-2">
              <Pressable onPress={() => setShowPicker(false)}>
                <Text className="font-nunito-bold text-sm text-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable onPress={() => { setShowPicker(false); onTimeSelected(pickerDate); }}>
                <Text className="font-nunito-bold text-sm text-primary">Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={pickerDate}
              mode="time"
              display="spinner"   // iOS spinner wheel
              onChange={handleChange}
            />
          </View>
        </View>
      </Modal>
    )}
    {Platform.OS === 'android' && showPicker && (
      <DateTimePicker
        value={pickerDate}
        mode="time"
        display="default"   // Android clock dialog
        onChange={handleChange}
      />
    )}
  </>
);
```

**HH:mm ↔ Date conversion helpers:**
```typescript
export function parseHHmmToDate(hhMm: string): Date {
  const [h, m] = hhMm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function dateToHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatHHmmFor12h(hhMm: string): string {
  const [h, m] = hhMm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  // "20:00" → "8:00 PM", "08:00" → "8:00 AM"
}
```

### Pattern 6: expo-store-review

```typescript
// Source: docs.expo.dev/versions/latest/sdk/store-review/ [VERIFIED: WebFetch returned 404;
//          pattern from expo-store-review README and CONTEXT.md D-16 — MEDIUM confidence]
import * as StoreReview from 'expo-store-review';
import { Linking } from 'react-native';
import { APP_STORE_URL } from '@/src/constants/links';

export async function handleRateApp(): Promise<void> {
  const isAvailable = await StoreReview.isAvailableAsync();
  if (isAvailable) {
    await StoreReview.requestReview();
  } else {
    // Fallback: open App Store URL (stub until Phase 7)
    await Linking.openURL(APP_STORE_URL);
  }
}
```

**Platform behavior:** `isAvailableAsync()` returns `false` on Android simulator, physical Android devices in debug mode, and when the OS rate-limiting throttle has been triggered. The `Linking` fallback covers all these cases.

### Pattern 7: RN Share API

```typescript
// Source: react-native Share docs [ASSUMED — well-established core API]
import { Share } from 'react-native';
import { APP_STORE_URL, SHARE_MESSAGE } from '@/src/constants/links';

export async function handleShareApp(): Promise<void> {
  await Share.share({
    message: `${SHARE_MESSAGE} ${APP_STORE_URL}`,
    title: 'Just Keep Winning',  // Android only; iOS ignores title
    url: APP_STORE_URL,           // iOS only; Android uses message field
  });
}
```

**Behavior difference:** On iOS, `url` and `message` are separate fields in the share sheet. On Android, only `message` is used — include the URL in the message string for Android compatibility (which the pattern above does).

### Anti-Patterns to Avoid

- **Using DAILY repeating trigger:** Consumes only 1 slot but prevents per-day copy rotation. Does not satisfy the design requirement for deterministic per-date prompts.
- **Scheduling more than 64 notifications:** iOS silently discards the excess, keeping only the soonest 64. 30 one-shots = safe.
- **Calling `scheduleNext30Days` without permission check:** Will silently fail or throw. Always gate on `notification_permission_status === 'granted'`.
- **Skipping `setNotificationChannelAsync` on Android:** POST_NOTIFICATIONS dialog will not appear on Android 13+ devices if no channel exists first.
- **Using deprecated `shouldShowAlert`:** Use `shouldShowBanner` + `shouldShowList` in `setNotificationHandler`.
- **Calling `initNotificationHandler` inside a component:** It must be called at module level or in _layout.tsx before any notification can be received, not inside a hook/effect that runs later.
- **Using `StyleSheet.create` in new Settings components:** CLAUDE.md invariant — NativeWind className only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Local notification scheduling | Custom background task / setInterval | expo-notifications | iOS/Android OS notification APIs; setInterval doesn't survive app kill |
| Permission dialog | Custom permission explanation UI | `requestPermissionsAsync()` → OS native dialog | Native dialog is required; custom UI only supplements (explain before requesting) |
| Time/date picker UI | Custom wheel/scroll picker | @react-native-community/datetimepicker | Platform-native look; handles AM/PM, locale, accessibility automatically |
| In-app browser | WebView component | expo-web-browser `openBrowserAsync` | WebBrowser provides share button, SSL indicator, back navigation for free |
| App Store review | Custom rating survey | expo-store-review | StoreKit (iOS) and Play Core (Android) handle throttling, OS-level in-app sheet |

---

## Common Pitfalls

### Pitfall 1: Missing expo-notifications plugin in app.json
**What goes wrong:** Android build silently omits SCHEDULE_EXACT_ALARM permission and notification channel wiring. Notifications may never fire or fire imprecisely on Android 12+ when device enters Doze mode.
**Why it happens:** The plugin performs AndroidManifest.xml injection during EAS prebuild. Without it, the manifest has no `<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>`.
**How to avoid:** Add `["expo-notifications", {...}]` to the `plugins` array in `app.json` before any EAS build. Even without custom options, the bare `"expo-notifications"` string entry is sufficient.
**Warning signs:** Android notifications work on emulator but not on a physical Android 12+ device in Doze mode.
[VERIFIED: docs.expo.dev/versions/v55.0.0/sdk/notifications/]

### Pitfall 2: Android 13+ permission dialog never appears
**What goes wrong:** `requestPermissionsAsync()` returns `'denied'` immediately without showing any dialog. Android 13+ silently blocks the prompt.
**Why it happens:** On Android 13 (API 33+), the POST_NOTIFICATIONS runtime permission dialog only appears after at least one notification channel has been created.
**How to avoid:** Always call `setNotificationChannelAsync('daily-reminder', {...})` inside a `Platform.OS === 'android'` block BEFORE calling `requestPermissionsAsync()`.
**Warning signs:** Permission always returns `'denied'` on Android 13+ devices without any dialog appearing.
[VERIFIED: docs.expo.dev/versions/v55.0.0/sdk/notifications/, multiple GitHub issues confirmed]

### Pitfall 3: Cold start not covered by AppState listener
**What goes wrong:** On the very first cold launch after a permission grant (or when installing on a new device), no AppState change event fires because the state was already `'active'` at component mount. The 30-day queue never gets initially scheduled.
**Why it happens:** `AppState.addEventListener('change', handler)` fires only on *transitions* from one state to another, not on initial mount.
**How to avoid:** In the same `useEffect` that installs the AppState listener in `_layout.tsx`, call `scheduleNext30Days` directly (guarded by permission + enabled check) to cover cold start. The listener covers all subsequent foreground events.
**Warning signs:** Permission granted, reminder enabled in settings, but no notifications ever fire (the queue is always empty).
[ASSUMED — well-known AppState behavior; training knowledge]

### Pitfall 4: DateTimePicker `onChange` prop name confusion
**What goes wrong:** Runtime error "onChange is not a function" or picker value changes don't fire because the callback prop name differs across versions.
**Why it happens:** Older versions of `@react-native-community/datetimepicker` used `onChange(event, date)`; the WebFetch of the repo README showed `onValueChange(event, date)`. At v9.1.0, `onChange` is the correct prop name.
**How to avoid:** Use `onChange` (not `onValueChange`). Import `DateTimePickerEvent` type from the library for typed event handling.
**Warning signs:** TypeScript type errors on the prop name, or silent no-ops when user selects a time.
[MEDIUM confidence — verified v9.1.0 is latest but prop name confirmed only via README WebFetch]

### Pitfall 5: iOS foreground notification not visible
**What goes wrong:** App is open, reminder time arrives, no notification banner appears.
**Why it happens:** iOS suppresses notifications when the app is in foreground by default. Must call `setNotificationHandler` with `shouldShowBanner: true`.
**How to avoid:** Call `initNotificationHandler()` early in `_layout.tsx` (before fonts/migrations gate — or at module level in the service file). Use `shouldShowBanner` not deprecated `shouldShowAlert`.
**Warning signs:** Notification appears when app is backgrounded/killed but not when app is open during testing.
[VERIFIED: docs.expo.dev/versions/v55.0.0/sdk/notifications/]

### Pitfall 6: Notification title "Just Keep Winning" vs app name "Winning Streak"
**What goes wrong:** Using `"Winning Streak"` as the notification title is wrong per D-04. Using `"Just Keep Winning"` everywhere else is wrong per the deferred rename decision.
**Why it happens:** The app is currently named "Winning Streak" in `app.json` but the notification title constant uses the future name "Just Keep Winning" per explicit CONTEXT.md decision.
**How to avoid:** In `notificationService.ts`, hardcode `const NOTIFICATION_TITLE = 'Just Keep Winning'` as a constant. Do NOT read from `app.json` name. Do NOT use "Just Keep Winning" in any other Phase 5 string (the rename is deferred to Phase 7).
**Warning signs:** Notifications show wrong title; or Phase 7 rename is made harder by scattered hardcoded strings.
[VERIFIED: CONTEXT.md D-04]

### Pitfall 7: toDateKey(targetDate) must receive a Date argument
**What goes wrong:** `toDateKey()` called with no argument returns today's date key regardless of `dayOffset`. All 30 notifications get the same `dateKey` and therefore the same copy body.
**Why it happens:** `toDateKey()` in `src/utils/dateUtils.ts` likely defaults to `new Date()` if no argument provided (Phase 2 implementation).
**How to avoid:** In `scheduleNext30Days`, explicitly pass `toDateKey(targetDate)` where `targetDate` is the offset date object.
**Warning signs:** All scheduled notifications have the same body text.
[ASSUMED — based on reading dateUtils.ts; verify toDateKey() signature accepts a Date argument]

---

## Code Examples

### Full notificationService.ts skeleton

```typescript
// Source: expo-notifications docs [VERIFIED] + algorithm design [ASSUMED]
// src/notifications/notificationService.ts

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { toDateKey } from '@/src/utils/dateUtils';

const CHANNEL_ID = 'daily-reminder';
const NOTIFICATION_TITLE = 'Just Keep Winning';
const COPY_POOL = [
  "What was your win today?",
  "One small win counts. Log it.",
  "Time to notice what's working.",
  "Your dream is built one win at a time.",
  "Add one win — that's enough.",
] as const;

export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function pickPromptForDate(dateKey: string): string {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash * 31) + dateKey.charCodeAt(i)) >>> 0;
  }
  return COPY_POOL[hash % COPY_POOL.length];
}

export async function requestPermission(): Promise<'granted' | 'denied'> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return 'granted';
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status === 'granted' ? 'granted' : 'denied';
}

export async function scheduleNext30Days(reminderTimeHHmm: string): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const [hours, minutes] = reminderTimeHHmm.split(':').map(Number);
  const now = new Date();
  for (let offset = 0; offset < 30; offset++) {
    const target = new Date(now);
    target.setDate(now.getDate() + offset);
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) continue;
    const dateKey = toDateKey(target);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TITLE,
        body: pickPromptForDate(dateKey),
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

### src/constants/links.ts

```typescript
// Stub constants — real URLs populated in Phase 7 before store submission
export const PRIVACY_URL = 'https://winningstreak.app/privacy';
export const TERMS_URL = 'https://winningstreak.app/terms';
export const APP_STORE_URL = 'https://apps.apple.com/app/just-keep-winning'; // stub
export const SHARE_MESSAGE = "I've been using Just Keep Winning to log my daily wins — it's quietly great.";
```

---

## MVP Vertical Slices

The planner should structure this phase in three vertical slices, each deployable independently:

### Slice A: Permission + Minimal Schedule + Settings Reminders Section
**Goal:** Notifications work end-to-end. Settings shows Reminders section.
**Files:** `src/notifications/notificationService.ts`, `src/constants/links.ts`, `app.json` (plugin), `app/_layout.tsx` (AppState listener + cold-start schedule), `src/stores/useWinsStore.ts` (permission hook), `src/components/settings/SettingsRow.tsx`, `src/components/settings/SettingsSection.tsx`, `app/(tabs)/settings.tsx` (Reminders section only — scaffold rest empty)
**Tests:** `src/__tests__/notificationService.test.ts` (pickPromptForDate hash, scheduleNext30Days date math in dry-run mode)

### Slice B: Time Picker + Reschedule
**Goal:** User can change reminder time and see the queue update.
**Files:** `src/components/settings/TimePickerRow.tsx`, updated `app/(tabs)/settings.tsx` (time picker row wired)
**Tests:** `src/__tests__/notificationService.test.ts` (formatHHmmFor12h, parseHHmmToDate)

### Slice C: Profile + About Section
**Goal:** Display name editing + all About rows functional.
**Files:** `src/components/settings/EditableNameRow.tsx`, `app/(tabs)/settings.tsx` (Profile + About sections), `app/settings/how-it-works.tsx`
**Tests:** Manual only (expo-web-browser, Share, StoreReview require device)

---

## File Map

### New files (create in Phase 5)

| File | Purpose |
|------|---------|
| `src/notifications/notificationService.ts` | All notification logic: requestPermission, scheduleNext30Days, cancelAll, pickPromptForDate, initNotificationHandler |
| `src/constants/links.ts` | PRIVACY_URL, TERMS_URL, APP_STORE_URL, SHARE_MESSAGE constants (stubs) |
| `src/components/settings/SettingsRow.tsx` | Reusable row: icon + label + value + chevron |
| `src/components/settings/SettingsSection.tsx` | Section wrapper: header label + bg-surface card + divider rows |
| `src/components/settings/TimePickerRow.tsx` | SettingsRow subtype: DateTimePicker modal |
| `src/components/settings/EditableNameRow.tsx` | SettingsRow subtype: inline TextInput toggle |
| `app/settings/how-it-works.tsx` | In-app How It Works sub-screen (Expo Router stack route) |
| `src/__tests__/notificationService.test.ts` | Unit tests for pure logic (hash, date math) |

### Existing files modified

| File | Change |
|------|--------|
| `app/(tabs)/settings.tsx` | Full replacement — sectioned ScrollView |
| `app/_layout.tsx` | Add AppState listener useEffect + cold-start schedule call + initNotificationHandler call |
| `src/stores/useWinsStore.ts` | Add permission trigger hook inside `addWin()` |
| `app.json` | Add expo-notifications plugin entry to plugins array |
| `package.json` | Add expo-notifications, @react-native-community/datetimepicker, expo-store-review |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `shouldShowAlert` in setNotificationHandler | `shouldShowBanner` + `shouldShowList` | expo-notifications v0.14+ | `shouldShowAlert` still works but is deprecated — use new props |
| `onChange` returning `(event, date)` inline | `DateTimePickerEvent` typed import | @react-native-community/datetimepicker v7+ | Import the type for correct TypeScript handling |
| Push notifications testable in Expo Go | Must use EAS dev build | Expo SDK 52+ (SDK 53 fully removed) | **Phase 5 cannot be tested in Expo Go at all** — EAS dev build required |

**Deprecated/outdated:**
- `shouldShowAlert`: use `shouldShowBanner` (still functional, emits deprecation warning)
- Testing notifications in Expo Go: removed in SDK 53; SDK 55 project must use EAS dev build

---

## Runtime State Inventory

> Phase 5 is NOT a rename/refactor phase. No rename runtime state applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `settings` table gains 4 new keys: `reminder_time`, `reminder_enabled`, `display_name`, `notification_permission_status` | No migration needed — new keys are inserted on first write via `setSetting()` |
| Live service config | None | — |
| OS-registered state | iOS/Android notification OS queue — starts empty, populated by Phase 5 scheduling | No pre-existing state to migrate |
| Secrets/env vars | None | — |
| Build artifacts | EAS dev build must be rebuilt after adding expo-notifications plugin to app.json | `eas build --profile development --platform ios` (and/or android) |

**Build artifact note:** Adding `expo-notifications` to `app.json` plugins requires a new EAS dev build. The existing dev build will not have the native modules compiled in.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| EAS CLI | expo-notifications testing | ✓ | (eas.json present, dev profile configured) | None — no fallback for notifications |
| expo-notifications | NOTF-01..04 | ✗ (not yet installed) | — | None — required |
| @react-native-community/datetimepicker | SET-01 | ✗ (not yet installed) | — | None — required |
| expo-store-review | SET-03 | ✗ (not yet installed) | — | None — required |
| expo-web-browser | SET-03 (Privacy/Terms) | ✓ (already in package.json v55.0.15) | 55.0.15 | — |
| Expo Router v55 (stack routing) | settings/how-it-works sub-route | ✓ | 55.0.14 | — |

**Missing dependencies with no fallback:**
- `expo-notifications` — install required before any notification code
- `@react-native-community/datetimepicker` — install required for SET-01
- `expo-store-review` — install required for SET-03 Rate App

**Missing dependencies with fallback:**
- None

**EAS build required note:** Physical device or simulator testing of notifications REQUIRES an EAS dev build (not Expo Go). The `eas.json` development profile is already configured. After adding the expo-notifications plugin to `app.json`, run `eas build --profile development --platform ios --local` (or without `--local` for cloud build).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `AppState.addEventListener` fires on `'active'` on background→foreground but NOT on cold start (already active at mount) | Pattern 3, Pitfall 3 | If wrong, cold-start scheduling would be double-triggered. Low-risk — both paths call the same idempotent function |
| A2 | `@react-native-community/datetimepicker` v9.1.0 uses `onChange` (not `onValueChange`) as the callback prop name | Pattern 5, Pitfall 4 | If wrong, time picker selection would silently fail. Must verify against installed v9.1.0 TypeScript types |
| A3 | `toDateKey()` in `src/utils/dateUtils.ts` accepts an optional `Date` argument (defaults to `new Date()` when none given) | Pattern 2, Pitfall 7 | If it only takes no arguments, the scheduleNext30Days loop sends the same dateKey for all 30 days — all notifications get same body |
| A4 | `expo-store-review` `isAvailableAsync()` + `requestReview()` API shape matches training knowledge (404 on docs page) | Pattern 6 | If API has changed in v55.0.14, the call signature may differ. Risk: medium — this is a stable API |
| A5 | iOS 64-notification hard cap applies to `UNUserNotificationCenter` (modern framework), not just deprecated `UILocalNotification` | Section: iOS 64 cap | If the cap was removed/increased in recent iOS versions, the 30-slot rolling window is conservative but not harmful |
| A6 | `Share.share({ url })` on Android — the `url` field is silently ignored; only `message` is used | Pattern 7 | No functional risk — the URL is included in the `message` string for cross-platform coverage |

---

## Open Questions

1. **Does `toDateKey()` accept a `Date` argument?**
   - What we know: The function exists in `src/utils/dateUtils.ts` and is used by `useWinsStore.addWin` with no argument for today's date.
   - What's unclear: Whether it accepts an optional `Date` parameter for offset dates.
   - Recommendation: Read `src/utils/dateUtils.ts` before implementing `scheduleNext30Days`. If it only accepts no args, add an optional parameter in the same file (small, safe change).

2. **`setNotificationHandler` call timing in _layout.tsx**
   - What we know: It must be called before any notification can be received, and before `scheduleNotificationAsync`.
   - What's unclear: Whether calling it at module level in `notificationService.ts` (before component mount) is safe with Expo's module system.
   - Recommendation: Call `initNotificationHandler()` as the first statement inside `RootLayout()` component body (before any conditional returns), which guarantees it runs before any notification could be received.

3. **How It Works screen navigation: stack push vs modal**
   - What we know: CONTEXT.md D-14 says "sub-route `settings/how-it-works` or modal stack". UI-SPEC says "back navigation via Expo Router default".
   - What's unclear: Whether the Expo Router stack for `app/settings/` requires adding a screen to `app/_layout.tsx`'s `<Stack>`.
   - Recommendation: Use `app/settings/how-it-works.tsx` as a file-route (Expo Router auto-discovers it). In `_layout.tsx`, the existing `<Stack>` already handles non-tab routes. Add `<Stack.Screen name="settings/how-it-works" options={{ title: 'How It Works' }} />` for a header title. Navigation: `router.push('/settings/how-it-works')`.

4. **Expo Router `app/settings/` directory — does it conflict with `app/(tabs)/settings.tsx`?**
   - What we know: `app/(tabs)/settings.tsx` is the tab screen. `app/settings/how-it-works.tsx` would be a stack route outside the tabs group.
   - What's unclear: Whether Expo Router handles this cleanly (two different `settings` paths at different levels).
   - Recommendation: This is safe — `(tabs)/settings.tsx` maps to `/settings` (the tab) and `settings/how-it-works.tsx` maps to `/settings/how-it-works` (a stack route). Expo Router handles this cleanly because the `(tabs)` group is a layout group, not a URL segment. Verify with `npx expo start` after creating the file.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest (existing) |
| Config file | `jest.config.js` (exists) |
| Quick run command | `npx jest --testPathPattern notificationService` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NOTF-02 | `pickPromptForDate` returns deterministic pool entry for any date key | unit | `npx jest --testPathPattern notificationService -t "pickPromptForDate"` | ❌ Wave 0 |
| NOTF-02 | `pickPromptForDate` returns NO guilt language (all prompts in pool pass audit) | unit | `npx jest --testPathPattern notificationService -t "copy pool"` | ❌ Wave 0 |
| NOTF-03 | `scheduleNext30Days` calls scheduleNotificationAsync ≤30 times (dry run with mock) | unit | `npx jest --testPathPattern notificationService -t "schedule count"` | ❌ Wave 0 |
| NOTF-03 | Past-time today slot is skipped (no notification at time < now) | unit | `npx jest --testPathPattern notificationService -t "past time"` | ❌ Wave 0 |
| SET-01 | `parseHHmmToDate("20:00")` returns Date with hours=20, minutes=0 | unit | `npx jest --testPathPattern notificationService -t "parseHHmmToDate"` | ❌ Wave 0 |
| SET-01 | `formatHHmmFor12h("20:00")` returns `"8:00 PM"` | unit | `npx jest --testPathPattern notificationService -t "formatHHmmFor12h"` | ❌ Wave 0 |
| SET-01 | `dateToHHmm` round-trips with `parseHHmmToDate` | unit | `npx jest --testPathPattern notificationService -t "dateToHHmm"` | ❌ Wave 0 |
| NOTF-01 | Permission hook fires only when `notification_permission_status` is null or `"undetermined"` | unit (mock getSetting) | `npx jest --testPathPattern useWinsStore -t "permission"` | ❌ Wave 0 |
| NOTF-04 | AppState → actual notification firing | manual | EAS dev build — manual | N/A |
| NOTF-02 | Notification fires at configured time on physical device | manual | EAS dev build — manual | N/A |
| SET-02 | Display name saves and re-renders on blur | manual | EAS dev build — manual | N/A |
| SET-03 | Rate App: `isAvailableAsync` + `requestReview` / Linking fallback | manual | EAS dev build — manual | N/A |

### Sampling Rate
- **Per task commit:** `npx jest --testPathPattern notificationService`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/notificationService.test.ts` — covers NOTF-02 (copy pool hash, no-guilt audit), NOTF-03 (schedule count, past-time skip), SET-01 (date utilities)
- [ ] `src/__tests__/notificationService.test.ts` — NOTF-01 permission guard (mock `getSetting`)
- [ ] Mock `expo-notifications` module — `jest.mock('expo-notifications', ...)` in test setup or per-test-file

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in V1 |
| V3 Session Management | No | No sessions in V1 |
| V4 Access Control | No | No multi-user in V1 |
| V5 Input Validation | Yes | Display name: trim + SQLite TEXT storage via `setSetting`. Max length not enforced at DB layer — enforce at TextInput level (`maxLength` prop). Reminder time: `HH:mm` regex validate before storing. |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Notification body injection | Tampering | Copy pool is static constant array — no user input in notification body (D-05) |
| Settings key injection | Tampering | `setSetting(key, value)` uses parameterized Drizzle ORM query — safe |
| Display name XSS | Spoofing | Display name is rendered as React Native `Text` component (not web HTML) — no XSS vector |
| App Store URL redirect | Spoofing | `APP_STORE_URL` is a hardcoded constant, not user-supplied — no redirect risk |

**Note:** All data is local-only in V1. No network calls from Phase 5 code. The only external calls are `WebBrowser.openBrowserAsync` (opens stub URLs in system browser) and `Share.share` (uses OS share sheet with app-provided constant strings).

---

## Sources

### Primary (HIGH confidence)
- [docs.expo.dev/versions/v55.0.0/sdk/notifications/](https://docs.expo.dev/versions/v55.0.0/sdk/notifications/) — permission API, trigger shapes, channel setup, handler config, plugin options
- [github.com/react-native-datetimepicker/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) — iOS/Android display modes, onChange pattern, time mode
- npm registry — expo-notifications@55.0.23, @react-native-community/datetimepicker@9.1.0, expo-store-review@55.0.14 (verified versions)
- Project codebase — `src/stores/useWinsStore.ts`, `src/db/repositories/settings.ts`, `src/components/GoalEditor.tsx`, `app/_layout.tsx`, `app.json`, `eas.json` (verified via Read tool)

### Secondary (MEDIUM confidence)
- [reactnativerelay.com/article/react-native-push-notifications-expo-complete-guide-2026](https://reactnativerelay.com/article/react-native-push-notifications-expo-complete-guide-2026) — Android 13 setChannel-before-requestPermission order confirmed
- [developer.apple.com/forums/thread/106829](https://developer.apple.com/forums/thread/106829) — iOS 64 local notification cap confirmed (applies to modern UNUserNotificationCenter)
- WebSearch results — Android POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM requirement, channel-first pattern

### Tertiary (LOW confidence / ASSUMED)
- expo-store-review `isAvailableAsync` + `requestReview` API shape (docs 404'd; pattern from training knowledge and CONTEXT.md D-16)
- `RN Share.share` behavior on iOS vs Android (training knowledge; well-established stable API)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry; expo-notifications API verified via official docs
- Architecture (notification scheduling): HIGH — trigger shapes and cancel/reschedule verified via official docs
- Android 13 permission nuances: MEDIUM — confirmed channel-first pattern via multiple sources; canAskAgain behavior edge case documented in GitHub issues but not fully resolved
- AppState cold-start gap: MEDIUM (ASSUMED) — well-known behavior, not verified against expo-router's lifecycle specifically
- expo-store-review API: MEDIUM (ASSUMED) — docs 404'd; using training knowledge

**Research date:** 2026-05-13
**Valid until:** 2026-06-12 (30 days — Expo SDK releases frequently; re-verify if SDK upgrade occurs)
