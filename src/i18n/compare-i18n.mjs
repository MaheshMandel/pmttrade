// Runtime for translated compare pages: dictionaries + helpers used by the page frontmatter and <Localize>.
import { keyOf, decode, normalize, translate, localizeHrefs } from "./compare-i18n-core.mjs";
import de from "./compare/de.json";
import es from "./compare/es.json";
import fr from "./compare/fr.json";
import it from "./compare/it.json";

const DICTS = { de, es, fr, it };
const BCP47 = { en: "en-US", de: "de-DE", es: "es-ES", fr: "fr-FR", it: "it-IT" };

const plain = (v) => decode(v.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

/** tr("English string") -> translated plain text (title, description, FAQ, JSON-LD names). English passes through. */
export function makeTr(locale) {
  const dict = DICTS[locale];
  return (s) => {
    if (!dict || typeof s !== "string") return s;
    const v = dict[keyOf(s)];
    return v === undefined ? s : plain(v);
  };
}

/** Translate a rendered English fragment and localise its internal links. */
const KNOWN = {};
function knownTranslations(locale) {
  if (!KNOWN[locale]) {
    KNOWN[locale] = new Set();
    for (const v of Object.values(DICTS[locale] || {})) {
      KNOWN[locale].add(normalize(v));
      KNOWN[locale].add(normalize(plain(v)));
    }
  }
  return KNOWN[locale];
}

export function translateFragment(html, locale) {
  const dict = DICTS[locale];
  if (!dict) return html;
  const { html: out, missing } = translate(html, dict, knownTranslations(locale));
  if (missing.size) {
    const msg = `[compare-i18n] ${locale}: ${missing.size} untranslated unit(s), e.g. ${[...missing].slice(0, 3).join(" | ")}`;
    if (process.env.COMPARE_I18N_STRICT) throw new Error(msg);
    console.warn(msg);
  }
  return localizeHrefs(out, locale);
}

const SITE = /^(https:\/\/pickmytrade\.(?:io|trade))(\/.*)?$/;
function localizeUrl(v, locale) {
  const m = SITE.exec(v);
  if (!m || /#(organization|website)/.test(v)) return v;
  const path = m[2] ?? "/";
  if (path === "/" || path.startsWith("/compare/") || path.startsWith("/pages/pricing")) return `${m[1]}/${locale}${path}`;
  return v;
}

/** Localise JSON-LD: URLs get the locale prefix, human-readable names go through tr(), WebPage gets inLanguage. */
export function localizeLd(ld, locale, tr) {
  if (locale === "en") return ld;
  const go = (v, key) => {
    if (Array.isArray(v)) return v.map((x) => go(x, key));
    if (v && typeof v === "object") {
      const o = {};
      for (const [k, x] of Object.entries(v)) o[k] = go(x, k);
      if (o["@type"] === "WebPage") o.inLanguage = BCP47[locale];
      return o;
    }
    if (typeof v === "string") {
      if (key === "item" || key === "url" || key === "@id") return localizeUrl(v, locale);
      if (key === "name" || key === "headline") return tr(v);
    }
    return v;
  };
  return go(ld, "");
}
