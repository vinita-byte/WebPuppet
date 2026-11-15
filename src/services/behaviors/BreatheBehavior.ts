import { firstLayerByTag } from "@/puppets/registry";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class BreatheBehavior implements Behavior {
  readonly id = "breathe";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.breathe) return {};

    const phase = Math.sin(ctx.timeMs / 900) * 0.5 + 0.5;
    const torso = firstLayerByTag(ctx.character, "torso");
    if (!torso) return {};
    return {
      layers: {
        [torso]: {
          scaleX: 1 + phase * 0.025,
          scaleY: 1 + phase * 0.035,
          y: -phase * 2,
        },
      },
    };
  }
}
