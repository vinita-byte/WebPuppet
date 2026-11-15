import { visemesToMouthShape } from "@/services/audio/VisemeCalculator";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

export class LipSyncBehavior implements Behavior {
  readonly id = "lip-sync";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.lipSync) return {};

    const mouthSet = ctx.character.swapSets.find((s) => s.id === "mouth");
    if (!mouthSet) return {};

    const lockedByTrigger = ctx.character.triggers.some(
      (t) =>
        t.swapTo?.setId === "mouth" &&
        t.mode === "toggle" &&
        ctx.activeTriggers[t.id],
    );
    if (lockedByTrigger) return {};

    const fromAudio = visemesToMouthShape(ctx.visemeWeights);
    const audioEnergy = 1 - (ctx.visemeWeights.rest ?? 0);
    const open =
      audioEnergy > 0.08
        ? fromAudio.open * 0.85 + ctx.face.mouthOpen * 0.15
        : ctx.face.mouthOpen;

    let layerId = mouthSet.defaultLayerId;
    if (open > 0.72 && mouthSet.layers.includes("mouthWide")) {
      layerId = "mouthWide";
    } else if (open > 0.72 && mouthSet.layers.includes("beakOpen")) {
      layerId = "beakOpen";
    } else if (open > 0.38) {
      layerId =
        mouthSet.layers.find(
          (id) => id.toLowerCase().includes("open"),
        ) ?? mouthSet.layers[mouthSet.layers.length - 1];
    } else if (open > 0.12) {
      layerId =
        mouthSet.layers.find(
          (id) => id.toLowerCase().includes("half"),
        ) ?? mouthSet.layers[Math.min(1, mouthSet.layers.length - 1)];
    }

    if (!mouthSet.layers.includes(layerId)) {
      layerId = mouthSet.defaultLayerId;
    }

    return { swaps: { mouth: layerId } };
  }
}
