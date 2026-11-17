import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HotspotConfig, ProductData } from '../types/showroom';
import { formatPrice } from '../utils/pricing';

interface ProductInfoProps {
  markerNumber: string;
  product: ProductData;
  calloutSide: 'left' | 'right';
  currencySymbol: string;
  onInspect: () => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  markerNumber,
  product,
  calloutSide,
  currencySymbol,
  onInspect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, x: calloutSide === 'right' ? -6 : 6 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => {
        e.stopPropagation();
        onInspect();
      }}
      className={`absolute top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 sm:gap-2.5 bg-white border border-[#DCDCDC] px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm cursor-pointer whitespace-nowrap hover:border-[#111111] transition-colors max-w-[160px] sm:max-w-none ${
        calloutSide === 'right' ? 'left-8 sm:left-9' : 'right-8 sm:right-9'
      }`}
    >
      <span className="font-mono text-[9.5px] sm:text-[10px] font-medium text-[#737373] shrink-0">
        {markerNumber}
      </span>
      <span className="text-[9.5px] sm:text-[11px] font-medium tracking-[0.05em] text-[#111111] uppercase truncate">
        {product.name}
      </span>
      <span className="font-mono text-[9.5px] sm:text-[11px] text-[#737373] tabular-nums shrink-0">
        {formatPrice(product.price, currencySymbol)}
      </span>
    </motion.div>
  );
};

interface ModelHotspotProps {
  hotspot: HotspotConfig;
  product: ProductData;
  isActive: boolean;
  currencySymbol: string;
  onSelect: (productId: string) => void;
}

export const ModelHotspot: React.FC<ModelHotspotProps> = ({
  hotspot,
  product,
  isActive,
  currencySymbol,
  onSelect,
}) => {
  return (
    <div
      style={{
        left: `${hotspot.xPercent}%`,
        top: `${hotspot.yPercent}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(product.id);
        }}
        aria-label={`Inspect ${hotspot.markerNumber} ${product.name}`}
        className="relative flex items-center justify-center min-w-[44px] min-h-[44px] -m-[11px] cursor-pointer group focus-visible:outline-none"
      >
        {/* Subtle outer ring when active */}
        {isActive && (
          <motion.span
            layoutId="active-hotspot-ring"
            className="absolute w-8 h-8 rounded-full border border-[#111111]/45 bg-white/30"
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        )}
        <span
          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] tracking-[0.04em] transition-all duration-150 ${
            isActive
              ? 'bg-[#111111] text-white scale-110 shadow-md'
              : 'bg-[#111111]/85 text-white group-hover:bg-[#111111] group-hover:scale-110 shadow-sm'
          }`}
        >
          {hotspot.markerNumber}
        </span>
      </button>

      <AnimatePresence>
        {isActive && (
          <div className="hidden md:block">
            <ProductInfo
              markerNumber={hotspot.markerNumber}
              product={product}
              calloutSide={hotspot.calloutSide}
              currencySymbol={currencySymbol}
              onInspect={() => onSelect(product.id)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
