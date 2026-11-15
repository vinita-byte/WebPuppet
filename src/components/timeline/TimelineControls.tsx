"use client";

import { useEffect, useRef } from "react";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";
import type { Keyframe } from "@/store/types";

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const rem = Math.floor(ms % 1000)
    .toString()
    .padStart(3, "0");
  return `${s}.${rem}s`;
}

export function TimelineControls() {
  const {
    state,
    keyframes,
    playheadMs,
    durationMs,
    loop,
    arm,
    startRecording,
    stopRecording,
    addKeyframe,
    clearKeyframes,
    setPlayhead,
    play,
    pause,
    setLoop,
  } = useRecordingStore();

  const recordStartRef = useRef(0);
  const playStartRef = useRef(0);
  const rafRef = useRef(0);

  // Capture keyframes while recording
  useEffect(() => {
    if (state !== "recording") return;

    recordStartRef.current = performance.now();
    let lastCapture = 0;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - lastCapture < 1000 / 30) return;
      lastCapture = now;

      const puppet = usePuppetStore.getState();
      const timeMs = now - recordStartRef.current;
      const frame: Keyframe = {
        timeMs,
        rotation: { ...puppet.rotation },
        layers: Object.fromEntries(
          Object.entries(puppet.layers).map(([id, node]) => [
            id,
            { ...node.driven },
          ]),
        ) as Keyframe["layers"],
        face: { ...puppet.face },
        visemeWeights: { ...puppet.visemeWeights },
      };
      addKeyframe(frame);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, addKeyframe]);

  // Playback scrubber
  useEffect(() => {
    if (state !== "playing") return;
    playStartRef.current = performance.now() - playheadMs;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      let t = performance.now() - playStartRef.current;
      if (t > durationMs) {
        if (loop) {
          playStartRef.current = performance.now();
          t = 0;
        } else {
          pause();
          setPlayhead(durationMs);
          return;
        }
      }
      setPlayhead(t);
      applyKeyframeAt(t, keyframes);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    state,
    durationMs,
    loop,
    keyframes,
    playheadMs,
    pause,
    setPlayhead,
  ]);

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 bg-[#121820] px-4 py-3 text-sm text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-medium tracking-wide text-slate-400 uppercase text-xs">
          Timeline
        </span>

        {state === "idle" || state === "armed" ? (
          <button
            type="button"
            onClick={() => {
              arm();
              startRecording();
            }}
            className="rounded bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-500"
          >
            Record
          </button>
        ) : state === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded bg-rose-800 px-3 py-1.5 font-medium text-white hover:bg-rose-700"
          >
            Stop
          </button>
        ) : null}

        <button
          type="button"
          disabled={keyframes.length < 2}
          onClick={() => (state === "playing" ? pause() : play())}
          className="rounded bg-sky-700 px-3 py-1.5 font-medium text-white hover:bg-sky-600 disabled:opacity-40"
        >
          {state === "playing" ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={clearKeyframes}
          disabled={keyframes.length === 0}
          className="rounded border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
        >
          Clear
        </button>

        <label className="ml-2 flex items-center gap-2 text-slate-400">
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
          />
          Loop
        </label>

        <span className="ml-auto tabular-nums text-slate-400">
          {formatMs(playheadMs)} / {formatMs(durationMs)} · {keyframes.length}{" "}
          keys
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(durationMs, 1)}
        value={playheadMs}
        onChange={(e) => {
          const t = Number(e.target.value);
          setPlayhead(t);
          if (state !== "recording") applyKeyframeAt(t, keyframes);
        }}
        className="w-full accent-sky-500"
      />
    </div>
  );
}

function applyKeyframeAt(timeMs: number, keyframes: Keyframe[]): void {
  if (keyframes.length === 0) return;

  let prev = keyframes[0];
  let next = keyframes[keyframes.length - 1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (keyframes[i].timeMs <= timeMs && keyframes[i + 1].timeMs >= timeMs) {
      prev = keyframes[i];
      next = keyframes[i + 1];
      break;
    }
  }

  const span = Math.max(1, next.timeMs - prev.timeMs);
  const u = Math.min(1, Math.max(0, (timeMs - prev.timeMs) / span));

  const lerp = (a: number, b: number) => a + (b - a) * u;

  const rotation = {
    yaw: lerp(prev.rotation.yaw, next.rotation.yaw),
    pitch: lerp(prev.rotation.pitch, next.rotation.pitch),
    roll: lerp(prev.rotation.roll, next.rotation.roll),
  };
  usePuppetStore.getState().setRotation(rotation);
  usePuppetStore.getState().setDisplayRotation(rotation);
  usePuppetStore.getState().setFace({
    blinkLeft: lerp(prev.face.blinkLeft, next.face.blinkLeft),
    blinkRight: lerp(prev.face.blinkRight, next.face.blinkRight),
    mouthOpen: lerp(prev.face.mouthOpen, next.face.mouthOpen),
    mouthSmile: lerp(prev.face.mouthSmile, next.face.mouthSmile),
    browInnerUp: lerp(prev.face.browInnerUp, next.face.browInnerUp),
  });

  const layerIds = new Set([
    ...Object.keys(prev.layers),
    ...Object.keys(next.layers),
  ]);
  const batch: Parameters<
    ReturnType<typeof usePuppetStore.getState>["applyLayerDrivenBatch"]
  >[0] = {};

  for (const id of layerIds) {
    const a = prev.layers[id as keyof typeof prev.layers];
    const b = next.layers[id as keyof typeof next.layers];
    if (!a || !b) continue;
    batch[id as keyof typeof batch] = {
      x: lerp(a.x, b.x),
      y: lerp(a.y, b.y),
      rotation: lerp(a.rotation, b.rotation),
      scaleX: lerp(a.scaleX, b.scaleX),
      scaleY: lerp(a.scaleY, b.scaleY),
      opacity: lerp(a.opacity, b.opacity),
    };
  }
  usePuppetStore.getState().applyLayerDrivenBatch(batch);
}
