import { create } from 'zustand';
import { MODEL_BY_ID } from '../data/models';
import { DEFAULT_PRICING_CONFIG } from '../data/outfitConfigurations';
import { PRODUCT_BY_ID } from '../data/products';
import { TURNTABLE_MODE_CONFIGS } from '../data/turntableGeometry';
import {
  BagItem,
  DisplayMode,
  GroupDisplayMode,
  OrderReceipt,
  ShowroomPricingConfig,
  SizeOption,
  ViewMode,
} from '../types/showroom';
import { calculateBagPricing } from '../utils/pricing';

interface ShowroomState {
  displayMode: DisplayMode;
  previousGroupMode: GroupDisplayMode;
  viewMode: ViewMode;
  activeModelId: string;
  /** Incrementing token to signal explicit rotation target changes (clicks/mode switches) vs drag settle */
  rotationCommandNonce: number;
  activeHotspotProductId: string | null;
  expandedSizeProductId: string | null;
  indexOpen: boolean;
  activeEditorialTab: 'drop-01' | 'stories' | 'journal' | null;
  bagOpen: boolean;
  bagItems: BagItem[];
  pricingConfig: ShowroomPricingConfig;
  lastOrderReceipt: OrderReceipt | null;
  toastMessage: string | null;

  setDisplayMode: (mode: DisplayMode) => void;
  setViewMode: (view: ViewMode) => void;
  setActiveModelFromDragSnap: (modelId: string) => void;
  selectModelInShowroom: (modelId: string) => void;
  selectLookFromSelector: (modelId: string) => void;
  openIndividualView: (modelId?: string, focusProductId?: string) => void;
  closeIndividualView: () => void;
  selectHotspot: (productId: string | null) => void;
  setExpandedSizeProduct: (productId: string | null) => void;
  addToBag: (productId: string, lookId: string, size: SizeOption) => void;
  addFullLookToBag: (lookId: string, defaultSize?: SizeOption) => void;
  updateBagItemQuantity: (itemId: string, delta: number) => void;
  removeBagItem: (itemId: string) => void;
  toggleIndex: (open?: boolean) => void;
  setActiveEditorialTab: (tab: 'drop-01' | 'stories' | 'journal' | null) => void;
  toggleBag: (open?: boolean) => void;
  toggleFullLookDiscount: () => void;
  completePurchase: () => void;
  clearReceipt: () => void;
  clearToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function triggerToast(set: (partial: Partial<ShowroomState>) => void, message: string) {
  if (toastTimer) clearTimeout(toastTimer);
  set({ toastMessage: message });
  toastTimer = setTimeout(() => {
    set({ toastMessage: null });
  }, 2400);
}

export const useShowroomStore = create<ShowroomState>((set, get) => ({
  displayMode: DisplayMode.DO_NOT_DISTURB,
  previousGroupMode: DisplayMode.DO_NOT_DISTURB,
  viewMode: ViewMode.SPATIAL,
  activeModelId: TURNTABLE_MODE_CONFIGS[DisplayMode.DO_NOT_DISTURB].defaultFocusModelId,
  rotationCommandNonce: 0,
  activeHotspotProductId: null,
  expandedSizeProductId: null,
  indexOpen: false,
  activeEditorialTab: null,
  bagOpen: false,
  bagItems: [],
  pricingConfig: DEFAULT_PRICING_CONFIG,
  lastOrderReceipt: null,
  toastMessage: null,

  setDisplayMode: (mode) => {
    const current = get();
    if (mode === DisplayMode.STATIC) {
      set({
        displayMode: DisplayMode.STATIC,
        viewMode: ViewMode.INDIVIDUAL,
        activeModelId: current.activeModelId,
        activeHotspotProductId: null,
        expandedSizeProductId: null,
        indexOpen: false,
      });
      return;
    }

    const config = TURNTABLE_MODE_CONFIGS[mode];
    set({
      displayMode: mode,
      previousGroupMode: mode,
      viewMode: ViewMode.SPATIAL,
      activeModelId: config.defaultFocusModelId,
      rotationCommandNonce: current.rotationCommandNonce + 1,
      activeHotspotProductId: null,
      expandedSizeProductId: null,
    });
  },

  setViewMode: (view) => {
    const current = get();
    set({
      viewMode: view,
      displayMode:
        view === ViewMode.SPATIAL && current.displayMode === DisplayMode.STATIC
          ? current.previousGroupMode
          : current.displayMode,
      activeHotspotProductId: null,
      expandedSizeProductId: null,
      indexOpen: false,
    });
  },

  setActiveModelFromDragSnap: (modelId) => {
    set({ activeModelId: modelId });
  },

  selectModelInShowroom: (modelId) => {
    const current = get();
    if (current.viewMode === ViewMode.GRID) {
      // Clicking a model in GRID returns to the rotating turntable and rotates it to front-center
      set({
        activeModelId: modelId,
        displayMode: current.previousGroupMode,
        viewMode: ViewMode.SPATIAL,
        rotationCommandNonce: current.rotationCommandNonce + 1,
        activeHotspotProductId: null,
        expandedSizeProductId: null,
        indexOpen: false,
      });
      return;
    }

    if (current.viewMode === ViewMode.SPATIAL && current.activeModelId === modelId) {
      // Clicking the already front-center model stops the turntable and opens STATIC view
      set({
        displayMode: DisplayMode.STATIC,
        viewMode: ViewMode.INDIVIDUAL,
        activeHotspotProductId: null,
        expandedSizeProductId: null,
      });
      return;
    }

    // Rotate the shared central bearing so the clicked model rotates smoothly to front-center
    set({
      activeModelId: modelId,
      viewMode: ViewMode.SPATIAL,
      rotationCommandNonce: current.rotationCommandNonce + 1,
      activeHotspotProductId: null,
      expandedSizeProductId: null,
      indexOpen: false,
    });
  },

  selectLookFromSelector: (modelId) => {
    const current = get();
    const matchingMode = MODEL_BY_ID[modelId]?.featuredInMode;
    if (
      matchingMode &&
      matchingMode !== DisplayMode.STATIC &&
      current.viewMode === ViewMode.SPATIAL
    ) {
      set({
        displayMode: matchingMode,
        previousGroupMode: matchingMode,
        viewMode: ViewMode.SPATIAL,
        activeModelId: modelId,
        rotationCommandNonce: current.rotationCommandNonce + 1,
        activeHotspotProductId: null,
        expandedSizeProductId: null,
      });
      return;
    }

    set({
      activeModelId: modelId,
      displayMode:
        current.displayMode === DisplayMode.STATIC
          ? current.previousGroupMode
          : current.displayMode,
      viewMode: ViewMode.SPATIAL,
      rotationCommandNonce: current.rotationCommandNonce + 1,
      activeHotspotProductId: null,
      expandedSizeProductId: null,
    });
  },

  openIndividualView: (modelId, focusProductId) => {
    const current = get();
    const targetId = modelId ?? current.activeModelId;
    set({
      activeModelId: targetId,
      displayMode: DisplayMode.STATIC,
      viewMode: ViewMode.INDIVIDUAL,
      activeHotspotProductId: focusProductId ?? null,
      expandedSizeProductId: focusProductId ?? null,
      indexOpen: false,
    });
  },

  closeIndividualView: () => {
    const current = get();
    set({
      displayMode: current.previousGroupMode,
      viewMode: ViewMode.SPATIAL,
      rotationCommandNonce: current.rotationCommandNonce + 1,
      activeHotspotProductId: null,
      expandedSizeProductId: null,
    });
  },

  selectHotspot: (productId) => {
    set({
      activeHotspotProductId: productId,
      expandedSizeProductId: productId,
    });
  },

  setExpandedSizeProduct: (productId) => {
    set((state) => ({
      expandedSizeProductId: state.expandedSizeProductId === productId ? null : productId,
    }));
  },

  addToBag: (productId, lookId, size) => {
    set((state) => {
      const existingIndex = state.bagItems.findIndex(
        (item) => item.productId === productId && item.size === size,
      );
      let nextItems: BagItem[];
      if (existingIndex >= 0) {
        nextItems = state.bagItems.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        nextItems = [
          ...state.bagItems,
          {
            id: `${productId}-${size}`,
            productId,
            lookId,
            size,
            quantity: 1,
          },
        ];
      }
      return {
        bagItems: nextItems,
        expandedSizeProductId: null,
        lastOrderReceipt: null,
      };
    });
    triggerToast(set, 'PIECE SAVED TO YOUR BAG');
  },

  addFullLookToBag: (lookId, defaultSize = 'M') => {
    const look = MODEL_BY_ID[lookId];
    if (!look) return;
    set((state) => {
      const nextItems = [...state.bagItems];
      look.productIds.forEach((productId) => {
        const product = PRODUCT_BY_ID[productId];
        const resolvedSize = product?.availableSizes.includes(defaultSize)
          ? defaultSize
          : (product?.availableSizes[0] ?? defaultSize);

        const existingIndex = nextItems.findIndex(
          (item) => item.productId === productId && item.size === resolvedSize,
        );
        if (existingIndex >= 0) {
          nextItems[existingIndex] = {
            ...nextItems[existingIndex],
            quantity: nextItems[existingIndex].quantity + 1,
          };
        } else {
          nextItems.push({
            id: `${productId}-${resolvedSize}`,
            productId,
            lookId,
            size: resolvedSize,
            quantity: 1,
          });
        }
      });
      return {
        bagItems: nextItems,
        expandedSizeProductId: null,
        lastOrderReceipt: null,
      };
    });
    triggerToast(set, `LOOK ${look.indexNumber} ADDED TO YOUR BAG`);
  },

  updateBagItemQuantity: (itemId, delta) => {
    set((state) => ({
      bagItems: state.bagItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    }));
  },

  removeBagItem: (itemId) => {
    set((state) => ({
      bagItems: state.bagItems.filter((item) => item.id !== itemId),
    }));
  },

  toggleIndex: (open) => {
    set((state) => ({
      indexOpen: typeof open === 'boolean' ? open : !state.indexOpen,
      bagOpen: false,
    }));
  },

  setActiveEditorialTab: (tab) => {
    set((state) => ({
      activeEditorialTab: state.activeEditorialTab === tab ? null : tab,
    }));
  },

  toggleBag: (open) => {
    set((state) => ({
      bagOpen: typeof open === 'boolean' ? open : !state.bagOpen,
      indexOpen: false,
    }));
  },

  toggleFullLookDiscount: () => {
    set((state) => ({
      pricingConfig: {
        ...state.pricingConfig,
        enableFullLookDiscount: !state.pricingConfig.enableFullLookDiscount,
      },
    }));
  },

  completePurchase: () => {
    const state = get();
    if (state.bagItems.length === 0) return;

    const summary = calculateBagPricing(state.bagItems, state.pricingConfig);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `OFF-26-${randomCode}`;

    const receipt: OrderReceipt = {
      orderNumber,
      barcodeValue: `REF-${orderNumber}-${summary.itemCount}PCS`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: state.bagItems.map((item) => {
        const product = PRODUCT_BY_ID[item.productId];
        const look = MODEL_BY_ID[item.lookId];
        return {
          productId: item.productId,
          lookIndex: look?.indexNumber ?? '00',
          lookTitle: look?.title ?? 'SHOWROOM',
          name: product?.name ?? 'PIECE',
          category: product?.category ?? 'OUTERWEAR',
          size: item.size,
          quantity: item.quantity,
          unitPrice: product?.price ?? 0,
        };
      }),
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      total: summary.total,
    };

    set({
      lastOrderReceipt: receipt,
      bagItems: [],
    });
  },

  clearReceipt: () => {
    set({ lastOrderReceipt: null, bagOpen: false });
  },

  clearToast: () => set({ toastMessage: null }),
}));
