import { LOOK_ENTITIES, LOOK_PRODUCT_JUNCTIONS } from './catalogSeed';
import { FashionModelData } from '../types/showroom';

export const FASHION_MODELS: FashionModelData[] = LOOK_ENTITIES.filter(
  (look) => look.status === 'published',
).map((look) => {
  const primaryIds = LOOK_PRODUCT_JUNCTIONS.filter(
    (j) => j.lookId === look.id && j.role === 'primary',
  )
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((j) => j.productId);

  return {
    id: look.id,
    indexNumber: look.indexNumber,
    title: look.title,
    subtitle: look.outfitDescription,
    imageUrl: look.mainImageUrl,
    productIds: primaryIds,
    featuredInMode: look.featuredInMode,
  };
});

export const MODEL_BY_ID: Record<string, FashionModelData> = Object.fromEntries(
  FASHION_MODELS.map((m) => [m.id, m]),
);
