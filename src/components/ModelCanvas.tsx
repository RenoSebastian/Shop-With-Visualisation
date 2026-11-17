import React from 'react';
import { motion } from 'motion/react';
import { FASHION_MODELS } from '../data/models';
import { DisplayMode, FashionModelData, GroupDisplayMode, ViewMode } from '../types/showroom';
import { FashionModel } from './FashionModel';
import { useTurntableController } from './useTurntableController';

interface ModelCanvasProps {
  visibleModels: FashionModelData[];
  viewMode: ViewMode;
  displayMode: DisplayMode;
  previousGroupMode: GroupDisplayMode;
  activeModelId: string;
  rotationCommandNonce: number;
  isMobile: boolean;
  onSnapActiveModel: (modelId: string) => void;
  onSelectModel: (modelId: string) => void;
  onClearFilters: () => void;
}

export const ModelCanvas: React.FC<ModelCanvasProps> = ({
  visibleModels,
  viewMode,
  displayMode,
  previousGroupMode,
  activeModelId,
  rotationCommandNonce,
  isMobile,
  onSnapActiveModel,
  onSelectModel,
  onClearFilters,
}) => {
  const visibleModelIds = visibleModels.map((m) => m.id);

  const { sharedMotion, isDragging, consumeDidDrag, handlers } = useTurntableController({
    displayMode,
    previousGroupMode,
    viewMode,
    activeModelId,
    visibleModelIds,
    rotationCommandNonce,
    isMobile,
    onSnapActiveModel,
  });

  const isSpatial = viewMode === ViewMode.SPATIAL;

  if (visibleModels.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center bg-[#F2F2F2]">
        <p className="font-display text-2xl font-light text-[#111111]">
          No matching looks on turntable
        </p>
        <p className="mt-2 text-xs text-[#666666] max-w-sm">
          Adjust your active taxonomy filters or search query to reveal matching ensembles.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 min-h-[42px] px-5 bg-[#111111] text-white font-mono text-[10px] tracking-[0.14em] uppercase cursor-pointer"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <motion.div
      key="central-bearing-turntable"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
      {...handlers}
      style={{
        touchAction: isSpatial ? 'none' : 'auto',
      }}
      className={`relative w-full h-full overflow-hidden select-none ${
        isSpatial
          ? isDragging
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : 'cursor-default'
      }`}
    >
      {visibleModels.map((model, visibleIdx) => {
        const globalIndex = FASHION_MODELS.findIndex((m) => m.id === model.id);
        return (
          <FashionModel
            key={model.id}
            model={model}
            index={globalIndex >= 0 ? globalIndex : visibleIdx}
            visibleIndex={visibleIdx}
            totalVisible={visibleModels.length}
            sharedMotion={sharedMotion}
            viewMode={viewMode}
            isFocal={model.id === activeModelId}
            isMobile={isMobile}
            canClick={() => !consumeDidDrag()}
            onSelect={onSelectModel}
          />
        );
      })}
    </motion.div>
  );
};
