import { firstLayerByTag } from "@/puppets/registry";
import { visemesToMouthShape } from "@/services/audio/VisemeCalculator";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class NutcrackerJawBehavior implements Behavior {
  readonly id = "nutcracker-jaw";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.nutcrackerJaw) return {};

    const fromAudio = visemesToMouthShape(ctx.visemeWeights);
    const audioEnergy = 1 - (ctx.visemeWeights.rest ?? 0);
    const open =
      audioEnergy > 0.08
        ? fromAudio.open * 0.7 + ctx.face.mouthOpen * 0.3
        : ctx.face.mouthOpen;

    const jawId = firstLayerByTag(ctx.character, "jaw");
    if (!jawId) return {};
    return {
      layers: {
        [jawId]: {
          y: open * 16,
          scaleY: 1 + open * 0.1,
        },
      },
    };
  }
}
