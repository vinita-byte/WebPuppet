"use client";

import { create } from "zustand";
import { setRecordingHudHidden } from "@/lib/recordingHudBridge";
import { getViewportCanvas } from "@/lib/viewportBridge";
import { VideoRecorder } from "@/services/video/VideoRecorder";

export type VideoTakeStatus =
  | "idle"
  | "recording"
  | "ready"
  | "exporting"
  | "error";

interface VideoStore {
  status: VideoTakeStatus;
  mimeType: string | null;
  blob: Blob | null;
  durationHintMs: number;
  error: string | null;
  exportProgress: number;
  exportLabel: string | null;

  startTake: (audioStream?: MediaStream | null) => Promise<void>;
  stopTake: () => Promise<void>;
  clearTake: () => void;
  downloadMov: () => Promise<void>;
  downloadMp4: () => Promise<void>;
  disposeSession: () => Promise<void>;
}

const recorder = new VideoRecorder();

function syncHud(status: VideoTakeStatus): void {
  setRecordingHudHidden(status === "recording" || status === "exporting");
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  status: "idle",
  mimeType: null,
  blob: null,
  durationHintMs: 0,
  error: null,
  exportProgress: 0,
  exportLabel: null,

  startTake: async (audioStream) => {
    const canvas = getViewportCanvas();
    if (!canvas) {
      set({
        status: "error",
        error: "Stage is not ready yet. Wait a moment and try Record again.",
      });
      syncHud("error");
      return;
    }

    get().clearTake();
    try {
      await recorder.start(canvas, { fps: 30, audioStream });
      set({
        status: "recording",
        error: null,
        exportProgress: 0,
        exportLabel: null,
      });
      syncHud("recording");
    } catch (err) {
      recorder.discard();
      set({
        status: "error",
        error:
          err instanceof Error ? err.message : "Could not start video capture",
      });
      syncHud("error");
    }
  },

  stopTake: async () => {
    if (!recorder.isRecording) {
      const next = get().blob ? "ready" : "idle";
      set({ status: next });
      syncHud(next);
      return;
    }
    try {
      const { blob, mimeType } = await recorder.stop();
      set({
        status: "ready",
        blob,
        mimeType,
        error: null,
      });
      syncHud("ready");
    } catch (err) {
      recorder.discard();
      set({
        status: "error",
        blob: null,
        mimeType: null,
        error:
          err instanceof Error ? err.message : "Could not finish recording",
      });
      syncHud("error");
    }
  },

  clearTake: () => {
    recorder.discard();
    set({
      status: "idle",
      blob: null,
      mimeType: null,
      durationHintMs: 0,
      error: null,
      exportProgress: 0,
      exportLabel: null,
    });
    syncHud("idle");
  },

  downloadMov: async () => {
    const { blob, mimeType } = get();
    if (!blob) return;
    set({
      status: "exporting",
      exportProgress: 0,
      exportLabel: "Preparing MOV…",
      error: null,
    });
    syncHud("exporting");
    try {
      const { convertTake, triggerDownload } = await import(
        "@/services/video/convertTake"
      );
      const out = await convertTake(blob, mimeType || blob.type, "mov", (p) =>
        set({ exportProgress: p }),
      );
      triggerDownload(out, `webpuppet-take-${Date.now()}.mov`);
      set({ status: "ready", exportProgress: 1, exportLabel: null });
      syncHud("ready");
    } catch (err) {
      set({
        status: "ready",
        error:
          err instanceof Error
            ? err.message
            : "Could not export MOV. Try MP4, or record a shorter take.",
        exportLabel: null,
      });
      syncHud("ready");
    }
  },

  downloadMp4: async () => {
    const { blob, mimeType } = get();
    if (!blob) return;
    set({
      status: "exporting",
      exportProgress: 0,
      exportLabel: "Preparing MP4…",
      error: null,
    });
    syncHud("exporting");
    try {
      const { convertTake, triggerDownload } = await import(
        "@/services/video/convertTake"
      );
      const out = await convertTake(blob, mimeType || blob.type, "mp4", (p) =>
        set({ exportProgress: p }),
      );
      triggerDownload(out, `webpuppet-take-${Date.now()}.mp4`);
      set({ status: "ready", exportProgress: 1, exportLabel: null });
      syncHud("ready");
    } catch (err) {
      set({
        status: "ready",
        error:
          err instanceof Error
            ? err.message
            : "Could not export MP4. Try again with a shorter take.",
        exportLabel: null,
      });
      syncHud("ready");
    }
  },

  disposeSession: async () => {
    get().clearTake();
    try {
      const { disposeFfmpeg } = await import("@/services/video/convertTake");
      await disposeFfmpeg();
    } catch {
      // ignore
    }
  },
}));
