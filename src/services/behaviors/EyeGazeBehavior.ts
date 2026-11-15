import { firstLayerByTag } from "@/puppets/registry";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class EyeGazeBehavior implements Behavior {
  readonly id = "eye-gaze";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.eyeGaze) return {};

    const gazeX = ctx.face.gazeX || ctx.calibratedRotation.yaw / 55;
    const gazeY = ctx.face.gazeY || ctx.calibratedRotation.pitch / 40;
    const x = Math.max(-1, Math.min(1, gazeX)) * 10;
    const y = Math.max(-1, Math.min(1, gazeY)) * 8;

    const left = firstLayerByTag(ctx.character, "leftPupil");
    const right = firstLayerByTag(ctx.character, "rightPupil");
    const layers: BehaviorOutput["layers"] = {};
    if (left) layers[left] = { x, y };
    if (right) layers[right] = { x, y };
    return { layers };
  }
}
