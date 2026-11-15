"use client";

import { create } from "zustand";

export type PipelineStatus =
  | "idle"
  | "requesting-permissions"
  | "loading-model"
  | "ready"
  | "running"
  | "error";

export interface AppStore {
  status: PipelineStatus;
  statusMessage: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  behaviors: {
    headTracking: boolean;
    blink: boolean;
    lipSync: boolean;
  };
  showDebugOverlay: boolean;
  sharedBufferAvailable: boolean;

  setStatus: (status: PipelineStatus, message?: string) => void;
  setCameraEnabled: (enabled: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  toggleBehavior: (key: keyof AppStore["behaviors"]) => void;
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
    lipSync: true,
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
