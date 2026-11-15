"use client";

import { useEffect, useRef } from "react";
import { BehaviorSystem } from "@/services/behaviors";
import { useAppStore } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";
import type { PuppetLayerId } from "@/store/types";
import { createIdentityTransform } from "@/store/types";

/**
 * Runs the modular behavior system each animation frame, writing driven
 * layer transforms into the Zustand puppet store for the Pixi viewport.
 */
export function usePuppetPipeline(): void {
  const systemRef = useRef(new BehaviorSystem());
  const lastTs = useRef(0);

  useEffect(() => {
    let raf = 0;

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      const dtMs = lastTs.current ? ts - lastTs.current : 16;
      lastTs.current = ts;

      // Timeline playback owns transforms while playing.
      if (useRecordingStore.getState().state === "playing") return;

      const state = usePuppetStore.getState();
      const app = useAppStore.getState();

      const result = systemRef.current.evaluate({
        rotation: state.rotation,
        face: state.face,
        visemeWeights: state.visemeWeights,
        calibration: state.calibration,
        dtMs,
        enabled: app.behaviors,
      });

      // Rebuild driven transforms from scratch so disabled behaviors leave no residue.
      const layers = { ...state.layers };
      for (const id of Object.keys(layers) as PuppetLayerId[]) {
        layers[id] = {
          ...layers[id],
          driven: createIdentityTransform(),
        };
      }
      for (const [id, driven] of Object.entries(result.layers) as [
        PuppetLayerId,
        (typeof result.layers)[PuppetLayerId],
      ][]) {
        if (!driven) continue;
        layers[id] = {
          ...layers[id],
          driven: { ...layers[id].driven, ...driven },
        };
      }

      usePuppetStore.setState({
        layers,
        displayRotation: result.headRotation,
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
