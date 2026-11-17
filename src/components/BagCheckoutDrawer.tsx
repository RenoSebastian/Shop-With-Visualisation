import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Minus, Plus, Trash2, X } from 'lucide-react';
import { MODEL_BY_ID } from '../data/models';
import { PRODUCT_BY_ID } from '../data/products';
import { useShowroomStore } from '../store/useShowroomStore';
import { calculateBagPricing, formatReceiptPrice } from '../utils/pricing';
import { PurchaseBarcode } from './PurchaseBarcode';

interface BagCheckoutDrawerProps {
  isMobile?: boolean;
}

export const BagCheckoutDrawer: React.FC<BagCheckoutDrawerProps> = ({
  isMobile = false,
}) => {
  const {
    bagOpen,
    bagItems,
    pricingConfig,
    lastOrderReceipt,
    toggleBag,
    updateBagItemQuantity,
    removeBagItem,
    toggleFullLookDiscount,
    completePurchase,
    clearReceipt,
  } = useShowroomStore();

  const summary = calculateBagPricing(bagItems, pricingConfig);

  return (
    <AnimatePresence>
      {bagOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => toggleBag(false)}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
          />

          <motion.aside
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 290, damping: 32 }}
            aria-label="Shopping Bag"
            className={
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] rounded-t-2xl bg-white border-t border-[#E2E2E2] shadow-2xl flex flex-col overflow-hidden'
                : 'fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px] bg-white border-l border-[#E2E2E2] flex flex-col justify-between p-6 overflow-y-auto'
            }
          >
            {isMobile && (
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 bg-[#D4D4D4] rounded-full" />
              </div>
            )}

            <div
              className={
                isMobile
                  ? 'flex-1 overflow-y-auto px-5 pt-2 pb-[max(1.1rem,env(safe-area-inset-bottom))] flex flex-col justify-between gap-4'
                  : 'flex flex-col justify-between flex-1'
              }
            >
              {lastOrderReceipt ? (
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#EAEAEA]">
                      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase">
                        <Check className="w-3.5 h-3.5" />
                        <span>ORDER CONFIRMED</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBag(false)}
                        aria-label="Close receipt"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-5 text-center pb-5 border-b border-dashed border-[#DCDCDC]">
                      <div className="font-display text-xl font-medium tracking-[-0.02em]">
                        OFFLINE<span className="align-super text-[10px]">*</span>
                      </div>
                      <div className="mt-1 font-mono text-[9.5px] tracking-[0.14em] text-[#737373] uppercase">
                        {pricingConfig.storeLocationLabel}
                      </div>
                      <div className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase">
                        REF #{lastOrderReceipt.orderNumber} · {lastOrderReceipt.createdAt}
                      </div>
                    </div>

                    <div className="mt-4 divide-y divide-[#F0F0F0]">
                      {lastOrderReceipt.items.map((item, idx) => (
                        <div
                          key={`${item.productId}-${item.size}-${idx}`}
                          className="py-2.5 flex items-start justify-between gap-3 text-[11px]"
                        >
                          <div>
                            <div className="font-medium text-[#111111] uppercase">
                              {item.name}
                            </div>
                            <div className="font-mono text-[9.5px] text-[#737373] uppercase mt-0.5">
                              LOOK {item.lookIndex} · SIZE {item.size} · QTY {item.quantity}
                            </div>
                          </div>
                          <span className="font-mono text-[#111111] tabular-nums">
                            {formatReceiptPrice(
                              item.unitPrice * item.quantity,
                              pricingConfig.currencySymbol,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EAEAEA] space-y-1.5 font-mono text-[10px] tracking-[0.08em] uppercase">
                      <div className="flex justify-between text-[#737373]">
                        <span>SUBTOTAL</span>
                        <span className="tabular-nums">
                          {formatReceiptPrice(
                            lastOrderReceipt.subtotal,
                            pricingConfig.currencySymbol,
                          )}
                        </span>
                      </div>
                      {lastOrderReceipt.discountAmount > 0 && (
                        <div className="flex justify-between text-[#737373]">
                          <span>{pricingConfig.fullLookDiscountLabel}</span>
                          <span className="tabular-nums">
                            -
                            {formatReceiptPrice(
                              lastOrderReceipt.discountAmount,
                              pricingConfig.currencySymbol,
                            )}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-[#EAEAEA] flex items-baseline justify-between text-[#111111]">
                        <span>TOTAL</span>
                        <span className="font-display text-2xl font-normal tabular-nums">
                          {formatReceiptPrice(
                            lastOrderReceipt.total,
                            pricingConfig.currencySymbol,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-dashed border-[#DCDCDC]">
                    <PurchaseBarcode
                      referenceValue={lastOrderReceipt.barcodeValue}
                      caption="ORDER REFERENCE · DEMO"
                      height={42}
                    />
                    <p className="mt-3 text-center font-mono text-[9px] tracking-[0.16em] text-[#737373] uppercase">
                      {pricingConfig.receiptFooterNote}
                    </p>
                    <button
                      type="button"
                      onClick={clearReceipt}
                      className="mt-4 w-full min-h-[46px] bg-[#111111] hover:bg-[#262626] text-white font-mono text-[10px] tracking-[0.14em] uppercase cursor-pointer transition-colors"
                    >
                      RETURN TO SHOWROOM
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#EAEAEA]">
                      <div className="font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase">
                        SHOPPING BAG ({summary.itemCount})
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBag(false)}
                        aria-label="Close Bag"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {bagItems.length === 0 ? (
                      <div className="py-12 sm:py-16 text-center">
                        <p className="font-mono text-[10px] tracking-[0.14em] text-[#737373] uppercase">
                          YOUR BAG IS CURRENTLY EMPTY
                        </p>
                        <p className="mt-2 text-xs text-[#666666]">
                          Select any model in the showroom and tap a garment dot to add pieces.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 divide-y divide-[#EAEAEA]">
                        {bagItems.map((item) => {
                          const product = PRODUCT_BY_ID[item.productId];
                          const look = MODEL_BY_ID[item.lookId];
                          if (!product) return null;

                          return (
                            <div key={item.id} className="py-3.5 flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-12 h-14 bg-[#F2F2F2] border border-[#EAEAEA] p-1 shrink-0 flex items-center justify-center">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                    draggable={false}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] font-medium tracking-[0.04em] text-[#111111] uppercase truncate">
                                    {product.name}
                                  </div>
                                  <div className="mt-0.5 font-mono text-[9.5px] tracking-[0.08em] text-[#737373] uppercase">
                                    {look ? `${look.indexNumber} ${look.title}` : product.category} · SIZE{' '}
                                    {item.size}
                                  </div>
                                  <div className="mt-2.5 flex items-center gap-2">
                                    <div className="inline-flex items-center border border-[#DCDCDC]">
                                      <button
                                        type="button"
                                        onClick={() => updateBagItemQuantity(item.id, -1)}
                                        aria-label="Decrease quantity"
                                        className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center text-[#555555] hover:text-[#111111] cursor-pointer"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-7 md:w-6 text-center font-mono text-[10px] tabular-nums">
                                        {item.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => updateBagItemQuantity(item.id, 1)}
                                        aria-label="Increase quantity"
                                        className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center text-[#555555] hover:text-[#111111] cursor-pointer"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeBagItem(item.id)}
                                      aria-label={`Remove ${product.name}`}
                                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#888888] hover:text-[#111111] cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <span className="font-mono text-[11px] text-[#111111] tabular-nums shrink-0">
                                {formatReceiptPrice(
                                  product.price * item.quantity,
                                  pricingConfig.currencySymbol,
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {bagItems.length > 0 && (
                    <div className="pt-4 border-t border-[#E4E4E4]">
                      <div className="space-y-1.5 font-mono text-[10px] tracking-[0.08em] uppercase">
                        <div className="flex justify-between text-[#737373]">
                          <span>SUBTOTAL</span>
                          <span className="tabular-nums">
                            {formatReceiptPrice(summary.subtotal, pricingConfig.currencySymbol)}
                          </span>
                        </div>

                        <div className="flex justify-between text-[#737373]">
                          <button
                            type="button"
                            onClick={toggleFullLookDiscount}
                            className="text-left hover:text-[#111111] underline decoration-dotted underline-offset-2 cursor-pointer"
                          >
                            {pricingConfig.enableFullLookDiscount
                              ? pricingConfig.fullLookDiscountLabel
                              : 'FULL LOOK BUNDLE (OFF)'}
                          </button>
                          <span className="tabular-nums">
                            {summary.discountAmount > 0
                              ? `-${formatReceiptPrice(summary.discountAmount, pricingConfig.currencySymbol)}`
                              : formatReceiptPrice(0, pricingConfig.currencySymbol)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#EAEAEA] flex items-baseline justify-between">
                        <span className="font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase">
                          TOTAL
                        </span>
                        <span className="font-display text-2xl font-normal text-[#111111] tabular-nums">
                          {formatReceiptPrice(summary.total, pricingConfig.currencySymbol)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={completePurchase}
                        className="mt-4 w-full min-h-[46px] bg-[#111111] hover:bg-[#262626] text-white font-mono text-[10px] tracking-[0.14em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>GENERATE ORDER RECEIPT</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="mt-5 pt-4 border-t border-dashed border-[#DCDCDC]">
                        <PurchaseBarcode
                          referenceValue={`BAG-${summary.itemCount}PCS-${Math.round(summary.total)}`}
                          caption="PREVIEW REFERENCE · DEMO"
                          height={32}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
