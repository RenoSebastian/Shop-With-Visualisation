import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ProductData, SizeOption } from '../types/showroom';
import { formatPrice } from '../utils/pricing';

interface ShoppingItemProps {
  product: ProductData;
  markerNumber?: string;
  isHighlighted: boolean;
  isSizeExpanded: boolean;
  inBagCount: number;
  currencySymbol: string;
  onHighlight: () => void;
  onToggleExpandSize: () => void;
  onAddSize: (size: SizeOption) => void;
}

export const ShoppingItem: React.FC<ShoppingItemProps> = ({
  product,
  markerNumber,
  isHighlighted,
  isSizeExpanded,
  inBagCount,
  currencySymbol,
  onHighlight,
  onToggleExpandSize,
  onAddSize,
}) => {
  const displayMarker = markerNumber ?? product.markerNumber;

  return (
    <div
      onClick={onHighlight}
      className={`py-3 border-b border-dashed border-[#D6D6D6] transition-colors cursor-pointer ${
        isHighlighted ? 'bg-[#F7F7F7] -mx-3 px-3' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="font-mono text-[10px] text-[#737373] pt-0.5 tabular-nums">
            {displayMarker}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-medium tracking-[0.04em] text-[#111111] uppercase truncate">
              {product.name}
            </div>
            <div className="mt-0.5 text-[9.5px] font-mono tracking-[0.08em] text-[#737373] uppercase">
              {product.category}
            </div>
            {isHighlighted && (
              <div className="mt-2 flex items-start gap-2.5">
                <div className="w-11 h-11 bg-[#F2F2F2] border border-[#E5E5E5] p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] leading-snug text-[#555555]">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-1.5">
          <span className="font-mono text-[11px] text-[#111111] tabular-nums">
            {formatPrice(product.price, currencySymbol)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpandSize();
            }}
            className={`min-h-[36px] md:min-h-[24px] px-3.5 md:px-3 rounded-full border text-[10px] md:text-[9px] font-mono tracking-[0.12em] uppercase transition-colors cursor-pointer whitespace-nowrap ${
              inBagCount > 0
                ? 'bg-[#111111] text-white border-[#111111]'
                : isSizeExpanded
                  ? 'bg-[#EAEAEA] text-[#111111] border-[#111111]'
                  : 'bg-white text-[#111111] border-dashed border-[#A3A3A3] hover:border-solid hover:border-[#111111]'
            }`}
          >
            {inBagCount > 0 ? `IN BAG (${inBagCount})` : 'ADD'}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isSizeExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-2.5 flex items-center justify-between gap-2">
              <span className="text-[9.5px] md:text-[9px] font-mono tracking-[0.1em] text-[#737373] uppercase">
                SELECT SIZE
              </span>
              <div className="flex items-center gap-1.5">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onAddSize(size)}
                    className="min-w-[40px] h-[40px] md:min-w-[30px] md:h-[26px] px-1.5 rounded-full border border-[#D4D4D4] bg-white hover:bg-[#111111] hover:text-white hover:border-[#111111] font-mono text-[11px] md:text-[10px] text-[#111111] transition-colors cursor-pointer"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
