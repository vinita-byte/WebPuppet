import type { Graphics } from "pixi.js";

export type AspectMode = "landscape" | "portrait" | "fill";

export interface ScenePropDef {
  id: string;
  label: string;
  /** Draw relative to scene center. */
  draw: (g: Graphics, w: number, h: number) => void;
  /** Optional idle animation phase hook (0..1 loop). */
  animate?: (g: Graphics, t: number, w: number, h: number) => void;
  zIndex?: number;
}

export interface SceneDef {
  id: string;
  name: string;
  shortName: string;
  mood: string;
  palette: string;
  bestFor: string[];
  /** Far / mid / front wash colors. */
  colors: {
    far: number;
    mid: number;
    accent: number;
    light: number;
  };
  drawFar: (g: Graphics, w: number, h: number) => void;
  drawMid: (g: Graphics, w: number, h: number) => void;
  props: ScenePropDef[];
}

export const ASPECT_PRESETS: Record<
  AspectMode,
  { label: string; ratio: number | null; hint: string }
> = {
  landscape: {
    label: "16:9",
    ratio: 16 / 9,
    hint: "Horizontal take",
  },
  portrait: {
    label: "9:16",
    ratio: 9 / 16,
    hint: "Vertical take",
  },
  fill: {
    label: "Fill",
    ratio: null,
    hint: "Use full stage",
  },
};
