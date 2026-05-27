import type { Locale } from "date-fns";
import { enUS, nl, es, fr, de } from "date-fns/locale";
import type { LocaleCode } from "./languages";

const MAP: Record<LocaleCode, Locale> = {
  en: enUS,
  nl,
  es,
  fr,
  de,
};

export function dateLocaleFor(code: LocaleCode): Locale {
  return MAP[code] ?? enUS;
}
