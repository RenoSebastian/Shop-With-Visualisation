import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, MotionValue, useMotionValue } from 'motion/react';
import {
  computeTargetOffsetForModel,
  snapNearestModelToFront,
  TURNTABLE_MODE_CONFIGS,
} from '../data/turntableGeometry';
import { DisplayMode, GroupDisplayMode, TurntableModeConfig, ViewMode } from '../types/showroom';

export interface SharedTurntableMotion {
  rotationOffset: MotionValue<number>;
  gridMix: MotionValue<number>;
  centerX: MotionValue<number>;
  centerY: MotionValue<number>;
  radiusX: MotionValue<number>;
  verticalTilt: MotionValue<number>;
  minScale: MotionValue<number>;
  maxScale: MotionValue<number>;
  minOpacity: MotionValue<number>;
  maxBlurPx: MotionValue<number>;
}

interface UseTurntableControllerArgs {
  displayMode: DisplayMode;
  previousGroupMode: GroupDisplayMode;
  viewMode: ViewMode;
  activeModelId: string;
  visibleModelIds: string[];
  rotationCommandNonce: number;
  isMobile: boolean;
  onSnapActiveModel: (modelId: string) => void;
}

/**
 * Dedicated Central Rotation Controller:
 * Owns the single shared rotational axis (`rotationOffset`), `gridMix` blend,
 * shared orbital geometry parameters, drag/touch inertia, and snap-to-front behavior.
 */
export function useTurntableController({
  displayMode,
  previousGroupMode,
  viewMode,
  activeModelId,
  visibleModelIds,
  rotationCommandNonce,
  isMobile,
  onSnapActiveModel,
}: UseTurntableControllerArgs) {
  const effectiveMode: GroupDisplayMode =
    displayMode === DisplayMode.STATIC ? previousGroupMode : displayMode;
  const initialParams: TurntableModeConfig['desktop'] = isMobile
    ? TURNTABLE_MODE_CONFIGS[effectiveMode].mobile
    : TURNTABLE_MODE_CONFIGS[effectiveMode].desktop;

  const visibleKey = useMemo(() => visibleModelIds.join(','), [visibleModelIds]);

  // Single shared central bearing rotation angle in radians (initialized to active model)
  const rotationOffset = useMotionValue(
    computeTargetOffsetForModel(activeModelId, 0, visibleModelIds),
  );
  // 0 = rotating circular turntable, 1 = collection grid
  const gridMix = useMotionValue(viewMode === ViewMode.GRID ? 1 : 0);

  // Shared platform geometry parameters animated smoothly on mode changes
  const centerX = useMotionValue(initialParams.centerX);
  const centerY = useMotionValue(initialParams.centerY);
  const radiusX = useMotionValue(initialParams.radiusX);
  const verticalTilt = useMotionValue(initialParams.verticalTilt);
  const minScale = useMotionValue(initialParams.minScale);
  const maxScale = useMotionValue(initialParams.maxScale);
  const minOpacity = useMotionValue(initialParams.minOpacity);
  const maxBlurPx = useMotionValue(initialParams.maxBlurPx);

  const [isDragging, setIsDragging] = useState(false);

  const pointerDownRef = useRef(false);
  const didDragRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const angularVelocityRef = useRef(0);
  const activeAnimationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const control = animate(gridMix, viewMode === ViewMode.GRID ? 1 : 0, {
      type: 'spring',
      stiffness: 155,
      damping: 24,
    });
    return () => control.stop();
  }, [viewMode, gridMix]);

  useEffect(() => {
    const modeSpec = TURNTABLE_MODE_CONFIGS[effectiveMode];
    const target = isMobile ? modeSpec.mobile : modeSpec.desktop;

    const springOpts = { type: 'spring' as const, stiffness: 140, damping: 24 };
    const controls = [
      animate(centerX, target.centerX, springOpts),
      animate(centerY, target.centerY, springOpts),
      animate(radiusX, target.radiusX, springOpts),
      animate(verticalTilt, target.verticalTilt, springOpts),
      animate(minScale, target.minScale, springOpts),
      animate(maxScale, target.maxScale, springOpts),
      animate(minOpacity, target.minOpacity, springOpts),
      animate(maxBlurPx, target.maxBlurPx, springOpts),
    ];

    return () => {
      controls.forEach((c) => c.stop());
    };
  }, [
    effectiveMode,
    isMobile,
    centerX,
    centerY,
    radiusX,
    verticalTilt,
    minScale,
    maxScale,
    minOpacity,
    maxBlurPx,
  ]);

  // Rotate the shared bearing to bring activeModelId cleanly to front-center
  useEffect(() => {
    if (viewMode !== ViewMode.SPATIAL || visibleModelIds.length === 0) return;

    const current = rotationOffset.get();
    const target = computeTargetOffsetForModel(activeModelId, current, visibleModelIds);
    if (Math.abs(target - current) < 0.001) return;

    activeAnimationRef.current?.stop();
    activeAnimationRef.current = animate(rotationOffset, target, {
      type: 'spring',
      stiffness: 115,
      damping: 22,
      mass: 1.0,
    });
  }, [activeModelId, rotationCommandNonce, viewMode, visibleKey, rotationOffset, visibleModelIds]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (viewMode !== ViewMode.SPATIAL || visibleModelIds.length <= 1) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    activeAnimationRef.current?.stop();
    pointerDownRef.current = true;
    didDragRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    angularVelocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current || viewMode !== ViewMode.SPATIAL) return;

    const now = performance.now();
    const dx = e.clientX - lastXRef.current;
    const totalDx = Math.abs(e.clientX - startXRef.current);

    if (!didDragRef.current && totalDx > 6) {
      didDragRef.current = true;
      setIsDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture isn't supported
      }
    }

    if (didDragRef.current) {
      const sensitivity = isMobile ? 165 : 270;
      const deltaAngle = dx / sensitivity;
      rotationOffset.set(rotationOffset.get() + deltaAngle);

      const dt = Math.max(8, now - lastTimeRef.current) / 1000;
      const instantVelocity = deltaAngle / dt;
      angularVelocityRef.current = angularVelocityRef.current * 0.45 + instantVelocity * 0.55;
    }

    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;

    if (didDragRef.current) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore release errors
      }
      setIsDragging(false);

      const currentOffset = rotationOffset.get();
      const clampedVelocity = Math.max(-4.5, Math.min(4.5, angularVelocityRef.current));
      const projectedOffset = currentOffset + clampedVelocity * 0.22;
      const { modelId, snappedOffset } = snapNearestModelToFront(
        projectedOffset,
        visibleModelIds,
      );

      onSnapActiveModel(modelId);
      activeAnimationRef.current?.stop();
      activeAnimationRef.current = animate(rotationOffset, snappedOffset, {
        type: 'spring',
        stiffness: 110,
        damping: 22,
        velocity: clampedVelocity,
      });

      setTimeout(() => {
        didDragRef.current = false;
      }, 40);
    }
  };

  const consumeDidDrag = () => didDragRef.current;

  const sharedMotion: SharedTurntableMotion = {
    rotationOffset,
    gridMix,
    centerX,
    centerY,
    radiusX,
    verticalTilt,
    minScale,
    maxScale,
    minOpacity,
    maxBlurPx,
  };

  return {
    sharedMotion,
    isDragging,
    consumeDidDrag,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
    },
  };
}
