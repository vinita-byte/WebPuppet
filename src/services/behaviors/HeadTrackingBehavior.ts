import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

/** Maps calibrated yaw/pitch/roll onto the head layer (and subtle pupil parallax). */
export class HeadTrackingBehavior implements Behavior {
  readonly id = "head-tracking";

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.headTracking) return {};

    const { yaw, pitch, roll } = ctx.calibratedRotation;
    const scale = ctx.calibration.landmarkScale;

    // Soft clamp so extreme poses don't tear the 2D hierarchy.
    const y = Math.max(-55, Math.min(55, yaw));
    const p = Math.max(-40, Math.min(40, pitch));
    const r = Math.max(-35, Math.min(35, roll));

    const pupilX = (y / 55) * 10;
    const pupilY = (p / 40) * 8;

    return {
      headRotation: { yaw: y, pitch: p, roll: r },
      head: {
        x: (y / 55) * scale * 0.08,
        y: (p / 40) * scale * 0.05,
        rotation: (r * Math.PI) / 180,
        scaleX: 1 - Math.abs(y) / 400,
        scaleY: 1 - Math.abs(p) / 500,
      },
      leftPupil: { x: pupilX, y: pupilY },
      rightPupil: { x: pupilX, y: pupilY },
      jaw: {
        y: Math.max(0, p) * 0.15,
        rotation: (r * Math.PI) / 180 * 0.25,
      },
    };
  }
}
