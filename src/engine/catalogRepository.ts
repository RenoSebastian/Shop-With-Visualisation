import {
  COLLECTION_LOOK_JUNCTIONS,
  LOOK_ENTITIES,
  LOOK_FILTER_OPTIONS,
  LOOK_PRODUCT_JUNCTIONS,
  MODEL_ENTITIES,
  PRODUCT_ENTITIES,
  PRODUCT_FILTER_OPTIONS,
  PRODUCT_VARIANTS,
} from '../data/catalogSeed';
import {
  CURATED_COLLECTIONS,
  FILTER_DIMENSIONS,
  INITIAL_FILTER_OPTIONS,
} from '../data/taxonomySeed';
import { SizeOption } from '../types/showroom';
import {
  CatalogFilterQuery,
  CollectionLookJunction,
  CuratedCollection,
  EnrichedLookRecord,
  EnrichedProductRecord,
  FilterDimension,
  FilterOption,
  LookEntity,
  LookFilterOptionJunction,
  ModelEntity,
  PaginatedResult,
  ProductEntity,
  ProductFilterOptionJunction,
  ProductVariantEntity,
  SearchSuggestion,
  SortOption,
  TaxonomyDimensionSlug,
} from '../types/taxonomy';

const ALL_DIMENSION_SLUGS: TaxonomyDimensionSlug[] = [
  'style',
  'era',
  'garment',
  'color_pattern',
  'fit',
  'occasion',
  'season',
  'material',
];

function createEmptyDimensionMap(): Record<TaxonomyDimensionSlug, FilterOption[]> {
  return {
    style: [],
    era: [],
    garment: [],
    color_pattern: [],
    fit: [],
    occasion: [],
    season: [],
    material: [],
  };
}

/**
 * Indexed relational repository for multi-dimensional taxonomy filtering,
 * unified catalog search, M:N look/product traversal, and bounded result caching.
 */
class CatalogRepository {
  private dimensions: FilterDimension[] = [...FILTER_DIMENSIONS];
  private options: FilterOption[] = [...INITIAL_FILTER_OPTIONS];
  private modelsById = new Map<string, ModelEntity>();
  private looksById = new Map<string, LookEntity>();
  private productsById = new Map<string, ProductEntity>();
  private collectionsById = new Map<string, CuratedCollection>();
  private collectionsBySlug = new Map<string, CuratedCollection>();

  private optionById = new Map<string, FilterOption>();
  private childOptionsByParentId = new Map<string, string[]>();
  private variantsByProductId = new Map<string, ProductVariantEntity[]>();
  private productsByLookId = new Map<string, ProductEntity[]>();
  private primaryProductIdsByLookId = new Map<string, string[]>();
  private looksByProductId = new Map<string, LookEntity[]>();
  private collectionsByLookId = new Map<string, CuratedCollection[]>();
  private lookIdsByCollectionSlug = new Map<string, Set<string>>();

  private lookFilterJunctions: LookFilterOptionJunction[] = [...LOOK_FILTER_OPTIONS];
  private productFilterJunctions: ProductFilterOptionJunction[] = [...PRODUCT_FILTER_OPTIONS];
  private collectionLookJunctions: CollectionLookJunction[] = [...COLLECTION_LOOK_JUNCTIONS];

  // Inverted indexes (optionId -> Set<entityId>) for fast scalable multi-select filtering
  private lookIdsByOptionId = new Map<string, Set<string>>();
  private productIdsByOptionId = new Map<string, Set<string>>();
  private optionIdsByLookId = new Map<string, Set<string>>();
  private optionIdsByProductId = new Map<string, Set<string>>();

  // Bounded LRU-like query cache invalidated whenever taxonomy/catalog changes
  private queryCache = new Map<string, unknown>();
  private mutationVersion = 0;

  constructor() {
    this.rebuildIndexes();
  }

  private rebuildIndexes() {
    this.modelsById.clear();
    this.looksById.clear();
    this.productsById.clear();
    this.collectionsById.clear();
    this.collectionsBySlug.clear();
    this.optionById.clear();
    this.childOptionsByParentId.clear();
    this.variantsByProductId.clear();
    this.productsByLookId.clear();
    this.primaryProductIdsByLookId.clear();
    this.looksByProductId.clear();
    this.collectionsByLookId.clear();
    this.lookIdsByCollectionSlug.clear();
    this.lookIdsByOptionId.clear();
    this.productIdsByOptionId.clear();
    this.optionIdsByLookId.clear();
    this.optionIdsByProductId.clear();
    this.queryCache.clear();

    MODEL_ENTITIES.forEach((m) => this.modelsById.set(m.id, m));
    LOOK_ENTITIES.forEach((l) => this.looksById.set(l.id, l));
    PRODUCT_ENTITIES.forEach((p) => this.productsById.set(p.id, p));
    CURATED_COLLECTIONS.forEach((c) => {
      this.collectionsById.set(c.id, c);
      this.collectionsBySlug.set(c.slug, c);
      this.lookIdsByCollectionSlug.set(c.slug, new Set());
    });

    this.options.forEach((opt) => {
      this.optionById.set(opt.id, opt);
      if (opt.parentId) {
        const list = this.childOptionsByParentId.get(opt.parentId) ?? [];
        list.push(opt.id);
        this.childOptionsByParentId.set(opt.parentId, list);
      }
    });

    PRODUCT_VARIANTS.forEach((v) => {
      const list = this.variantsByProductId.get(v.productId) ?? [];
      list.push(v);
      this.variantsByProductId.set(v.productId, list);
    });

    // Build Look <-> Product traversal
    const sortedJunctions = [...LOOK_PRODUCT_JUNCTIONS].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    sortedJunctions.forEach((lp) => {
      const product = this.productsById.get(lp.productId);
      const look = this.looksById.get(lp.lookId);
      if (!product || !look) return;

      const prodList = this.productsByLookId.get(lp.lookId) ?? [];
      if (!prodList.some((p) => p.id === product.id)) {
        prodList.push(product);
        this.productsByLookId.set(lp.lookId, prodList);
      }

      const lookList = this.looksByProductId.get(lp.productId) ?? [];
      if (!lookList.some((l) => l.id === look.id)) {
        lookList.push(look);
        this.looksByProductId.set(lp.productId, lookList);
      }
    });

    LOOK_ENTITIES.forEach((look) => {
      const primary = sortedJunctions
        .filter((j) => j.lookId === look.id && j.role === 'primary')
        .map((j) => j.productId);
      const fallback = (this.productsByLookId.get(look.id) ?? []).map((p) => p.id);
      const ids = primary.length > 0 ? primary : fallback;
      this.primaryProductIdsByLookId.set(look.id, ids);
    });

    // Collection <-> Look
    this.collectionLookJunctions.forEach((cl) => {
      const col = this.collectionsById.get(cl.collectionId);
      if (!col) return;
      const list = this.collectionsByLookId.get(cl.lookId) ?? [];
      if (!list.some((c) => c.id === col.id)) {
        list.push(col);
        this.collectionsByLookId.set(cl.lookId, list);
      }
      this.lookIdsByCollectionSlug.get(col.slug)?.add(cl.lookId);
    });

    // Inverted Taxonomy Indexes
    this.lookFilterJunctions.forEach(({ lookId, optionId }) => {
      const set = this.lookIdsByOptionId.get(optionId) ?? new Set<string>();
      set.add(lookId);
      this.lookIdsByOptionId.set(optionId, set);

      const lookOptSet = this.optionIdsByLookId.get(lookId) ?? new Set<string>();
      lookOptSet.add(optionId);
      this.optionIdsByLookId.set(lookId, lookOptSet);
    });

    this.productFilterJunctions.forEach(({ productId, optionId }) => {
      const set = this.productIdsByOptionId.get(optionId) ?? new Set<string>();
      set.add(productId);
      this.productIdsByOptionId.set(optionId, set);

      const prodOptSet = this.optionIdsByProductId.get(productId) ?? new Set<string>();
      prodOptSet.add(optionId);
      this.optionIdsByProductId.set(productId, prodOptSet);
    });
  }

  getMutationVersion(): number {
    return this.mutationVersion;
  }

  getDimensions(): FilterDimension[] {
    return this.dimensions
      .filter((d) => d.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getOptionsByDimension(dimensionSlug: TaxonomyDimensionSlug): FilterOption[] {
    return this.options
      .filter((o) => o.isActive && o.dimensionSlug === dimensionSlug)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getOptionById(optionId: string): FilterOption | undefined {
    return this.optionById.get(optionId);
  }

  /**
   * Administrative Extensibility: allows adding new taxonomy tags/categories
   * at runtime without changing application code.
   */
  addTaxonomyOption(input: {
    dimensionSlug: TaxonomyDimensionSlug;
    label: string;
    parentId?: string | null;
    groupLabel?: string;
    swatchHex?: string;
  }): FilterOption {
    const trimmed = input.label.trim();
    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const dim = this.dimensions.find((d) => d.slug === input.dimensionSlug);
    const id = `${input.dimensionSlug}-${slug || Date.now()}`;

    const existing = this.optionById.get(id);
    if (existing) {
      existing.isActive = true;
      this.mutationVersion += 1;
      this.queryCache.clear();
      return existing;
    }

    const newOpt: FilterOption = {
      id,
      dimensionId: dim?.id ?? `dim-${input.dimensionSlug}`,
      dimensionSlug: input.dimensionSlug,
      slug,
      label: trimmed,
      parentId: input.parentId ?? null,
      groupLabel: input.groupLabel,
      swatchHex: input.swatchHex,
      displayOrder: this.options.length + 1,
      isFeatured: false,
      isActive: true,
    };

    this.options = [...this.options, newOpt];
    this.mutationVersion += 1;
    this.rebuildIndexes();
    return newOpt;
  }

  getCollections(): CuratedCollection[] {
    return [...CURATED_COLLECTIONS].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getCollectionBySlug(slug: string): CuratedCollection | undefined {
    return this.collectionsBySlug.get(slug);
  }

  getLookIdsInCollection(slug: string): string[] {
    return Array.from(this.lookIdsByCollectionSlug.get(slug) ?? []);
  }

  getAllPublishedLooks(): EnrichedLookRecord[] {
    return LOOK_ENTITIES.filter((l) => l.status === 'published').map((l) =>
      this.enrichLook(l),
    );
  }

  getEnrichedLookById(lookId: string): EnrichedLookRecord | undefined {
    const look = this.looksById.get(lookId);
    return look ? this.enrichLook(look) : undefined;
  }

  getEnrichedProductById(productId: string): EnrichedProductRecord | undefined {
    const product = this.productsById.get(productId);
    return product ? this.enrichProduct(product) : undefined;
  }

  getProductsForLook(lookId: string): ProductEntity[] {
    return this.productsByLookId.get(lookId) ?? [];
  }

  getLooksForProduct(productId: string): LookEntity[] {
    return this.looksByProductId.get(productId) ?? [];
  }

  private expandOptionIds(optionId: string): string[] {
    const visited = new Set<string>([optionId]);
    const queue = [optionId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = this.childOptionsByParentId.get(current) ?? [];
      for (const childId of children) {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push(childId);
        }
      }
    }
    return Array.from(visited);
  }

  private enrichLook(look: LookEntity): EnrichedLookRecord {
    const model = this.modelsById.get(look.modelId) ?? MODEL_ENTITIES[0];
    const products = this.productsByLookId.get(look.id) ?? [];
    const primaryProductIds =
      this.primaryProductIdsByLookId.get(look.id) ?? products.map((p) => p.id);
    const collections = this.collectionsByLookId.get(look.id) ?? [];
    const optIds = Array.from(this.optionIdsByLookId.get(look.id) ?? []);

    const optionsByDimension = createEmptyDimensionMap();
    optIds.forEach((optId) => {
      const opt = this.optionById.get(optId);
      if (opt && opt.isActive) {
        optionsByDimension[opt.dimensionSlug].push(opt);
      }
    });

    // All primary outfit pieces compute the look price cleanly
    const primaryProducts = primaryProductIds
      .map((id) => this.productsById.get(id))
      .filter((p): p is ProductEntity => Boolean(p));
    const hasPurchasablePrice = primaryProducts.every((p) => typeof p.price === 'number');
    const totalPrice = primaryProducts.reduce((sum, p) => sum + (p.price ?? 0), 0);

    return {
      look,
      model,
      products,
      primaryProductIds,
      collections,
      optionsByDimension,
      allOptionIds: optIds,
      totalPrice,
      hasPurchasablePrice,
    };
  }

  private enrichProduct(product: ProductEntity): EnrichedProductRecord {
    const variants = this.variantsByProductId.get(product.id) ?? [];
    const sizeSet = new Set<SizeOption>();
    const colorMap = new Map<string, { slug: string; name: string; hex: string }>();

    variants.forEach((v) => {
      sizeSet.add(v.size);
      if (!colorMap.has(v.colorSlug)) {
        colorMap.set(v.colorSlug, {
          slug: v.colorSlug,
          name: v.colorName,
          hex: v.colorHex,
        });
      }
    });

    const optIds = Array.from(this.optionIdsByProductId.get(product.id) ?? []);
    const optionsByDimension = createEmptyDimensionMap();
    optIds.forEach((optId) => {
      const opt = this.optionById.get(optId);
      if (opt && opt.isActive) {
        optionsByDimension[opt.dimensionSlug].push(opt);
      }
    });

    const hierarchyLabels: string[] = [];
    const catOption = this.options.find(
      (o) => o.dimensionSlug === 'garment' && o.slug === product.categorySlug,
    );
    let cursor: FilterOption | undefined = catOption;
    while (cursor) {
      hierarchyLabels.unshift(cursor.label);
      cursor = cursor.parentId ? this.optionById.get(cursor.parentId) : undefined;
    }

    return {
      product,
      variants,
      availableSizes: Array.from(sizeSet),
      availableColors: Array.from(colorMap.values()),
      associatedLooks: this.looksByProductId.get(product.id) ?? [],
      optionsByDimension,
      allOptionIds: optIds,
      categoryHierarchyLabels: hierarchyLabels,
    };
  }

  private getMatchingLookIdsForFilters(
    selectedByDimension: Partial<Record<TaxonomyDimensionSlug, string[]>>,
    collectionSlug: string | null,
  ): Set<string> {
    let candidateIds = new Set(
      LOOK_ENTITIES.filter((l) => l.status === 'published').map((l) => l.id),
    );

    if (collectionSlug) {
      const collectionIds = this.lookIdsByCollectionSlug.get(collectionSlug) ?? new Set();
      candidateIds = new Set(Array.from(candidateIds).filter((id) => collectionIds.has(id)));
    }

    // AND across different taxonomy dimensions, OR within each dimension
    for (const dimSlug of ALL_DIMENSION_SLUGS) {
      const selected = selectedByDimension[dimSlug];
      if (!selected || selected.length === 0) continue;

      const unionIds = new Set<string>();
      selected.forEach((optId) => {
        this.expandOptionIds(optId).forEach((expandedId) => {
          this.lookIdsByOptionId.get(expandedId)?.forEach((lookId) => unionIds.add(lookId));
        });
      });

      candidateIds = new Set(Array.from(candidateIds).filter((id) => unionIds.has(id)));
    }

    return candidateIds;
  }

  private getMatchingProductIdsForFilters(
    selectedByDimension: Partial<Record<TaxonomyDimensionSlug, string[]>>,
    collectionSlug: string | null,
  ): Set<string> {
    let candidateIds = new Set(PRODUCT_ENTITIES.map((p) => p.id));

    if (collectionSlug) {
      const collectionLookIds = this.lookIdsByCollectionSlug.get(collectionSlug) ?? new Set();
      const allowedProducts = new Set<string>();
      collectionLookIds.forEach((lookId) => {
        this.productsByLookId.get(lookId)?.forEach((p) => allowedProducts.add(p.id));
      });
      candidateIds = new Set(Array.from(candidateIds).filter((id) => allowedProducts.has(id)));
    }

    for (const dimSlug of ALL_DIMENSION_SLUGS) {
      const selected = selectedByDimension[dimSlug];
      if (!selected || selected.length === 0) continue;

      const unionIds = new Set<string>();
      selected.forEach((optId) => {
        this.expandOptionIds(optId).forEach((expandedId) => {
          this.productIdsByOptionId.get(expandedId)?.forEach((prodId) => unionIds.add(prodId));
        });
      });

      candidateIds = new Set(Array.from(candidateIds).filter((id) => unionIds.has(id)));
    }

    return candidateIds;
  }

  private matchesLookSearch(record: EnrichedLookRecord, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    const haystack = [
      record.look.indexNumber,
      record.look.title,
      record.look.outfitDescription,
      record.model.name,
      ...record.collections.map((c) => c.title),
      ...record.products.flatMap((p) => [p.name, p.categorySlug, p.materialSummary, p.sku]),
      ...record.allOptionIds.map((id) => this.optionById.get(id)?.label ?? ''),
    ]
      .join(' ')
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  }

  private matchesProductSearch(record: EnrichedProductRecord, normalizedQuery: string): boolean {
    if (!normalizedQuery) return true;
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    const haystack = [
      record.product.name,
      record.product.sku,
      record.product.description,
      record.product.materialSummary,
      ...record.categoryHierarchyLabels,
      ...record.availableColors.map((c) => c.name),
      ...record.associatedLooks.flatMap((l) => [l.title, l.indexNumber]),
      ...record.allOptionIds.map((id) => this.optionById.get(id)?.label ?? ''),
    ]
      .join(' ')
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  }

  private sortLooks(records: EnrichedLookRecord[], sortBy: SortOption): EnrichedLookRecord[] {
    const copy = [...records];
    switch (sortBy) {
      case 'newest':
        return copy.sort(
          (a, b) => Date.parse(b.look.createdAt) - Date.parse(a.look.createdAt),
        );
      case 'most-popular':
        return copy.sort((a, b) => b.look.popularityScore - a.look.popularityScore);
      case 'trending':
        return copy.sort((a, b) => b.look.trendingScore - a.look.trendingScore);
      case 'price-asc':
        return copy.sort((a, b) => a.totalPrice - b.totalPrice);
      case 'price-desc':
        return copy.sort((a, b) => b.totalPrice - a.totalPrice);
      case 'featured':
      default:
        return copy.sort((a, b) => {
          if (a.look.featured !== b.look.featured) return a.look.featured ? -1 : 1;
          return Number(a.look.indexNumber) - Number(b.look.indexNumber);
        });
    }
  }

  private sortProducts(
    records: EnrichedProductRecord[],
    sortBy: SortOption,
  ): EnrichedProductRecord[] {
    const copy = [...records];
    switch (sortBy) {
      case 'newest':
        return copy.sort(
          (a, b) => Date.parse(b.product.createdAt) - Date.parse(a.product.createdAt),
        );
      case 'most-popular':
        return copy.sort((a, b) => b.product.popularityScore - a.product.popularityScore);
      case 'trending':
        return copy.sort((a, b) => b.product.trendingScore - a.product.trendingScore);
      case 'price-asc':
        return copy.sort((a, b) => (a.product.price ?? 0) - (b.product.price ?? 0));
      case 'price-desc':
        return copy.sort((a, b) => (b.product.price ?? 0) - (a.product.price ?? 0));
      case 'featured':
      default:
        return copy.sort((a, b) => b.product.popularityScore - a.product.popularityScore);
    }
  }

  queryLooks(query: CatalogFilterQuery): PaginatedResult<EnrichedLookRecord> {
    const cacheKey = `looks::v${this.mutationVersion}::${JSON.stringify(query)}`;
    const cached = this.queryCache.get(cacheKey) as PaginatedResult<EnrichedLookRecord> | undefined;
    if (cached) return cached;

    const candidateIds = this.getMatchingLookIdsForFilters(
      query.selectedByDimension,
      query.collectionSlug,
    );
    const normalizedSearch = query.searchQuery.trim().toLowerCase();

    const matched = Array.from(candidateIds)
      .map((id) => this.looksById.get(id))
      .filter((l): l is LookEntity => Boolean(l))
      .map((l) => this.enrichLook(l))
      .filter((rec) => this.matchesLookSearch(rec, normalizedSearch));

    const sorted = this.sortLooks(matched, query.sortBy);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const safePage = Math.min(Math.max(1, query.page), totalPages);
    const start = (safePage - 1) * query.pageSize;
    const items = sorted.slice(start, start + query.pageSize);

    const result: PaginatedResult<EnrichedLookRecord> = {
      items,
      total,
      page: safePage,
      pageSize: query.pageSize,
      totalPages,
      hasMore: safePage < totalPages,
      hasPurchasablePrices: matched.some((m) => m.hasPurchasablePrice),
    };

    if (this.queryCache.size > 80) this.queryCache.clear();
    this.queryCache.set(cacheKey, result);
    return result;
  }

  queryProducts(query: CatalogFilterQuery): PaginatedResult<EnrichedProductRecord> {
    const cacheKey = `products::v${this.mutationVersion}::${JSON.stringify(query)}`;
    const cached = this.queryCache.get(cacheKey) as PaginatedResult<EnrichedProductRecord> | undefined;
    if (cached) return cached;

    const candidateIds = this.getMatchingProductIdsForFilters(
      query.selectedByDimension,
      query.collectionSlug,
    );
    const normalizedSearch = query.searchQuery.trim().toLowerCase();

    const matched = Array.from(candidateIds)
      .map((id) => this.productsById.get(id))
      .filter((p): p is ProductEntity => Boolean(p))
      .map((p) => this.enrichProduct(p))
      .filter((rec) => this.matchesProductSearch(rec, normalizedSearch));

    const sorted = this.sortProducts(matched, query.sortBy);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
    const safePage = Math.min(Math.max(1, query.page), totalPages);
    const start = (safePage - 1) * query.pageSize;
    const items = sorted.slice(start, start + query.pageSize);

    const result: PaginatedResult<EnrichedProductRecord> = {
      items,
      total,
      page: safePage,
      pageSize: query.pageSize,
      totalPages,
      hasMore: safePage < totalPages,
      hasPurchasablePrices: matched.some((m) => typeof m.product.price === 'number'),
    };

    if (this.queryCache.size > 80) this.queryCache.clear();
    this.queryCache.set(cacheKey, result);
    return result;
  }

  /**
   * Computes option facet counts for either Looks or Products.
   */
  getOptionFacetCounts(target: 'looks' | 'products'): Record<string, number> {
    const counts: Record<string, number> = {};
    this.options.forEach((opt) => {
      if (!opt.isActive) return;
      const expanded = this.expandOptionIds(opt.id);
      const uniqueIds = new Set<string>();
      expanded.forEach((expId) => {
        const sourceMap =
          target === 'looks' ? this.lookIdsByOptionId : this.productIdsByOptionId;
        sourceMap.get(expId)?.forEach((id) => uniqueIds.add(id));
      });
      counts[opt.id] = uniqueIds.size;
    });
    return counts;
  }

  searchSuggestions(rawQuery: string, limit = 8): SearchSuggestion[] {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return [];

    const suggestions: SearchSuggestion[] = [];

    // 1. Looks
    for (const look of LOOK_ENTITIES) {
      if (
        look.title.toLowerCase().includes(q) ||
        look.indexNumber.includes(q) ||
        look.outfitDescription.toLowerCase().includes(q)
      ) {
        suggestions.push({
          id: `sug-look-${look.id}`,
          type: 'look',
          label: `${look.indexNumber}. ${look.title}`,
          meta: 'LOOK',
          targetId: look.id,
        });
      }
    }

    // 2. Products
    for (const product of PRODUCT_ENTITIES) {
      if (
        product.name.toLowerCase().includes(q) ||
        product.materialSummary.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q)
      ) {
        suggestions.push({
          id: `sug-prod-${product.id}`,
          type: 'product',
          label: product.name,
          meta: `PRODUCT · ${product.materialSummary}`,
          targetId: product.id,
        });
      }
    }

    // 3. Curated Collections
    for (const col of CURATED_COLLECTIONS) {
      if (col.title.toLowerCase().includes(q) || col.subtitle.toLowerCase().includes(q)) {
        suggestions.push({
          id: `sug-col-${col.id}`,
          type: 'collection',
          label: col.title,
          meta: 'COLLECTION',
          targetId: col.slug,
        });
      }
    }

    // 4. Taxonomy Options (Styles, Eras, Garments, Colors, Materials, Fits, Occasions, Seasons)
    const dimLabelBySlug = Object.fromEntries(
      this.dimensions.map((d) => [d.slug, d.shortLabel.toUpperCase()]),
    );
    for (const opt of this.options) {
      if (!opt.isActive) continue;
      if (opt.label.toLowerCase().includes(q) || opt.slug.includes(q)) {
        suggestions.push({
          id: `sug-opt-${opt.id}`,
          type: 'option',
          label: opt.label,
          meta: dimLabelBySlug[opt.dimensionSlug] ?? 'TAG',
          targetId: opt.id,
          dimensionSlug: opt.dimensionSlug,
        });
      }
    }

    return suggestions.slice(0, limit);
  }
}

export const catalogRepository = new CatalogRepository();
