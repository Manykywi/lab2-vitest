export type Tier = 'basic' | 'silver' | 'gold';

export interface OrderItem {
  sku: string;
  price: number;
  qty: number;
}

export const TIER_DISCOUNT: Record<Tier, number> = {
  basic: 0,
  silver: 0.05,
  gold: 0.1,
};

export const BIG_ORDER_FROM = 2000;
export const BIG_ORDER_BONUS = 0.05;
export const MAX_DISCOUNT = 0.25;
export const FREE_SHIPPING_FROM = 1000;
export const SHIPPING_FEE = 60;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcSubtotal(items: OrderItem[]): number {
  if (items.length === 0) throw new Error('EMPTY_ORDER');
  return items.reduce((sum, item) => {
    if (item.price < 0) throw new Error('NEGATIVE_PRICE');
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error('INVALID_QTY');
    }
    return sum + item.price * item.qty;
  }, 0);
}

export function calcDiscountRate(
  tier: Tier,
  subtotal: number,
  promoRate = 0,
): number {
  if (promoRate < 0) throw new Error('INVALID_PROMO');
  let rate = TIER_DISCOUNT[tier];
  if (subtotal >= BIG_ORDER_FROM) rate += BIG_ORDER_BONUS;
  return Math.min(rate + promoRate, MAX_DISCOUNT);
}

export function calcShipping(amount: number): number {
  return amount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

export function calcOrderTotal(
  items: OrderItem[],
  tier: Tier,
  promoRate = 0,
): number {
  const subtotal = calcSubtotal(items);
  const rate = calcDiscountRate(tier, subtotal, promoRate);
  const afterDiscount = round2(subtotal * (1 - rate));
  return round2(afterDiscount + calcShipping(afterDiscount));
}

// ---------------------------------------------------------------------------
// Частина 2. Варіант 6: тарифікація доставки за вагою
// ---------------------------------------------------------------------------

/** Верхні межі діапазонів ваги (кг, включно) і тарифи (грн). */
export const WEIGHT_TIERS: ReadonlyArray<{ upTo: number; fee: number }> = [
  { upTo: 5, fee: 50 },
  { upTo: 15, fee: 90 },
  { upTo: 30, fee: 150 },
];

/** Надбавка за кожен розпочатий кілограм понад 30 кг. */
export const OVERWEIGHT_LIMIT = 30;
export const OVERWEIGHT_FEE_PER_KG = 10;

/**
 * Тарифікація доставки за вагою посилки (кг):
 *   0 < вага ≤ 5   → 50 грн
 *   5 < вага ≤ 15  → 90 грн
 *   15 < вага ≤ 30 → 150 грн
 *   вага > 30      → 150 грн + 10 грн за кожен розпочатий кг понад 30
 * Помилка: INVALID_WEIGHT — вага не додатна або не є скінченним числом.
 */
export function calcShippingByWeight(weight: number): number {
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error('INVALID_WEIGHT');
  }
  for (const tier of WEIGHT_TIERS) {
    if (weight <= tier.upTo) return tier.fee;
  }
  const extraKg = Math.ceil(weight - OVERWEIGHT_LIMIT);
  return WEIGHT_TIERS[WEIGHT_TIERS.length - 1].fee + extraKg * OVERWEIGHT_FEE_PER_KG;
}
