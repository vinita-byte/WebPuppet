"use client";

import { create } from "zustand";
import type { Keyframe, RecordingState } from "./types";

export interface RecordingStore {
  state: RecordingState;
  keyframes: Keyframe[];
  playheadMs: number;
  durationMs: number;
  loop: boolean;

  arm: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  addKeyframe: (frame: Keyframe) => void;
  clearKeyframes: () => void;
  setPlayhead: (ms: number) => void;
  play: () => void;
  pause: () => void;
  setLoop: (loop: boolean) => void;
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  state: "idle",
  keyframes: [],
  playheadMs: 0,
  durationMs: 0,
  loop: true,

  arm: () => set({ state: "armed", playheadMs: 0 }),

  startRecording: () =>
    set({
      state: "recording",
      keyframes: [],
      playheadMs: 0,
      durationMs: 0,
    }),

  stopRecording: () => {
    const { keyframes } = get();
    const durationMs =
      keyframes.length > 0 ? keyframes[keyframes.length - 1].timeMs : 0;
    set({ state: "idle", durationMs });
  },

  addKeyframe: (frame) =>
    set((state) => {
      if (state.state !== "recording") return state;
      const keyframes = [...state.keyframes, frame];
      return {
        keyframes,
        playheadMs: frame.timeMs,
        durationMs: frame.timeMs,
      };
    }),

  clearKeyframes: () =>
    set({
      keyframes: [],
      playheadMs: 0,
      durationMs: 0,
      state: "idle",
    }),

  setPlayhead: (playheadMs) => set({ playheadMs }),

  play: () => set({ state: "playing" }),

  pause: () => set({ state: "idle" }),

  setLoop: (loop) => set({ loop }),
}));
