import { PRODUCT_ENTITIES, PRODUCT_VARIANTS } from './catalogSeed';
import { ProductData, SizeOption } from '../types/showroom';

export const PRODUCTS: ProductData[] = PRODUCT_ENTITIES.map((entity) => {
  const sizes = Array.from(
    new Set(
      PRODUCT_VARIANTS.filter((v) => v.productId === entity.id).map((v) => v.size),
    ),
  ) as SizeOption[];

  return {
    id: entity.id,
    markerNumber: entity.markerNumber,
    name: entity.name,
    category: entity.legacyCategory,
    price: entity.price ?? 0,
    description: entity.description,
    imageUrl: entity.mainImageUrl,
    availableSizes: sizes.length > 0 ? sizes : ['XS', 'S', 'M', 'L', 'XL'],
    swatchColor: entity.swatchColor,
    materialNote: entity.materialSummary,
  };
});

export const PRODUCT_BY_ID: Record<string, ProductData> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p]),
);
