import pricingRaw from "../../public/pricing-config.json";

export const pricingConfig = pricingRaw;

export type PricingPlan = {
  enabled: boolean;
  order: number;
  // Post-sale overrides — used once the sale ends; fall back to order/highlight when null/absent.
  originalOrder?: number | null;
  originalHighlight?: boolean | null;
  name: string;
  description: string;
  icon: string;
  price: number;
  originalPrice: number | null;
  period: string;
  periodLabel: string;
  badge: { text: string; type: string; icon?: string } | null;
  highlight: boolean;
  buttonText: string;
  buttonIcon: string;
  buttonId?: string;
  ctaUrl: string;
  billingNote: string | null;
  features: string[];
};
