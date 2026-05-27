import * as Localization from "expo-localization";

export const SUPPORTED_LOCALES = ["en", "nl", "es", "fr", "de"] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];
export type LocalePref = "auto" | LocaleCode;

export const FALLBACK_LOCALE: LocaleCode = "en";

export interface LanguageEntry {
  code: LocaleCode;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: readonly LanguageEntry[] = [
  { code: "en", nativeName: "English" },
  { code: "nl", nativeName: "Nederlands" },
  { code: "es", nativeName: "Español" },
  { code: "fr", nativeName: "Français" },
  { code: "de", nativeName: "Deutsch" },
] as const;

export function isSupportedLocale(code: string | null | undefined): code is LocaleCode {
  return !!code && (SUPPORTED_LOCALES as readonly string[]).includes(code);
}

export function nativeNameFor(code: LocaleCode): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)!.nativeName;
}

export function mapDeviceToBase(): LocaleCode {
  const locales = Localization.getLocales();
  for (const l of locales) {
    const candidate = (l.languageCode ?? "").toLowerCase();
    if (isSupportedLocale(candidate)) return candidate;
  }
  return FALLBACK_LOCALE;
}

export function resolveLocale(pref: LocalePref): LocaleCode {
  if (pref === "auto") return mapDeviceToBase();
  return isSupportedLocale(pref) ? pref : FALLBACK_LOCALE;
}

export function parseStoredPref(raw: string | null): LocalePref {
  if (raw === "auto" || raw === null) return "auto";
  return isSupportedLocale(raw) ? raw : "auto";
}
