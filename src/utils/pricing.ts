import { MODEL_BY_ID } from '../data/models';
import { PRODUCT_BY_ID } from '../data/products';
import { BagItem, ShowroomPricingConfig } from '../types/showroom';

export function formatPrice(amount: number, currencySymbol = '$'): string {
  const fixed = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2);
  return `${currencySymbol}${fixed}`;
}

export function formatReceiptPrice(amount: number, currencySymbol = '$'): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}

export interface LookPricingSummary {
  subtotal: number;
  discountAmount: number;
  total: number;
  discountApplied: boolean;
}

/**
 * Calculates pricing for a complete multi-piece look.
 * Full-look discount is strictly driven by the external ShowroomPricingConfig.
 */
export function calculateLookPricing(
  productIds: string[],
  config: ShowroomPricingConfig,
): LookPricingSummary {
  const subtotal = productIds.reduce((sum, id) => {
    const product = PRODUCT_BY_ID[id];
    return sum + (product ? product.price : 0);
  }, 0);

  const discountApplied =
    config.enableFullLookDiscount && config.fullLookDiscountRate > 0 && productIds.length >= 2;
  const discountAmount = discountApplied
    ? Math.round(subtotal * config.fullLookDiscountRate * 100) / 100
    : 0;
  const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  return { subtotal, discountAmount, total, discountApplied };
}

export interface BagPricingSummary {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  completedLookTitles: string[];
}

/**
 * Calculates bag subtotal and optional configurable full-look savings
 * whenever all pieces of a look are present in the bag.
 */
export function calculateBagPricing(
  bagItems: BagItem[],
  config: ShowroomPricingConfig,
): BagPricingSummary {
  const itemCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bagItems.reduce((sum, item) => {
    const product = PRODUCT_BY_ID[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  let discountAmount = 0;
  const completedLookTitles: string[] = [];

  if (config.enableFullLookDiscount && config.fullLookDiscountRate > 0) {
    Object.values(MODEL_BY_ID).forEach((look) => {
      const countsPerPiece = look.productIds.map((pid) =>
        bagItems
          .filter((item) => item.productId === pid)
          .reduce((acc, item) => acc + item.quantity, 0),
      );
      const completeSets = Math.min(...countsPerPiece);
      if (completeSets > 0) {
        const oneLookSubtotal = look.productIds.reduce(
          (sum, pid) => sum + (PRODUCT_BY_ID[pid]?.price ?? 0),
          0,
        );
        discountAmount += oneLookSubtotal * config.fullLookDiscountRate * completeSets;
        completedLookTitles.push(`${look.indexNumber} ${look.title}`);
      }
    });
  }

  discountAmount = Math.round(discountAmount * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  return {
    itemCount,
    subtotal,
    discountAmount,
    total,
    completedLookTitles,
  };
}
