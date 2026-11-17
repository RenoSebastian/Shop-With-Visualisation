import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { FASHION_MODELS } from '../data/models';
import { EDITORIAL_NOTES } from '../data/outfitConfigurations';
import { DISPLAY_MODE_ORDER } from '../data/showroomLayouts';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useShowroomStore } from '../store/useShowroomStore';
import { calculateLookPricing, formatPrice } from '../utils/pricing';

interface IndexDrawerProps {
  isMobile?: boolean;
}

export const IndexDrawer: React.FC<IndexDrawerProps> = ({ isMobile = false }) => {
  const {
    indexOpen,
    activeModelId,
    displayMode,
    activeEditorialTab,
    pricingConfig,
    toggleIndex,
    selectLookFromSelector,
    setDisplayMode,
    setActiveEditorialTab,
  } = useShowroomStore();

  const activeNote = EDITORIAL_NOTES.find((n) => n.id === activeEditorialTab);

  return (
    <AnimatePresence>
      {indexOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => toggleIndex(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          <motion.aside
            initial={isMobile ? { y: '100%' } : { x: '-100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '-100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            aria-label="Showroom Index"
            className={
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-50 max-h-[86dvh] rounded-t-2xl bg-[#F7F7F7] border-t border-[#E2E2E2] shadow-2xl flex flex-col overflow-hidden'
                : 'fixed top-0 left-0 bottom-0 z-50 w-full max-w-[360px] bg-[#F7F7F7] border-r border-[#E2E2E2] flex flex-col justify-between p-6 overflow-y-auto'
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
                  ? 'flex-1 overflow-y-auto px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col justify-between'
                  : 'flex flex-col justify-between flex-1'
              }
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#E2E2E2]">
                  <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] uppercase">
                    <span className="text-[#111111] font-medium">INDEX</span>
                    <span className="text-[#737373]">DROP 01 ({FASHION_MODELS.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleIndex(false)}
                    aria-label="Close Index"
                    className="min-h-[40px] px-1.5 inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-[#737373] hover:text-[#111111] uppercase cursor-pointer"
                  >
                    <span>CLOSE</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Look list 01 - 09 */}
                <div className="mt-3 sm:mt-4 divide-y divide-[#EAEAEA]">
                  {FASHION_MODELS.map((model) => {
                    const isActive = model.id === activeModelId;
                    const pricing = calculateLookPricing(model.productIds, pricingConfig);
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          selectLookFromSelector(model.id);
                          toggleIndex(false);
                        }}
                        className="w-full min-h-[48px] py-3 flex items-baseline justify-between gap-3 text-left group cursor-pointer"
                      >
                        <div className="flex items-baseline gap-3 min-w-0">
                          <span className="font-mono text-[10px] text-[#737373] tabular-nums">
                            {model.indexNumber}
                          </span>
                          <span
                            className={`font-display text-lg tracking-[-0.01em] uppercase truncate transition-colors ${
                              isActive
                                ? 'text-[#111111] font-medium'
                                : 'text-[#444444] font-light group-hover:text-[#111111]'
                            }`}
                          >
                            {model.title}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#737373] whitespace-nowrap shrink-0 tabular-nums">
                          {model.productIds.length} pieces {formatPrice(pricing.subtotal, pricingConfig.currencySymbol)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Spatial mode shortcuts */}
                <div className="mt-6 pt-4 border-t border-[#E2E2E2]">
                  <div className="font-mono text-[9px] tracking-[0.14em] text-[#737373] uppercase mb-2">
                    DISPLAY MODES
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DISPLAY_MODE_ORDER.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setDisplayMode(mode);
                          toggleIndex(false);
                        }}
                        className={`min-h-[42px] sm:min-h-[36px] px-2.5 py-2 border font-mono text-[9.5px] tracking-[0.1em] uppercase text-left transition-colors cursor-pointer ${
                          displayMode === mode
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-[#444444] border-[#E2E2E2] hover:border-[#111111]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleIndex(false);
                      useDiscoveryStore.getState().toggleFilterDrawer(true);
                    }}
                    className="mt-3 w-full min-h-[44px] py-2.5 px-3 bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-[#111111] font-mono text-[9.5px] tracking-[0.12em] uppercase transition-colors cursor-pointer"
                  >
                    Open 8-Dimension Taxonomy Filters
                  </button>
                </div>

                {/* Editorial Notes panel if toggled */}
                {activeNote && (
                  <div className="mt-5 p-4 bg-white border border-[#E2E2E2]">
                    <div className="font-mono text-[9.5px] tracking-[0.12em] text-[#111111] uppercase">
                      {activeNote.heading}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#555555]">
                      {activeNote.body}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom links */}
              <div className="pt-6 mt-6 border-t border-[#E2E2E2] flex items-center gap-4 flex-wrap">
                {EDITORIAL_NOTES.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setActiveEditorialTab(note.id)}
                    className={`min-h-[36px] font-mono text-[9.5px] tracking-[0.14em] uppercase cursor-pointer transition-colors ${
                      activeEditorialTab === note.id
                        ? 'text-[#111111] underline underline-offset-4'
                        : 'text-[#737373] hover:text-[#111111]'
                    }`}
                  >
                    {note.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
