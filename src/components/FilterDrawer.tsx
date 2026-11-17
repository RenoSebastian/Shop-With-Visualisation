import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
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
import { FilterOption, SearchSuggestion, TaxonomyDimensionSlug } from '../types/taxonomy';

interface FilterDrawerProps {
  facetTarget: 'looks' | 'products';
  isMobile?: boolean;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  facetTarget,
  isMobile = false,
}) => {
  const {
    filterDrawerOpen,
    searchQuery,
    selectedByDimension,
    collectionSlug,
    taxonomyVersion,
    setSearchQuery,
    toggleFilterDrawer,
    toggleFilterOption,
    removeFilterOption,
    setCollectionSlug,
    clearAllFilters,
    openProductDetail,
    addCustomTaxonomyOption,
  } = useDiscoveryStore();

  const { selectModelInShowroom } = useShowroomStore();

  const {
    dimensions,
    collections,
    filteredShowroomLooks,
    paginatedProducts,
    activeFilterChips,
    activeFilterCount,
  } = useCatalogDiscovery();

  const [searchFocused, setSearchFocused] = useState(false);

  const [expandedDims, setExpandedDims] = useState<Record<string, boolean>>({
    style: true,
    era: true,
    garment: true,
    color_pattern: true,
    fit: false,
    occasion: false,
    season: false,
    material: false,
  });

  // Discreet administrative extensibility form to add new taxonomy tags without editing code
  const [adminAddOpen, setAdminAddOpen] = useState(false);
  const [newTagDimension, setNewTagDimension] = useState<TaxonomyDimensionSlug>('style');
  const [newTagLabel, setNewTagLabel] = useState('');

  const facetCounts = useMemo(
    () => catalogRepository.getOptionFacetCounts(facetTarget),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facetTarget, taxonomyVersion],
  );

  const suggestions = useMemo(
    () => (searchFocused ? catalogRepository.searchSuggestions(searchQuery, 6) : []),
    [searchFocused, searchQuery],
  );

  const handleSelectSuggestion = (sug: SearchSuggestion) => {
    setSearchFocused(false);
    if (sug.type === 'look') {
      toggleFilterDrawer(false);
      selectModelInShowroom(sug.targetId);
    } else if (sug.type === 'product') {
      toggleFilterDrawer(false);
      openProductDetail(sug.targetId);
    } else if (sug.type === 'collection') {
      setCollectionSlug(sug.targetId);
      setSearchQuery('');
    } else if (sug.type === 'option' && sug.dimensionSlug) {
      toggleFilterOption(sug.dimensionSlug, sug.targetId);
      setSearchQuery('');
    }
  };

  const toggleDimAccordion = (slug: string) => {
    setExpandedDims((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagLabel.trim()) return;
    addCustomTaxonomyOption({
      dimensionSlug: newTagDimension,
      label: newTagLabel.trim(),
    });
    setExpandedDims((prev) => ({ ...prev, [newTagDimension]: true }));
    setNewTagLabel('');
  };

  const matchCount =
    facetTarget === 'products' ? paginatedProducts.total : filteredShowroomLooks.total;

  return (
    <AnimatePresence>
      {filterDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => toggleFilterDrawer(false)}
            className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]"
          />

          <motion.aside
            initial={isMobile ? { y: '100%' } : { x: '-100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '-100%' }}
            transition={{ type: 'spring', stiffness: 290, damping: 32 }}
            aria-label="Multi-dimensional taxonomy filters"
            className={
              isMobile
                ? 'fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] rounded-t-2xl bg-white border-t border-[#E2E2E2] shadow-2xl flex flex-col overflow-hidden'
                : 'fixed top-0 left-0 bottom-0 z-50 w-full max-w-[420px] bg-white border-r border-[#E2E2E2] flex flex-col'
            }
          >
            {isMobile && (
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 bg-[#D4D4D4] rounded-full" />
              </div>
            )}

            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E5E5E5] flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[#111111]" />
                <h2 className="font-mono text-[11px] tracking-[0.14em] text-[#111111] uppercase">
                  DISCOVER & FILTER
                </h2>
                {activeFilterCount > 0 && (
                  <span className="font-mono text-[10px] text-[#737373] tabular-nums">
                    ({activeFilterCount} active)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggleFilterDrawer(false)}
                aria-label="Close taxonomy filters"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Unified Search + Active Chips inside Drawer */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-[#FAFAFA] border-b border-[#EAEAEA] space-y-2.5 shrink-0">
              <div className="relative">
                <div className="flex items-center h-10 sm:h-9 bg-white border border-[#DCDCDC] focus-within:border-[#111111] px-2.5 gap-2">
                  <Search className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchFocused(true);
                    }}
                    placeholder="Search looks, pieces, styles, materials..."
                    aria-label="Search looks and products"
                    className="w-full bg-transparent text-xs text-[#111111] placeholder:text-[#888888] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#737373] hover:text-[#111111] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {searchFocused && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#DCDCDC] shadow-lg z-50 divide-y divide-[#F0F0F0]">
                    {suggestions.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(sug);
                        }}
                        className="w-full min-h-[42px] px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-[#F5F5F5] cursor-pointer"
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

              {activeFilterChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
                      className="min-h-[30px] sm:min-h-[24px] px-2.5 sm:px-2 inline-flex items-center gap-1 bg-white border border-[#111111] text-[10px] text-[#111111] cursor-pointer"
                    >
                      <span className="text-[#737373]">{chip.dimensionLabel}:</span>
                      <span>{chip.label}</span>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-[10.5px] text-[#737373]">
                Match ANY within dimension (OR) · ALL across dimensions (AND)
              </div>
            </div>

            {/* Scrollable Quick Styles + Collections + 8-Dimension Accordions */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {/* Popular Style Quick Filters */}
              <section className="pb-4 border-b border-[#EAEAEA]">
                <div className="font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase mb-2.5">
                  Popular Styles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FIND_POPULAR_QUICK_FILTERS.map((qf) => {
                    const active = (selectedByDimension[qf.dimensionSlug] ?? []).includes(
                      qf.optionId,
                    );
                    return (
                      <button
                        key={qf.optionId}
                        type="button"
                        onClick={() => toggleFilterOption(qf.dimensionSlug, qf.optionId)}
                        className={`min-h-[38px] sm:min-h-[32px] px-3 sm:px-2.5 py-1 border font-mono text-[10px] tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-[#FAFAFA] text-[#222222] border-[#E0E0E0] hover:border-[#111111]'
                        }`}
                      >
                        {qf.label}
                      </button>
                    );
                  })}
                </div>
              </section>
              {/* Curated Collections (Independent of Taxonomy) */}
              <section className="pb-4 border-b border-[#EAEAEA]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-[#111111] uppercase">
                    Curated Editorial Collections
                  </span>
                  <span className="font-mono text-[9.5px] text-[#737373]">Independent</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {collections.map((col) => {
                    const isSelected = collectionSlug === col.slug;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setCollectionSlug(col.slug)}
                        className={`min-h-[38px] sm:min-h-[34px] px-3 py-1.5 text-[11px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-[#FAFAFA] text-[#222222] border-[#E0E0E0] hover:border-[#111111]'
                        }`}
                      >
                        {col.title}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Eight Independent Taxonomy Dimensions */}
              {dimensions.map((dim, idx) => {
                const isOpen = Boolean(expandedDims[dim.slug]);
                const options = catalogRepository.getOptionsByDimension(dim.slug);
                const selectedIds = selectedByDimension[dim.slug] ?? [];

                // Group options by groupLabel if provided, or render flat/hierarchical
                const grouped = groupOptions(options);

                return (
                  <section key={dim.id} className="pb-4 border-b border-[#EAEAEA] last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleDimAccordion(dim.slug)}
                      className="w-full min-h-[40px] sm:min-h-0 py-2 sm:py-1.5 flex items-center justify-between gap-3 text-left cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#737373] tabular-nums">
                            0{idx + 1}.
                          </span>
                          <span className="text-[13px] font-medium text-[#111111]">
                            {dim.name}
                          </span>
                          {selectedIds.length > 0 && (
                            <span className="font-mono text-[10px] text-[#111111] tabular-nums">
                              · {selectedIds.length}
                            </span>
                          )}
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#737373] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="mt-3 space-y-3">
                        {dim.isHierarchical ? (
                          <HierarchicalOptionTree
                            options={options}
                            selectedIds={selectedIds}
                            facetCounts={facetCounts}
                            onToggle={(optId) => toggleFilterOption(dim.slug, optId)}
                          />
                        ) : (
                          grouped.map((group) => (
                            <div key={group.label ?? 'default'}>
                              {group.label && (
                                <div className="font-mono text-[9.5px] tracking-[0.12em] text-[#737373] uppercase mb-1.5">
                                  {group.label}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1.5">
                                {group.items.map((opt) => {
                                  const active = selectedIds.includes(opt.id);
                                  const count = facetCounts[opt.id] ?? 0;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => toggleFilterOption(dim.slug, opt.id)}
                                      className={`min-h-[38px] sm:min-h-[34px] px-2.5 py-1 inline-flex items-center gap-1.5 text-[11px] border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                        active
                                          ? 'bg-[#111111] text-white border-[#111111]'
                                          : 'bg-white text-[#262626] border-[#E0E0E0] hover:border-[#111111]'
                                      }`}
                                    >
                                      {opt.swatchHex && (
                                        <span
                                          aria-hidden="true"
                                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                          style={{ backgroundColor: opt.swatchHex }}
                                        />
                                      )}
                                      <span>{opt.label}</span>
                                      <span
                                        className={`font-mono text-[9.5px] tabular-nums ${
                                          active ? 'text-white/75' : 'text-[#888888]'
                                        }`}
                                      >
                                        {count}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Discreet Administrative Taxonomy Extensibility */}
              <section className="pt-2">
                <button
                  type="button"
                  onClick={() => setAdminAddOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#666666] hover:text-[#111111] uppercase cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Taxonomy Value</span>
                </button>

                {adminAddOpen && (
                  <form
                    onSubmit={handleAddTag}
                    className="mt-2.5 p-3 bg-[#F7F7F7] border border-[#E5E5E5] space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newTagDimension}
                        onChange={(e) =>
                          setNewTagDimension(e.target.value as TaxonomyDimensionSlug)
                        }
                        aria-label="Target taxonomy dimension"
                        className="h-9 px-2 bg-white border border-[#DCDCDC] text-xs text-[#111111]"
                      >
                        {dimensions.map((d) => (
                          <option key={d.id} value={d.slug}>
                            {d.shortLabel}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newTagLabel}
                        onChange={(e) => setNewTagLabel(e.target.value)}
                        placeholder="e.g. Techwear, Silk"
                        aria-label="New taxonomy option name"
                        className="h-9 px-2.5 bg-white border border-[#DCDCDC] text-xs text-[#111111]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full h-9 bg-[#111111] text-white font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer"
                    >
                      Register Option
                    </button>
                  </form>
                )}
              </section>
            </div>

            {/* Footer Action Bar */}
            <div className="px-4 sm:px-6 pt-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-4 border-t border-[#E5E5E5] bg-white flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
                className="min-h-[44px] px-4 inline-flex items-center gap-1.5 border border-[#DCDCDC] text-xs text-[#333333] hover:border-[#111111] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              <button
                type="button"
                onClick={() => toggleFilterDrawer(false)}
                className="min-h-[44px] flex-1 px-5 bg-[#111111] hover:bg-[#262626] text-white font-mono text-[10.5px] tracking-[0.14em] uppercase cursor-pointer whitespace-nowrap tabular-nums"
              >
                VIEW {matchCount} {facetTarget === 'products' ? 'PRODUCTS' : 'LOOKS'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

function groupOptions(options: FilterOption[]) {
  const map = new Map<string, FilterOption[]>();
  options.forEach((opt) => {
    const key = opt.groupLabel ?? '';
    const list = map.get(key) ?? [];
    list.push(opt);
    map.set(key, list);
  });
  return Array.from(map.entries()).map(([label, items]) => ({
    label: label || undefined,
    items,
  }));
}

interface HierarchicalOptionTreeProps {
  options: FilterOption[];
  selectedIds: string[];
  facetCounts: Record<string, number>;
  onToggle: (optionId: string) => void;
}

const HierarchicalOptionTree: React.FC<HierarchicalOptionTreeProps> = ({
  options,
  selectedIds,
  facetCounts,
  onToggle,
}) => {
  const roots = options.filter((o) => !o.parentId);
  const childrenByParent = useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    options.forEach((o) => {
      if (o.parentId) {
        const list = map.get(o.parentId) ?? [];
        list.push(o);
        map.set(o.parentId, list);
      }
    });
    return map;
  }, [options]);

  return (
    <div className="space-y-3">
      {roots.map((root) => {
        const rootSelected = selectedIds.includes(root.id);
        const children = childrenByParent.get(root.id) ?? [];

        return (
          <div key={root.id} className="space-y-1.5">
            <button
              type="button"
              onClick={() => onToggle(root.id)}
              className={`min-h-[38px] sm:min-h-[34px] px-3 py-1 inline-flex items-center gap-2 text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                rootSelected
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-[#F7F7F7] text-[#111111] border-[#E0E0E0] hover:border-[#111111]'
              }`}
            >
              <span>{root.label}</span>
              <span
                className={`font-mono text-[9.5px] tabular-nums ${
                  rootSelected ? 'text-white/75' : 'text-[#737373]'
                }`}
              >
                {facetCounts[root.id] ?? 0}
              </span>
            </button>

            {children.length > 0 && (
              <div className="pl-3 flex flex-wrap gap-1.5">
                {children.map((child) => {
                  const childSelected = selectedIds.includes(child.id);
                  const grandChildren = childrenByParent.get(child.id) ?? [];
                  return (
                    <React.Fragment key={child.id}>
                      <button
                        type="button"
                        onClick={() => onToggle(child.id)}
                        className={`min-h-[38px] sm:min-h-[32px] px-2.5 py-1 inline-flex items-center gap-1.5 text-[11px] border transition-colors cursor-pointer whitespace-nowrap ${
                          childSelected
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-[#333333] border-[#E5E5E5] hover:border-[#111111]'
                        }`}
                      >
                        <span>{child.label}</span>
                        <span
                          className={`font-mono text-[9.5px] tabular-nums ${
                            childSelected ? 'text-white/75' : 'text-[#888888]'
                          }`}
                        >
                          {facetCounts[child.id] ?? 0}
                        </span>
                      </button>

                      {grandChildren.map((gc) => {
                        const gcSelected = selectedIds.includes(gc.id);
                        return (
                          <button
                            key={gc.id}
                            type="button"
                            onClick={() => onToggle(gc.id)}
                            className={`min-h-[38px] sm:min-h-[32px] px-2.5 py-1 inline-flex items-center gap-1.5 text-[11px] border border-dashed transition-colors cursor-pointer whitespace-nowrap ${
                              gcSelected
                                ? 'bg-[#111111] text-white border-[#111111] border-solid'
                                : 'bg-white text-[#555555] border-[#D4D4D4] hover:border-[#111111]'
                            }`}
                          >
                            <span>{child.label} → {gc.label}</span>
                            <span
                              className={`font-mono text-[9.5px] tabular-nums ${
                                gcSelected ? 'text-white/75' : 'text-[#888888]'
                              }`}
                            >
                              {facetCounts[gc.id] ?? 0}
                            </span>
                          </button>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
