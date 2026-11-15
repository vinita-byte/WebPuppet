import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

/** Drives eye lid scale from MediaPipe blink blendshapes. */
export class BlinkBehavior implements Behavior {
  readonly id = "blink";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.blink) return {};

    const left = smoothBlink(ctx.face.blinkLeft);
    const right = smoothBlink(ctx.face.blinkRight);

    return {
      leftEye: {
        scaleY: 1 - left * 0.92,
        opacity: 1,
      },
      rightEye: {
        scaleY: 1 - right * 0.92,
        opacity: 1,
      },
      leftPupil: {
        scaleY: 1 - left * 0.5,
        opacity: 1 - left * 0.35,
      },
      rightPupil: {
        scaleY: 1 - right * 0.5,
        opacity: 1 - right * 0.35,
      },
    };
  }
}

function smoothBlink(v: number): number {
  // Ease so soft blinks still read clearly on a flat 2D lid.
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
}
