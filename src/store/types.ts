/** Euler head rotation in degrees (right-handed, Y-up). */
export interface HeadRotation {
  yaw: number;
  pitch: number;
  roll: number;
}

/** 2D/3D landmark in normalized face space (origin at face center). */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface LayerTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

/** Layer ids are character-defined strings. */
export type PuppetLayerId = string;

export interface PuppetLayerNode {
  id: PuppetLayerId;
  parentId: PuppetLayerId | null;
  rest: LayerTransform;
  driven: LayerTransform;
  zIndex: number;
  visible: boolean;
  tag: string;
  swapSet?: string;
}

export interface FaceSignals {
  blinkLeft: number;
  blinkRight: number;
  mouthOpen: number;
  mouthSmile: number;
  browInnerUp: number;
  /** Normalized gaze offsets from iris landmarks (-1..1). */
  gazeX: number;
  gazeY: number;
}

export interface CalibrationOffsets {
  yaw: number;
  pitch: number;
  roll: number;
  landmarkScale: number;
}

export type RecordingState = "idle" | "armed" | "recording" | "playing";

export interface Keyframe {
  timeMs: number;
  rotation: HeadRotation;
  layers: Partial<Record<PuppetLayerId, LayerTransform>>;
  face: FaceSignals;
  visemeWeights: Record<string, number>;
  activeTriggers: string[];
  activeSwaps: Record<string, string>;
}

export const IDENTITY_TRANSFORM: LayerTransform = {
  x: 0,
  y: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
};

export function createIdentityTransform(
  overrides: Partial<LayerTransform> = {},
): LayerTransform {
  return { ...IDENTITY_TRANSFORM, ...overrides };
}
