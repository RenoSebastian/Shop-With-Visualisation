import React from 'react';
import { Compass, LayoutGrid, List, QrCode, SlidersHorizontal, X } from 'lucide-react';
import { ViewMode } from '../types/showroom';

interface MobileNavigationProps {
  bagCount: number;
  activeFilterCount: number;
  viewMode: ViewMode;
  isMobile: boolean;
  onOpenIndex: () => void;
  onOpenFilter: () => void;
  onClearFilters: () => void;
  onOpenBag: () => void;
  onChangeViewMode: (view: ViewMode) => void;
  onResetShowroom: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  bagCount,
  activeFilterCount,
  viewMode,
  isMobile,
  onOpenIndex,
  onOpenFilter,
  onClearFilters,
  onOpenBag,
  onChangeViewMode,
  onResetShowroom,
}) => {
  return (
    <>
      {/* Minimalist Top Bar */}
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 flex items-center justify-between gap-3">
        {/* Left Zone: Exhibition metadata & QR on desktop, clean spacing on mobile */}
        <div className="pointer-events-auto flex items-center gap-3 min-w-[72px] sm:min-w-[90px]">
          {!isMobile && (
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.12em] text-[#737373] uppercase select-none">
                <span className="tabular-nums">DROP 01</span>
                <span aria-hidden="true">·</span>
                <span>PRAGUE</span>
              </div>
              <button
                type="button"
                onClick={onOpenIndex}
                title="Open Exhibition Index"
                aria-label="Open Exhibition Index"
                className="p-1.5 bg-white/80 hover:bg-white border border-[#DCDCDC] text-[#111111] transition-colors cursor-pointer"
              >
                <QrCode className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Center Zone: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={onResetShowroom}
          className="pointer-events-auto font-display text-lg sm:text-xl font-medium tracking-[-0.02em] text-[#111111] whitespace-nowrap shrink-0 cursor-pointer"
        >
          OFFLINE<span className="align-super text-[10px]">*</span>
        </button>

        {/* Right Zone: Desktop Filter + Bag CTA (Mobile moves Filter to bottom thumb bar) */}
        <div
          className={`pointer-events-auto flex items-center justify-end gap-2 min-w-[72px] sm:min-w-[90px] transition-all duration-200 ${
            !isMobile && viewMode === ViewMode.INDIVIDUAL ? 'mr-[368px] lg:mr-[392px]' : ''
          }`}
        >
          {!isMobile && viewMode !== ViewMode.INDIVIDUAL && (
            <div className="inline-flex items-center">
              <button
                type="button"
                onClick={onOpenFilter}
                aria-label="Open Search and Taxonomy Filters"
                className={`min-h-[36px] px-3 py-1.5 border font-mono text-[10px] tracking-[0.12em] uppercase inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  activeFilterCount > 0
                    ? 'rounded-l-full border-[#111111] bg-[#111111] text-white'
                    : 'rounded-full border-[#DCDCDC] bg-white/85 hover:border-[#111111] text-[#111111]'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>FILTER</span>
                {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
              </button>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  title="Clear active filters"
                  aria-label="Clear active filters"
                  className="min-h-[36px] px-2 py-1.5 rounded-r-full border border-l-0 border-[#111111] bg-white hover:bg-[#F5F5F5] text-[#111111] inline-flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onOpenBag}
            className="min-h-[40px] sm:min-h-[36px] px-3.5 py-1.5 rounded-full border border-[#111111] bg-white/90 hover:bg-[#111111] hover:text-white text-[#111111] font-mono text-[10px] tracking-[0.12em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
          >
            BAG ({bagCount})
          </button>
        </div>
      </header>

      {/* Desktop Edge Vertical Tabs vs. Mobile Bottom Thumb Bar (no side tabs on mobile) */}
      {viewMode !== ViewMode.INDIVIDUAL && (
        <>
          {!isMobile ? (
            <>
              {/* Desktop Left Edge: INDEX */}
              <button
                type="button"
                onClick={onOpenIndex}
                aria-label="Open Look Index"
                className="fixed left-4 top-1/2 -translate-y-1/2 z-30 py-4 px-2 bg-white/90 hover:bg-white border border-[#DCDCDC] hover:border-[#111111] rounded-full shadow-xs cursor-pointer transition-colors"
              >
                <span className="block [writing-mode:vertical-rl] rotate-180 font-mono text-[9.5px] tracking-[0.18em] text-[#111111] uppercase">
                  INDEX
                </span>
              </button>

              {/* Desktop Right Edge: FIND / GRID switcher */}
              <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col border border-[#DCDCDC] rounded-full overflow-hidden bg-white/90 shadow-xs">
                <button
                  type="button"
                  onClick={() => onChangeViewMode(ViewMode.SPATIAL)}
                  className={`py-4 px-2 transition-colors cursor-pointer ${
                    viewMode === ViewMode.SPATIAL
                      ? 'bg-[#111111] text-white'
                      : 'text-[#737373] hover:text-[#111111]'
                  }`}
                >
                  <span className="block [writing-mode:vertical-rl] font-mono text-[9.5px] tracking-[0.18em] uppercase">
                    FIND
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeViewMode(ViewMode.GRID)}
                  className={`py-4 px-2 transition-colors cursor-pointer ${
                    viewMode === ViewMode.GRID
                      ? 'bg-[#111111] text-white'
                      : 'text-[#737373] hover:text-[#111111]'
                  }`}
                >
                  <span className="block [writing-mode:vertical-rl] font-mono text-[9.5px] tracking-[0.18em] uppercase">
                    GRID
                  </span>
                </button>
              </div>
            </>
          ) : (
            <nav
              aria-label="Mobile showroom navigation"
              className="fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur-md border-t border-[#E2E2E2] pb-[env(safe-area-inset-bottom)]"
            >
              <div className="grid grid-cols-4 h-[54px] items-center">
                <button
                  type="button"
                  onClick={() => onChangeViewMode(ViewMode.SPATIAL)}
                  className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                    viewMode === ViewMode.SPATIAL
                      ? 'text-[#111111]'
                      : 'text-[#737373]'
                  }`}
                >
                  <Compass
                    className={`w-[18px] h-[18px] ${
                      viewMode === ViewMode.SPATIAL ? 'stroke-[2.2]' : 'stroke-[1.6]'
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] tracking-[0.12em] uppercase whitespace-nowrap ${
                      viewMode === ViewMode.SPATIAL ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    FIND
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeViewMode(ViewMode.GRID)}
                  className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                    viewMode === ViewMode.GRID
                      ? 'text-[#111111]'
                      : 'text-[#737373]'
                  }`}
                >
                  <LayoutGrid
                    className={`w-[18px] h-[18px] ${
                      viewMode === ViewMode.GRID ? 'stroke-[2.2]' : 'stroke-[1.6]'
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] tracking-[0.12em] uppercase whitespace-nowrap ${
                      viewMode === ViewMode.GRID ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    GRID
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onOpenIndex}
                  className="h-full flex flex-col items-center justify-center gap-0.5 text-[#737373] active:text-[#111111] cursor-pointer transition-colors"
                >
                  <List className="w-[18px] h-[18px] stroke-[1.7]" />
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase whitespace-nowrap">
                    INDEX
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onOpenFilter}
                  className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                    activeFilterCount > 0 ? 'text-[#111111]' : 'text-[#737373]'
                  }`}
                >
                  <SlidersHorizontal
                    className={`w-[18px] h-[18px] ${
                      activeFilterCount > 0 ? 'stroke-[2.2]' : 'stroke-[1.7]'
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] tracking-[0.1em] uppercase whitespace-nowrap tabular-nums ${
                      activeFilterCount > 0 ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {activeFilterCount > 0 ? `FILTER (${activeFilterCount})` : 'FILTER'}
                  </span>
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </>
  );
};
