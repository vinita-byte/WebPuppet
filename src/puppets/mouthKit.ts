import type { Graphics } from "pixi.js";
import { layer, type LayerDef, type SwapSetDef, type TriggerDef } from "./types";

export type MouthKind = "closed" | "open" | "oh" | "smile" | "tongue";

export const STANDARD_MOUTH_LAYERS = [
  "mouthClosed",
  "mouthOpen",
  "mouthOh",
  "mouthSmile",
  "mouthTongue",
] as const;

export function drawLipSyncMouth(
  g: Graphics,
  kind: MouthKind,
  ink = 0x2a1520,
  lip = 0xff8fa3,
  tongue = 0xff6b8a,
): void {
  g.clear();
  switch (kind) {
    case "closed":
      g.roundRect(-32, -5, 64, 10, 5);
      g.fill({ color: ink });
      break;
    case "open":
      g.ellipse(0, 4, 34, 26);
      g.fill({ color: ink });
      g.ellipse(0, -2, 24, 12);
      g.fill({ color: lip, alpha: 0.55 });
      break;
    case "oh":
      g.ellipse(0, 2, 18, 24);
      g.fill({ color: ink });
      g.ellipse(0, 0, 10, 14);
      g.fill({ color: lip, alpha: 0.45 });
      break;
    case "smile":
      g.moveTo(-36, -2);
      g.quadraticCurveTo(0, 26, 36, -2);
      g.quadraticCurveTo(0, 12, -36, -2);
      g.closePath();
      g.fill({ color: ink });
      g.ellipse(0, 8, 18, 6);
      g.fill({ color: lip, alpha: 0.4 });
      break;
    case "tongue":
      g.ellipse(0, 4, 32, 22);
      g.fill({ color: ink });
      g.ellipse(0, 10, 16, 10);
      g.fill({ color: tongue });
      g.roundRect(-18, -10, 36, 8, 4);
      g.fill({ color: 0xf5f5f5 });
      break;
  }
}

export function mouthSwapSet(): SwapSetDef {
  return {
    id: "mouth",
    layers: [...STANDARD_MOUTH_LAYERS],
    defaultLayerId: "mouthClosed",
  };
}

export function mouthLayers(
  parentId: string,
  rest: { x?: number; y?: number } = { y: 28 },
  zIndex = 6,
): LayerDef[] {
  const kinds: { id: (typeof STANDARD_MOUTH_LAYERS)[number]; kind: MouthKind; visible: boolean }[] =
    [
      { id: "mouthClosed", kind: "closed", visible: true },
      { id: "mouthOpen", kind: "open", visible: false },
      { id: "mouthOh", kind: "oh", visible: false },
      { id: "mouthSmile", kind: "smile", visible: false },
      { id: "mouthTongue", kind: "tongue", visible: false },
    ];
  return kinds.map(({ id, kind, visible }) =>
    layer({
      id,
      parentId,
      tag: "mouth",
      swapSet: "mouth",
      visible,
      rest,
      zIndex,
      draw: (g) => drawLipSyncMouth(g, kind),
    }),
  );
}

export function trigger(
  partial: TriggerDef,
): TriggerDef {
  return partial;
}
