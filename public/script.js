// UTM parameter capture — first-touch attribution stored as cookie
(function () {
    var params = new URLSearchParams(window.location.search);
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var captured = {};

    utmKeys.forEach(function (key) {
        var val = params.get(key);
        if (val) captured[key] = val;
    });

    var host = window.location.hostname;
    var isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
    var isLocal = host === 'localhost';

    if (!captured.utm_source) {
        if (document.cookie.indexOf('pmt_utm=') !== -1) {
            var expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
            // Clear without domain (covers cookies set on exact hostname)
            document.cookie = 'pmt_utm=; ' + expiry + '; path=/; SameSite=Lax';
            // Clear with root domain (covers cookies set with domain= attribute)
            if (!isIp && !isLocal) {
                var hp = host.split('.');
                var clearDomain = hp.length >= 2 ? '.' + hp.slice(-2).join('.') : host;
                document.cookie = 'pmt_utm=; ' + expiry + '; path=/; domain=' + clearDomain + '; SameSite=Lax';
            }
        }
        return;
    }

    var expires = new Date();
    expires.setDate(expires.getDate() + 30);

    var cookieParts = [
        'pmt_utm=' + encodeURIComponent(JSON.stringify(captured)),
        'expires=' + expires.toUTCString(),
        'path=/'
    ];

    if (!isIp && !isLocal) {
        var parts = host.split('.');
        var rootDomain = parts.length >= 2 ? '.' + parts.slice(-2).join('.') : host;
        cookieParts.push('domain=' + rootDomain);
    }

    cookieParts.push('SameSite=Lax');
    document.cookie = cookieParts.join('; ');
})();

const referralCode = new URLSearchParams(window.location.search).get('ref');

if (referralCode) {
  document.cookie = `referral=${referralCode}; domain=.pickmytrade.trade; max-age=432000;`;
}

// NOTE: Banner / sale-countdown logic lives in BaseLayout.astro (single source of truth,
// end date 2026-07-15). It used to be duplicated here with a stale end date, which made the
// home page hide the banner on load while every other page kept it visible. Do not re-add it.

// Dynamic Pricing System
async function loadPricingConfig() {
  try {
    const response = await fetch('/pricing-config.json');
    if (!response.ok) throw new Error('Failed to load pricing config');
    return await response.json();
  } catch (error) {
    console.error('Error loading pricing config:', error);
    return null;
  }
}

// Whether the sale is currently live. The cutover date is the single source of
// truth in src/data/sale.ts, exposed as window.SALE_END (epoch ms) by BaseLayout.
// When the sale ends, prices automatically revert from `price` (sale) to
// `originalPrice` (regular). Falls back to the config date, then fails open.
function isSaleActive(config) {
  if (config && config.sale && config.sale.active === false) return false;
  var end = typeof window.SALE_END === 'number'
    ? window.SALE_END
    : (config && config.sale && config.sale.endDate ? new Date(config.sale.endDate).getTime() : null);
  return end == null ? true : Date.now() < end;
}

function calculateDiscount(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return null;
  const savings = originalPrice - price;
  const percentage = ((savings / originalPrice) * 100).toFixed(2);
  return { savings, percentage };
}

// Number of whole months a plan's period covers, or null if the period isn't a
// clean multi-month duration (e.g. a day-based trial, or the monthly plan itself).
function getPeriodMonths(period) {
  if (!period) return null;
  const p = period.trim().toLowerCase();
  if (p === 'year' || p === 'annual' || p === 'years') return 12;
  if (p === 'month' || p === 'monthly') return 1;

  let m = p.match(/^(\d+)\s*months?$/);
  if (m) return parseInt(m[1], 10);

  m = p.match(/^(\d+)\s*days?$/);
  if (m) {
    const days = parseInt(m[1], 10);
    const months = Math.round(days / 30);
    // Only treat it as a clean month-multiple if it's actually close to that
    // many 30-day months (keeps odd trial lengths like "7 days" excluded).
    return Math.abs(days - months * 30) <= 3 ? months : null;
  }

  return null;
}

// Finds the Monthly plan's current price directly from config, so the
// baseline comparison below never hardcodes a dollar amount.
function getMonthlyPlanPrice(config) {
  const monthlyPlan = Object.values(config.plans || {}).find(
    (plan) => getPeriodMonths(plan.period) === 1
  );
  return monthlyPlan ? monthlyPlan.price : null;
}

// What the displayed price works out to per month, for multi-month periods only.
function calculateMonthlyEquivalent(displayPrice, period) {
  const months = getPeriodMonths(period);
  return months != null && months >= 2 ? (displayPrice / months).toFixed(2) : null;
}

function renderPricingCard(plan, isHighlighted, saleActive, monthlyPrice) {
  // During the sale show the discounted `price` with `originalPrice` struck through.
  // Once the sale ends, fall back to the plan's everyday regular price (regularPrice),
  // then originalPrice, then price — first one present wins.
  const onSale = saleActive && plan.originalPrice != null && plan.originalPrice > plan.price;
  const displayPrice = onSale
    ? plan.price
    : (plan.regularPrice != null ? plan.regularPrice : (plan.originalPrice != null ? plan.originalPrice : plan.price));

  // comparisonPrice is the struck-through figure shown next to displayPrice.
  // - While a sale discounts this specific plan: its own regular/original price (unchanged behavior).
  // - Otherwise (no sale, or this plan has no sale discount of its own): the price the same
  //   duration would cost at the Monthly plan's rate, computed dynamically — never hardcoded.
  let discount = null;
  let comparisonPrice = null;
  if (onSale) {
    discount = calculateDiscount(plan.price, plan.originalPrice);
    comparisonPrice = plan.originalPrice;
  } else {
    const months = getPeriodMonths(plan.period);
    if (months != null && months >= 2 && monthlyPrice != null) {
      const baseline = monthlyPrice * months;
      discount = calculateDiscount(displayPrice, baseline);
      comparisonPrice = baseline;
    }
  }

  const monthlyEquiv = calculateMonthlyEquivalent(displayPrice, plan.period);

  // Badge HTML
  let badgeHtml = '';
  if (plan.badge) {
    if (plan.badge.type === 'ribbon') {
      badgeHtml = `
        <div class="absolute -right-10 top-10 rotate-45 bg-gradient-to-r from-red-400 to-red-600 text-white text-xs font-bold py-1 px-12 shadow-lg z-10">
          ${plan.badge.text}
        </div>`;
    } else if (plan.badge.type === 'pill') {
      badgeHtml = `
        <div class="absolute top-4 right-4 z-10">
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            ${plan.badge.icon ? `<i class="fas ${plan.badge.icon}"></i> ` : ''}${plan.badge.text}
          </div>
        </div>`;
    }
  }

  // Discount HTML
  let discountHtml = '';
  if (discount && !onSale) {
    // FE-16: no struck-through anchors or SAVE % badges outside a live sale —
    // the old baseline (monthly x months, e.g. $600) is not a price PMT sells.
    // State the real saving in plain text instead.
    const periodWord = plan.period === 'year' ? 'year' : 'quarter';
    const cls = isHighlighted ? 'text-green-300' : 'text-green-600';
    discountHtml = `
        <p class="text-sm ${cls} font-semibold mt-2">
          $${displayPrice} per ${periodWord}. That is $${discount.savings} less than paying monthly.
        </p>`;
  } else if (discount) {
    if (isHighlighted) {
      discountHtml = `
        <div class="flex items-center gap-2 mb-2">
          <span class="text-white/60 line-through text-sm">$${comparisonPrice}</span>
          <span class="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
            SAVE ${discount.percentage}%
          </span>
        </div>
        <p class="text-sm text-green-300 font-semibold mt-2">
          <i class="fas fa-piggy-bank"></i> You save $${discount.savings} ${plan.period === 'year' ? 'annually' : ''}
        </p>`;
      if (monthlyEquiv) {
        discountHtml += `
          <p class="text-xs text-green-300 font-semibold mt-1">
            Just $${monthlyEquiv}/month when billed ${plan.period === 'year' ? 'annually' : 'quarterly'}
          </p>`;
      }
    } else {
      discountHtml = `
        <div class="flex items-center gap-2 mb-2">
          <span class="text-gray-400 line-through text-sm">$${comparisonPrice}</span>
          <span class="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            SAVE ${discount.percentage}%
          </span>
        </div>
        <p class="text-sm text-green-600 font-bold mt-2">
          <i class="fas fa-piggy-bank"></i> You save $${discount.savings}
        </p>`;
    }
  }

  // Billing note
  let billingNoteHtml = '';
  if (plan.billingNote) {
    if (plan.price === 0) {
      billingNoteHtml = `<p class="text-sm text-green-600 font-semibold mt-2"><i class="fas fa-gift"></i> ${plan.billingNote}</p>`;
    } else {
      billingNoteHtml = `<p class="text-sm text-gray-600 mt-2">${plan.billingNote}</p>`;
    }
  }

  // Features HTML
  const featuresHtml = plan.features.map(feature => {
    const isUnlimitedAccounts = feature === 'Unlimited Accounts';
    const featureContent = isUnlimitedAccounts ? `
      <div class="flex items-center gap-2">
        <span class="${isHighlighted ? 'text-white text-sm font-medium' : 'text-gray-700 text-sm'}">${feature}</span>
        <div class="relative group/tooltip">
          <i class="fas fa-info-circle ${isHighlighted ? 'text-white/60' : 'text-gray-400'} text-xs cursor-help"></i>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
            Unlimited sub-accounts under one prop firm login
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      </div>` : `<span class="${isHighlighted ? 'text-white text-sm font-medium' : 'text-gray-700 text-sm'}">${feature}</span>`;

    if (isHighlighted) {
      return `
        <div class="flex items-start gap-3">
          <div class="mt-1 w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <i class="fas fa-check text-white text-xs"></i>
          </div>
          ${featureContent}
        </div>`;
    } else if (plan.price === 0) {
      return `
        <div class="flex items-start gap-3">
          <div class="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-check text-green-600 text-xs"></i>
          </div>
          ${featureContent}
        </div>`;
    } else {
      return `
        <div class="flex items-start gap-3">
          <div class="mt-1 w-5 h-5 rounded-full bg-[#0084d1]/20 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-check text-[#0084d1] text-xs"></i>
          </div>
          ${featureContent}
        </div>`;
    }
  }).join('');

  // Card styles based on highlight
  let cardClasses, bgPattern, priceClasses, buttonClasses;
  if (isHighlighted) {
    cardClasses = 'bg-gradient-to-br from-[#0084d1] via-[#0055FE] to-[#003d99] border-2 border-[#0084d1] hover:shadow-[#0084d1]/50';
    bgPattern = 'bg-gradient-to-br from-white/10 to-transparent';
    priceClasses = 'text-white';
    buttonClasses = 'bg-white hover:bg-gray-100 text-[#0084d1] font-bold';
  } else if (plan.price === 0) {
    cardClasses = 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-[#0084d1]/50';
    bgPattern = 'bg-gradient-to-br from-[#0084d1]/5 to-transparent';
    priceClasses = 'text-gray-900';
    buttonClasses = 'bg-gradient-to-r from-[#0084d1] to-[#0055FE] hover:from-[#0055FE] hover:to-[#0084d1] text-white font-semibold';
  } else {
    cardClasses = 'bg-gradient-to-br from-white to-blue-50 border-2 border-[#0084d1]/30 hover:border-[#0084d1]';
    bgPattern = 'bg-gradient-to-br from-[#0084d1]/10 to-transparent';
    priceClasses = 'bg-gradient-to-r from-[#0084d1] to-[#0055FE] bg-clip-text text-transparent';
    buttonClasses = 'bg-gradient-to-r from-[#0084d1] to-[#0055FE] hover:from-[#0055FE] hover:to-[#0084d1] text-white font-bold';
  }

  // Icon container styles
  let iconContainerClasses, iconClasses;
  if (isHighlighted) {
    iconContainerClasses = 'bg-white/20 backdrop-blur-sm';
    iconClasses = plan.icon === 'fa-star' ? 'text-yellow-300' : 'text-white';
  } else if (plan.price === 0) {
    iconContainerClasses = 'bg-gradient-to-br from-gray-100 to-gray-200';
    iconClasses = 'text-gray-600';
  } else {
    iconContainerClasses = 'bg-gradient-to-br from-[#0084d1]/20 to-[#0084d1]/40';
    iconClasses = 'text-[#0084d1]';
  }

  return `
    <div class="group relative rounded-2xl min-w-[320px] max-w-[380px] ${cardClasses} transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden">
      ${badgeHtml}
      <div class="absolute inset-0 ${bgPattern} opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative p-8">
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-10 h-10 rounded-lg ${iconContainerClasses} flex items-center justify-center">
              <i class="fas ${plan.icon} ${iconClasses} text-lg"></i>
            </div>
            <h3 class="text-2xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}">${plan.name}</h3>
          </div>
          <p class="${isHighlighted ? 'text-white/80' : 'text-gray-600'} text-sm">${plan.description}</p>
        </div>
        <div class="mb-8">
          <div class="flex items-baseline gap-2 ${discount ? 'mb-2' : ''}">
            <span class="text-5xl font-bold ${priceClasses}">$${displayPrice}</span>
            <span class="${isHighlighted ? 'text-white/80' : 'text-gray-500'} font-medium">${plan.periodLabel}</span>
          </div>
          ${discountHtml}
          ${billingNoteHtml}
        </div>
        <div class="space-y-4 mb-8">
          ${featuresHtml}
        </div>
        <a href="${plan.ctaUrl}" ${plan.buttonId ? `id="${plan.buttonId}"` : ''}
          class="block w-full py-3 px-6 ${buttonClasses} rounded-xl text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${isHighlighted ? 'shadow-lg' : ''}">
          ${plan.buttonText}
          <i class="fas ${plan.buttonIcon} ml-2"></i>
        </a>
      </div>
    </div>`;
}

async function renderPricingSection() {
  const config = await loadPricingConfig();
  if (!config) return;

  const container = document.getElementById('pricing-cards-container');
  if (!container) return;

  // Sale state is resolved once so every card agrees. Order and highlight swap to
  // their originalOrder/originalHighlight values once the sale ends.
  const saleActive = isSaleActive(config);
  const effectiveOrder = (plan) =>
    !saleActive && plan.originalOrder != null ? plan.originalOrder : plan.order;
  const effectiveHighlight = (plan) =>
    !saleActive && plan.originalHighlight != null ? plan.originalHighlight : plan.highlight;

  // Sort enabled plans by their effective (sale-aware) order
  const sortedPlans = Object.entries(config.plans)
    .filter(([_, plan]) => plan.enabled)
    .sort((a, b) => effectiveOrder(a[1]) - effectiveOrder(b[1]));

  const monthlyPrice = getMonthlyPlanPrice(config);

  const cardsHtml = sortedPlans
    .map(([_, plan]) => renderPricingCard(plan, effectiveHighlight(plan), saleActive, monthlyPrice))
    .join('');

  container.innerHTML = cardsHtml;

  // Update countdown target if sale is active
  if (config.sale?.active && config.sale.endDate) {
    window.saleEndDate = new Date(config.sale.endDate).getTime();
  }
}

// Load pricing on DOM ready
document.addEventListener('DOMContentLoaded', renderPricingSection);

const faqs = document.querySelectorAll(".faq-item");
const allAnswers = document.querySelectorAll(".faq-answer");
const allFaqIcons = document.querySelectorAll(".faq-icon");

faqs.forEach(faq => {
  const question = faq.querySelector(".faq-question");
  const answer = faq.querySelector(".faq-answer");

  question.addEventListener("click", () => {
    const isActive = answer.classList.contains("active");

    // Close all
    allAnswers.forEach(item => item.classList.remove("active"));
    allFaqIcons.forEach(item => item.classList.remove("active"));

    // If the clicked one was not active, open it
    if (!isActive) {
      answer.classList.add("active");
      question.querySelector(".faq-icon").classList.add("active");
    }
  });
});
