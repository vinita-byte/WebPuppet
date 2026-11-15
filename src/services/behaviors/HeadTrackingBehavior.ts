import { firstLayerByTag } from "@/puppets/registry";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class HeadTrackingBehavior implements Behavior {
  readonly id = "head-tracking";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.headTracking) return {};

    const { yaw, pitch, roll } = ctx.calibratedRotation;
    const y = Math.max(-55, Math.min(55, yaw));
    const p = Math.max(-40, Math.min(40, pitch));
    const r = Math.max(-35, Math.min(35, roll));
    const scale = ctx.calibration.landmarkScale;

    const headId = firstLayerByTag(ctx.character, "head");
    const jawId = firstLayerByTag(ctx.character, "jaw");
    const layers: BehaviorOutput["layers"] = {};

    if (headId) {
      layers[headId] = {
        x: (y / 55) * scale * 0.08,
        y: (p / 40) * scale * 0.05,
        rotation: (r * Math.PI) / 180,
        scaleX: 1 - Math.abs(y) / 400,
        scaleY: 1 - Math.abs(p) / 500,
      };
    }
    if (jawId) {
      layers[jawId] = {
        y: Math.max(0, p) * 0.15,
        rotation: ((r * Math.PI) / 180) * 0.25,
      };
    }

    return {
      headRotation: { yaw: y, pitch: p, roll: r },
      layers,
    };
  }
}
