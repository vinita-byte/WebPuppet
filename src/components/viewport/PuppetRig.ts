import { Container, Graphics } from "pixi.js";
import type {
  HeadRotation,
  LayerTransform,
  PuppetLayerId,
  PuppetLayerNode,
} from "@/store/types";

interface LayerVisual {
  container: Container;
  graphics: Graphics;
}

/**
 * Hierarchical multi-layer 2D sample puppet rendered with Pixi Graphics.
 * Layers: root → head → (eyes → pupils), mouth, jaw.
 */
export class PuppetRig {
  readonly root: Container;
  private readonly layers = new Map<PuppetLayerId, LayerVisual>();
  private readonly nodes: Record<PuppetLayerId, PuppetLayerNode>;

  constructor(nodes: Record<PuppetLayerId, PuppetLayerNode>) {
    this.nodes = nodes;
    this.root = new Container();
    this.root.label = "puppet-root";

    this.buildLayer("root");
    this.buildLayer("head");
    this.buildLayer("jaw");
    this.buildLayer("leftEye");
    this.buildLayer("rightEye");
    this.buildLayer("leftPupil");
    this.buildLayer("rightPupil");
    this.buildLayer("mouth");

    this.drawStaticArt();
    this.applyRestPose();
  }

  private buildLayer(id: PuppetLayerId): void {
    const node = this.nodes[id];
    const container = new Container();
    container.label = id;
    container.zIndex = node.zIndex;
    const graphics = new Graphics();
    container.addChild(graphics);
    this.layers.set(id, { container, graphics });

    if (node.parentId) {
      const parent = this.layers.get(node.parentId);
      parent?.container.addChild(container);
    } else {
      this.root.addChild(container);
    }
  }

  private drawStaticArt(): void {
    // Head
    const head = this.layers.get("head")!.graphics;
    head.clear();
    head.roundRect(-110, -130, 220, 250, 90);
    head.fill({ color: 0xf2c9a0 });
    head.stroke({ width: 3, color: 0xc48a5a });
    // Ears
    head.ellipse(-118, -10, 22, 32);
    head.fill({ color: 0xe8b890 });
    head.ellipse(118, -10, 22, 32);
    head.fill({ color: 0xe8b890 });
    // Nose
    head.moveTo(0, -5);
    head.lineTo(-10, 28);
    head.lineTo(10, 28);
    head.closePath();
    head.fill({ color: 0xd9a07a });

    // Jaw / chin plate
    const jaw = this.layers.get("jaw")!.graphics;
    jaw.clear();
    jaw.ellipse(0, 0, 70, 28);
    jaw.fill({ color: 0xe8b890, alpha: 0.85 });

    // Eyes (sclera)
    for (const id of ["leftEye", "rightEye"] as const) {
      const g = this.layers.get(id)!.graphics;
      g.clear();
      g.ellipse(0, 0, 28, 22);
      g.fill({ color: 0xffffff });
      g.stroke({ width: 2, color: 0x3a2a1f });
    }

    // Pupils
    for (const id of ["leftPupil", "rightPupil"] as const) {
      const g = this.layers.get(id)!.graphics;
      g.clear();
      g.circle(0, 0, 10);
      g.fill({ color: 0x1c1410 });
      g.circle(-3, -3, 3);
      g.fill({ color: 0xffffff, alpha: 0.85 });
    }

    // Mouth — slightly fuller rest shape so closed lips still read clearly
    const mouth = this.layers.get("mouth")!.graphics;
    mouth.clear();
    mouth.roundRect(-38, -10, 76, 22, 11);
    mouth.fill({ color: 0x8b2e3a });
    mouth.ellipse(0, -1, 30, 7);
    mouth.fill({ color: 0xff9aa8, alpha: 0.55 });
  }

  private compose(rest: LayerTransform, driven: LayerTransform): LayerTransform {
    return {
      x: rest.x + driven.x,
      y: rest.y + driven.y,
      rotation: rest.rotation + driven.rotation,
      scaleX: rest.scaleX * driven.scaleX,
      scaleY: rest.scaleY * driven.scaleY,
      opacity: rest.opacity * driven.opacity,
    };
  }

  private applyTransform(id: PuppetLayerId, t: LayerTransform): void {
    const visual = this.layers.get(id);
    if (!visual) return;
    visual.container.position.set(t.x, t.y);
    visual.container.rotation = t.rotation;
    visual.container.scale.set(t.scaleX, t.scaleY);
    visual.container.alpha = t.opacity;
  }

  applyRestPose(): void {
    for (const [id, node] of Object.entries(this.nodes) as [
      PuppetLayerId,
      PuppetLayerNode,
    ][]) {
      this.applyTransform(id, node.rest);
    }
  }

  /**
   * Apply driven offsets from the behavior system / Zustand store.
   */
  syncFromStore(
    nodes: Record<PuppetLayerId, PuppetLayerNode>,
    headRotation: HeadRotation,
  ): void {
    for (const [id, node] of Object.entries(nodes) as [
      PuppetLayerId,
      PuppetLayerNode,
    ][]) {
      const composed = this.compose(node.rest, node.driven);
      this.applyTransform(id, composed);
    }

    // Additional head-space tilt using yaw/pitch as foreshortening cues.
    const head = this.layers.get("head")?.container;
    if (head) {
      head.skew.x = (headRotation.yaw * Math.PI) / 180 * 0.15;
      // Pitch already partially in y; nudge scale for depth.
      const pitchScale = 1 - Math.abs(headRotation.pitch) / 250;
      head.scale.y *= pitchScale;
    }
  }

  destroy(): void {
    this.root.destroy({ children: true });
    this.layers.clear();
  }
}
