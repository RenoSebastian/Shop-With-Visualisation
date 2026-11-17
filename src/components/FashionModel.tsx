import React, { useState } from 'react';
import { motion, useTransform } from 'motion/react';
import {
  getDynamicOrbitalAngle,
  getGridPositionForIndex,
  ORBITAL_BY_MODEL_ID,
} from '../data/turntableGeometry';
import { FashionModelData, ViewMode } from '../types/showroom';
import { SharedTurntableMotion } from './useTurntableController';

interface FashionModelProps {
  model: FashionModelData;
  index: number;
  visibleIndex: number;
  totalVisible: number;
  sharedMotion: SharedTurntableMotion;
  viewMode: ViewMode;
  isFocal: boolean;
  isMobile: boolean;
  canClick: () => boolean;
  onSelect: (modelId: string) => void;
}

export const FashionModel: React.FC<FashionModelProps> = ({
  model,
  index,
  visibleIndex,
  totalVisible,
  sharedMotion,
  viewMode,
  isFocal,
  isMobile,
  canClick,
  onSelect,
}) => {
  const [imgError, setImgError] = useState(false);

  const orbital = ORBITAL_BY_MODEL_ID[model.id];
  const initialAngle = getDynamicOrbitalAngle(visibleIndex, totalVisible);
  const isGrid = viewMode === ViewMode.GRID;
  const gridPos = getGridPositionForIndex(index, isMobile);
  const baseHeight = isMobile ? 'min(47vh, 390px)' : 'min(57vh, 505px)';

  const leftPct = useTransform(
    [sharedMotion.rotationOffset, sharedMotion.gridMix, sharedMotion.centerX, sharedMotion.radiusX],
    ([offset, mix, cx, rx]: number[]) => {
      const angle = initialAngle + offset;
      const polarX = cx + rx * Math.sin(angle);
      return `${polarX + (gridPos.xPercent - polarX) * mix}%`;
    },
  );

  const topPct = useTransform(
    [
      sharedMotion.rotationOffset,
      sharedMotion.gridMix,
      sharedMotion.centerY,
      sharedMotion.verticalTilt,
    ],
    ([offset, mix, cy, tilt]: number[]) => {
      const angle = initialAngle + offset;
      const depth = Math.cos(angle);
      const polarY = cy + tilt * depth + orbital.verticalOffsetPercent;
      return `${polarY + (gridPos.yPercent - polarY) * mix}%`;
    },
  );

  const finalScale = useTransform(
    [sharedMotion.rotationOffset, sharedMotion.gridMix, sharedMotion.minScale, sharedMotion.maxScale],
    ([offset, mix, minS, maxS]: number[]) => {
      const angle = initialAngle + offset;
      const normDepth = (Math.cos(angle) + 1) * 0.5;
      const polarS = minS + (maxS - minS) * Math.pow(normDepth, 1.35);
      return polarS + (gridPos.scale - polarS) * mix;
    },
  );

  const finalOpacity = useTransform(
    [sharedMotion.rotationOffset, sharedMotion.gridMix, sharedMotion.minOpacity],
    ([offset, mix, minOp]: number[]) => {
      const angle = initialAngle + offset;
      const normDepth = (Math.cos(angle) + 1) * 0.5;
      const polarOp = minOp + (1 - minOp) * Math.pow(normDepth, 0.7);
      return polarOp + (1 - polarOp) * mix;
    },
  );

  const finalZIndex = useTransform(
    [sharedMotion.rotationOffset, sharedMotion.gridMix],
    ([offset, mix]: number[]) => {
      const angle = initialAngle + offset;
      const normDepth = (Math.cos(angle) + 1) * 0.5;
      const polarZ = 10 + normDepth * 40;
      return Math.round(polarZ + (20 - polarZ) * mix);
    },
  );

  const finalFilter = useTransform(
    [sharedMotion.rotationOffset, sharedMotion.gridMix, sharedMotion.maxBlurPx],
    ([offset, mix, maxB]: number[]) => {
      const angle = initialAngle + offset;
      const depth = Math.cos(angle);
      const rawBlur = depth < 0.35 ? Math.max(0, ((0.35 - depth) / 1.35) * maxB) : 0;
      const blur = rawBlur * (1 - mix);
      return blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'blur(0px)';
    },
  );

  const handleClick = () => {
    if (!canClick()) return;
    onSelect(model.id);
  };

  return (
    <motion.div
      style={{
        left: leftPct,
        top: topPct,
        scale: finalScale,
        opacity: finalOpacity,
        zIndex: finalZIndex,
        filter: finalFilter,
        height: baseHeight,
        transformOrigin: 'center center',
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 aspect-[3/4] pointer-events-none"
    >
      {/* Subtle grounded gallery shadow beneath shoes */}
      <div
        aria-hidden="true"
        className="absolute bottom-[4.5%] left-1/2 -translate-x-1/2 w-[36%] h-[3.2%] rounded-full bg-black/14 blur-md pointer-events-none"
      />

      <button
        type="button"
        onClick={handleClick}
        aria-label={`Select Look ${model.indexNumber} ${model.title}`}
        className="group pointer-events-auto relative w-full h-full cursor-pointer focus-visible:outline-none"
        style={{
          clipPath: isGrid ? 'none' : 'inset(4% 16% 3% 16%)',
        }}
      >
        {!imgError ? (
          <img
            src={model.imageUrl}
            alt={`Look ${model.indexNumber} — ${model.title}`}
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#555555] font-mono text-xs p-4">
            <span>{model.indexNumber}</span>
            <span className="mt-1 text-center">{model.title}</span>
          </div>
        )}

        {isGrid ? (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-6 flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`font-mono text-[24px] sm:text-[26px] tracking-[0.14em] uppercase ${
                isFocal ? 'text-[#111111] font-semibold' : 'text-[#555555]'
              }`}
              style={{ transform: 'scale(0.42)', transformOrigin: 'top center' }}
            >
              {model.indexNumber} {model.title}
            </span>
          </div>
        ) : (
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[7%] px-2 py-0.5 bg-white/95 border border-[#DCDCDC] font-mono text-[9.5px] tracking-[0.14em] text-[#111111] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {isFocal ? `STATIC · ${model.indexNumber}` : `${model.indexNumber} · ${model.title}`}
          </span>
        )}
      </button>
    </motion.div>
  );
};
