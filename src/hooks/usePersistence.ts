"use client";

import { useEffect, useRef } from "react";
import {
  loadRecording,
  loadSettings,
  saveRecording,
  saveSettings,
} from "@/lib/persistence";
import { useAppStore } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";

/**
 * Restores settings and the last recording from IndexedDB, then autosaves changes.
 */
export function usePersistence(): void {
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [settings, recording] = await Promise.all([
        loadSettings(),
        loadRecording(),
      ]);
      if (cancelled) return;

      if (settings) {
        if (settings.characterId) {
          usePuppetStore.getState().setCharacter(settings.characterId);
        }
        if (settings.behaviors) {
          useAppStore.getState().setBehaviors(settings.behaviors);
        }
        if (settings.calibration) {
          usePuppetStore.getState().setCalibration(settings.calibration);
        }
        if (typeof settings.loop === "boolean") {
          useRecordingStore.getState().setLoop(settings.loop);
        }
      }

      if (recording && recording.keyframes?.length) {
        useRecordingStore.setState({
          keyframes: recording.keyframes,
          durationMs: recording.durationMs,
          playheadMs: 0,
          state: "idle",
        });
      }

      hydrated.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const persist = () => {
      if (!hydrated.current) return;
      const puppet = usePuppetStore.getState();
      const app = useAppStore.getState();
      const recording = useRecordingStore.getState();

      void saveSettings({
        version: 1,
        characterId: puppet.characterId,
        behaviors: app.behaviors,
        calibration: puppet.calibration,
        loop: recording.loop,
        updatedAt: Date.now(),
      });

      if (recording.keyframes.length > 0) {
        void saveRecording({
          version: 1,
          keyframes: recording.keyframes,
          durationMs: recording.durationMs,
          characterId: puppet.characterId,
          updatedAt: Date.now(),
        });
      }
    };

    const unsubPuppet = usePuppetStore.subscribe(persist);
    const unsubApp = useAppStore.subscribe(persist);
    const unsubRec = useRecordingStore.subscribe(persist);

    const interval = window.setInterval(persist, 4000);
    return () => {
      unsubPuppet();
      unsubApp();
      unsubRec();
      window.clearInterval(interval);
    };
  }, []);
}
