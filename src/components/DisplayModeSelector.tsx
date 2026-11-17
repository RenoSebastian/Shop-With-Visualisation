import React from 'react';
import { Plus } from 'lucide-react';
import { FASHION_MODELS } from '../data/models';
import { OUTFIT_HOTSPOTS } from '../data/outfitConfigurations';
import { PRODUCT_BY_ID } from '../data/products';
import { FashionModelData, ViewMode } from '../types/showroom';
import { formatPrice } from '../utils/pricing';

interface DisplayModeSelectorProps {
  viewMode: ViewMode;
  activeModel: FashionModelData;
  currencySymbol: string;
  isMobile: boolean;
  onInspectLook: (productId?: string) => void;
}

export const DisplayModeSelector: React.FC<DisplayModeSelectorProps> = ({
  viewMode,
  activeModel,
  currencySymbol,
  isMobile,
  onInspectLook,
}) => {
  if (viewMode === ViewMode.INDIVIDUAL) return null;

  const outfitProducts = activeModel.productIds
    .map((id) => PRODUCT_BY_ID[id])
    .filter((p) => Boolean(p));

  const hotspots = OUTFIT_HOTSPOTS[activeModel.id] ?? [];

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed bottom-[calc(54px+env(safe-area-inset-bottom))] left-0 right-0 z-30 px-4 pb-3 pt-4 bg-gradient-to-t from-[#F2F2F2] via-[#F2F2F2]/90 to-transparent">
        <div className="flex items-end justify-between gap-3">
          <div className="pointer-events-auto min-w-0">
            <div className="font-mono text-[9px] tracking-[0.16em] text-[#737373] uppercase mb-0.5 tabular-nums">
              {activeModel.indexNumber} / 0{FASHION_MODELS.length}
            </div>
            <h1 className="font-display text-xl font-light tracking-[-0.02em] text-[#111111] uppercase truncate">
              {activeModel.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onInspectLook()}
            aria-label={`Shop Look ${activeModel.indexNumber} ${activeModel.title}`}
            className="pointer-events-auto min-h-[44px] px-4 rounded-full bg-[#111111] text-white inline-flex items-center gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase whitespace-nowrap">
              SHOP LOOK
            </span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 px-6 lg:px-8 pb-5 pt-4 bg-gradient-to-t from-[#F2F2F2] via-[#F2F2F2]/80 to-transparent">
      <div className="flex items-end justify-between gap-4 lg:gap-6">
        {/* Left: Look counter + large light editorial look title */}
        <div className="pointer-events-auto shrink-0">
          <div className="font-mono text-[9.5px] tracking-[0.16em] text-[#737373] uppercase mb-1.5 tabular-nums">
            {activeModel.indexNumber} / 0{FASHION_MODELS.length}
          </div>
          <h1 className="font-display text-2xl lg:text-[30px] leading-none font-light tracking-[-0.02em] text-[#111111] uppercase whitespace-nowrap">
            {activeModel.title}
          </h1>
        </div>

        {/* Center: The 3 garments worn by the active centered model */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2.5">
          {outfitProducts.map((product) => {
            const spot = hotspots.find((h) => h.productId === product.id);
            const focusX = spot ? `${spot.xPercent}%` : '50%';
            const focusY = spot ? `${spot.yPercent}%` : '50%';
            const zoomScale = product.category === 'FOOTWEAR' ? 3.2 : 2.3;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onInspectLook(product.id)}
                className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 bg-white/95 hover:bg-white border border-[#E2E2E2] hover:border-[#111111] rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.03)]"
              >
                <span className="relative w-8 h-8 rounded-full bg-[#F2F2F2] overflow-hidden shrink-0 border border-black/5">
                  <img
                    src={activeModel.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: `${focusX} ${focusY}`,
                    }}
                    className="w-full h-full object-contain select-none pointer-events-none"
                  />
                </span>
                <div className="text-left leading-tight">
                  <div className="text-[9.5px] font-medium tracking-[0.06em] text-[#111111] uppercase">
                    {product.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[9px] text-[#737373] tabular-nums">
                    {formatPrice(product.price, currencySymbol)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: SHOP THE LOOK + circular plus trigger */}
        <div className="pointer-events-auto flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onInspectLook()}
            className="flex items-center gap-3 group cursor-pointer focus-visible:outline-none"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase whitespace-nowrap group-hover:underline underline-offset-4">
              SHOP THE LOOK
            </span>
            <span className="w-10 h-10 rounded-full bg-[#111111] group-hover:scale-105 text-white flex items-center justify-center transition-transform">
              <Plus className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
