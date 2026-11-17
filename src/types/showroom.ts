export enum DisplayMode {
  DO_NOT_DISTURB = 'DO NOT DISTURB',
  AIRPLANE_MODE = 'AIRPLANE MODE',
  SIDE_A = 'SIDE A',
  STATIC = 'STATIC',
}

export enum ViewMode {
  SPATIAL = 'FIND',
  GRID = 'GRID',
  INDIVIDUAL = 'INDIVIDUAL',
}

export type GroupDisplayMode =
  | DisplayMode.DO_NOT_DISTURB
  | DisplayMode.AIRPLANE_MODE
  | DisplayMode.SIDE_A;

export type SizeOption = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'OS';

export type ProductCategory = 'OUTERWEAR' | 'TOP' | 'BOTTOM' | 'FOOTWEAR' | 'ACCESSORY';

export interface ProductData {
  id: string;
  markerNumber: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl: string;
  availableSizes: SizeOption[];
  swatchColor: string;
  materialNote: string;
}

export interface HotspotConfig {
  productId: string;
  markerNumber: string;
  xPercent: number;
  yPercent: number;
  calloutSide: 'left' | 'right';
}

export interface FashionModelData {
  id: string;
  indexNumber: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  productIds: string[];
  featuredInMode?: DisplayMode;
}

export interface ModelOrbitalSpec {
  modelId: string;
  index: number;
  /** Fixed angular position around the shared central bearing in radians */
  initialAngle: number;
  /** Slight per-model vertical grounding offset for natural stature variation */
  verticalOffsetPercent: number;
}

export interface TurntableModeConfig {
  mode: GroupDisplayMode;
  label: string;
  shortNote: string;
  defaultFocusModelId: string;
  /** Preferred orbital rotation direction sign when entering mode (1 or -1) */
  rotationBias: 1 | -1;
  desktop: {
    centerX: number;
    centerY: number;
    radiusX: number;
    verticalTilt: number;
    minScale: number;
    maxScale: number;
    minOpacity: number;
    maxBlurPx: number;
  };
  mobile: {
    centerX: number;
    centerY: number;
    radiusX: number;
    verticalTilt: number;
    minScale: number;
    maxScale: number;
    minOpacity: number;
    maxBlurPx: number;
  };
}

export interface GridPositionSpec {
  xPercent: number;
  yPercent: number;
  scale: number;
}

export interface ShowroomPricingConfig {
  currencySymbol: string;
  currencyCode: string;
  enableFullLookDiscount: boolean;
  fullLookDiscountRate: number;
  fullLookDiscountLabel: string;
  storeLocationLabel: string;
  receiptFooterNote: string;
}

export interface BagItem {
  id: string;
  productId: string;
  lookId: string;
  size: SizeOption;
  quantity: number;
}

export interface OrderReceipt {
  orderNumber: string;
  barcodeValue: string;
  createdAt: string;
  items: Array<{
    productId: string;
    lookIndex: string;
    lookTitle: string;
    name: string;
    category: ProductCategory;
    size: SizeOption;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  discountAmount: number;
  total: number;
}
