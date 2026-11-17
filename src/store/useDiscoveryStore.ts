import { create } from 'zustand';
import { catalogRepository } from '../engine/catalogRepository';
import {
  GridCatalogTab,
  SortOption,
  TaxonomyDimensionSlug,
} from '../types/taxonomy';

interface DiscoveryState {
  searchQuery: string;
  selectedByDimension: Partial<Record<TaxonomyDimensionSlug, string[]>>;
  collectionSlug: string | null;
  sortBy: SortOption;
  gridTab: GridCatalogTab;
  looksPage: number;
  productsPage: number;
  looksPageSize: number;
  productsPageSize: number;
  filterDrawerOpen: boolean;
  selectedProductDetailId: string | null;
  taxonomyVersion: number;

  setSearchQuery: (q: string) => void;
  toggleFilterOption: (dimensionSlug: TaxonomyDimensionSlug, optionId: string) => void;
  setDimensionOptions: (dimensionSlug: TaxonomyDimensionSlug, optionIds: string[]) => void;
  removeFilterOption: (dimensionSlug: TaxonomyDimensionSlug, optionId: string) => void;
  setCollectionSlug: (slug: string | null) => void;
  clearAllFilters: () => void;
  setSortBy: (sort: SortOption) => void;
  setGridTab: (tab: GridCatalogTab) => void;
  setLooksPage: (page: number) => void;
  setProductsPage: (page: number) => void;
  toggleFilterDrawer: (open?: boolean) => void;
  openProductDetail: (productId: string | null) => void;
  addCustomTaxonomyOption: (input: {
    dimensionSlug: TaxonomyDimensionSlug;
    label: string;
    parentId?: string | null;
    groupLabel?: string;
    swatchHex?: string;
  }) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  searchQuery: '',
  selectedByDimension: {},
  collectionSlug: null,
  sortBy: 'featured',
  gridTab: 'looks',
  looksPage: 1,
  productsPage: 1,
  looksPageSize: 6,
  productsPageSize: 9,
  filterDrawerOpen: false,
  selectedProductDetailId: null,
  taxonomyVersion: catalogRepository.getMutationVersion(),

  setSearchQuery: (q) =>
    set({
      searchQuery: q,
      looksPage: 1,
      productsPage: 1,
    }),

  toggleFilterOption: (dimensionSlug, optionId) =>
    set((state) => {
      const current = state.selectedByDimension[dimensionSlug] ?? [];
      const exists = current.includes(optionId);
      const next = exists ? current.filter((id) => id !== optionId) : [...current, optionId];
      const nextMap = { ...state.selectedByDimension };
      if (next.length === 0) {
        delete nextMap[dimensionSlug];
      } else {
        nextMap[dimensionSlug] = next;
      }
      return {
        selectedByDimension: nextMap,
        looksPage: 1,
        productsPage: 1,
      };
    }),

  setDimensionOptions: (dimensionSlug, optionIds) =>
    set((state) => {
      const nextMap = { ...state.selectedByDimension };
      if (optionIds.length === 0) {
        delete nextMap[dimensionSlug];
      } else {
        nextMap[dimensionSlug] = optionIds;
      }
      return {
        selectedByDimension: nextMap,
        looksPage: 1,
        productsPage: 1,
      };
    }),

  removeFilterOption: (dimensionSlug, optionId) =>
    set((state) => {
      const current = state.selectedByDimension[dimensionSlug] ?? [];
      const next = current.filter((id) => id !== optionId);
      const nextMap = { ...state.selectedByDimension };
      if (next.length === 0) {
        delete nextMap[dimensionSlug];
      } else {
        nextMap[dimensionSlug] = next;
      }
      return {
        selectedByDimension: nextMap,
        looksPage: 1,
        productsPage: 1,
      };
    }),

  setCollectionSlug: (slug) =>
    set((state) => ({
      collectionSlug: state.collectionSlug === slug ? null : slug,
      looksPage: 1,
      productsPage: 1,
    })),

  clearAllFilters: () =>
    set({
      searchQuery: '',
      selectedByDimension: {},
      collectionSlug: null,
      looksPage: 1,
      productsPage: 1,
    }),

  setSortBy: (sort) =>
    set({
      sortBy: sort,
      looksPage: 1,
      productsPage: 1,
    }),

  setGridTab: (tab) => set({ gridTab: tab }),

  setLooksPage: (page) => set({ looksPage: Math.max(1, page) }),

  setProductsPage: (page) => set({ productsPage: Math.max(1, page) }),

  toggleFilterDrawer: (open) =>
    set((state) => ({
      filterDrawerOpen: typeof open === 'boolean' ? open : !state.filterDrawerOpen,
    })),

  openProductDetail: (productId) => set({ selectedProductDetailId: productId }),

  addCustomTaxonomyOption: (input) => {
    catalogRepository.addTaxonomyOption(input);
    set({ taxonomyVersion: catalogRepository.getMutationVersion() });
  },
}));
