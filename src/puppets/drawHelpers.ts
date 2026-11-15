import type { Graphics } from "pixi.js";

export function strokeFill(
  g: Graphics,
  fill: number,
  stroke = 0x1a1a1a,
  width = 3,
): void {
  g.fill({ color: fill });
  g.stroke({ width, color: stroke });
}

export function ellipse(
  g: Graphics,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: number,
  stroke?: number,
  width = 3,
): void {
  g.ellipse(x, y, rx, ry);
  g.fill({ color: fill });
  if (stroke !== undefined) g.stroke({ width, color: stroke });
}

export function roundBox(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: number,
  stroke?: number,
  width = 3,
): void {
  g.roundRect(x, y, w, h, r);
  g.fill({ color: fill });
  if (stroke !== undefined) g.stroke({ width, color: stroke });
}

export function circle(
  g: Graphics,
  x: number,
  y: number,
  r: number,
  fill: number,
  stroke?: number,
  width = 2,
): void {
  g.circle(x, y, r);
  g.fill({ color: fill });
  if (stroke !== undefined) g.stroke({ width, color: stroke });
}

export function pixelRect(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
): void {
  g.rect(x, y, w, h);
  g.fill({ color: fill });
}

/** Simple closed / half / open mouth shapes for swap sets. */
export function drawMouthShape(
  g: Graphics,
  kind: "closed" | "half" | "open" | "wide" | "smile",
  color = 0x2a1520,
  lip = 0xff8fa3,
): void {
  g.clear();
  switch (kind) {
    case "closed":
      g.roundRect(-34, -4, 68, 10, 5);
      g.fill({ color });
      break;
    case "half":
      g.roundRect(-36, -8, 72, 18, 8);
      g.fill({ color });
      g.ellipse(0, 0, 22, 5);
      g.fill({ color: lip, alpha: 0.5 });
      break;
    case "open":
      g.ellipse(0, 0, 34, 22);
      g.fill({ color });
      g.ellipse(0, -4, 24, 10);
      g.fill({ color: lip, alpha: 0.55 });
      break;
    case "wide":
      g.ellipse(0, 0, 42, 28);
      g.fill({ color });
      g.ellipse(0, -2, 30, 14);
      g.fill({ color: lip, alpha: 0.5 });
      break;
    case "smile":
      g.moveTo(-36, 0);
      g.quadraticCurveTo(0, 22, 36, 0);
      g.quadraticCurveTo(0, 10, -36, 0);
      g.fill({ color });
      break;
  }
}
