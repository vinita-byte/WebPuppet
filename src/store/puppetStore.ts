"use client";

import { create } from "zustand";
import {
  getCharacter,
  type CharacterDef,
} from "@/puppets/registry";
import {
  type CalibrationOffsets,
  type FaceSignals,
  type HeadRotation,
  type LayerTransform,
  type PuppetLayerId,
  type PuppetLayerNode,
  createIdentityTransform,
} from "./types";

function nodesFromCharacter(
  character: CharacterDef,
): Record<PuppetLayerId, PuppetLayerNode> {
  const nodes: Record<PuppetLayerId, PuppetLayerNode> = {};
  for (const def of character.layers) {
    nodes[def.id] = {
      id: def.id,
      parentId: def.parentId,
      rest: createIdentityTransform(def.rest ?? {}),
      driven: createIdentityTransform(),
      zIndex: def.zIndex ?? 0,
      visible: def.visible ?? true,
      tag: def.tag,
      swapSet: def.swapSet,
    };
  }
  // Ensure swap-set defaults are the only visible members.
  for (const set of character.swapSets) {
    for (const id of set.layers) {
      if (!nodes[id]) continue;
      nodes[id] = {
        ...nodes[id],
        visible: id === set.defaultLayerId,
      };
    }
  }
  return nodes;
}

const DEFAULT_CHARACTER_ID = "jester";

const initialFace: FaceSignals = {
  blinkLeft: 0,
  blinkRight: 0,
  mouthOpen: 0,
  mouthSmile: 0,
  browInnerUp: 0,
  gazeX: 0,
  gazeY: 0,
};

export interface PuppetState {
  characterId: string;
  character: CharacterDef;
  layers: Record<PuppetLayerId, PuppetLayerNode>;
  layerOrder: PuppetLayerId[];
  rotation: HeadRotation;
  face: FaceSignals;
  calibration: CalibrationOffsets;
  visemeWeights: Record<string, number>;
  trackingActive: boolean;
  fps: number;
  displayRotation: HeadRotation;
  /** Trigger ids currently held/toggled on. */
  activeTriggers: Record<string, boolean>;
  /** Active swap-set member per set id. */
  activeSwaps: Record<string, string>;
  /** Manual dragger offsets (layerId → xy). */
  dragOffsets: Record<string, { x: number; y: number }>;

  setCharacter: (id: string) => void;
  setRotation: (rotation: HeadRotation) => void;
  setDisplayRotation: (rotation: HeadRotation) => void;
  setFace: (face: Partial<FaceSignals>) => void;
  setVisemeWeights: (weights: Record<string, number>) => void;
  setLayerDriven: (id: PuppetLayerId, driven: Partial<LayerTransform>) => void;
  applyLayerDrivenBatch: (
    batch: Partial<Record<PuppetLayerId, Partial<LayerTransform>>>,
  ) => void;
  setLayerVisibility: (id: PuppetLayerId, visible: boolean) => void;
  setSwap: (setId: string, layerId: string) => void;
  setTrigger: (triggerId: string, active: boolean) => void;
  toggleTrigger: (triggerId: string) => void;
  setDragOffset: (layerId: string, offset: { x: number; y: number } | null) => void;
  setCalibration: (offsets: Partial<CalibrationOffsets>) => void;
  captureNeutralPose: () => void;
  setTrackingActive: (active: boolean) => void;
  setFps: (fps: number) => void;
  resetDriven: () => void;
}

function boot(characterId: string) {
  const character = getCharacter(characterId);
  const layers = nodesFromCharacter(character);
  const activeSwaps: Record<string, string> = {};
  for (const set of character.swapSets) {
    activeSwaps[set.id] = set.defaultLayerId;
  }
  return {
    characterId: character.id,
    character,
    layers,
    layerOrder: character.layers.map((l) => l.id),
    activeSwaps,
    activeTriggers: {} as Record<string, boolean>,
    dragOffsets: {} as Record<string, { x: number; y: number }>,
  };
}

const initial = boot(DEFAULT_CHARACTER_ID);

export const usePuppetStore = create<PuppetState>((set, get) => ({
  ...initial,
  rotation: { yaw: 0, pitch: 0, roll: 0 },
  face: initialFace,
  calibration: { yaw: 0, pitch: 0, roll: 0, landmarkScale: 180 },
  visemeWeights: { rest: 1 },
  trackingActive: false,
  fps: 0,
  displayRotation: { yaw: 0, pitch: 0, roll: 0 },

  setCharacter: (id) => {
    const next = boot(id);
    set({
      ...next,
      rotation: { yaw: 0, pitch: 0, roll: 0 },
      displayRotation: { yaw: 0, pitch: 0, roll: 0 },
      face: initialFace,
      visemeWeights: { rest: 1 },
    });
  },

  setRotation: (rotation) => set({ rotation }),
  setDisplayRotation: (displayRotation) => set({ displayRotation }),

  setFace: (face) =>
    set((state) => ({
      face: { ...state.face, ...face },
    })),

  setVisemeWeights: (visemeWeights) => set({ visemeWeights }),

  setLayerDriven: (id, driven) =>
    set((state) => {
      const layer = state.layers[id];
      if (!layer) return state;
      return {
        layers: {
          ...state.layers,
          [id]: {
            ...layer,
            driven: { ...layer.driven, ...driven },
          },
        },
      };
    }),

  applyLayerDrivenBatch: (batch) =>
    set((state) => {
      const layers = { ...state.layers };
      for (const [id, driven] of Object.entries(batch)) {
        const layer = layers[id];
        if (!layer || !driven) continue;
        layers[id] = {
          ...layer,
          driven: { ...layer.driven, ...driven },
        };
      }
      return { layers };
    }),

  setLayerVisibility: (id, visible) =>
    set((state) => {
      const layer = state.layers[id];
      if (!layer) return state;
      return {
        layers: {
          ...state.layers,
          [id]: { ...layer, visible },
        },
      };
    }),

  setSwap: (setId, layerId) =>
    set((state) => {
      const setDef = state.character.swapSets.find((s) => s.id === setId);
      if (!setDef) return state;
      const layers = { ...state.layers };
      for (const id of setDef.layers) {
        if (!layers[id]) continue;
        layers[id] = { ...layers[id], visible: id === layerId };
      }
      return {
        layers,
        activeSwaps: { ...state.activeSwaps, [setId]: layerId },
      };
    }),

  setTrigger: (triggerId, active) =>
    set((state) => ({
      activeTriggers: { ...state.activeTriggers, [triggerId]: active },
    })),

  toggleTrigger: (triggerId) =>
    set((state) => ({
      activeTriggers: {
        ...state.activeTriggers,
        [triggerId]: !state.activeTriggers[triggerId],
      },
    })),

  setDragOffset: (layerId, offset) =>
    set((state) => {
      const dragOffsets = { ...state.dragOffsets };
      if (!offset) delete dragOffsets[layerId];
      else dragOffsets[layerId] = offset;
      return { dragOffsets };
    }),

  setCalibration: (offsets) =>
    set((state) => ({
      calibration: { ...state.calibration, ...offsets },
    })),

  captureNeutralPose: () => {
    const { rotation } = get();
    set({
      calibration: {
        ...get().calibration,
        yaw: rotation.yaw,
        pitch: rotation.pitch,
        roll: rotation.roll,
      },
    });
  },

  setTrackingActive: (trackingActive) => set({ trackingActive }),
  setFps: (fps) => set({ fps }),

  resetDriven: () =>
    set((state) => {
      const layers = { ...state.layers };
      for (const id of Object.keys(layers)) {
        layers[id] = {
          ...layers[id],
          driven: createIdentityTransform(),
        };
      }
      return {
        layers,
        rotation: { yaw: 0, pitch: 0, roll: 0 },
        displayRotation: { yaw: 0, pitch: 0, roll: 0 },
        face: initialFace,
        visemeWeights: { rest: 1 },
        activeTriggers: {},
        dragOffsets: {},
      };
    }),
}));
