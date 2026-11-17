import { FASHION_MODELS } from './models';
import {
  DisplayMode,
  GridPositionSpec,
  GroupDisplayMode,
  ModelOrbitalSpec,
  TurntableModeConfig,
} from '../types/showroom';

const TOTAL_MODELS = FASHION_MODELS.length;
const ANGLE_STEP = (Math.PI * 2) / TOTAL_MODELS;

/**
 * Fixed orbital ring positions around ONE shared central bearing.
 * Every model keeps its fixed angular spacing relative to all other models.
 */
export const MODEL_ORBITAL_SPECS: ModelOrbitalSpec[] = FASHION_MODELS.map((model, index) => ({
  modelId: model.id,
  index,
  initialAngle: index * ANGLE_STEP,
  verticalOffsetPercent: index % 2 === 0 ? 0 : -0.6,
}));

export const ORBITAL_BY_MODEL_ID: Record<string, ModelOrbitalSpec> = Object.fromEntries(
  MODEL_ORBITAL_SPECS.map((spec) => [spec.modelId, spec]),
);

/**
 * Three rotating turntable display configurations sharing the exact same central pivot.
 * Switching modes smoothly adjusts the turntable radius, camera elevation tilt,
 * depth blur, and rotates the shared bearing to the featured look.
 */
export const TURNTABLE_MODE_CONFIGS: Record<GroupDisplayMode, TurntableModeConfig> = {
  [DisplayMode.DO_NOT_DISTURB]: {
    mode: DisplayMode.DO_NOT_DISTURB,
    label: 'DO NOT DISTURB',
    shortNote: 'Compact central-bearing rotation led by Look 01',
    defaultFocusModelId: 'look-01',
    rotationBias: 1,
    desktop: {
      centerX: 50,
      centerY: 46,
      radiusX: 29,
      verticalTilt: 6.5,
      minScale: 0.38,
      maxScale: 1.08,
      minOpacity: 0.72,
      maxBlurPx: 2.3,
    },
    mobile: {
      centerX: 50,
      centerY: 42,
      radiusX: 25,
      verticalTilt: 7.5,
      minScale: 0.34,
      maxScale: 1.0,
      minOpacity: 0.7,
      maxBlurPx: 2.0,
    },
  },
  [DisplayMode.AIRPLANE_MODE]: {
    mode: DisplayMode.AIRPLANE_MODE,
    label: 'AIRPLANE MODE',
    shortNote: 'Tight wide-span orbit centered on Look 08',
    defaultFocusModelId: 'look-08',
    rotationBias: -1,
    desktop: {
      centerX: 50,
      centerY: 46,
      radiusX: 32,
      verticalTilt: 8.2,
      minScale: 0.37,
      maxScale: 1.1,
      minOpacity: 0.7,
      maxBlurPx: 2.1,
    },
    mobile: {
      centerX: 50,
      centerY: 42,
      radiusX: 27,
      verticalTilt: 8.5,
      minScale: 0.33,
      maxScale: 1.02,
      minOpacity: 0.68,
      maxBlurPx: 1.9,
    },
  },
  [DisplayMode.SIDE_A]: {
    mode: DisplayMode.SIDE_A,
    label: 'SIDE A',
    shortNote: 'Compact high-angle bearing arc centered on Look 07',
    defaultFocusModelId: 'look-07',
    rotationBias: 1,
    desktop: {
      centerX: 50,
      centerY: 45,
      radiusX: 26,
      verticalTilt: 9.5,
      minScale: 0.36,
      maxScale: 1.08,
      minOpacity: 0.68,
      maxBlurPx: 2.5,
    },
    mobile: {
      centerX: 50,
      centerY: 41,
      radiusX: 24,
      verticalTilt: 9.5,
      minScale: 0.33,
      maxScale: 1.0,
      minOpacity: 0.66,
      maxBlurPx: 2.2,
    },
  },
};

export interface ProjectedPolarState {
  xPercent: number;
  yPercent: number;
  scale: number;
  zIndex: number;
  opacity: number;
  blurPx: number;
  depth: number;
}

/**
 * Pure polar projection around the central bearing:
 *   angle = initialAngle + rotationOffset
 *   x = centerX + radiusX * sin(angle)
 *   depth = cos(angle)
 */
export function projectModelFromBearing(
  orbital: ModelOrbitalSpec,
  rotationOffset: number,
  params: TurntableModeConfig['desktop'],
): ProjectedPolarState {
  const angle = orbital.initialAngle + rotationOffset;
  const depth = Math.cos(angle); // -1 (rear) .. +1 (front)
  const normDepth = (depth + 1) * 0.5; // 0 .. 1

  const xPercent = params.centerX + params.radiusX * Math.sin(angle);
  const yPercent =
    params.centerY + params.verticalTilt * depth + orbital.verticalOffsetPercent;

  // Perspective scale curve emphasizes foreground prominence while shrinking rear models
  const scale =
    params.minScale + (params.maxScale - params.minScale) * Math.pow(normDepth, 1.35);

  const zIndex = Math.round(10 + normDepth * 40);
  const opacity =
    params.minOpacity + (1 - params.minOpacity) * Math.pow(normDepth, 0.7);
  const blurPx =
    depth < 0.35 ? Math.max(0, ((0.35 - depth) / 1.35) * params.maxBlurPx) : 0;

  return {
    xPercent,
    yPercent,
    scale,
    zIndex,
    opacity,
    blurPx,
    depth,
  };
}

/**
 * Computes orbital angle step for a dynamic subset of visible models around the shared central bearing.
 */
export function getDynamicOrbitalAngle(visibleIndex: number, totalVisible: number): number {
  if (totalVisible <= 1) return 0;
  return (visibleIndex * Math.PI * 2) / totalVisible;
}

/**
 * Computes the shortest angular offset to rotate the shared turntable
 * so `targetModelId` arrives cleanly at front-center (angle ≡ 0 mod 2π).
 */
export function computeTargetOffsetForModel(
  targetModelId: string,
  currentOffset: number,
  visibleModelIds?: string[],
): number {
  let initialAngle = ORBITAL_BY_MODEL_ID[targetModelId]?.initialAngle;
  if (visibleModelIds && visibleModelIds.length > 0) {
    const idx = visibleModelIds.indexOf(targetModelId);
    if (idx >= 0) {
      initialAngle = getDynamicOrbitalAngle(idx, visibleModelIds.length);
    }
  }
  if (initialAngle === undefined) return currentOffset;

  const currentAngle = initialAngle + currentOffset;
  const shortestDelta = Math.atan2(Math.sin(-currentAngle), Math.cos(-currentAngle));
  return currentOffset + shortestDelta;
}

/**
 * Finds which model is closest to front-center (largest cos(angle)) at a given offset,
 * and returns both its ID and the exact snapped rotationOffset.
 */
export function snapNearestModelToFront(
  projectedOffset: number,
  visibleModelIds?: string[],
): {
  modelId: string;
  snappedOffset: number;
} {
  const candidates =
    visibleModelIds && visibleModelIds.length > 0
      ? visibleModelIds.map((id, idx) => ({
          modelId: id,
          initialAngle: getDynamicOrbitalAngle(idx, visibleModelIds.length),
        }))
      : MODEL_ORBITAL_SPECS;

  let bestSpec = candidates[0];
  let bestDepth = -Infinity;

  for (const spec of candidates) {
    const depth = Math.cos(spec.initialAngle + projectedOffset);
    if (depth > bestDepth) {
      bestDepth = depth;
      bestSpec = spec;
    }
  }

  return {
    modelId: bestSpec.modelId,
    snappedOffset: computeTargetOffsetForModel(
      bestSpec.modelId,
      projectedOffset,
      visibleModelIds,
    ),
  };
}

/**
 * Normalized 3x3 collection layout for optional GRID view.
 */
export function getGridPositionForIndex(
  index: number,
  isMobile: boolean,
): GridPositionSpec {
  const cols = isMobile ? [22, 50, 78] : [26, 50, 74];
  const rows = isMobile ? [22, 46, 70] : [22, 48, 74];
  const scale = isMobile ? 0.33 : 0.35;

  const row = Math.floor(index / 3);
  const col = index % 3;
  return {
    xPercent: cols[col],
    yPercent: rows[row],
    scale,
  };
}
