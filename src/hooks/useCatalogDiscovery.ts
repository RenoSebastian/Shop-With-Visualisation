import { useEffect, useMemo, useState } from 'react';
import { catalogRepository } from '../engine/catalogRepository';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { TaxonomyDimensionSlug } from '../types/taxonomy';

export interface ActiveFilterChip {
  kind: 'option' | 'collection';
  dimensionSlug?: TaxonomyDimensionSlug;
  dimensionLabel: string;
  optionId: string;
  label: string;
}

export function useDebouncedValue<T>(value: T, delayMs = 160): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useCatalogDiscovery() {
  const {
    searchQuery,
    selectedByDimension,
    collectionSlug,
    sortBy,
    looksPage,
    productsPage,
    looksPageSize,
    productsPageSize,
    taxonomyVersion,
  } = useDiscoveryStore();

  const debouncedSearch = useDebouncedValue(searchQuery, 150);

  const dimensions = useMemo(
    () => catalogRepository.getDimensions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taxonomyVersion],
  );

  const collections = useMemo(
    () => catalogRepository.getCollections(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taxonomyVersion],
  );

  // Full filtered looks for FIND central-bearing turntable
  const filteredShowroomLooks = useMemo(
    () =>
      catalogRepository.queryLooks({
        searchQuery: debouncedSearch,
        selectedByDimension,
        collectionSlug,
        sortBy,
        page: 1,
        pageSize: 500,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, selectedByDimension, collectionSlug, sortBy, taxonomyVersion],
  );

  // Paginated looks for GRID -> LOOKS
  const paginatedLooks = useMemo(
    () =>
      catalogRepository.queryLooks({
        searchQuery: debouncedSearch,
        selectedByDimension,
        collectionSlug,
        sortBy,
        page: looksPage,
        pageSize: looksPageSize,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      debouncedSearch,
      selectedByDimension,
      collectionSlug,
      sortBy,
      looksPage,
      looksPageSize,
      taxonomyVersion,
    ],
  );

  // Paginated products for GRID -> PRODUCTS
  const paginatedProducts = useMemo(
    () =>
      catalogRepository.queryProducts({
        searchQuery: debouncedSearch,
        selectedByDimension,
        collectionSlug,
        sortBy,
        page: productsPage,
        pageSize: productsPageSize,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      debouncedSearch,
      selectedByDimension,
      collectionSlug,
      sortBy,
      productsPage,
      productsPageSize,
      taxonomyVersion,
    ],
  );

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = [];

    if (collectionSlug) {
      const col = catalogRepository.getCollectionBySlug(collectionSlug);
      if (col) {
        chips.push({
          kind: 'collection',
          dimensionLabel: 'Collection',
          optionId: col.slug,
          label: col.title,
        });
      }
    }

    dimensions.forEach((dim) => {
      const selected = selectedByDimension[dim.slug] ?? [];
      selected.forEach((optId) => {
        const opt = catalogRepository.getOptionById(optId);
        if (opt) {
          chips.push({
            kind: 'option',
            dimensionSlug: dim.slug,
            dimensionLabel: dim.shortLabel,
            optionId: optId,
            label: opt.label,
          });
        }
      });
    });

    return chips;
  }, [collectionSlug, dimensions, selectedByDimension]);

  const activeFilterCount = activeFilterChips.length + (debouncedSearch.trim() ? 1 : 0);

  return {
    dimensions,
    collections,
    debouncedSearch,
    filteredShowroomLooks,
    paginatedLooks,
    paginatedProducts,
    activeFilterChips,
    activeFilterCount,
  };
}
