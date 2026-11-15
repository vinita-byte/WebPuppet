import type { Behavior, BehaviorContext, BehaviorOutput } from "./types";

interface BodyState {
  angle: number;
  velocity: number;
}

export class PhysicsBehavior implements Behavior {
  readonly id = "physics";
  private bodies = new Map<string, BodyState>();

  update(ctx: BehaviorContext): BehaviorOutput {
    if (!ctx.enabled.physics) return {};

    const dt = Math.min(0.05, ctx.dtMs / 1000);
    const headImpulse =
      (ctx.calibratedRotation.yaw / 55) * 2.2 +
      (ctx.calibratedRotation.roll / 35) * 1.4;

    const layers: BehaviorOutput["layers"] = {};

    for (const def of ctx.character.physics) {
      let body = this.bodies.get(def.layerId);
      if (!body) {
        body = { angle: 0, velocity: 0 };
        this.bodies.set(def.layerId, body);
      }

      const spring = -def.stiffness * body.angle;
      const damp = -def.damping * body.velocity;
      const accel =
        spring + damp + headImpulse * 8 + Math.sin(ctx.timeMs / 400) * 0.4;
      body.velocity += accel * dt;
      body.angle += body.velocity * dt;
      body.angle = Math.max(-def.maxSwing, Math.min(def.maxSwing, body.angle));

      layers[def.layerId] = {
        rotation: body.angle,
        x: Math.sin(body.angle) * 8,
      };
    }

    return { layers };
  }
}
