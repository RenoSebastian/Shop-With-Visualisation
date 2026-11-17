import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp, X } from 'lucide-react';
import { OUTFIT_HOTSPOTS } from '../data/outfitConfigurations';
import { PRODUCT_BY_ID } from '../data/products';
import { useShowroomStore } from '../store/useShowroomStore';
import { FashionModelData } from '../types/showroom';
import { calculateLookPricing, formatReceiptPrice } from '../utils/pricing';
import { OutfitSummary } from './OutfitSummary';
import { ShoppingItem } from './ShoppingItem';

interface ShoppingPanelProps {
  model: FashionModelData;
  isMobile: boolean;
  mobileExpanded?: boolean;
  onToggleMobileExpand?: (open: boolean) => void;
}

const ReceiptSawtoothEdge: React.FC = () => (
  <svg
    viewBox="0 0 360 12"
    preserveAspectRatio="none"
    className="w-full h-3 block text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.04)]"
    aria-hidden="true"
  >
    <polygon
      fill="currentColor"
      points="0,0 10,11 20,0 30,11 40,0 50,11 60,0 70,11 80,0 90,11 100,0 110,11 120,0 130,11 140,0 150,11 160,0 170,11 180,0 190,11 200,0 210,11 220,0 230,11 240,0 250,11 260,0 270,11 280,0 290,11 300,0 310,11 320,0 330,11 340,0 350,11 360,0"
    />
  </svg>
);

export const ShoppingPanel: React.FC<ShoppingPanelProps> = ({
  model,
  isMobile,
  mobileExpanded = false,
  onToggleMobileExpand,
}) => {
  const {
    activeHotspotProductId,
    expandedSizeProductId,
    bagItems,
    pricingConfig,
    selectHotspot,
    setExpandedSizeProduct,
    addToBag,
    addFullLookToBag,
    toggleFullLookDiscount,
  } = useShowroomStore();

  const hotspots = OUTFIT_HOTSPOTS[model.id] ?? [];
  const markerByProductId = Object.fromEntries(
    hotspots.map((h) => [h.productId, h.markerNumber]),
  );

  const products = model.productIds
    .map((id) => PRODUCT_BY_ID[id])
    .filter((p) => Boolean(p));

  const lookPricing = calculateLookPricing(model.productIds, pricingConfig);

  const countProductInBag = (productId: string) =>
    bagItems
      .filter((item) => item.productId === productId)
      .reduce((acc, item) => acc + item.quantity, 0);

  if (isMobile) {
    return (
      <>
        {/* Collapsed Peek Bar anchored cleanly in bottom thumb zone */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E2E2] rounded-t-2xl shadow-[0_-8px_28px_rgba(0,0,0,0.08)] px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => onToggleMobileExpand?.(true)}
            aria-label="Expand look receipt sheet"
            className="w-full flex flex-col items-center pb-1.5 cursor-pointer"
          >
            <span className="w-10 h-1 rounded-full bg-[#D4D4D4]" />
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onToggleMobileExpand?.(true)}
              className="text-left min-w-0 flex-1 py-1 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.12em] text-[#737373] uppercase">
                <span>{products.length} PIECES</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-0.5 text-[#111111] font-medium">
                  RECEIPT
                  <ChevronUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-display text-xl font-normal text-[#111111] tabular-nums leading-tight mt-0.5">
                {formatReceiptPrice(lookPricing.total, pricingConfig.currencySymbol)}
              </div>
            </button>

            <button
              type="button"
              onClick={() => addFullLookToBag(model.id)}
              className="min-h-[44px] px-4 rounded-full bg-[#111111] active:scale-[0.98] text-white font-mono text-[10px] tracking-[0.12em] uppercase transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              ADD FULL LOOK
            </button>
          </div>
        </div>

        {/* Expanded Slide-Up Thermal Receipt Bottom Sheet */}
        <AnimatePresence>
          {mobileExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => onToggleMobileExpand?.(false)}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
              />

              <motion.section
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 290, damping: 32 }}
                aria-label="Look receipt details"
                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[82dvh] flex flex-col shadow-2xl"
              >
                <div className="px-5 pt-3 pb-3 border-b border-dashed border-[#D6D6D6] shrink-0">
                  <div className="w-10 h-1 rounded-full bg-[#D4D4D4] mx-auto mb-3" />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[9.5px] tracking-[0.14em] text-[#737373] uppercase">
                        LOOK {model.indexNumber} — {model.title}
                      </div>
                      <div className="font-display text-lg font-light text-[#111111]">
                        OFFLINE<span className="align-super text-[9px]">*</span> RECEIPT
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleMobileExpand?.(false)}
                      aria-label="Collapse receipt sheet"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                  {products.map((product) => (
                    <ShoppingItem
                      key={product.id}
                      product={product}
                      markerNumber={markerByProductId[product.id] ?? product.markerNumber}
                      isHighlighted={activeHotspotProductId === product.id}
                      isSizeExpanded={expandedSizeProductId === product.id}
                      inBagCount={countProductInBag(product.id)}
                      currencySymbol={pricingConfig.currencySymbol}
                      onHighlight={() => selectHotspot(product.id)}
                      onToggleExpandSize={() => setExpandedSizeProduct(product.id)}
                      onAddSize={(size) => addToBag(product.id, model.id, size)}
                    />
                  ))}

                  <OutfitSummary
                    lookIndexNumber={model.indexNumber}
                    lookTitle={model.title}
                    pricing={lookPricing}
                    config={pricingConfig}
                    onAddFullLook={() => addFullLookToBag(model.id)}
                    onToggleDiscountRule={toggleFullLookDiscount}
                    compact
                  />
                </div>
              </motion.section>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <aside className="relative z-30 w-[340px] lg:w-[365px] h-full py-3 pr-4 pl-1 flex flex-col justify-start shrink-0 pointer-events-none">
      <div className="pointer-events-auto flex flex-col max-h-full overflow-y-auto scrollbar-hide drop-shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <div className="bg-white px-6 pt-6 pb-4">
          <div className="pb-4 border-b border-dashed border-[#D6D6D6] text-center">
            <div className="font-display text-2xl tracking-[-0.02em] font-light text-[#111111]">
              OFFLINE<span className="align-super text-[10px]">*</span>
            </div>
            <div className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#737373] uppercase">
              {pricingConfig.storeLocationLabel}
            </div>
            <div className="mt-0.5 font-mono text-[9px] tracking-[0.14em] text-[#111111] uppercase">
              LOOK {model.indexNumber} — {model.title}
            </div>
          </div>

          <div className="mt-1">
            {products.map((product) => (
              <ShoppingItem
                key={product.id}
                product={product}
                markerNumber={markerByProductId[product.id] ?? product.markerNumber}
                isHighlighted={activeHotspotProductId === product.id}
                isSizeExpanded={expandedSizeProductId === product.id}
                inBagCount={countProductInBag(product.id)}
                currencySymbol={pricingConfig.currencySymbol}
                onHighlight={() => selectHotspot(product.id)}
                onToggleExpandSize={() => setExpandedSizeProduct(product.id)}
                onAddSize={(size) => addToBag(product.id, model.id, size)}
              />
            ))}
          </div>

          <OutfitSummary
            lookIndexNumber={model.indexNumber}
            lookTitle={model.title}
            pricing={lookPricing}
            config={pricingConfig}
            onAddFullLook={() => addFullLookToBag(model.id)}
            onToggleDiscountRule={toggleFullLookDiscount}
          />
        </div>
        <ReceiptSawtoothEdge />
      </div>
    </aside>
  );
};
