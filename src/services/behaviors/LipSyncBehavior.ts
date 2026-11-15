import { visemesToMouthShape } from "@/services/audio/VisemeCalculator";
import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

/**
 * Prefer audio-reactive visemes when mic is active; fall back to vision
 * jawOpen blendshape so the mouth still moves without a mic.
 */
export class LipSyncBehavior implements Behavior {
  readonly id = "lip-sync";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.lipSync) return {};

    const fromAudio = visemesToMouthShape(ctx.visemeWeights);
    const audioEnergy = 1 - (ctx.visemeWeights.rest ?? 0);
    const visionOpen = ctx.face.mouthOpen;
    const smile = ctx.face.mouthSmile;

    const open =
      audioEnergy > 0.08
        ? fromAudio.open * 0.85 + visionOpen * 0.15
        : visionOpen;

    const scaleX =
      audioEnergy > 0.08
        ? fromAudio.scaleX + smile * 0.25
        : 1 + smile * 0.35 - open * 0.05;

    // Closed mouth stays readable (~0.55–0.7); open vowels stretch upward.
    const scaleY =
      audioEnergy > 0.08
        ? Math.max(fromAudio.scaleY, 0.55 + open * 0.85)
        : 0.65 + open * 0.9;

    return {
      mouth: {
        scaleX,
        scaleY,
        y: open * 6,
      },
      jaw: {
        y: open * 14,
        scaleY: 1 + open * 0.08,
      },
    };
  }
}
