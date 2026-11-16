import { firstLayerByTag } from "@/puppets/registry";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class AutoBlinkBehavior implements Behavior {
  readonly id = "auto-blink";
  private nextBlinkAt = 2000;
  private blinkUntil = 0;

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.autoBlink) return {};
    if (ctx.face.blinkLeft > 0.35 || ctx.face.blinkRight > 0.35) return {};

    if (ctx.timeMs >= this.nextBlinkAt && ctx.timeMs > this.blinkUntil) {
      this.blinkUntil = ctx.timeMs + 120;
      this.nextBlinkAt = ctx.timeMs + 1800 + Math.random() * 3200;
    }

    if (ctx.timeMs >= this.blinkUntil) return {};

    const amount = 0.95;
    const layers: BehaviorOutput["layers"] = {};
    const visibility: Record<string, boolean> = {};
    const leftEye = firstLayerByTag(ctx.character, "leftEye");
    const rightEye = firstLayerByTag(ctx.character, "rightEye");
    const leftLid = firstLayerByTag(ctx.character, "leftEyelid");
    const rightLid = firstLayerByTag(ctx.character, "rightEyelid");

    if (leftEye) layers[leftEye] = { scaleY: 1 - amount };
    if (rightEye) layers[rightEye] = { scaleY: 1 - amount };
    if (leftLid) visibility[leftLid] = true;
    if (rightLid) visibility[rightLid] = true;
    return { layers, visibility };
  }
}
