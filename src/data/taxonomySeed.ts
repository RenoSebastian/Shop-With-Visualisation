import {
  CuratedCollection,
  FilterDimension,
  FilterOption,
  TaxonomyDimensionSlug,
} from '../types/taxonomy';

export const FILTER_DIMENSIONS: FilterDimension[] = [
  {
    id: 'dim-style',
    slug: 'style',
    name: 'Fashion Style & Aesthetic',
    shortLabel: 'Style',
    description: 'Overall fashion identity and editorial aesthetic.',
    displayOrder: 1,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-era',
    slug: 'era',
    name: 'Fashion Era / Decade',
    shortLabel: 'Era',
    description: 'Historical fashion reference or decade.',
    displayOrder: 2,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-garment',
    slug: 'garment',
    name: 'Garment Category',
    shortLabel: 'Garment',
    description: 'Hierarchical clothing and accessory classification.',
    displayOrder: 3,
    allowMultiSelect: true,
    isHierarchical: true,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-color-pattern',
    slug: 'color_pattern',
    name: 'Color, Palette & Pattern',
    shortLabel: 'Color & Pattern',
    description: 'Colors, tonal palettes (such as Monochrome), and textile patterns.',
    displayOrder: 4,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-fit',
    slug: 'fit',
    name: 'Silhouette & Fit',
    shortLabel: 'Silhouette',
    description: 'Garment drape, cut, and volume.',
    displayOrder: 5,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-occasion',
    slug: 'occasion',
    name: 'Occasion & Activity',
    shortLabel: 'Occasion',
    description: 'Situational context and activity pairing.',
    displayOrder: 6,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-season',
    slug: 'season',
    name: 'Season & Climate',
    shortLabel: 'Season',
    description: 'Optional seasonal and climate suitability.',
    displayOrder: 7,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
  {
    id: 'dim-material',
    slug: 'material',
    name: 'Material & Fabric',
    shortLabel: 'Material',
    description: 'Primary textile and construction material.',
    displayOrder: 8,
    allowMultiSelect: true,
    isHierarchical: false,
    isPrimaryOnProduct: true,
    isActive: true,
  },
];

interface OptionSeedInput {
  id: string;
  dimensionSlug: TaxonomyDimensionSlug;
  slug: string;
  label: string;
  parentId?: string | null;
  groupLabel?: string;
  swatchHex?: string;
  isFeatured?: boolean;
}

const DIM_ID_BY_SLUG: Record<TaxonomyDimensionSlug, string> = {
  style: 'dim-style',
  era: 'dim-era',
  garment: 'dim-garment',
  color_pattern: 'dim-color-pattern',
  fit: 'dim-fit',
  occasion: 'dim-occasion',
  season: 'dim-season',
  material: 'dim-material',
};

function buildOptions(entries: OptionSeedInput[]): FilterOption[] {
  return entries.map((entry, idx) => ({
    id: entry.id,
    dimensionId: DIM_ID_BY_SLUG[entry.dimensionSlug],
    dimensionSlug: entry.dimensionSlug,
    slug: entry.slug,
    label: entry.label,
    parentId: entry.parentId ?? null,
    groupLabel: entry.groupLabel,
    swatchHex: entry.swatchHex,
    displayOrder: idx + 1,
    isFeatured: Boolean(entry.isFeatured),
    isActive: true,
  }));
}

export const INITIAL_FILTER_OPTIONS: FilterOption[] = buildOptions([
  // 01 — FASHION STYLE & AESTHETIC
  { id: 'style-y2k', dimensionSlug: 'style', slug: 'y2k', label: 'Y2K', isFeatured: true },
  { id: 'style-streetwear', dimensionSlug: 'style', slug: 'streetwear', label: 'Streetwear', isFeatured: true },
  { id: 'style-casual', dimensionSlug: 'style', slug: 'casual', label: 'Casual' },
  { id: 'style-old-money', dimensionSlug: 'style', slug: 'old-money', label: 'Old Money', isFeatured: true },
  { id: 'style-quiet-luxury', dimensionSlug: 'style', slug: 'quiet-luxury', label: 'Quiet Luxury' },
  { id: 'style-minimalist', dimensionSlug: 'style', slug: 'minimalist', label: 'Minimalist', isFeatured: true },
  { id: 'style-vintage', dimensionSlug: 'style', slug: 'vintage', label: 'Vintage' },
  { id: 'style-retro', dimensionSlug: 'style', slug: 'retro', label: 'Retro', isFeatured: true },
  { id: 'style-grunge', dimensionSlug: 'style', slug: 'grunge', label: 'Grunge' },
  { id: 'style-preppy', dimensionSlug: 'style', slug: 'preppy', label: 'Preppy' },
  { id: 'style-bohemian', dimensionSlug: 'style', slug: 'bohemian', label: 'Bohemian' },
  { id: 'style-gorpcore', dimensionSlug: 'style', slug: 'gorpcore', label: 'Gorpcore' },
  { id: 'style-punk', dimensionSlug: 'style', slug: 'punk', label: 'Punk' },
  { id: 'style-workwear', dimensionSlug: 'style', slug: 'workwear', label: 'Workwear' },
  { id: 'style-korean-style', dimensionSlug: 'style', slug: 'korean-style', label: 'Korean Style' },
  { id: 'style-japanese-style', dimensionSlug: 'style', slug: 'japanese-style', label: 'Japanese Style' },
  { id: 'style-sportswear', dimensionSlug: 'style', slug: 'sportswear', label: 'Sportswear', isFeatured: true },
  { id: 'style-athleisure', dimensionSlug: 'style', slug: 'athleisure', label: 'Athleisure' },
  { id: 'style-formal', dimensionSlug: 'style', slug: 'formal', label: 'Formal' },
  { id: 'style-smart-casual', dimensionSlug: 'style', slug: 'smart-casual', label: 'Smart Casual' },

  // 02 — FASHION ERA / DECADE
  { id: 'era-60s', dimensionSlug: 'era', slug: '60s', label: '60s' },
  { id: 'era-70s', dimensionSlug: 'era', slug: '70s', label: '70s' },
  { id: 'era-80s', dimensionSlug: 'era', slug: '80s', label: '80s', isFeatured: true },
  { id: 'era-90s', dimensionSlug: 'era', slug: '90s', label: '90s', isFeatured: true },
  { id: 'era-2000s', dimensionSlug: 'era', slug: '2000s', label: '2000s', isFeatured: true },
  { id: 'era-2010s', dimensionSlug: 'era', slug: '2010s', label: '2010s' },
  { id: 'era-contemporary', dimensionSlug: 'era', slug: 'contemporary', label: 'Contemporary', isFeatured: true },

  // 03 — GARMENT CATEGORY (Hierarchical: Parent -> Child -> Grandchild)
  // Tops
  { id: 'garment-tops', dimensionSlug: 'garment', slug: 'tops', label: 'Tops', groupLabel: 'Tops', isFeatured: true },
  { id: 'garment-shirts', dimensionSlug: 'garment', slug: 'shirts', label: 'Shirts', parentId: 'garment-tops', groupLabel: 'Tops' },
  { id: 'garment-oversized-shirts', dimensionSlug: 'garment', slug: 'oversized-shirts', label: 'Oversized Shirts', parentId: 'garment-shirts', groupLabel: 'Tops' },
  { id: 'garment-t-shirts', dimensionSlug: 'garment', slug: 't-shirts', label: 'T-Shirts', parentId: 'garment-tops', groupLabel: 'Tops' },
  { id: 'garment-polo-shirts', dimensionSlug: 'garment', slug: 'polo-shirts', label: 'Polo Shirts', parentId: 'garment-tops', groupLabel: 'Tops' },
  { id: 'garment-blouses', dimensionSlug: 'garment', slug: 'blouses', label: 'Blouses', parentId: 'garment-tops', groupLabel: 'Tops' },
  { id: 'garment-tank-tops', dimensionSlug: 'garment', slug: 'tank-tops', label: 'Tank Tops', parentId: 'garment-tops', groupLabel: 'Tops' },
  { id: 'garment-sweaters', dimensionSlug: 'garment', slug: 'sweaters', label: 'Sweaters', parentId: 'garment-tops', groupLabel: 'Tops' },
  { id: 'garment-hoodies', dimensionSlug: 'garment', slug: 'hoodies', label: 'Hoodies', parentId: 'garment-tops', groupLabel: 'Tops' },

  // Bottoms
  { id: 'garment-bottoms', dimensionSlug: 'garment', slug: 'bottoms', label: 'Bottoms', groupLabel: 'Bottoms', isFeatured: true },
  { id: 'garment-jeans', dimensionSlug: 'garment', slug: 'jeans', label: 'Jeans', parentId: 'garment-bottoms', groupLabel: 'Bottoms' },
  { id: 'garment-trousers', dimensionSlug: 'garment', slug: 'trousers', label: 'Trousers', parentId: 'garment-bottoms', groupLabel: 'Bottoms' },
  { id: 'garment-cargo-pants', dimensionSlug: 'garment', slug: 'cargo-pants', label: 'Cargo Pants', parentId: 'garment-bottoms', groupLabel: 'Bottoms' },
  { id: 'garment-chinos', dimensionSlug: 'garment', slug: 'chinos', label: 'Chinos', parentId: 'garment-bottoms', groupLabel: 'Bottoms' },
  { id: 'garment-shorts', dimensionSlug: 'garment', slug: 'shorts', label: 'Shorts', parentId: 'garment-bottoms', groupLabel: 'Bottoms' },
  { id: 'garment-skirts', dimensionSlug: 'garment', slug: 'skirts', label: 'Skirts', parentId: 'garment-bottoms', groupLabel: 'Bottoms' },

  // Outerwear
  { id: 'garment-outerwear', dimensionSlug: 'garment', slug: 'outerwear', label: 'Outerwear', groupLabel: 'Outerwear', isFeatured: true },
  { id: 'garment-jackets', dimensionSlug: 'garment', slug: 'jackets', label: 'Jackets', parentId: 'garment-outerwear', groupLabel: 'Outerwear' },
  { id: 'garment-coats', dimensionSlug: 'garment', slug: 'coats', label: 'Coats', parentId: 'garment-outerwear', groupLabel: 'Outerwear' },
  { id: 'garment-blazers', dimensionSlug: 'garment', slug: 'blazers', label: 'Blazers', parentId: 'garment-outerwear', groupLabel: 'Outerwear' },
  { id: 'garment-cardigans', dimensionSlug: 'garment', slug: 'cardigans', label: 'Cardigans', parentId: 'garment-outerwear', groupLabel: 'Outerwear' },
  { id: 'garment-windbreakers', dimensionSlug: 'garment', slug: 'windbreakers', label: 'Windbreakers', parentId: 'garment-outerwear', groupLabel: 'Outerwear' },

  // One-Piece
  { id: 'garment-one-piece', dimensionSlug: 'garment', slug: 'one-piece', label: 'One-Piece', groupLabel: 'One-Piece' },
  { id: 'garment-dresses', dimensionSlug: 'garment', slug: 'dresses', label: 'Dresses', parentId: 'garment-one-piece', groupLabel: 'One-Piece' },
  { id: 'garment-jumpsuits', dimensionSlug: 'garment', slug: 'jumpsuits', label: 'Jumpsuits', parentId: 'garment-one-piece', groupLabel: 'One-Piece' },
  { id: 'garment-rompers', dimensionSlug: 'garment', slug: 'rompers', label: 'Rompers', parentId: 'garment-one-piece', groupLabel: 'One-Piece' },

  // Footwear
  { id: 'garment-footwear', dimensionSlug: 'garment', slug: 'footwear', label: 'Footwear', groupLabel: 'Footwear', isFeatured: true },
  { id: 'garment-sneakers', dimensionSlug: 'garment', slug: 'sneakers', label: 'Sneakers', parentId: 'garment-footwear', groupLabel: 'Footwear' },
  { id: 'garment-boots', dimensionSlug: 'garment', slug: 'boots', label: 'Boots', parentId: 'garment-footwear', groupLabel: 'Footwear' },
  { id: 'garment-formal-shoes', dimensionSlug: 'garment', slug: 'formal-shoes', label: 'Formal Shoes', parentId: 'garment-footwear', groupLabel: 'Footwear' },
  { id: 'garment-sandals', dimensionSlug: 'garment', slug: 'sandals', label: 'Sandals', parentId: 'garment-footwear', groupLabel: 'Footwear' },
  { id: 'garment-loafers', dimensionSlug: 'garment', slug: 'loafers', label: 'Loafers', parentId: 'garment-footwear', groupLabel: 'Footwear' },

  // Accessories
  { id: 'garment-accessories', dimensionSlug: 'garment', slug: 'accessories', label: 'Accessories', groupLabel: 'Accessories' },
  { id: 'garment-bags', dimensionSlug: 'garment', slug: 'bags', label: 'Bags', parentId: 'garment-accessories', groupLabel: 'Accessories' },
  { id: 'garment-hats', dimensionSlug: 'garment', slug: 'hats', label: 'Hats', parentId: 'garment-accessories', groupLabel: 'Accessories' },
  { id: 'garment-glasses', dimensionSlug: 'garment', slug: 'glasses', label: 'Glasses', parentId: 'garment-accessories', groupLabel: 'Accessories' },
  { id: 'garment-audio', dimensionSlug: 'garment', slug: 'audio', label: 'Headphones & Audio', parentId: 'garment-accessories', groupLabel: 'Accessories' },
  { id: 'garment-watches', dimensionSlug: 'garment', slug: 'watches', label: 'Watches', parentId: 'garment-accessories', groupLabel: 'Accessories' },
  { id: 'garment-jewelry', dimensionSlug: 'garment', slug: 'jewelry', label: 'Jewelry', parentId: 'garment-accessories', groupLabel: 'Accessories' },
  { id: 'garment-belts', dimensionSlug: 'garment', slug: 'belts', label: 'Belts', parentId: 'garment-accessories', groupLabel: 'Accessories' },

  // 04 — COLOR, PALETTE & PATTERN (Monochrome is strictly a palette, NOT a fashion style)
  // Colors
  { id: 'color-black', dimensionSlug: 'color_pattern', slug: 'black', label: 'Black', groupLabel: 'Colors', swatchHex: '#151517', isFeatured: true },
  { id: 'color-white', dimensionSlug: 'color_pattern', slug: 'white', label: 'White', groupLabel: 'Colors', swatchHex: '#F5F5F3' },
  { id: 'color-gray', dimensionSlug: 'color_pattern', slug: 'gray', label: 'Gray', groupLabel: 'Colors', swatchHex: '#8E9299' },
  { id: 'color-beige', dimensionSlug: 'color_pattern', slug: 'beige', label: 'Beige', groupLabel: 'Colors', swatchHex: '#D8CEBA' },
  { id: 'color-brown', dimensionSlug: 'color_pattern', slug: 'brown', label: 'Brown', groupLabel: 'Colors', swatchHex: '#5A3E2F' },
  { id: 'color-navy', dimensionSlug: 'color_pattern', slug: 'navy', label: 'Navy', groupLabel: 'Colors', swatchHex: '#1E2A42' },
  { id: 'color-blue', dimensionSlug: 'color_pattern', slug: 'blue', label: 'Blue', groupLabel: 'Colors', swatchHex: '#335D9B' },
  { id: 'color-red', dimensionSlug: 'color_pattern', slug: 'red', label: 'Red', groupLabel: 'Colors', swatchHex: '#6F2429' },
  { id: 'color-green', dimensionSlug: 'color_pattern', slug: 'green', label: 'Green', groupLabel: 'Colors', swatchHex: '#254434' },
  { id: 'color-yellow', dimensionSlug: 'color_pattern', slug: 'yellow', label: 'Yellow', groupLabel: 'Colors', swatchHex: '#E8D58B' },
  { id: 'color-pink', dimensionSlug: 'color_pattern', slug: 'pink', label: 'Pink', groupLabel: 'Colors', swatchHex: '#DFB6BD' },
  { id: 'color-purple', dimensionSlug: 'color_pattern', slug: 'purple', label: 'Purple', groupLabel: 'Colors', swatchHex: '#5D4873' },
  { id: 'color-orange', dimensionSlug: 'color_pattern', slug: 'orange', label: 'Orange', groupLabel: 'Colors', swatchHex: '#B9512C' },

  // Palettes
  { id: 'palette-monochrome', dimensionSlug: 'color_pattern', slug: 'monochrome', label: 'Monochrome', groupLabel: 'Palettes', isFeatured: true },
  { id: 'palette-neutral', dimensionSlug: 'color_pattern', slug: 'neutral', label: 'Neutral', groupLabel: 'Palettes' },
  { id: 'palette-earth-tone', dimensionSlug: 'color_pattern', slug: 'earth-tone', label: 'Earth Tone', groupLabel: 'Palettes' },
  { id: 'palette-pastel', dimensionSlug: 'color_pattern', slug: 'pastel', label: 'Pastel', groupLabel: 'Palettes' },
  { id: 'palette-bright-colors', dimensionSlug: 'color_pattern', slug: 'bright-colors', label: 'Bright Colors', groupLabel: 'Palettes' },
  { id: 'palette-dark-tone', dimensionSlug: 'color_pattern', slug: 'dark-tone', label: 'Dark Tone', groupLabel: 'Palettes' },
  { id: 'palette-color-blocking', dimensionSlug: 'color_pattern', slug: 'color-blocking', label: 'Color Blocking', groupLabel: 'Palettes' },

  // Patterns
  { id: 'pattern-solid', dimensionSlug: 'color_pattern', slug: 'solid', label: 'Solid', groupLabel: 'Patterns' },
  { id: 'pattern-striped', dimensionSlug: 'color_pattern', slug: 'striped', label: 'Striped', groupLabel: 'Patterns' },
  { id: 'pattern-plaid', dimensionSlug: 'color_pattern', slug: 'plaid', label: 'Plaid', groupLabel: 'Patterns' },
  { id: 'pattern-checkered', dimensionSlug: 'color_pattern', slug: 'checkered', label: 'Checkered', groupLabel: 'Patterns' },
  { id: 'pattern-floral', dimensionSlug: 'color_pattern', slug: 'floral', label: 'Floral', groupLabel: 'Patterns' },
  { id: 'pattern-graphic-print', dimensionSlug: 'color_pattern', slug: 'graphic-print', label: 'Graphic Print', groupLabel: 'Patterns' },
  { id: 'pattern-animal-print', dimensionSlug: 'color_pattern', slug: 'animal-print', label: 'Animal Print', groupLabel: 'Patterns' },
  { id: 'pattern-abstract-print', dimensionSlug: 'color_pattern', slug: 'abstract-print', label: 'Abstract Print', groupLabel: 'Patterns' },

  // 05 — SILHOUETTE & FIT
  { id: 'fit-oversized', dimensionSlug: 'fit', slug: 'oversized', label: 'Oversized', isFeatured: true },
  { id: 'fit-slim-fit', dimensionSlug: 'fit', slug: 'slim-fit', label: 'Slim Fit' },
  { id: 'fit-regular-fit', dimensionSlug: 'fit', slug: 'regular-fit', label: 'Regular Fit' },
  { id: 'fit-relaxed-fit', dimensionSlug: 'fit', slug: 'relaxed-fit', label: 'Relaxed Fit', isFeatured: true },
  { id: 'fit-baggy', dimensionSlug: 'fit', slug: 'baggy', label: 'Baggy', isFeatured: true },
  { id: 'fit-cropped', dimensionSlug: 'fit', slug: 'cropped', label: 'Cropped' },
  { id: 'fit-tailored', dimensionSlug: 'fit', slug: 'tailored', label: 'Tailored' },
  { id: 'fit-layered', dimensionSlug: 'fit', slug: 'layered', label: 'Layered' },
  { id: 'fit-wide-leg', dimensionSlug: 'fit', slug: 'wide-leg', label: 'Wide Leg' },
  { id: 'fit-straight-cut', dimensionSlug: 'fit', slug: 'straight-cut', label: 'Straight Cut' },
  { id: 'fit-skinny', dimensionSlug: 'fit', slug: 'skinny', label: 'Skinny' },
  { id: 'fit-loose-fit', dimensionSlug: 'fit', slug: 'loose-fit', label: 'Loose Fit' },

  // 06 — OCCASION & ACTIVITY
  { id: 'occasion-everyday', dimensionSlug: 'occasion', slug: 'everyday', label: 'Everyday', isFeatured: true },
  { id: 'occasion-office', dimensionSlug: 'occasion', slug: 'office', label: 'Office' },
  { id: 'occasion-campus', dimensionSlug: 'occasion', slug: 'campus', label: 'Campus' },
  { id: 'occasion-date-night', dimensionSlug: 'occasion', slug: 'date-night', label: 'Date Night' },
  { id: 'occasion-party', dimensionSlug: 'occasion', slug: 'party', label: 'Party' },
  { id: 'occasion-travel', dimensionSlug: 'occasion', slug: 'travel', label: 'Travel' },
  { id: 'occasion-vacation', dimensionSlug: 'occasion', slug: 'vacation', label: 'Vacation' },
  { id: 'occasion-sports', dimensionSlug: 'occasion', slug: 'sports', label: 'Sports' },
  { id: 'occasion-outdoor', dimensionSlug: 'occasion', slug: 'outdoor', label: 'Outdoor' },
  { id: 'occasion-formal-event', dimensionSlug: 'occasion', slug: 'formal-event', label: 'Formal Event' },
  { id: 'occasion-weekend', dimensionSlug: 'occasion', slug: 'weekend', label: 'Weekend', isFeatured: true },
  { id: 'occasion-street-activity', dimensionSlug: 'occasion', slug: 'street-activity', label: 'Street Activity' },

  // 07 — SEASON & CLIMATE
  { id: 'season-spring', dimensionSlug: 'season', slug: 'spring', label: 'Spring', groupLabel: 'Season' },
  { id: 'season-summer', dimensionSlug: 'season', slug: 'summer', label: 'Summer', groupLabel: 'Season' },
  { id: 'season-autumn', dimensionSlug: 'season', slug: 'autumn', label: 'Autumn', groupLabel: 'Season', isFeatured: true },
  { id: 'season-winter', dimensionSlug: 'season', slug: 'winter', label: 'Winter', groupLabel: 'Season' },
  { id: 'season-all-season', dimensionSlug: 'season', slug: 'all-season', label: 'All Season', groupLabel: 'Season', isFeatured: true },
  { id: 'climate-tropical', dimensionSlug: 'season', slug: 'tropical', label: 'Tropical', groupLabel: 'Climate' },
  { id: 'climate-hot-weather', dimensionSlug: 'season', slug: 'hot-weather', label: 'Hot Weather', groupLabel: 'Climate' },
  { id: 'climate-cold-weather', dimensionSlug: 'season', slug: 'cold-weather', label: 'Cold Weather', groupLabel: 'Climate' },
  { id: 'climate-rainy-weather', dimensionSlug: 'season', slug: 'rainy-weather', label: 'Rainy Weather', groupLabel: 'Climate' },
  { id: 'climate-transitional-weather', dimensionSlug: 'season', slug: 'transitional-weather', label: 'Transitional Weather', groupLabel: 'Climate' },

  // 08 — MATERIAL & FABRIC
  { id: 'material-cotton', dimensionSlug: 'material', slug: 'cotton', label: 'Cotton', isFeatured: true },
  { id: 'material-denim', dimensionSlug: 'material', slug: 'denim', label: 'Denim', isFeatured: true },
  { id: 'material-leather', dimensionSlug: 'material', slug: 'leather', label: 'Leather' },
  { id: 'material-faux-leather', dimensionSlug: 'material', slug: 'faux-leather', label: 'Faux Leather' },
  { id: 'material-linen', dimensionSlug: 'material', slug: 'linen', label: 'Linen' },
  { id: 'material-wool', dimensionSlug: 'material', slug: 'wool', label: 'Wool' },
  { id: 'material-knitwear', dimensionSlug: 'material', slug: 'knitwear', label: 'Knitwear' },
  { id: 'material-silk', dimensionSlug: 'material', slug: 'silk', label: 'Silk' },
  { id: 'material-nylon', dimensionSlug: 'material', slug: 'nylon', label: 'Nylon', isFeatured: true },
  { id: 'material-polyester', dimensionSlug: 'material', slug: 'polyester', label: 'Polyester' },
  { id: 'material-suede', dimensionSlug: 'material', slug: 'suede', label: 'Suede' },
  { id: 'material-canvas', dimensionSlug: 'material', slug: 'canvas', label: 'Canvas' },
  { id: 'material-corduroy', dimensionSlug: 'material', slug: 'corduroy', label: 'Corduroy' },
  { id: 'material-satin', dimensionSlug: 'material', slug: 'satin', label: 'Satin' },
]);

/**
 * Curated Editorial Collections — completely independent of the 8-dimension taxonomy.
 */
export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'col-y2k-edit',
    slug: 'the-y2k-edit',
    title: 'THE Y2K EDIT',
    subtitle: 'Aluminized shells, dirty-wash denim & wired audio proportions',
    editorialNote: 'An editorial capsule focused on early-millennium volume, metallic finishes, and low-slung silhouettes.',
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'col-80s-collection',
    slug: 'the-80s-collection',
    title: 'THE 80s COLLECTION',
    subtitle: 'Heritage knitwear, piped wool blousons & pleated flannel',
    editorialNote: 'Structured shoulders, textured wales, and relaxed tailoring drawn from archival European studio dressing.',
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'col-monochrome-study',
    slug: 'monochrome-study',
    title: 'MONOCHROME STUDY',
    subtitle: 'Tonal slate, optic chalk & charcoal gradients',
    editorialNote: 'Explores texture and silhouette weight across neutral black, gray, stone, and silver surfaces.',
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'col-summer-essentials',
    slug: 'summer-essentials',
    title: 'SUMMER ESSENTIALS',
    subtitle: 'Breathable camp shirts, ripstop parachute volume & open mesh',
    editorialNote: 'Lightweight linen-cotton blends and relaxed everyday layering engineered for warm movement.',
    featured: false,
    displayOrder: 4,
  },
  {
    id: 'col-streetwear-archive',
    slug: 'the-streetwear-archive',
    title: 'THE STREETWEAR ARCHIVE',
    subtitle: 'Heavyweight fleece, technical shells & wide-cut denim',
    editorialNote: 'Core urban uniforms pairing oversized jerseys with utilitarian outerwear and grounded runners.',
    featured: true,
    displayOrder: 5,
  },
  {
    id: 'col-old-money',
    slug: 'old-money-selection',
    title: 'OLD MONEY SELECTION',
    subtitle: 'Virgin wool trousers, merino cable knits & suede court shoes',
    editorialNote: 'Understated tactile fabrics—merino wool, heavy corduroy, and distressed suede without loud branding.',
    featured: false,
    displayOrder: 6,
  },
  {
    id: 'col-weekend-uniform',
    slug: 'weekend-uniform',
    title: 'WEEKEND UNIFORM',
    subtitle: 'Pigment-dyed fleece, carpenter canvas & slip-on suede',
    editorialNote: 'Low-signal silhouettes built for unhurried mornings, transit, and quiet studio hours.',
    featured: false,
    displayOrder: 7,
  },
  {
    id: 'col-retro-sports',
    slug: 'retro-sports-club',
    title: 'RETRO SPORTS CLUB',
    subtitle: 'Piped track blousons, loopback sweats & heritage runners',
    editorialNote: 'Vintage athletic warm-up proportions reinterpreted in Italian Melton wool and technical mesh.',
    featured: false,
    displayOrder: 8,
  },
];

/**
 * Quick popular style/palette shortcuts for FIND bar (uses canonical option IDs).
 */
export const FIND_POPULAR_QUICK_FILTERS: Array<{
  label: string;
  dimensionSlug: TaxonomyDimensionSlug;
  optionId: string;
}> = [
  { label: 'Y2K', dimensionSlug: 'style', optionId: 'style-y2k' },
  { label: 'Streetwear', dimensionSlug: 'style', optionId: 'style-streetwear' },
  { label: 'Retro', dimensionSlug: 'style', optionId: 'style-retro' },
  { label: 'Old Money', dimensionSlug: 'style', optionId: 'style-old-money' },
  { label: 'Minimalist', dimensionSlug: 'style', optionId: 'style-minimalist' },
  { label: 'Monochrome', dimensionSlug: 'color_pattern', optionId: 'palette-monochrome' },
  { label: 'Sportswear', dimensionSlug: 'style', optionId: 'style-sportswear' },
];
