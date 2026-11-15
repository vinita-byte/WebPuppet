import { applyCalibration } from "@/services/vision/normalize";
import type { HeadRotation, LayerTransform, PuppetLayerId } from "@/store/types";
import { BlinkBehavior } from "./BlinkBehavior";
import { HeadTrackingBehavior } from "./HeadTrackingBehavior";
import { LipSyncBehavior } from "./LipSyncBehavior";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export interface BehaviorSystemResult {
  layers: Partial<Record<PuppetLayerId, Partial<LayerTransform>>>;
  headRotation: HeadRotation;
}

/**
 * Runs modular puppet drivers each frame. Later behaviors may override
 * earlier ones on the same layer keys (lip-sync after head, etc.).
 */
export class BehaviorSystem {
  private readonly behaviors: Behavior[];

  constructor(behaviors?: Behavior[]) {
    this.behaviors = behaviors ?? [
      new HeadTrackingBehavior(),
      new BlinkBehavior(),
      new LipSyncBehavior(),
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
    let headRotation: HeadRotation = { ...calibratedRotation };

    for (const behavior of this.behaviors) {
      const out: BehaviorOutput = behavior.update(ctx);
      if (out.headRotation) {
        headRotation = out.headRotation;
      }
      for (const [id, driven] of Object.entries(out) as [
        string,
        Partial<LayerTransform> | HeadRotation | undefined,
      ][]) {
        if (id === "headRotation" || !driven || typeof driven !== "object") {
          continue;
        }
        if ("yaw" in driven) continue;
        const layerId = id as PuppetLayerId;
        layers[layerId] = {
          ...(layers[layerId] ?? {}),
          ...(driven as Partial<LayerTransform>),
        };
      }
    }

    return { layers, headRotation };
  }
}
