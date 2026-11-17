import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FASHION_MODELS, MODEL_BY_ID } from '../data/models';
import { useCatalogDiscovery } from '../hooks/useCatalogDiscovery';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useShowroomStore } from '../store/useShowroomStore';
import { DisplayMode, FashionModelData, ViewMode } from '../types/showroom';
import { BagCheckoutDrawer } from './BagCheckoutDrawer';
import { CatalogGridView } from './CatalogGridView';
import { DisplayModeSelector } from './DisplayModeSelector';
import { FilterDrawer } from './FilterDrawer';
import { IndexDrawer } from './IndexDrawer';
import { MobileNavigation } from './MobileNavigation';
import { ModelCanvas } from './ModelCanvas';
import { ModelDetailView } from './ModelDetailView';
import { ProductDetailModal } from './ProductDetailModal';

function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpointPx : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpointPx]);

  return isMobile;
}

export const FashionShowroom: React.FC = () => {
  const isMobile = useIsMobile();

  const {
    displayMode,
    previousGroupMode,
    viewMode,
    activeModelId,
    rotationCommandNonce,
    bagItems,
    pricingConfig,
    toastMessage,
    setDisplayMode,
    setViewMode,
    setActiveModelFromDragSnap,
    selectModelInShowroom,
    openIndividualView,
    toggleIndex,
    toggleBag,
  } = useShowroomStore();

  const { gridTab, clearAllFilters, toggleFilterDrawer } = useDiscoveryStore();
  const { filteredShowroomLooks, activeFilterCount } = useCatalogDiscovery();

  const visibleModels = useMemo<FashionModelData[]>(() => {
    return filteredShowroomLooks.items
      .map((rec) => MODEL_BY_ID[rec.look.id])
      .filter((m): m is FashionModelData => Boolean(m));
  }, [filteredShowroomLooks.items]);

  useEffect(() => {
    if (viewMode !== ViewMode.SPATIAL || visibleModels.length === 0) return;
    if (!visibleModels.some((m) => m.id === activeModelId)) {
      setActiveModelFromDragSnap(visibleModels[0].id);
    }
  }, [viewMode, visibleModels, activeModelId, setActiveModelFromDragSnap]);

  const effectiveActiveModel =
    (viewMode === ViewMode.SPATIAL
      ? visibleModels.find((m) => m.id === activeModelId) ?? visibleModels[0]
      : MODEL_BY_ID[activeModelId]) ??
    MODEL_BY_ID[activeModelId] ??
    FASHION_MODELS[0];

  const bagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);
  const facetTarget = viewMode === ViewMode.GRID && gridTab === 'products' ? 'products' : 'looks';

  return (
    <main className="relative w-screen h-[100dvh] bg-[#F2F2F2] text-[#111111] overflow-hidden select-none">
      <MobileNavigation
        bagCount={bagCount}
        activeFilterCount={activeFilterCount}
        viewMode={viewMode}
        isMobile={isMobile}
        onOpenIndex={() => toggleIndex(true)}
        onOpenFilter={() => toggleFilterDrawer(true)}
        onClearFilters={clearAllFilters}
        onOpenBag={() => toggleBag(true)}
        onChangeViewMode={(nextView) => setViewMode(nextView)}
        onResetShowroom={() => {
          clearAllFilters();
          setDisplayMode(DisplayMode.DO_NOT_DISTURB);
        }}
      />

      {/* Main Canvas: Clean FIND Turntable, GRID Hybrid Discovery, or INDIVIDUAL Static View */}
      <div className="w-full h-full">
        <AnimatePresence mode="wait">
          {viewMode === ViewMode.INDIVIDUAL ? (
            <ModelDetailView
              key="individual"
              model={effectiveActiveModel}
              isMobile={isMobile}
            />
          ) : viewMode === ViewMode.GRID ? (
            <CatalogGridView key="grid-catalog" isMobile={isMobile} />
          ) : (
            <ModelCanvas
              key="showroom-canvas"
              visibleModels={visibleModels}
              viewMode={viewMode}
              displayMode={displayMode}
              previousGroupMode={previousGroupMode}
              activeModelId={effectiveActiveModel.id}
              rotationCommandNonce={rotationCommandNonce}
              isMobile={isMobile}
              onSnapActiveModel={(modelId) => setActiveModelFromDragSnap(modelId)}
              onSelectModel={(modelId) => selectModelInShowroom(modelId)}
              onClearFilters={clearAllFilters}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Showroom Bar */}
      {viewMode === ViewMode.SPATIAL && visibleModels.length > 0 && (
        <DisplayModeSelector
          viewMode={viewMode}
          activeModel={effectiveActiveModel}
          currencySymbol={pricingConfig.currencySymbol}
          isMobile={isMobile}
          onInspectLook={(productId) =>
            openIndividualView(effectiveActiveModel.id, productId)
          }
        />
      )}

      {/* Drawers & Modals */}
      <IndexDrawer isMobile={isMobile} />
      <FilterDrawer isMobile={isMobile} facetTarget={facetTarget} />
      <ProductDetailModal isMobile={isMobile} />
      <BagCheckoutDrawer isMobile={isMobile} />

      {/* Confirmation Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-[calc(7.75rem+env(safe-area-inset-bottom))] md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#111111] text-white font-mono text-[10px] tracking-[0.14em] uppercase shadow-lg whitespace-nowrap pointer-events-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
