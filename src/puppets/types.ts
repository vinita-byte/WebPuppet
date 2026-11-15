import type { Graphics } from "pixi.js";
import type { LayerTransform } from "@/store/types";
import { createIdentityTransform } from "@/store/types";

/** Semantic tags used by behaviors (Character Animator–style layer tagging). */
export type LayerTag =
  | "root"
  | "torso"
  | "head"
  | "jaw"
  | "leftEye"
  | "rightEye"
  | "leftEyelid"
  | "rightEyelid"
  | "leftPupil"
  | "rightPupil"
  | "leftBrow"
  | "rightBrow"
  | "mouth"
  | "leftUpperArm"
  | "rightUpperArm"
  | "leftForearm"
  | "rightForearm"
  | "leftHand"
  | "rightHand"
  | "leftLeg"
  | "rightLeg"
  | "hat"
  | "glasses"
  | "accessory"
  | "physics"
  | "other";

export type DrawFn = (g: Graphics) => void;

export interface LayerDef {
  id: string;
  parentId: string | null;
  tag: LayerTag;
  rest?: Partial<LayerTransform>;
  zIndex?: number;
  /** Initial visibility (swap-set members often start hidden). */
  visible?: boolean;
  /** Which swap set this layer belongs to, if any. */
  swapSet?: string;
  draw: DrawFn;
}

export interface SwapSetDef {
  id: string;
  /** Layer ids in the set; only one visible at a time. */
  layers: string[];
  defaultLayerId: string;
}

export interface TriggerDef {
  id: string;
  label: string;
  /** Keyboard key (lowercase). */
  key: string;
  /** Momentary hold vs toggle. */
  mode: "hold" | "toggle";
  /** Show these layers while active. */
  showLayers?: string[];
  /** Activate this swap-set member. */
  swapTo?: { setId: string; layerId: string };
}

export interface PhysicsDef {
  layerId: string;
  stiffness: number;
  damping: number;
  gravity: number;
  maxSwing: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  /** Approximate vertical span used for viewport fit. */
  fitHeight: number;
  layers: LayerDef[];
  swapSets: SwapSetDef[];
  triggers: TriggerDef[];
  physics: PhysicsDef[];
}

export function layer(
  partial: Omit<LayerDef, "rest" | "zIndex" | "visible"> & {
    rest?: Partial<LayerTransform>;
    zIndex?: number;
    visible?: boolean;
  },
): LayerDef {
  const { rest, zIndex, visible, ...restFields } = partial;
  return {
    ...restFields,
    zIndex: zIndex ?? 0,
    visible: visible ?? true,
    rest: createIdentityTransform(rest ?? {}),
  };
}
