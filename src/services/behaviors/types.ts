import type { CharacterDef } from "@/puppets/registry";
import type { BehaviorKey } from "@/store/appStore";
import type {
  CalibrationOffsets,
  FaceSignals,
  HeadRotation,
  LayerTransform,
  PuppetLayerId,
} from "@/store/types";

export interface BehaviorContext {
  rotation: HeadRotation;
  calibratedRotation: HeadRotation;
  face: FaceSignals;
  visemeWeights: Record<string, number>;
  calibration: CalibrationOffsets;
  dtMs: number;
  timeMs: number;
  character: CharacterDef;
  activeTriggers: Record<string, boolean>;
  activeSwaps: Record<string, string>;
  dragOffsets: Record<string, { x: number; y: number }>;
  enabled: Record<BehaviorKey, boolean>;
}

export interface BehaviorOutput {
  layers?: Partial<Record<PuppetLayerId, Partial<LayerTransform>>>;
  headRotation?: HeadRotation;
  visibility?: Record<string, boolean>;
  swaps?: Record<string, string>;
}

export interface Behavior {
  readonly id: string;
  update(ctx: BehaviorContext): BehaviorOutput;
}
