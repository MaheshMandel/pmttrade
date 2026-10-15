import en from "./locales/en.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";

import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./config";

const dictionaries = { en, de, es, fr, it } satisfies Record<Locale, unknown>;

type Dictionary = typeof en;

type DotPaths<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${DotPaths<T[K]>}`
    : K;
}[keyof T & string];

export type TranslationKey = DotPaths<Dictionary>;

function resolve(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

export function useTranslations(locale: Locale) {
  const dict = dictionaries[locale];
  return function t(key: TranslationKey): string {
    const value = resolve(dict, key);
    if (value !== undefined) return value;

    const fallback = resolve(dictionaries[DEFAULT_LOCALE], key);
    if (import.meta.env.DEV && value === undefined) {
      console.warn(`[i18n] Missing key "${key}" for locale "${locale}".`);
    }
    return fallback ?? key;
  };
}

export type Translator = ReturnType<typeof useTranslations>;

export function getLocalePaths() {
  return LOCALES.map((locale) => ({
    params: { locale: locale === DEFAULT_LOCALE ? undefined : locale },
    props: { locale },
  }));
}

export function toLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// Trailing slash always included — must match the canonical/hreflang/sitemap
// convention in BaseLayout.astro, or internal links point to a URL that
// disagrees with its own page's canonical tag.
export function localizedPath(locale: Locale, path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  if (locale === DEFAULT_LOCALE) {
    return clean ? `/${clean}/` : "/";
  }
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}

export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && isLocale(segments[0]) && segments[0] !== DEFAULT_LOCALE) {
    segments.shift();
  }
  // There is no localized 404 route, so the language switcher on the 404 page
  // should land on the target locale's home page instead of /de/404/ etc.
  if (segments.length === 1 && segments[0] === "404") segments.length = 0;
  if (target === DEFAULT_LOCALE) {
    return segments.length ? `/${segments.join("/")}/` : "/";
  }
  return `/${[target, ...segments].join("/")}/`;
}
