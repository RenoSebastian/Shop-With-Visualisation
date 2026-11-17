import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { catalogRepository } from '../engine/catalogRepository';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useShowroomStore } from '../store/useShowroomStore';
import { SizeOption } from '../types/showroom';
import { formatReceiptPrice } from '../utils/pricing';

interface ProductDetailModalProps {
  isMobile?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isMobile = false,
}) => {
  const { selectedProductDetailId, openProductDetail } = useDiscoveryStore();
  const { pricingConfig, addToBag, openIndividualView } = useShowroomStore();

  const record = selectedProductDetailId
    ? catalogRepository.getEnrichedProductById(selectedProductDetailId)
    : undefined;

  const [selectedColorSlug, setSelectedColorSlug] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<SizeOption>('M');
  const [previewFullLook, setPreviewFullLook] = useState(false);

  useEffect(() => {
    if (!record) return;
    setSelectedColorSlug(record.availableColors[0]?.slug ?? '');
    setSelectedSize(
      record.availableSizes.includes('M')
        ? 'M'
        : record.availableSizes[0] ?? 'M',
    );
    setPreviewFullLook(false);
  }, [record?.product.id]);

  return (
    <AnimatePresence>
      {record && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => openProductDetail(null)}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]"
          />

          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={
              isMobile
                ? { type: 'spring', stiffness: 290, damping: 32 }
                : { duration: 0.2 }
            }
            role="dialog"
            aria-modal="true"
            aria-label={record.product.name}
            className={
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] rounded-t-2xl bg-white border-t border-[#E2E2E2] shadow-2xl flex flex-col overflow-hidden'
                : 'fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-[820px] md:max-h-[86vh] bg-white border border-[#E2E2E2] shadow-xl flex flex-col md:flex-row overflow-hidden'
            }
          >
            {isMobile && (
              <div className="pt-2.5 pb-1 flex justify-center bg-[#F2F2F2] shrink-0">
                <div className="w-10 h-1 bg-[#D4D4D4] rounded-full" />
              </div>
            )}

            {/* Studio Product Photo / Full Look Toggle */}
            <div className="relative md:w-[46%] bg-[#F2F2F2] flex flex-col items-center justify-center p-4 sm:p-6 min-h-[210px] max-h-[255px] md:max-h-none md:min-h-[460px] overflow-hidden shrink-0">
              {isMobile && (
                <button
                  type="button"
                  onClick={() => openProductDetail(null)}
                  aria-label="Close product detail"
                  className="absolute top-2.5 right-3 z-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-white/90 border border-[#E2E2E2] text-[#333333] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="relative w-full max-w-[180px] sm:max-w-[300px] aspect-square md:aspect-[3/4] overflow-hidden flex items-center justify-center">
                <img
                  src={
                    previewFullLook
                      ? (record.associatedLooks[0]?.mainImageUrl ??
                        record.product.galleryImages[1] ??
                        record.product.mainImageUrl)
                      : record.product.mainImageUrl
                  }
                  alt={
                    previewFullLook
                      ? `${record.product.name} worn on model`
                      : record.product.name
                  }
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-contain select-none transition-opacity duration-200"
                />
              </div>

              <div className="mt-2 sm:mt-3 flex items-center gap-1 p-1 bg-white/90 border border-[#DCDCDC]">
                <button
                  type="button"
                  onClick={() => setPreviewFullLook(false)}
                  className={`min-h-[30px] sm:min-h-0 px-3 py-1 font-mono text-[9.5px] tracking-[0.12em] uppercase cursor-pointer ${
                    !previewFullLook ? 'bg-[#111111] text-white' : 'text-[#666666]'
                  }`}
                >
                  Product Photo
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFullLook(true)}
                  className={`min-h-[30px] sm:min-h-0 px-3 py-1 font-mono text-[9.5px] tracking-[0.12em] uppercase cursor-pointer ${
                    previewFullLook ? 'bg-[#111111] text-white' : 'text-[#666666]'
                  }`}
                >
                  On Model
                </button>
              </div>
            </div>

            {/* Right / Lower: Purchase Module & Associated Looks */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 px-5 py-4 sm:p-6 md:p-7 overflow-y-auto flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] tracking-[0.12em] text-[#737373] uppercase">
                        {record.categoryHierarchyLabels.join(' → ')} · SKU {record.product.sku}
                      </div>
                      <h2 className="mt-1 font-display text-xl sm:text-2xl font-light tracking-[-0.015em] text-[#111111] uppercase">
                        {record.product.name}
                      </h2>
                    </div>

                    {!isMobile && (
                      <button
                        type="button"
                        onClick={() => openProductDetail(null)}
                        aria-label="Close product detail"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-2.5 sm:mt-3 flex items-baseline justify-between gap-3 pb-3.5 sm:pb-4 border-b border-[#EAEAEA]">
                    <span className="font-display text-2xl font-normal text-[#111111] tabular-nums">
                      {record.product.price !== null
                        ? formatReceiptPrice(record.product.price, pricingConfig.currencySymbol)
                        : 'ARCHIVE ONLY'}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.12em] text-[#555555] uppercase text-right">
                      {record.product.stockStatus === 'low_stock' ? 'Low Stock' : 'In Stock'} ·{' '}
                      {record.product.materialSummary}
                    </span>
                  </div>

                  <p className="mt-3.5 sm:mt-4 text-sm leading-relaxed text-[#444444]">
                    {record.product.description}
                  </p>

                  {/* Color Variant Selector */}
                  <div className="mt-4 sm:mt-5">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-[#737373] uppercase mb-2">
                      Color:{' '}
                      <span className="text-[#111111]">
                        {record.availableColors.find((c) => c.slug === selectedColorSlug)?.name ??
                          record.availableColors[0]?.name}
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      {record.availableColors.map((col) => {
                        const active = col.slug === selectedColorSlug;
                        return (
                          <button
                            key={col.slug}
                            type="button"
                            onClick={() => setSelectedColorSlug(col.slug)}
                            aria-label={`Select color ${col.name}`}
                            className={`min-h-[42px] sm:min-h-[36px] px-3 py-1.5 inline-flex items-center gap-2 border text-xs cursor-pointer ${
                              active
                                ? 'border-[#111111] bg-[#F7F7F7] text-[#111111]'
                                : 'border-[#E0E0E0] text-[#555555] hover:border-[#111111]'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="mt-4">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-[#737373] uppercase mb-2">
                      Size
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {record.availableSizes.map((size) => {
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[44px] h-[44px] sm:h-[40px] px-3 font-mono text-xs border transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-white text-[#111111] border-[#DCDCDC] hover:border-[#111111]'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clean Unboxed Multi-Dimensional Taxonomy Metadata */}
                  <div className="mt-5 pt-4 border-t border-[#EAEAEA] space-y-1.5 text-xs text-[#555555]">
                    {record.optionsByDimension.style.length > 0 && (
                      <div>
                        <span className="font-mono text-[10px] text-[#888888] uppercase mr-2">
                          Style
                        </span>
                        <span>{record.optionsByDimension.style.map((o) => o.label).join(' · ')}</span>
                      </div>
                    )}
                    {record.optionsByDimension.era.length > 0 && (
                      <div>
                        <span className="font-mono text-[10px] text-[#888888] uppercase mr-2">
                          Era
                        </span>
                        <span>{record.optionsByDimension.era.map((o) => o.label).join(' · ')}</span>
                      </div>
                    )}
                    {record.optionsByDimension.fit.length > 0 && (
                      <div>
                        <span className="font-mono text-[10px] text-[#888888] uppercase mr-2">
                          Silhouette
                        </span>
                        <span>{record.optionsByDimension.fit.map((o) => o.label).join(' · ')}</span>
                      </div>
                    )}
                    {record.optionsByDimension.occasion.length > 0 && (
                      <div>
                        <span className="font-mono text-[10px] text-[#888888] uppercase mr-2">
                          Occasion
                        </span>
                        <span>
                          {record.optionsByDimension.occasion.map((o) => o.label).join(' · ')}
                        </span>
                      </div>
                    )}
                    {record.optionsByDimension.season.length > 0 && (
                      <div>
                        <span className="font-mono text-[10px] text-[#888888] uppercase mr-2">
                          Season
                        </span>
                        <span>{record.optionsByDimension.season.map((o) => o.label).join(' · ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Associated Looks M:N Navigation */}
                  <div className="mt-5 pt-4 border-t border-[#EAEAEA]">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-[#737373] uppercase mb-2">
                      Styled in {record.associatedLooks.length}{' '}
                      {record.associatedLooks.length === 1 ? 'Look' : 'Looks'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {record.associatedLooks.map((look) => (
                        <button
                          key={look.id}
                          type="button"
                          onClick={() => {
                            openProductDetail(null);
                            openIndividualView(look.id, record.product.id);
                          }}
                          className="min-h-[42px] sm:min-h-[38px] px-3 py-1.5 inline-flex items-center gap-2 bg-[#F7F7F7] hover:bg-[#111111] text-[#111111] hover:text-white border border-[#E0E0E0] text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span className="font-mono text-[10px] tabular-nums">
                            {look.indexNumber}
                          </span>
                          <span>{look.title}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop inline Primary Add Action */}
                {!isMobile && record.product.price !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      const primaryLookId = record.associatedLooks[0]?.id ?? 'look-01';
                      addToBag(record.product.id, primaryLookId, selectedSize);
                      openProductDetail(null);
                    }}
                    className="w-full min-h-[46px] bg-[#111111] hover:bg-[#262626] text-white font-mono text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>ADD TO BAG — SIZE {selectedSize}</span>
                  </button>
                )}
              </div>

              {/* Mobile pinned Primary Add Action in natural thumb zone */}
              {isMobile && record.product.price !== null && (
                <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-[#EAEAEA] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const primaryLookId = record.associatedLooks[0]?.id ?? 'look-01';
                      addToBag(record.product.id, primaryLookId, selectedSize);
                      openProductDetail(null);
                    }}
                    className="w-full min-h-[46px] bg-[#111111] hover:bg-[#262626] text-white font-mono text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>ADD TO BAG — SIZE {selectedSize}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
