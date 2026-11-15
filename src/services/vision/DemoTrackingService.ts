import type { NormalizedTrackingFrame } from "./normalize";
import type { TrackingListener } from "./types";

/**
 * Loops a short procedural face performance so the studio works with no camera.
 */
export class DemoTrackingService {
  private rafId = 0;
  private running = false;
  private startMs = 0;
  private readonly listeners = new Set<TrackingListener>();
  private sequence = 0;

  subscribe(listener: TrackingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.startMs = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private tick = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    const t = (performance.now() - this.startMs) / 1000;
    // ~8s loop of head motion, blinks, and mouth open
    const phase = t % 8;
    const yaw = Math.sin(t * 0.9) * 22;
    const pitch = Math.sin(t * 0.7 + 0.4) * 12;
    const roll = Math.sin(t * 0.55 + 1.1) * 8;

    const blinkPulse =
      phase > 2.1 && phase < 2.28 ? 1 : phase > 5.4 && phase < 5.55 ? 1 : 0;
    const mouthOpen = Math.max(
      0,
      Math.sin(t * 6.5) * 0.55 + 0.2 + (phase > 3 && phase < 5 ? 0.25 : 0),
    );

    this.sequence += 1;
    const frame: NormalizedTrackingFrame = {
      sequence: this.sequence,
      faceDetected: true,
      timestampMs: performance.now(),
      rotation: { yaw, pitch, roll },
      blinkLeft: blinkPulse,
      blinkRight: blinkPulse,
      mouthOpen: Math.min(1, mouthOpen),
      mouthSmile: Math.max(0, Math.sin(t * 0.4) * 0.35),
      browInnerUp: Math.max(0, Math.sin(t * 0.8) * 0.2),
      landmarks: {},
    };

    for (const listener of this.listeners) {
      listener(frame);
    }
  };
}
