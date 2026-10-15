import type { Translator } from "../i18n/utils";

// Bump whenever the $50/mo or $500/yr subscription price changes.
const OFFER_VALID_FROM = "2026-07-23";

/**
 * Shared fields for every "Offer" on the PickMyTrade subscription. Spread into
 * each offers object alongside price/priceCurrency/availability/etc.
 *
 * Deliberately does NOT carry shippingDetails or hasMerchantReturnPolicy.
 * Those are merchandise properties: they parse without error on any Offer, but
 * the entity here is a SoftwareApplication, not a Product, so they can never
 * power Google's merchant shipping/return enhancements — and asserting a US-only
 * shipping destination and a 7-day return window for a global cloud
 * subscription that ships nothing contradicted the site's own stated terms
 * (7-day free trial, no separate return policy). Any real cancellation/refund
 * terms belong in page copy, not in MerchantReturnPolicy markup.
 */
export const subscriptionOfferExtras = {
  "validFrom": OFFER_VALID_FROM,
};

/**
 * FAQPage JSON-LD for the pricing page's visible 6-question FAQ section, built
 * from the same `pricing.faq_*` keys the page renders so schema and DOM never
 * drift apart.
 */
export function pricingFaq(t: Translator) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": t("pricing.faq_1_q"), "acceptedAnswer": { "@type": "Answer", "text": t("pricing.faq_1_a") } },
      { "@type": "Question", "name": t("pricing.faq_2_q"), "acceptedAnswer": { "@type": "Answer", "text": t("pricing.faq_2_a") } },
      { "@type": "Question", "name": t("pricing.faq_3_q"), "acceptedAnswer": { "@type": "Answer", "text": t("pricing.faq_3_a") } },
      { "@type": "Question", "name": t("pricing.faq_4_q"), "acceptedAnswer": { "@type": "Answer", "text": t("pricing.faq_4_a") } },
      { "@type": "Question", "name": t("pricing.faq_5_q"), "acceptedAnswer": { "@type": "Answer", "text": `${t("pricing.faq_5_a_pre")}${t("pricing.faq_5_a_link")}${t("pricing.faq_5_a_post")}` } },
      { "@type": "Question", "name": t("pricing.faq_6_q"), "acceptedAnswer": { "@type": "Answer", "text": t("pricing.faq_6_a") } },
    ],
  };
}
