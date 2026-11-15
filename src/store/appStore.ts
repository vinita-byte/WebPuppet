"use client";

import { create } from "zustand";

export type PipelineStatus =
  | "idle"
  | "requesting-permissions"
  | "loading-model"
  | "ready"
  | "running"
  | "demo"
  | "tracking-lost"
  | "error";

export type TrackingQuality = "good" | "slow" | "off";

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
  demoMode: boolean;
  trackingQuality: TrackingQuality;
  behaviors: Record<BehaviorKey, boolean>;
  showDebugOverlay: boolean;
  sharedBufferAvailable: boolean;
  mobilePanel: "stage" | "controls";

  setStatus: (status: PipelineStatus, message?: string) => void;
  setCameraEnabled: (enabled: boolean) => void;
  setMicEnabled: (enabled: boolean) => void;
  setDemoMode: (demoMode: boolean) => void;
  setTrackingQuality: (quality: TrackingQuality) => void;
  toggleBehavior: (key: BehaviorKey) => void;
  setBehaviors: (behaviors: Record<BehaviorKey, boolean>) => void;
  setShowDebugOverlay: (show: boolean) => void;
  setSharedBufferAvailable: (available: boolean) => void;
  setMobilePanel: (panel: "stage" | "controls") => void;
}

export const DEFAULT_BEHAVIORS: Record<BehaviorKey, boolean> = {
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
};

export const useAppStore = create<AppStore>((set) => ({
  status: "idle",
  statusMessage: "Idle",
  cameraEnabled: false,
  micEnabled: false,
  demoMode: false,
  trackingQuality: "off",
  behaviors: { ...DEFAULT_BEHAVIORS },
  showDebugOverlay: true,
  sharedBufferAvailable: false,
  mobilePanel: "stage",

  setStatus: (status, message) =>
    set({
      status,
      statusMessage: message ?? status,
    }),

  setCameraEnabled: (cameraEnabled) => set({ cameraEnabled }),
  setMicEnabled: (micEnabled) => set({ micEnabled }),
  setDemoMode: (demoMode) => set({ demoMode }),
  setTrackingQuality: (trackingQuality) => set({ trackingQuality }),

  toggleBehavior: (key) =>
    set((state) => ({
      behaviors: {
        ...state.behaviors,
        [key]: !state.behaviors[key],
      },
    })),

  setBehaviors: (behaviors) => set({ behaviors }),

  setShowDebugOverlay: (showDebugOverlay) => set({ showDebugOverlay }),
  setSharedBufferAvailable: (sharedBufferAvailable) =>
    set({ sharedBufferAvailable }),
  setMobilePanel: (mobilePanel) => set({ mobilePanel }),
}));
