import { DisplayMode, ProductCategory, SizeOption } from './showroom';

export type TaxonomyDimensionSlug =
  | 'style'
  | 'era'
  | 'garment'
  | 'color_pattern'
  | 'fit'
  | 'occasion'
  | 'season'
  | 'material';

export type SortOption =
  | 'featured'
  | 'newest'
  | 'most-popular'
  | 'trending'
  | 'price-asc'
  | 'price-desc';

export type GridCatalogTab = 'looks' | 'products' | 'collections';

export interface FilterDimension {
  id: string;
  slug: TaxonomyDimensionSlug;
  name: string;
  shortLabel: string;
  description: string;
  displayOrder: number;
  allowMultiSelect: boolean;
  isHierarchical: boolean;
  isPrimaryOnProduct: boolean;
  isActive: boolean;
}

export interface FilterOption {
  id: string;
  dimensionId: string;
  dimensionSlug: TaxonomyDimensionSlug;
  slug: string;
  label: string;
  parentId: string | null;
  groupLabel?: string;
  swatchHex?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface ModelEntity {
  id: string;
  name: string;
  code: string;
  heightCm: number;
  studioNote: string;
  imageUrl: string;
}

export interface LookEntity {
  id: string;
  slug: string;
  indexNumber: string;
  title: string;
  modelId: string;
  mainImageUrl: string;
  outfitDescription: string;
  featured: boolean;
  status: 'published' | 'draft';
  createdAt: string;
  popularityScore: number;
  trendingScore: number;
  featuredInMode?: DisplayMode;
}

export interface ProductEntity {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  mainImageUrl: string;
  galleryImages: string[];
  categorySlug: string;
  legacyCategory: ProductCategory;
  price: number | null;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  materialSummary: string;
  swatchColor: string;
  markerNumber: string;
  createdAt: string;
  popularityScore: number;
  trendingScore: number;
  previewFocus: {
    xPercent: number;
    yPercent: number;
    zoomScale: number;
  };
}

export interface ProductVariantEntity {
  id: string;
  productId: string;
  sku: string;
  size: SizeOption;
  colorSlug: string;
  colorName: string;
  colorHex: string;
  stockQty: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface LookProductJunction {
  lookId: string;
  productId: string;
  role: 'primary' | 'layered';
  markerNumber: string;
  calloutSide: 'left' | 'right';
  xPercent: number;
  yPercent: number;
  displayOrder: number;
}

export interface LookFilterOptionJunction {
  lookId: string;
  optionId: string;
  source: 'editorial' | 'inherited_from_product';
}

export interface ProductFilterOptionJunction {
  productId: string;
  optionId: string;
}

export interface CuratedCollection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  editorialNote: string;
  featured: boolean;
  displayOrder: number;
}

export interface CollectionLookJunction {
  collectionId: string;
  lookId: string;
  displayOrder: number;
}

export interface CatalogFilterQuery {
  searchQuery: string;
  selectedByDimension: Partial<Record<TaxonomyDimensionSlug, string[]>>;
  collectionSlug: string | null;
  sortBy: SortOption;
  page: number;
  pageSize: number;
}

export interface EnrichedLookRecord {
  look: LookEntity;
  model: ModelEntity;
  products: ProductEntity[];
  primaryProductIds: string[];
  collections: CuratedCollection[];
  optionsByDimension: Record<TaxonomyDimensionSlug, FilterOption[]>;
  allOptionIds: string[];
  totalPrice: number;
  hasPurchasablePrice: boolean;
}

export interface EnrichedProductRecord {
  product: ProductEntity;
  variants: ProductVariantEntity[];
  availableSizes: SizeOption[];
  availableColors: Array<{ slug: string; name: string; hex: string }>;
  associatedLooks: LookEntity[];
  optionsByDimension: Record<TaxonomyDimensionSlug, FilterOption[]>;
  allOptionIds: string[];
  categoryHierarchyLabels: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  hasPurchasablePrices: boolean;
}

export interface SearchSuggestion {
  id: string;
  type: 'look' | 'product' | 'option' | 'collection';
  label: string;
  meta: string;
  targetId: string;
  dimensionSlug?: TaxonomyDimensionSlug;
}
