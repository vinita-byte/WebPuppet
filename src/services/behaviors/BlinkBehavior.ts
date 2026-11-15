import { firstLayerByTag } from "@/puppets/registry";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class BlinkBehavior implements Behavior {
  readonly id = "blink";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.blink) return {};

    const left = smooth(ctx.face.blinkLeft);
    const right = smooth(ctx.face.blinkRight);
    const layers: BehaviorOutput["layers"] = {};
    const visibility: Record<string, boolean> = {};

    const leftEye = firstLayerByTag(ctx.character, "leftEye");
    const rightEye = firstLayerByTag(ctx.character, "rightEye");
    const leftLid = firstLayerByTag(ctx.character, "leftEyelid");
    const rightLid = firstLayerByTag(ctx.character, "rightEyelid");
    const leftPupil = firstLayerByTag(ctx.character, "leftPupil");
    const rightPupil = firstLayerByTag(ctx.character, "rightPupil");

    if (leftEye) layers[leftEye] = { scaleY: 1 - left * 0.92 };
    if (rightEye) layers[rightEye] = { scaleY: 1 - right * 0.92 };
    if (leftPupil)
      layers[leftPupil] = { scaleY: 1 - left * 0.5, opacity: 1 - left * 0.35 };
    if (rightPupil)
      layers[rightPupil] = {
        scaleY: 1 - right * 0.5,
        opacity: 1 - right * 0.35,
      };

    if (leftLid) visibility[leftLid] = left > 0.55;
    if (rightLid) visibility[rightLid] = right > 0.55;

    return { layers, visibility };
  }
}

function smooth(v: number): number {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
}
