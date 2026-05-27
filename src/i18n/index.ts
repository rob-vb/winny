import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import nl from "./locales/nl.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import { FALLBACK_LOCALE, type LocaleCode } from "./languages";

let initialized = false;

export function initI18n(initialLocale: LocaleCode): typeof i18n {
  if (initialized) {
    if (i18n.language !== initialLocale) {
      i18n.changeLanguage(initialLocale);
    }
    return i18n;
  }
  initialized = true;
  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: "v4",
      resources: {
        en: { translation: en },
        nl: { translation: nl },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
      },
      lng: initialLocale,
      fallbackLng: FALLBACK_LOCALE,
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  return i18n;
}

export { default as i18n } from "i18next";
