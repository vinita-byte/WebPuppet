"use client";

import { useEffect, useRef } from "react";
import { BehaviorSystem } from "@/services/behaviors";
import { useAppStore } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";
import { createIdentityTransform } from "@/store/types";

export function usePuppetPipeline(): void {
  const systemRef = useRef(new BehaviorSystem());
  const lastTs = useRef(0);
  const startTs = useRef(0);

  useEffect(() => {
    let raf = 0;
    startTs.current = performance.now();

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      const dtMs = lastTs.current ? ts - lastTs.current : 16;
      lastTs.current = ts;

      if (useRecordingStore.getState().state === "playing") return;

      const state = usePuppetStore.getState();
      const app = useAppStore.getState();

      const result = systemRef.current.evaluate({
        rotation: state.rotation,
        face: state.face,
        visemeWeights: state.visemeWeights,
        calibration: state.calibration,
        dtMs,
        timeMs: ts - startTs.current,
        character: state.character,
        activeTriggers: state.activeTriggers,
        activeSwaps: state.activeSwaps,
        dragOffsets: state.dragOffsets,
        enabled: app.behaviors,
      });

      const layers = { ...state.layers };
      for (const id of Object.keys(layers)) {
        layers[id] = {
          ...layers[id],
          driven: createIdentityTransform(),
        };
      }
      for (const [id, driven] of Object.entries(result.layers)) {
        if (!driven || !layers[id]) continue;
        layers[id] = {
          ...layers[id],
          driven: { ...layers[id].driven, ...driven },
        };
      }

      // Apply visibility overrides from blink/triggers.
      for (const [id, visible] of Object.entries(result.visibility)) {
        if (!layers[id]) continue;
        layers[id] = { ...layers[id], visible };
      }

      // Apply swap-set selections (mouth visemes / trigger mouths).
      let activeSwaps = state.activeSwaps;
      if (Object.keys(result.swaps).length > 0) {
        activeSwaps = { ...activeSwaps };
        for (const [setId, layerId] of Object.entries(result.swaps)) {
          const setDef = state.character.swapSets.find((s) => s.id === setId);
          if (!setDef) continue;
          activeSwaps[setId] = layerId;
          for (const id of setDef.layers) {
            if (!layers[id]) continue;
            layers[id] = { ...layers[id], visible: id === layerId };
          }
        }
      }

      usePuppetStore.setState({
        layers,
        displayRotation: result.headRotation,
        activeSwaps,
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
