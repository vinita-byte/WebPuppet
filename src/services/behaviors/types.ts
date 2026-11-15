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
  enabled: {
    headTracking: boolean;
    blink: boolean;
    lipSync: boolean;
  };
}

export type BehaviorOutput = Partial<
  Record<PuppetLayerId, Partial<LayerTransform>>
> & {
  /** Optional head-level rotation override for the root/head container. */
  headRotation?: HeadRotation;
};

export interface Behavior {
  readonly id: string;
  update(ctx: BehaviorContext): BehaviorOutput;
}
