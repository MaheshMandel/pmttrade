import type { Locale } from "../i18n/config";

export type GuideBlock =
  | { type: "heading"; text: string; id?: string }
  | { type: "paragraph"; html: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { title: string; html: string; image?: { src: string; alt: string } }[] }
  | { type: "image"; src: string; alt: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "quote"; html: string }
  | { type: "checklist"; heading: string; items: string[] };

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideRelated {
  title: string;
  href: string;
}

/**
 * Single-locale, render-ready guide content. This is what GuideArticle.astro
 * consumes — produced by resolving a GuideArticleI18nData for one locale.
 */
export interface GuideArticleData {
  badge: string;
  h1: string;
  dek: string;
  readTime: string;
  lastUpdated: string;
  heroImage?: { src: string; alt: string };
  blocks: GuideBlock[];
  ctaHeading: string;
  ctaText: string;
  ctaButtonText: string;
  ctaUrl: string;
  faqHeading: string;
  faqs: GuideFaq[];
  relatedHeading: string;
  related: GuideRelated[];
  disclosureText: string;
}

/**
 * Multi-locale source-of-truth for a guide's content. Pages author this
 * shape (each field keyed by locale, matching the Record<Locale, string>
 * pattern used elsewhere for translated content, e.g. PartnerMeta.blurb in
 * data/partners.ts) and resolve it to a GuideArticleData at render time via
 * resolveGuideContent(). `related` is intentionally excluded here — it's
 * locale-dependent only in its hrefs/labels, computed per-request from the
 * GUIDES registry, and passed into resolveGuideContent separately.
 */
export interface GuideArticleI18nData {
  badge: Record<Locale, string>;
  h1: Record<Locale, string>;
  dek: Record<Locale, string>;
  readTime: Record<Locale, string>;
  lastUpdated: string;
  heroImage?: { src: string; alt: Record<Locale, string> };
  blocks: Record<Locale, GuideBlock[]>;
  ctaHeading: Record<Locale, string>;
  ctaText: Record<Locale, string>;
  ctaButtonText: Record<Locale, string>;
  ctaUrl: string;
  faqHeading: Record<Locale, string>;
  faqs: Record<Locale, GuideFaq[]>;
  relatedHeading: Record<Locale, string>;
  disclosureText: Record<Locale, string>;
}

export function resolveGuideContent(
  content: GuideArticleI18nData,
  locale: Locale,
  related: GuideRelated[],
): GuideArticleData {
  return {
    badge: content.badge[locale],
    h1: content.h1[locale],
    dek: content.dek[locale],
    readTime: content.readTime[locale],
    lastUpdated: content.lastUpdated,
    heroImage: content.heroImage
      ? { src: content.heroImage.src, alt: content.heroImage.alt[locale] }
      : undefined,
    blocks: content.blocks[locale],
    ctaHeading: content.ctaHeading[locale],
    ctaText: content.ctaText[locale],
    ctaButtonText: content.ctaButtonText[locale],
    ctaUrl: content.ctaUrl,
    faqHeading: content.faqHeading[locale],
    faqs: content.faqs[locale],
    relatedHeading: content.relatedHeading[locale],
    related,
    disclosureText: content.disclosureText[locale],
  };
}
