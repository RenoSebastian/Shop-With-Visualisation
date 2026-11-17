import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { OUTFIT_HOTSPOTS } from '../data/outfitConfigurations';
import { PRODUCT_BY_ID } from '../data/products';
import { catalogRepository } from '../engine/catalogRepository';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useShowroomStore } from '../store/useShowroomStore';
import { FashionModelData } from '../types/showroom';
import { formatPrice } from '../utils/pricing';
import { ModelHotspot } from './ModelHotspot';
import { ShoppingPanel } from './ShoppingPanel';

interface ModelDetailViewProps {
  model: FashionModelData;
  isMobile: boolean;
}

export const ModelDetailView: React.FC<ModelDetailViewProps> = ({ model, isMobile }) => {
  const {
    activeHotspotProductId,
    pricingConfig,
    selectHotspot,
    setExpandedSizeProduct,
    closeIndividualView,
  } = useShowroomStore();
  const { openProductDetail } = useDiscoveryStore();

  const [mobileReceiptOpen, setMobileReceiptOpen] = useState(false);

  const hotspots = OUTFIT_HOTSPOTS[model.id] ?? [];
  const enrichedLook = catalogRepository.getEnrichedLookById(model.id);
  const sharedLayeredProducts = (enrichedLook?.products ?? []).filter(
    (p) => !model.productIds.includes(p.id),
  );
  const stylesLabel = enrichedLook?.optionsByDimension.style
    .slice(0, 3)
    .map((s) => s.label)
    .join(' · ');
  const eraLabel = enrichedLook?.optionsByDimension.era.map((e) => e.label).join(' / ');

  const activeMobileHotspot = activeHotspotProductId
    ? hotspots.find((h) => h.productId === activeHotspotProductId)
    : undefined;
  const activeMobileProduct = activeHotspotProductId
    ? PRODUCT_BY_ID[activeHotspotProductId]
    : undefined;

  return (
    <motion.div
      key={`detail-${model.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      className="relative w-full h-full flex flex-col md:flex-row bg-[#F2F2F2] overflow-hidden"
    >
      {/* Exhibition stage for the selected model */}
      <div
        onClick={() => selectHotspot(null)}
        className={`relative flex-1 h-full flex flex-col items-center justify-center px-4 overflow-hidden ${
          isMobile ? 'pt-14 pb-[88px]' : 'py-10'
        }`}
      >
        {/* Top-left editorial look header + dashed circular close button */}
        <div className="absolute top-14 sm:top-16 left-4 sm:left-8 right-4 sm:right-8 flex items-start justify-between z-20 pointer-events-none">
          <div className="min-w-0 pr-3">
            <h2 className="font-display text-2xl sm:text-4xl font-light tracking-[-0.02em] text-[#111111] truncate">
              <span>{model.indexNumber}. </span>
              <span className="italic">{model.title}</span>
            </h2>
            {(stylesLabel || eraLabel) && (
              <div className="mt-1 font-mono text-[9.5px] tracking-[0.12em] text-[#666666] uppercase truncate">
                {stylesLabel}
                {eraLabel ? ` · ${eraLabel}` : ''}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeIndividualView();
            }}
            aria-label="Close individual look view"
            className="pointer-events-auto w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/80 border border-dashed border-[#A3A3A3] hover:border-solid hover:border-[#111111] flex items-center justify-center text-[#111111] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aspect-locked 3:4 model frame guarantees hotspots stay anchored across resizes */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 190, damping: 24 }}
          className={`relative aspect-[3/4] ${
            isMobile ? 'h-[61vh] max-h-[530px] mt-4' : 'h-[71vh] max-h-[660px]'
          }`}
        >
          <div
            aria-hidden="true"
            className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[38%] h-[3.2%] rounded-full bg-black/14 blur-md pointer-events-none"
          />

          <img
            src={model.imageUrl}
            alt={`Look ${model.indexNumber} ${model.title}`}
            referrerPolicy="no-referrer"
            draggable={false}
            className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          />

          {hotspots.map((hotspot) => {
            const product = PRODUCT_BY_ID[hotspot.productId];
            if (!product) return null;
            return (
              <ModelHotspot
                key={hotspot.productId}
                hotspot={hotspot}
                product={product}
                isActive={activeHotspotProductId === product.id}
                currencySymbol={pricingConfig.currencySymbol}
                onSelect={(pid) =>
                  selectHotspot(activeHotspotProductId === pid ? null : pid)
                }
              />
            );
          })}
        </motion.div>

        {/* Mobile Edge-Safe Docked Garment Preview Card when a Hotspot is tapped */}
        {isMobile && (
          <AnimatePresence mode="wait">
            {activeMobileProduct ? (
              <motion.div
                key={activeMobileProduct.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.16 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-[calc(84px+env(safe-area-inset-bottom))] left-4 right-4 z-20 bg-white/95 backdrop-blur-sm border border-[#111111] px-3 py-2.5 shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-11 h-11 bg-[#F2F2F2] border border-[#EAEAEA] p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={activeMobileProduct.imageUrl}
                      alt={activeMobileProduct.name}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-[#737373] uppercase">
                      <span>{activeMobileHotspot?.markerNumber ?? activeMobileProduct.markerNumber}</span>
                      <span>·</span>
                      <span className="truncate">{activeMobileProduct.materialNote}</span>
                    </div>
                    <div className="text-xs font-medium text-[#111111] uppercase truncate">
                      {activeMobileProduct.name} ·{' '}
                      <span className="font-mono tabular-nums">
                        {formatPrice(activeMobileProduct.price, pricingConfig.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedSizeProduct(activeMobileProduct.id);
                    setMobileReceiptOpen(true);
                  }}
                  className="min-h-[38px] px-3 bg-[#111111] text-white font-mono text-[9.5px] tracking-[0.1em] uppercase whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Select Size
                </button>
              </motion.div>
            ) : (
              <p className="mt-1 font-mono text-[9px] tracking-[0.16em] text-[#737373] uppercase select-none">
                TAP A DOT TO INSPECT PIECE
              </p>
            )}
          </AnimatePresence>
        )}

        {!isMobile && (
          <div className="mt-2 flex items-center gap-4 z-20">
            <p className="font-mono text-[9.5px] tracking-[0.18em] text-[#737373] uppercase select-none">
              TAP A DOT TO SHOP THE PIECE
            </p>
            {sharedLayeredProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9.5px] text-[#999999] uppercase">· Styled with:</span>
                {sharedLayeredProducts.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProductDetail(sp.id);
                    }}
                    className="inline-flex items-center gap-1 font-mono text-[9.5px] tracking-[0.08em] text-[#111111] hover:underline uppercase cursor-pointer"
                  >
                    <span>{sp.name}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shopping Panel: Docked right on desktop, expandable peek-to-sheet on mobile */}
      <ShoppingPanel
        model={model}
        isMobile={isMobile}
        mobileExpanded={mobileReceiptOpen}
        onToggleMobileExpand={setMobileReceiptOpen}
      />
    </motion.div>
  );
};
