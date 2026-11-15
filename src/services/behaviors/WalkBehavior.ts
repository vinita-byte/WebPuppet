import { firstLayerByTag } from "@/puppets/registry";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class WalkBehavior implements Behavior {
  readonly id = "walk";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.walk) return {};

    const t = ctx.timeMs / 220;
    const swing = Math.sin(t);
    const layers: BehaviorOutput["layers"] = {};

    const leftLeg = firstLayerByTag(ctx.character, "leftLeg");
    const rightLeg = firstLayerByTag(ctx.character, "rightLeg");
    const leftArm = firstLayerByTag(ctx.character, "leftUpperArm");
    const rightArm = firstLayerByTag(ctx.character, "rightUpperArm");

    if (leftLeg)
      layers[leftLeg] = {
        rotation: swing * 0.35,
        y: Math.max(0, -swing) * 6,
      };
    if (rightLeg)
      layers[rightLeg] = {
        rotation: -swing * 0.35,
        y: Math.max(0, swing) * 6,
      };
    if (leftArm) layers[leftArm] = { rotation: -swing * 0.45 };
    if (rightArm) layers[rightArm] = { rotation: swing * 0.45 };

    return { layers };
  }
}
