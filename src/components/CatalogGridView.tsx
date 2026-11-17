import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { FIND_POPULAR_QUICK_FILTERS } from '../data/taxonomySeed';
import { catalogRepository } from '../engine/catalogRepository';
import { useCatalogDiscovery } from '../hooks/useCatalogDiscovery';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useShowroomStore } from '../store/useShowroomStore';
import { ViewMode } from '../types/showroom';
import { SearchSuggestion, SortOption } from '../types/taxonomy';
import { formatPrice } from '../utils/pricing';

interface CatalogGridViewProps {
  isMobile: boolean;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; requiresPrice?: boolean }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'price-asc', label: 'Price: Low to High', requiresPrice: true },
  { value: 'price-desc', label: 'Price: High to Low', requiresPrice: true },
];

export const CatalogGridView: React.FC<CatalogGridViewProps> = ({ isMobile }) => {
  const {
    searchQuery,
    selectedByDimension,
    collectionSlug,
    sortBy,
    gridTab,
    setSearchQuery,
    toggleFilterOption,
    removeFilterOption,
    setCollectionSlug,
    clearAllFilters,
    setSortBy,
    setGridTab,
    setLooksPage,
    setProductsPage,
    toggleFilterDrawer,
    openProductDetail,
  } = useDiscoveryStore();

  const {
    pricingConfig,
    setViewMode,
    selectModelInShowroom,
    openIndividualView,
    addFullLookToBag,
    addToBag,
  } = useShowroomStore();

  const {
    collections,
    paginatedLooks,
    paginatedProducts,
    activeFilterChips,
    activeFilterCount,
  } = useCatalogDiscovery();

  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedSwatches, setSelectedSwatches] = useState<Record<string, string>>({});

  const suggestions = useMemo(
    () => (searchFocused ? catalogRepository.searchSuggestions(searchQuery, 7) : []),
    [searchFocused, searchQuery],
  );

  const activeResult = gridTab === 'products' ? paginatedProducts : paginatedLooks;
  const availableSorts = SORT_OPTIONS.filter(
    (s) => !s.requiresPrice || activeResult.hasPurchasablePrices,
  );

  const handleSuggestion = (sug: SearchSuggestion) => {
    setSearchFocused(false);
    if (sug.type === 'look') {
      openIndividualView(sug.targetId);
    } else if (sug.type === 'product') {
      openProductDetail(sug.targetId);
    } else if (sug.type === 'collection') {
      setCollectionSlug(sug.targetId);
      setGridTab('looks');
      setSearchQuery('');
    } else if (sug.type === 'option' && sug.dimensionSlug) {
      toggleFilterOption(sug.dimensionSlug, sug.targetId);
      setSearchQuery('');
    }
  };

  return (
    <section
      aria-label="Hybrid fashion catalog discovery"
      className="relative w-full h-full overflow-y-auto bg-[#F2F2F2] pt-16 sm:pt-20 pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-20 px-3.5 sm:px-14 lg:px-20"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Top Sub-Navigation & Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-[#DCDCDC]">
          {/* Sub-sections: LOOKS | PRODUCTS | COLLECTIONS */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-white border border-[#DCDCDC]">
            <button
              type="button"
              onClick={() => setGridTab('looks')}
              className={`min-h-[42px] sm:min-h-[38px] px-2 sm:px-4 font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.08em] sm:tracking-[0.12em] uppercase transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                gridTab === 'looks'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              Looks ({paginatedLooks.total})
            </button>
            <button
              type="button"
              onClick={() => setGridTab('products')}
              className={`min-h-[42px] sm:min-h-[38px] px-2 sm:px-4 font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.08em] sm:tracking-[0.12em] uppercase transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                gridTab === 'products'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              Products ({paginatedProducts.total})
            </button>
            <button
              type="button"
              onClick={() => setGridTab('collections')}
              className={`min-h-[42px] sm:min-h-[38px] px-2 sm:px-4 font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.08em] sm:tracking-[0.12em] uppercase transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                gridTab === 'collections'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              Edits ({collections.length})
            </button>
          </div>

          {/* Unified Search + Filter Drawer + Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5">
            <div className="relative flex-1 sm:flex-initial">
              <div className="flex items-center h-11 sm:h-10 bg-white border border-[#DCDCDC] focus-within:border-[#111111] px-3 gap-2">
                <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#737373] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search look, piece, style, fabric..."
                  aria-label="Unified catalog search"
                  className="w-full sm:w-64 bg-transparent text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchFocused && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-[#DCDCDC] shadow-lg z-40 divide-y divide-[#F0F0F0]">
                  {suggestions.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestion(sug);
                      }}
                      className="w-full px-3 py-3 sm:py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#F5F5F5] cursor-pointer"
                    >
                      <span className="text-xs text-[#111111] truncate">{sug.label}</span>
                      <span className="font-mono text-[9px] text-[#737373] uppercase shrink-0">
                        {sug.meta}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFilterDrawer(true)}
                className={`h-11 sm:h-10 px-3.5 sm:px-4 inline-flex items-center justify-center gap-2 border font-mono text-[10px] tracking-[0.12em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFilterCount > 0
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-[#111111] border-[#DCDCDC] hover:border-[#111111]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="tabular-nums">({activeFilterCount})</span>
                )}
              </button>

              {gridTab !== 'collections' && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort catalog results"
                  className="flex-1 sm:flex-initial h-11 sm:h-10 px-3 bg-white border border-[#DCDCDC] font-mono text-[10px] tracking-[0.08em] text-[#111111] uppercase cursor-pointer"
                >
                  {availableSorts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Sort: {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Quick Style Shortcuts & Removable Active Filter Chips */}
        {gridTab !== 'collections' && (
          <div className="py-3 space-y-2 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <span className="font-mono text-[9.5px] tracking-[0.12em] text-[#737373] uppercase mr-1 shrink-0">
                Styles:
              </span>
              {FIND_POPULAR_QUICK_FILTERS.map((qf) => {
                const active = (selectedByDimension[qf.dimensionSlug] ?? []).includes(
                  qf.optionId,
                );
                return (
                  <button
                    key={qf.optionId}
                    type="button"
                    onClick={() => toggleFilterOption(qf.dimensionSlug, qf.optionId)}
                    className={`min-h-[36px] sm:min-h-[32px] px-3 border font-mono text-[9.5px] tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#444444] border-[#E0E0E0] hover:border-[#111111]'
                    }`}
                  >
                    {qf.label}
                  </button>
                );
              })}
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {activeFilterChips.map((chip) => (
                  <button
                    key={`${chip.kind}-${chip.optionId}`}
                    type="button"
                    onClick={() => {
                      if (chip.kind === 'collection') {
                        setCollectionSlug(null);
                      } else if (chip.dimensionSlug) {
                        removeFilterOption(chip.dimensionSlug, chip.optionId);
                      }
                    }}
                    className="h-8 px-2.5 inline-flex items-center gap-1.5 bg-white border border-[#111111] text-[10.5px] text-[#111111] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span className="text-[#737373]">{chip.dimensionLabel}:</span>
                    <span>{chip.label}</span>
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="h-8 px-2.5 inline-flex items-center gap-1 font-mono text-[10px] text-[#555555] hover:text-[#111111] uppercase cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUB-SECTION 1: COMPLETE LOOKS (2-Column Compact on Mobile, 3-Column on Desktop) */}
        {gridTab === 'looks' && (
          <div className="mt-4 sm:mt-6">
            {paginatedLooks.items.length === 0 ? (
              <EmptyCatalogState onClear={clearAllFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {paginatedLooks.items.map((rec) => {
                    const stylesText = rec.optionsByDimension.style
                      .slice(0, isMobile ? 2 : 3)
                      .map((s) => s.label)
                      .join(' · ');
                    const erasText = rec.optionsByDimension.era.map((e) => e.label).join(' / ');

                    return (
                      <article
                        key={rec.look.id}
                        className="bg-white border border-[#E2E2E2] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <button
                          type="button"
                          onClick={() => openIndividualView(rec.look.id)}
                          className="group relative w-full aspect-[3/4] bg-[#F5F5F5] overflow-hidden cursor-pointer flex items-center justify-center p-2.5 sm:p-4"
                        >
                          <img
                            src={rec.look.mainImageUrl}
                            alt={`Look ${rec.look.indexNumber} ${rec.look.title}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            draggable={false}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </button>

                        <div className="p-2.5 sm:p-4 border-t border-[#EAEAEA] space-y-1.5 sm:space-y-2.5">
                          <div className="flex items-baseline justify-between gap-1.5">
                            <h3 className="font-display text-[13px] sm:text-lg font-normal tracking-[-0.01em] text-[#111111] uppercase truncate">
                              {rec.look.indexNumber}. {rec.look.title}
                            </h3>
                            <span className="font-mono text-[11px] sm:text-xs text-[#111111] tabular-nums shrink-0">
                              {formatPrice(rec.totalPrice, pricingConfig.currencySymbol)}
                            </span>
                          </div>

                          <div className="font-mono text-[9px] sm:text-[10px] text-[#737373] uppercase truncate">
                            {stylesText}
                            {!isMobile && erasText ? ` · ${erasText}` : ''}
                            {!isMobile ? ` · ${rec.products.length} Pieces` : ''}
                          </div>

                          <p className="hidden sm:block text-xs text-[#555555] line-clamp-2">
                            {rec.look.outfitDescription}
                          </p>

                          <div className="pt-1 sm:pt-2 flex items-center gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => openIndividualView(rec.look.id)}
                              className="flex-1 min-h-[40px] sm:min-h-[38px] px-2 sm:px-3 bg-[#111111] hover:bg-[#262626] text-white font-mono text-[9.5px] sm:text-[10px] tracking-[0.08em] sm:tracking-[0.1em] uppercase inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <span>{isMobile ? 'Inspect' : 'Inspect Look'}</span>
                              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => selectModelInShowroom(rec.look.id)}
                              title="Focus on rotating turntable"
                              className="hidden sm:inline-flex min-h-[38px] px-3 border border-[#DCDCDC] hover:border-[#111111] font-mono text-[10px] tracking-[0.08em] text-[#111111] uppercase items-center justify-center cursor-pointer"
                            >
                              Turntable
                            </button>
                            <button
                              type="button"
                              onClick={() => addFullLookToBag(rec.look.id)}
                              aria-label={`Add Look ${rec.look.indexNumber} to bag`}
                              title="Add full look to bag"
                              className="min-h-[40px] min-w-[40px] sm:min-h-[38px] sm:min-w-[38px] border border-[#DCDCDC] hover:border-[#111111] flex items-center justify-center text-[#111111] cursor-pointer shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <PaginationControls
                  page={paginatedLooks.page}
                  totalPages={paginatedLooks.totalPages}
                  total={paginatedLooks.total}
                  onPageChange={setLooksPage}
                />
              </>
            )}
          </div>
        )}

        {/* SUB-SECTION 2: INDIVIDUAL PRODUCTS (2-Column Compact on Mobile, 3-Column on Desktop) */}
        {gridTab === 'products' && (
          <div className="mt-4 sm:mt-6">
            {paginatedProducts.items.length === 0 ? (
              <EmptyCatalogState onClear={clearAllFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {paginatedProducts.items.map((rec) => {
                    const activeColorSlug =
                      selectedSwatches[rec.product.id] ?? rec.availableColors[0]?.slug;
                    const stylesText = rec.optionsByDimension.style
                      .slice(0, isMobile ? 2 : 3)
                      .map((s) => s.label)
                      .join(' · ');

                    return (
                      <article
                        key={rec.product.id}
                        className="bg-white border border-[#E2E2E2] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <button
                          type="button"
                          onClick={() => openProductDetail(rec.product.id)}
                          className="group relative w-full aspect-square bg-[#F2F2F2] overflow-hidden cursor-pointer flex items-center justify-center p-3 sm:p-5"
                        >
                          <img
                            src={rec.product.mainImageUrl}
                            alt={rec.product.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            draggable={false}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </button>

                        <div className="p-2.5 sm:p-4 border-t border-[#EAEAEA] space-y-1.5 sm:space-y-2.5">
                          <div className="font-mono text-[8.5px] sm:text-[10px] tracking-[0.06em] sm:tracking-[0.1em] text-[#737373] uppercase truncate">
                            {rec.categoryHierarchyLabels[rec.categoryHierarchyLabels.length - 1] ??
                              rec.product.legacyCategory}{' '}
                            · {rec.product.materialSummary}
                          </div>

                          <div className="flex items-baseline justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => openProductDetail(rec.product.id)}
                              className="text-left font-display text-[12px] sm:text-base font-medium text-[#111111] hover:underline uppercase truncate cursor-pointer"
                            >
                              {rec.product.name}
                            </button>
                            <span className="font-mono text-[11px] sm:text-xs text-[#111111] tabular-nums shrink-0">
                              {rec.product.price !== null
                                ? formatPrice(rec.product.price, pricingConfig.currencySymbol)
                                : 'Archive'}
                            </span>
                          </div>

                          <div className="hidden sm:block text-[11px] text-[#666666] truncate">
                            {stylesText}
                          </div>

                          {/* Color Variations & Associated Looks */}
                          <div className="pt-0.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {rec.availableColors.map((col) => {
                                const selected = col.slug === activeColorSlug;
                                return (
                                  <button
                                    key={col.slug}
                                    type="button"
                                    onClick={() =>
                                      setSelectedSwatches((prev) => ({
                                        ...prev,
                                        [rec.product.id]: col.slug,
                                      }))
                                    }
                                    title={col.name}
                                    aria-label={`Color ${col.name}`}
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border cursor-pointer transition-transform ${
                                      selected
                                        ? 'border-[#111111] scale-110 ring-1 ring-[#111111] ring-offset-1'
                                        : 'border-black/20'
                                    }`}
                                    style={{ backgroundColor: col.hex }}
                                  />
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => openProductDetail(rec.product.id)}
                              className="font-mono text-[9px] sm:text-[10px] text-[#555555] hover:text-[#111111] underline decoration-dotted underline-offset-2 uppercase cursor-pointer tabular-nums whitespace-nowrap"
                            >
                              {rec.associatedLooks.length}{' '}
                              {rec.associatedLooks.length === 1 ? 'Look' : 'Looks'}
                            </button>
                          </div>

                          <div className="pt-1 sm:pt-2 flex items-center gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => openProductDetail(rec.product.id)}
                              className="flex-1 min-h-[40px] sm:min-h-[38px] px-2 sm:px-3 border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white font-mono text-[9px] sm:text-[10px] tracking-[0.06em] sm:tracking-[0.1em] uppercase transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {isMobile ? 'Details' : 'Details & Looks'}
                            </button>
                            {rec.product.price !== null && (
                              <button
                                type="button"
                                onClick={() =>
                                  addToBag(
                                    rec.product.id,
                                    rec.associatedLooks[0]?.id ?? 'look-01',
                                    rec.availableSizes.includes('M')
                                      ? 'M'
                                      : (rec.availableSizes[0] ?? 'M'),
                                  )
                                }
                                className="min-h-[40px] sm:min-h-[38px] px-2.5 sm:px-3 bg-[#111111] hover:bg-[#262626] text-white font-mono text-[9px] sm:text-[10px] tracking-[0.08em] uppercase cursor-pointer whitespace-nowrap shrink-0"
                              >
                                + Bag
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <PaginationControls
                  page={paginatedProducts.page}
                  totalPages={paginatedProducts.totalPages}
                  total={paginatedProducts.total}
                  onPageChange={setProductsPage}
                />
              </>
            )}
          </div>
        )}

        {/* SUB-SECTION 3: CURATED EDITORIAL COLLECTIONS */}
        {gridTab === 'collections' && (
          <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {collections.map((col) => {
              const lookIds = catalogRepository.getLookIdsInCollection(col.slug);
              const looks = lookIds
                .map((id) => catalogRepository.getEnrichedLookById(id))
                .filter((r) => Boolean(r));
              const isSelected = collectionSlug === col.slug;

              return (
                <article
                  key={col.id}
                  className={`bg-white border p-4 sm:p-5 flex flex-col justify-between gap-4 ${
                    isSelected ? 'border-[#111111]' : 'border-[#E2E2E2]'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg sm:text-xl font-normal tracking-[-0.01em] text-[#111111] uppercase">
                        {col.title}
                      </h3>
                      <span className="font-mono text-[10px] text-[#737373] uppercase tabular-nums shrink-0">
                        {looks.length} Looks
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#333333]">{col.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#666666]">
                      {col.editorialNote}
                    </p>
                  </div>

                  {/* Preview Trio of Look Silhouettes */}
                  <div className="grid grid-cols-3 gap-2">
                    {looks.slice(0, 3).map((rec) =>
                      rec ? (
                        <button
                          key={rec.look.id}
                          type="button"
                          onClick={() => openIndividualView(rec.look.id)}
                          className="aspect-[3/4] bg-[#F5F5F5] p-2 overflow-hidden cursor-pointer hover:bg-[#EAEAEA] transition-colors"
                        >
                          <img
                            src={rec.look.mainImageUrl}
                            alt={rec.look.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ) : null,
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        useDiscoveryStore.setState({
                          collectionSlug: col.slug,
                          looksPage: 1,
                          productsPage: 1,
                        });
                        setGridTab('looks');
                      }}
                      className="flex-1 min-h-[44px] sm:min-h-[40px] bg-[#111111] hover:bg-[#262626] text-white font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer"
                    >
                      Explore Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        useDiscoveryStore.setState({
                          collectionSlug: col.slug,
                          looksPage: 1,
                          productsPage: 1,
                        });
                        setViewMode(ViewMode.SPATIAL);
                      }}
                      className="min-h-[44px] sm:min-h-[40px] px-3.5 sm:px-4 border border-[#DCDCDC] hover:border-[#111111] font-mono text-[10px] tracking-[0.1em] text-[#111111] uppercase cursor-pointer whitespace-nowrap"
                    >
                      Turntable
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return (
      <div className="mt-6 text-center font-mono text-[10px] tracking-[0.12em] text-[#737373] uppercase tabular-nums">
        Showing all {total} results
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-[#DCDCDC] flex items-center justify-between gap-4">
      <span className="font-mono text-[10px] tracking-[0.12em] text-[#666666] uppercase tabular-nums">
        Page {page} / {totalPages} · {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-[42px] sm:min-h-[38px] px-3.5 inline-flex items-center gap-1.5 bg-white border border-[#DCDCDC] hover:border-[#111111] disabled:opacity-40 font-mono text-[10px] uppercase cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-[42px] sm:min-h-[38px] px-3.5 inline-flex items-center gap-1.5 bg-white border border-[#DCDCDC] hover:border-[#111111] disabled:opacity-40 font-mono text-[10px] uppercase cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const EmptyCatalogState: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="py-16 sm:py-20 bg-white border border-[#E2E2E2] text-center px-6">
    <p className="font-display text-xl font-light text-[#111111]">
      No matching looks or pieces found
    </p>
    <p className="mt-2 text-xs text-[#666666] max-w-md mx-auto">
      Your selected combination across dimensions returned zero matches. Try removing an active
      dimension filter or resetting your search.
    </p>
    <button
      type="button"
      onClick={onClear}
      className="mt-5 min-h-[44px] px-5 bg-[#111111] text-white font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer"
    >
      Clear All Filters
    </button>
  </div>
);
