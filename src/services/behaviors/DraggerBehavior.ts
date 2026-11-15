import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class DraggerBehavior implements Behavior {
  readonly id = "dragger";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.dragger) return {};
    const layers: BehaviorOutput["layers"] = {};
    for (const [id, offset] of Object.entries(ctx.dragOffsets)) {
      layers[id] = { x: offset.x, y: offset.y };
    }
    return { layers };
  }
}
