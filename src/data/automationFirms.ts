/**
 * The /automation/tradovate-to-<firm>-automation/ template family.
 *
 * Single source of truth for the family's internal linking. Each entry maps the
 * page slug to the shared `automation.<nameKey>` translation key, plus the
 * matching /copier/ slug where that firm also has a copier page.
 *
 * Bulenox is deliberately absent: it has a copier page but no automation page.
 */
export interface AutomationFirm {
  /** Slug under /automation/, without the directory prefix. */
  slug: string;
  /** Key inside the `automation` translation namespace holding the firm name. */
  nameKey: string;
  /** Matching slug under /copier/, or null when the firm has no copier page. */
  copierSlug: string | null;
}

export const AUTOMATION_FIRMS: AutomationFirm[] = [
  {
    slug: "tradovate-to-apex-trader-funding-automation",
    nameKey: "apex_name",
    copierSlug: "tradovate-to-apex-trader-funding-copier",
  },
  {
    slug: "tradovate-to-blue-guardian-futures-automation",
    nameKey: "blue_guardian_name",
    copierSlug: "tradovate-to-blue-guardian-futures-copier",
  },
  {
    slug: "tradovate-to-fundednext-futures-automation",
    nameKey: "fundednext_name",
    copierSlug: "tradovate-to-fundednext-futures-copier",
  },
  {
    slug: "tradovate-to-my-funded-futures-automation",
    nameKey: "myfunded_name",
    copierSlug: "tradovate-to-my-funded-futures-copier",
  },
  {
    slug: "tradovate-to-take-profit-trader-automation",
    nameKey: "take_profit_name",
    copierSlug: "tradovate-to-take-profit-trader-copier",
  },
  {
    slug: "tradovate-to-top-one-futures-automation",
    nameKey: "top_one_name",
    copierSlug: "tradovate-to-top-one-futures-copier",
  },
  {
    slug: "tradovate-to-tradeday-automation",
    nameKey: "tradeday_name",
    copierSlug: "tradovate-to-tradeday-copier",
  },
  {
    slug: "tradovate-to-tradeify-automation",
    nameKey: "tradeify_name",
    copierSlug: "tradovate-to-tradeify-copier",
  },
];

/** Look up one firm by its /automation/ slug. */
export function findAutomationFirm(slug: string): AutomationFirm | undefined {
  return AUTOMATION_FIRMS.find((f) => f.slug === slug);
}

/**
 * The `count` firms that follow `slug` in list order, wrapping around. Rotating
 * rather than always picking the first N means every page in the family is
 * linked from some sibling instead of the first three absorbing every link.
 */
export function siblingAutomationFirms(slug: string, count = 3): AutomationFirm[] {
  const start = AUTOMATION_FIRMS.findIndex((f) => f.slug === slug);
  if (start === -1) return AUTOMATION_FIRMS.slice(0, count);

  const out: AutomationFirm[] = [];
  for (let i = 1; out.length < count && i < AUTOMATION_FIRMS.length; i++) {
    out.push(AUTOMATION_FIRMS[(start + i) % AUTOMATION_FIRMS.length]);
  }
  return out;
}
