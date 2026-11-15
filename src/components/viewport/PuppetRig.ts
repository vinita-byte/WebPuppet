import { Container, Graphics } from "pixi.js";
import type { CharacterDef } from "@/puppets/registry";
import type {
  HeadRotation,
  LayerTransform,
  PuppetLayerNode,
} from "@/store/types";

interface LayerVisual {
  container: Container;
  graphics: Graphics;
}

/**
 * Hierarchical multi-layer 2D puppet built from a CharacterDef.
 */
export class PuppetRig {
  readonly root: Container;
  readonly characterId: string;
  private readonly layers = new Map<string, LayerVisual>();
  private nodes: Record<string, PuppetLayerNode>;

  constructor(character: CharacterDef, nodes: Record<string, PuppetLayerNode>) {
    this.characterId = character.id;
    this.nodes = nodes;
    this.root = new Container();
    this.root.label = `puppet-${character.id}`;
    this.root.sortableChildren = true;

    // Parents must exist before children — defs are authored top-down.
    for (const def of character.layers) {
      this.buildLayer(def.id, def.parentId, def.zIndex ?? 0);
    }

    for (const def of character.layers) {
      const visual = this.layers.get(def.id);
      if (!visual) continue;
      def.draw(visual.graphics);
    }

    this.applyRestPose();
    this.applyVisibility(nodes);
  }

  private buildLayer(
    id: string,
    parentId: string | null,
    zIndex: number,
  ): void {
    const container = new Container();
    container.label = id;
    container.zIndex = zIndex;
    const graphics = new Graphics();
    container.addChild(graphics);
    this.layers.set(id, { container, graphics });

    if (parentId) {
      const parent = this.layers.get(parentId);
      if (parent) {
        parent.container.sortableChildren = true;
        parent.container.addChild(container);
        return;
      }
    }
    this.root.addChild(container);
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

  private applyTransform(id: string, t: LayerTransform): void {
    const visual = this.layers.get(id);
    if (!visual) return;
    visual.container.position.set(t.x, t.y);
    visual.container.rotation = t.rotation;
    visual.container.scale.set(t.scaleX, t.scaleY);
    visual.container.alpha = t.opacity;
  }

  applyRestPose(): void {
    for (const [id, node] of Object.entries(this.nodes)) {
      this.applyTransform(id, node.rest);
    }
  }

  applyVisibility(nodes: Record<string, PuppetLayerNode>): void {
    for (const [id, node] of Object.entries(nodes)) {
      const visual = this.layers.get(id);
      if (!visual) continue;
      visual.container.visible = node.visible;
    }
  }

  syncFromStore(
    nodes: Record<string, PuppetLayerNode>,
    headRotation: HeadRotation,
  ): void {
    this.nodes = nodes;
    for (const [id, node] of Object.entries(nodes)) {
      const composed = this.compose(node.rest, node.driven);
      this.applyTransform(id, composed);
      const visual = this.layers.get(id);
      if (visual) visual.container.visible = node.visible;
    }

    const head = this.layers.get("head")?.container;
    if (head) {
      head.skew.x = ((headRotation.yaw * Math.PI) / 180) * 0.12;
      const pitchScale = 1 - Math.abs(headRotation.pitch) / 250;
      head.scale.y *= pitchScale;
    }
  }

  destroy(): void {
    this.root.destroy({ children: true });
    this.layers.clear();
  }
}
