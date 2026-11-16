"use client";

import { create } from "zustand";

export type InspectorTab = "puppet" | "behaviors" | "frame";
export type MobileSheet = "none" | "puppet" | "behaviors" | "record" | "timeline";

export interface LayoutStore {
  inspectorOpen: boolean;
  timelineOpen: boolean;
  timelineHeight: number;
  inspectorTab: InspectorTab;
  mobileSheet: MobileSheet;
  stageZoom: "fit" | 50 | 100 | 200;
  showSafeArea: boolean;
  cameraPipCollapsed: boolean;
  tourSeen: boolean;
  restoredNote: boolean;

  setInspectorOpen: (open: boolean) => void;
  setTimelineOpen: (open: boolean) => void;
  setTimelineHeight: (height: number) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  setMobileSheet: (sheet: MobileSheet) => void;
  setStageZoom: (zoom: "fit" | 50 | 100 | 200) => void;
  setShowSafeArea: (show: boolean) => void;
  setCameraPipCollapsed: (collapsed: boolean) => void;
  setTourSeen: (seen: boolean) => void;
  setRestoredNote: (show: boolean) => void;
  resetLayout: () => void;
}

const DEFAULTS = {
  inspectorOpen: true,
  timelineOpen: true,
  timelineHeight: 168,
  inspectorTab: "puppet" as InspectorTab,
  mobileSheet: "none" as MobileSheet,
  stageZoom: "fit" as const,
  showSafeArea: false,
  cameraPipCollapsed: false,
  tourSeen: false,
  restoredNote: false,
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  ...DEFAULTS,

  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setTimelineOpen: (timelineOpen) => set({ timelineOpen }),
  setTimelineHeight: (timelineHeight) =>
    set({ timelineHeight: Math.min(360, Math.max(56, timelineHeight)) }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  setMobileSheet: (mobileSheet) => set({ mobileSheet }),
  setStageZoom: (stageZoom) => set({ stageZoom }),
  setShowSafeArea: (showSafeArea) => set({ showSafeArea }),
  setCameraPipCollapsed: (cameraPipCollapsed) => set({ cameraPipCollapsed }),
  setTourSeen: (tourSeen) => set({ tourSeen }),
  setRestoredNote: (restoredNote) => set({ restoredNote }),
  resetLayout: () => set({ ...DEFAULTS, tourSeen: true }),
}));
