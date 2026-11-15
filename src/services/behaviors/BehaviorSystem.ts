import { applyCalibration } from "@/services/vision/normalize";
import type { HeadRotation, LayerTransform, PuppetLayerId } from "@/store/types";
import { AutoBlinkBehavior } from "./AutoBlinkBehavior";
import { BlinkBehavior } from "./BlinkBehavior";
import { BreatheBehavior } from "./BreatheBehavior";
import { DraggerBehavior } from "./DraggerBehavior";
import { EyeGazeBehavior } from "./EyeGazeBehavior";
import { HeadTrackingBehavior } from "./HeadTrackingBehavior";
import { LipSyncBehavior } from "./LipSyncBehavior";
import { NutcrackerJawBehavior } from "./NutcrackerJawBehavior";
import { PhysicsBehavior } from "./PhysicsBehavior";
import { TriggerBehavior } from "./TriggerBehavior";
import { WalkBehavior } from "./WalkBehavior";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export interface BehaviorSystemResult {
  layers: Partial<Record<PuppetLayerId, Partial<LayerTransform>>>;
  headRotation: HeadRotation;
  visibility: Record<string, boolean>;
  swaps: Record<string, string>;
}

export class BehaviorSystem {
  private readonly behaviors: Behavior[];

  constructor(behaviors?: Behavior[]) {
    this.behaviors = behaviors ?? [
      new BreatheBehavior(),
      new WalkBehavior(),
      new HeadTrackingBehavior(),
      new EyeGazeBehavior(),
      new BlinkBehavior(),
      new AutoBlinkBehavior(),
      new NutcrackerJawBehavior(),
      new LipSyncBehavior(),
      new PhysicsBehavior(),
      new TriggerBehavior(),
      new DraggerBehavior(),
    ];
  }

  evaluate(
    input: Omit<BehaviorContext, "calibratedRotation">,
  ): BehaviorSystemResult {
    const calibratedRotation = applyCalibration(
      input.rotation,
      input.calibration,
    );

    const ctx: BehaviorContext = {
      ...input,
      calibratedRotation,
    };

    const layers: Partial<Record<PuppetLayerId, Partial<LayerTransform>>> = {};
    const visibility: Record<string, boolean> = {};
    const swaps: Record<string, string> = {};
    let headRotation: HeadRotation = { ...calibratedRotation };

    for (const behavior of this.behaviors) {
      const out: BehaviorOutput = behavior.update(ctx);
      if (out.headRotation) headRotation = out.headRotation;
      if (out.visibility) Object.assign(visibility, out.visibility);
      if (out.swaps) Object.assign(swaps, out.swaps);
      if (out.layers) {
        for (const [id, driven] of Object.entries(out.layers)) {
          if (!driven) continue;
          layers[id] = { ...(layers[id] ?? {}), ...driven };
        }
      }
    }

    return { layers, headRotation, visibility, swaps };
  }
}
