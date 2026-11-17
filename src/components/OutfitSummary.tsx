import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ShowroomPricingConfig } from '../types/showroom';
import { formatReceiptPrice, LookPricingSummary } from '../utils/pricing';
import { PurchaseBarcode } from './PurchaseBarcode';

interface OutfitSummaryProps {
  lookIndexNumber: string;
  lookTitle: string;
  pricing: LookPricingSummary;
  config: ShowroomPricingConfig;
  onAddFullLook: () => void;
  onToggleDiscountRule: () => void;
  compact?: boolean;
}

export const OutfitSummary: React.FC<OutfitSummaryProps> = ({
  lookIndexNumber,
  lookTitle,
  pricing,
  config,
  onAddFullLook,
  onToggleDiscountRule,
  compact = false,
}) => {
  const referenceCode = `LOOK-${lookIndexNumber}-${lookTitle.replace(/\s+/g, '').slice(0, 6)}`;

  return (
    <div className={compact ? 'pt-2.5' : 'pt-4'}>
      <div className="space-y-1.5 text-[10px] font-mono tracking-[0.08em] uppercase">
        <div className="flex items-center justify-between text-[#737373]">
          <span>SUBTOTAL</span>
          <span className="tabular-nums">
            {formatReceiptPrice(pricing.subtotal, config.currencySymbol)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#737373]">
          <button
            type="button"
            onClick={onToggleDiscountRule}
            title="Toggle optional full-look bundle discount"
            className="text-left hover:text-[#111111] transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
          >
            {config.enableFullLookDiscount
              ? config.fullLookDiscountLabel
              : 'FULL LOOK BUNDLE (OFF)'}
          </button>
          <span className="tabular-nums">
            {pricing.discountApplied
              ? `-${formatReceiptPrice(pricing.discountAmount, config.currencySymbol)}`
              : formatReceiptPrice(0, config.currencySymbol)}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E4E4E4] flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase">
          TOTAL
        </span>
        <span className="font-display text-2xl font-normal tracking-tight text-[#111111] tabular-nums">
          {formatReceiptPrice(pricing.total, config.currencySymbol)}
        </span>
      </div>

      <button
        type="button"
        onClick={onAddFullLook}
        className="mt-4 w-full h-11 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] text-white font-mono text-[10px] tracking-[0.14em] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>ADD FULL LOOK TO BAG</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {!compact && (
        <div className="mt-5 pt-4 border-t border-dashed border-[#DCDCDC]">
          <PurchaseBarcode
            referenceValue={referenceCode}
            caption="REF BARCODE · DEMO"
            height={36}
          />
          <p className="mt-3 text-center font-mono text-[9px] tracking-[0.16em] text-[#737373] uppercase">
            {config.receiptFooterNote}
          </p>
        </div>
      )}
    </div>
  );
};
