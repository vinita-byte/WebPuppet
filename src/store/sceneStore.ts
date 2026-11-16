"use client";

import { create } from "zustand";
import {
  ASPECT_PRESETS,
  DEFAULT_SCENE_ID,
  getScene,
  type AspectMode,
  type SceneDef,
} from "@/puppets/scenes";

export interface SceneStore {
  sceneId: string;
  scene: SceneDef;
  aspectMode: AspectMode;
  setScene: (id: string) => void;
  setAspectMode: (mode: AspectMode) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  sceneId: DEFAULT_SCENE_ID,
  scene: getScene(DEFAULT_SCENE_ID),
  aspectMode: "landscape",

  setScene: (id) => {
    const scene = getScene(id);
    set({ sceneId: scene.id, scene });
  },

  setAspectMode: (aspectMode) => set({ aspectMode }),
}));

export { ASPECT_PRESETS };
