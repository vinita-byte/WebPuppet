import type { LayerTransform } from "@/store/types";
import type { LayerTag, PhysicsDef, SwapSetDef, TriggerDef } from "./types";

/** WebPuppet package format (zip with puppet.json plus layer assets). */
export const PUPPET_FORMAT_ID = "webpuppet";
export const PUPPET_FORMAT_VERSION = 1 as const;

export interface PackagedLayer {
  id: string;
  parentId: string | null;
  tag: LayerTag;
  rest: LayerTransform;
  zIndex: number;
  visible: boolean;
  swapSet?: string;
  /** Path inside the zip, e.g. assets/layers/head.png */
  asset?: string;
}

export interface PuppetPackageJson {
  format: typeof PUPPET_FORMAT_ID;
  version: typeof PUPPET_FORMAT_VERSION;
  exportedAt: string;
  source: {
    kind: "builtin" | "custom";
    builtinId?: string;
  };
  puppet: {
    id: string;
    name: string;
    shortName: string;
    description: string;
    accent: string;
    fitHeight: number;
    layers: PackagedLayer[];
    swapSets: SwapSetDef[];
    triggers: TriggerDef[];
    physics: PhysicsDef[];
  };
}
