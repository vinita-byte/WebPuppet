"use client";

import { create } from "zustand";
import {
  type CalibrationOffsets,
  type FaceSignals,
  type HeadRotation,
  type LayerTransform,
  type PuppetLayerId,
  type PuppetLayerNode,
  createIdentityTransform,
} from "./types";

const SAMPLE_HIERARCHY: PuppetLayerNode[] = [
  {
    id: "root",
    parentId: null,
    rest: createIdentityTransform(),
    driven: createIdentityTransform(),
    zIndex: 0,
  },
  {
    id: "head",
    parentId: "root",
    rest: createIdentityTransform({ y: -20 }),
    driven: createIdentityTransform(),
    zIndex: 1,
  },
  {
    id: "leftEye",
    parentId: "head",
    rest: createIdentityTransform({ x: -42, y: -28 }),
    driven: createIdentityTransform(),
    zIndex: 2,
  },
  {
    id: "rightEye",
    parentId: "head",
    rest: createIdentityTransform({ x: 42, y: -28 }),
    driven: createIdentityTransform(),
    zIndex: 2,
  },
  {
    id: "leftPupil",
    parentId: "leftEye",
    rest: createIdentityTransform(),
    driven: createIdentityTransform(),
    zIndex: 3,
  },
  {
    id: "rightPupil",
    parentId: "rightEye",
    rest: createIdentityTransform(),
    driven: createIdentityTransform(),
    zIndex: 3,
  },
  {
    id: "mouth",
    parentId: "head",
    rest: createIdentityTransform({ y: 48 }),
    driven: createIdentityTransform(),
    zIndex: 2,
  },
  {
    id: "jaw",
    parentId: "head",
    rest: createIdentityTransform({ y: 70 }),
    driven: createIdentityTransform(),
    zIndex: 1,
  },
];

export interface PuppetState {
  layers: Record<PuppetLayerId, PuppetLayerNode>;
  layerOrder: PuppetLayerId[];
  rotation: HeadRotation;
  face: FaceSignals;
  calibration: CalibrationOffsets;
  visemeWeights: Record<string, number>;
  trackingActive: boolean;
  fps: number;
  /** Calibrated euler used by the viewport foreshortening pass. */
  displayRotation: HeadRotation;

  setRotation: (rotation: HeadRotation) => void;
  setDisplayRotation: (rotation: HeadRotation) => void;
  setFace: (face: Partial<FaceSignals>) => void;
  setVisemeWeights: (weights: Record<string, number>) => void;
  setLayerDriven: (id: PuppetLayerId, driven: Partial<LayerTransform>) => void;
  applyLayerDrivenBatch: (
    batch: Partial<Record<PuppetLayerId, Partial<LayerTransform>>>,
  ) => void;
  setCalibration: (offsets: Partial<CalibrationOffsets>) => void;
  captureNeutralPose: () => void;
  setTrackingActive: (active: boolean) => void;
  setFps: (fps: number) => void;
  resetDriven: () => void;
}

function layersFromHierarchy(
  nodes: PuppetLayerNode[],
): Record<PuppetLayerId, PuppetLayerNode> {
  return Object.fromEntries(nodes.map((n) => [n.id, structuredClone(n)])) as Record<
    PuppetLayerId,
    PuppetLayerNode
  >;
}

const initialFace: FaceSignals = {
  blinkLeft: 0,
  blinkRight: 0,
  mouthOpen: 0,
  mouthSmile: 0,
  browInnerUp: 0,
};

export const usePuppetStore = create<PuppetState>((set, get) => ({
  layers: layersFromHierarchy(SAMPLE_HIERARCHY),
  layerOrder: SAMPLE_HIERARCHY.map((n) => n.id),
  rotation: { yaw: 0, pitch: 0, roll: 0 },
  face: initialFace,
  calibration: { yaw: 0, pitch: 0, roll: 0, landmarkScale: 180 },
  visemeWeights: { rest: 1 },
  trackingActive: false,
  fps: 0,
  displayRotation: { yaw: 0, pitch: 0, roll: 0 },

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
      for (const [id, driven] of Object.entries(batch) as [
        PuppetLayerId,
        Partial<LayerTransform>,
      ][]) {
        const layer = layers[id];
        if (!layer || !driven) continue;
        layers[id] = {
          ...layer,
          driven: { ...layer.driven, ...driven },
        };
      }
      return { layers };
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
      for (const id of Object.keys(layers) as PuppetLayerId[]) {
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
      };
    }),
}));
