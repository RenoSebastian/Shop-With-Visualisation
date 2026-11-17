import { HotspotConfig, ShowroomPricingConfig } from '../types/showroom';

/**
 * Configurable showroom pricing & exhibition receipt rules.
 * The full-look discount is completely optional and controlled by these flags.
 */
export const DEFAULT_PRICING_CONFIG: ShowroomPricingConfig = {
  currencySymbol: '$',
  currencyCode: 'USD',
  enableFullLookDiscount: true,
  fullLookDiscountRate: 0.1,
  fullLookDiscountLabel: 'FULL LOOK -10%',
  storeLocationLabel: 'DROP 01 — STORE 001 — PRAGUE',
  receiptFooterNote: 'THANK YOU FOR LOGGING OFF',
};

/**
 * Normalized (xPercent, yPercent) hotspot coordinates anchored to the 3:4 model canvas.
 * Hotspots stay locked on their exact garment regions across all viewport sizes.
 */
export const OUTFIT_HOTSPOTS: Record<string, HotspotConfig[]> = {
  'look-01': [
    { productId: 'p-collab-audio-black', markerNumber: '01', xPercent: 54, yPercent: 14, calloutSide: 'right' },
    { productId: 'p-01-01', markerNumber: '02', xPercent: 58, yPercent: 32, calloutSide: 'right' },
    { productId: 'p-shared-01', markerNumber: '03', xPercent: 45, yPercent: 46, calloutSide: 'left' },
    { productId: 'p-acc-belt-grommet', markerNumber: '04', xPercent: 52, yPercent: 49, calloutSide: 'right' },
    { productId: 'p-01-02', markerNumber: '05', xPercent: 46, yPercent: 66, calloutSide: 'left' },
    { productId: 'p-01-03', markerNumber: '06', xPercent: 44, yPercent: 90, calloutSide: 'right' },
  ],
  'look-02': [
    { productId: 'p-collab-audio-silver', markerNumber: '01', xPercent: 51, yPercent: 25, calloutSide: 'right' },
    { productId: 'p-02-01', markerNumber: '02', xPercent: 60, yPercent: 36, calloutSide: 'right' },
    { productId: 'p-02-inner', markerNumber: '03', xPercent: 46, yPercent: 38, calloutSide: 'left' },
    { productId: 'p-02-02', markerNumber: '04', xPercent: 47, yPercent: 65, calloutSide: 'left' },
    { productId: 'p-02-03', markerNumber: '05', xPercent: 60, yPercent: 90, calloutSide: 'right' },
  ],
  'look-03': [
    { productId: 'p-03-01', markerNumber: '01', xPercent: 58, yPercent: 32, calloutSide: 'right' },
    { productId: 'p-shared-dark-tee', markerNumber: '02', xPercent: 47, yPercent: 30, calloutSide: 'left' },
    { productId: 'p-03-02', markerNumber: '03', xPercent: 45, yPercent: 62, calloutSide: 'left' },
    { productId: 'p-03-03', markerNumber: '04', xPercent: 41, yPercent: 90, calloutSide: 'right' },
  ],
  'look-04': [
    { productId: 'p-acc-sunglasses', markerNumber: '01', xPercent: 52, yPercent: 15, calloutSide: 'right' },
    { productId: 'p-04-01', markerNumber: '02', xPercent: 59, yPercent: 35, calloutSide: 'right' },
    { productId: 'p-04-inner', markerNumber: '03', xPercent: 50, yPercent: 28, calloutSide: 'left' },
    { productId: 'p-04-02', markerNumber: '04', xPercent: 46, yPercent: 65, calloutSide: 'left' },
    { productId: 'p-04-03', markerNumber: '05', xPercent: 44, yPercent: 90, calloutSide: 'right' },
  ],
  'look-05': [
    { productId: 'p-acc-beanie', markerNumber: '01', xPercent: 52, yPercent: 14, calloutSide: 'right' },
    { productId: 'p-05-01', markerNumber: '02', xPercent: 59, yPercent: 36, calloutSide: 'right' },
    { productId: 'p-shared-dark-tee', markerNumber: '03', xPercent: 48, yPercent: 33, calloutSide: 'left' },
    { productId: 'p-05-02', markerNumber: '04', xPercent: 45, yPercent: 65, calloutSide: 'left' },
    { productId: 'p-05-03', markerNumber: '05', xPercent: 62, yPercent: 89, calloutSide: 'right' },
  ],
  'look-06': [
    { productId: 'p-collab-audio-black', markerNumber: '01', xPercent: 54, yPercent: 14, calloutSide: 'right' },
    { productId: 'p-06-01', markerNumber: '02', xPercent: 61, yPercent: 34, calloutSide: 'right' },
    { productId: 'p-06-inner', markerNumber: '03', xPercent: 46, yPercent: 34, calloutSide: 'left' },
    { productId: 'p-acc-belt-minimal', markerNumber: '04', xPercent: 47, yPercent: 45, calloutSide: 'left' },
    { productId: 'p-06-02', markerNumber: '05', xPercent: 46, yPercent: 64, calloutSide: 'left' },
    { productId: 'p-06-03', markerNumber: '06', xPercent: 65, yPercent: 87, calloutSide: 'right' },
  ],
  'look-07': [
    { productId: 'p-collab-audio-silver', markerNumber: '01', xPercent: 57, yPercent: 15, calloutSide: 'right' },
    { productId: 'p-07-01', markerNumber: '02', xPercent: 51, yPercent: 33, calloutSide: 'right' },
    { productId: 'p-07-02', markerNumber: '03', xPercent: 46, yPercent: 64, calloutSide: 'left' },
    { productId: 'p-07-03', markerNumber: '04', xPercent: 38, yPercent: 90, calloutSide: 'right' },
  ],
  'look-08': [
    { productId: 'p-collab-audio-silver', markerNumber: '01', xPercent: 55, yPercent: 15, calloutSide: 'right' },
    { productId: 'p-08-01', markerNumber: '02', xPercent: 58, yPercent: 34, calloutSide: 'right' },
    { productId: 'p-08-inner', markerNumber: '03', xPercent: 50, yPercent: 31, calloutSide: 'left' },
    { productId: 'p-08-02', markerNumber: '04', xPercent: 45, yPercent: 65, calloutSide: 'left' },
    { productId: 'p-08-03', markerNumber: '05', xPercent: 42, yPercent: 90, calloutSide: 'right' },
  ],
  'look-09': [
    { productId: 'p-09-01', markerNumber: '01', xPercent: 55, yPercent: 34, calloutSide: 'right' },
    { productId: 'p-shared-dark-tee', markerNumber: '02', xPercent: 48, yPercent: 47, calloutSide: 'left' },
    { productId: 'p-09-02', markerNumber: '03', xPercent: 45, yPercent: 64, calloutSide: 'left' },
    { productId: 'p-09-03', markerNumber: '04', xPercent: 62, yPercent: 90, calloutSide: 'right' },
  ],
};

export interface EditorialSectionNote {
  id: 'drop-01' | 'stories' | 'journal';
  label: string;
  heading: string;
  body: string;
}

export const EDITORIAL_NOTES: EditorialSectionNote[] = [
  {
    id: 'drop-01',
    label: 'DROP 01',
    heading: 'DROP 01 — AUTUMN SILENCE',
    body: 'Nine silhouettes photographed in Prague on a seamless cyclorama. Heavyweight brushed fleece, enzyme-washed denim, and technical shell outerwear built for low-signal days.',
  },
  {
    id: 'stories',
    label: 'STORIES',
    heading: 'EXHIBITION NOTES — LOGGING OFF',
    body: 'Conceived as a quiet spatial gallery rather than a storefront. Switch display modes to rearrange the ensemble or select any figure to inspect individual garment construction.',
  },
  {
    id: 'journal',
    label: 'JOURNAL',
    heading: 'STUDIO ARCHIVE 001',
    body: 'Shot on 28mm optics under diffused overhead softboxes. All pieces are cut in limited runs and numbered by look sequence 01 through 09.',
  },
];
