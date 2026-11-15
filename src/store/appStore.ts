"use client";

import { create } from "zustand";

export type PipelineStatus =
  | "idle"
  | "requesting-permissions"
  | "loading-model"
  | "ready"
  | "running"
  | "error";

export type BehaviorKey =
  | "headTracking"
  | "blink"
  | "autoBlink"
  | "lipSync"
  | "eyeGaze"
  | "nutcrackerJaw"
  | "breathe"
  | "physics"
  | "walk"
  | "dragger";

export interface AppStore {
  status: PipelineStatus;
  statusMessage: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  behaviors: Record<BehaviorKey, boolean>;
  showDebugOverlay: boolean;
  sharedBufferAvailable: boolean;

  setStatus: (status: PipelineStatus, message?: string) => void;
  setCameraEnabled: (enabled: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  toggleBehavior: (key: BehaviorKey) => void;
  setShowDebugOverlay: (show: boolean) => void;
  setSharedBufferAvailable: (available: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  status: "idle",
  statusMessage: "Idle",
  cameraEnabled: false,
  micEnabled: false,
  behaviors: {
    headTracking: true,
    blink: true,
    autoBlink: true,
    lipSync: true,
    eyeGaze: true,
    nutcrackerJaw: true,
    breathe: true,
    physics: true,
    walk: false,
    dragger: true,
  },
  showDebugOverlay: true,
  sharedBufferAvailable: false,

  setStatus: (status, message) =>
    set({
      status,
      statusMessage: message ?? status,
    }),

  setCameraEnabled: (cameraEnabled) => set({ cameraEnabled }),
  setMicEnabled: (micEnabled) => set({ micEnabled }),

  toggleBehavior: (key) =>
    set((state) => ({
      behaviors: {
        ...state.behaviors,
        [key]: !state.behaviors[key],
      },
    })),

  setShowDebugOverlay: (showDebugOverlay) => set({ showDebugOverlay }),
  setSharedBufferAvailable: (sharedBufferAvailable) =>
    set({ sharedBufferAvailable }),
}));
