import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class TriggerBehavior implements Behavior {
  readonly id = "triggers";

  update(ctx: BehaviorContext): BehaviorOutput {
    const visibility: Record<string, boolean> = {};
    const swaps: Record<string, string> = {};

    for (const trigger of ctx.character.triggers) {
      for (const id of trigger.showLayers ?? []) {
        if (!(id in visibility)) visibility[id] = false;
      }
    }

    for (const trigger of ctx.character.triggers) {
      if (!ctx.activeTriggers[trigger.id]) continue;
      for (const id of trigger.showLayers ?? []) {
        visibility[id] = true;
      }
      if (trigger.swapTo) {
        swaps[trigger.swapTo.setId] = trigger.swapTo.layerId;
      }
    }

    return { visibility, swaps };
  }
}
