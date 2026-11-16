"use client";

import { useEffect, useRef } from "react";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useVideoStore } from "@/store/videoStore";
import type { Keyframe } from "@/store/types";

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const rem = Math.floor(ms % 1000)
    .toString()
    .padStart(3, "0");
  return `${s}.${rem}s`;
}

export interface TimelineControlsProps {
  getAudioStream?: () => MediaStream | null;
}

export function TimelineControls({ getAudioStream }: TimelineControlsProps) {
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

  const videoStatus = useVideoStore((s) => s.status);
  const videoError = useVideoStore((s) => s.error);
  const exportLabel = useVideoStore((s) => s.exportLabel);
  const exportProgress = useVideoStore((s) => s.exportProgress);
  const hasVideo = useVideoStore((s) => !!s.blob);
  const startTake = useVideoStore((s) => s.startTake);
  const stopTake = useVideoStore((s) => s.stopTake);
  const clearTake = useVideoStore((s) => s.clearTake);
  const downloadMov = useVideoStore((s) => s.downloadMov);
  const downloadMp4 = useVideoStore((s) => s.downloadMp4);
  const disposeSession = useVideoStore((s) => s.disposeSession);

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
        activeTriggers: Object.entries(puppet.activeTriggers)
          .filter(([, v]) => v)
          .map(([id]) => id),
        activeSwaps: { ...puppet.activeSwaps },
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

  // Drop the in memory video take when the tab/session closes.
  useEffect(() => {
    const onLeave = () => {
      void disposeSession();
    };
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
      void disposeSession();
    };
  }, [disposeSession]);

  const onRecord = async () => {
    arm();
    startRecording();
    await startTake(getAudioStream?.() ?? null);
  };

  const onStop = async () => {
    stopRecording();
    await stopTake();
  };

  const onClear = () => {
    clearKeyframes();
    clearTake();
  };

  const canExportVideo = hasVideo && videoStatus !== "exporting";

  return (
    <div className="flex flex-col gap-2 border-t border-white/10 bg-[#121820] px-3 py-2 text-sm text-slate-200 sm:gap-3 sm:px-4 sm:py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 hidden font-medium tracking-wide text-slate-400 uppercase text-xs sm:inline">
          Timeline
        </span>

        {state === "idle" || state === "armed" ? (
          <button
            type="button"
            onClick={() => void onRecord()}
            className="rounded bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-500"
          >
            Record
          </button>
        ) : state === "recording" ? (
          <button
            type="button"
            onClick={() => void onStop()}
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
          onClick={onClear}
          disabled={keyframes.length === 0 && !hasVideo}
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

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          Video take
        </span>
        {videoStatus === "recording" ? (
          <span className="text-xs text-rose-300">Capturing stage + mic…</span>
        ) : null}
        {videoStatus === "ready" ? (
          <span className="text-xs text-emerald-300">Take ready in memory</span>
        ) : null}
        {videoStatus === "idle" && !hasVideo ? (
          <span className="text-xs text-slate-500">
            Record to capture a downloadable take
          </span>
        ) : null}

        <button
          type="button"
          data-testid="download-mov"
          disabled={!canExportVideo}
          onClick={() => void downloadMov()}
          className="rounded border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-amber-100 hover:bg-amber-500/20 disabled:opacity-40"
        >
          Download MOV
        </button>
        <button
          type="button"
          data-testid="download-mp4"
          disabled={!canExportVideo}
          onClick={() => void downloadMp4()}
          className="rounded border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-sky-100 hover:bg-sky-500/20 disabled:opacity-40"
        >
          Download MP4
        </button>

        {exportLabel ? (
          <span className="text-xs text-slate-400">
            {exportLabel}{" "}
            {exportProgress > 0
              ? `${Math.round(exportProgress * 100)}%`
              : ""}
          </span>
        ) : null}
      </div>

      {videoError ? (
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100">
          {videoError}
        </p>
      ) : null}
      <p className="text-[11px] leading-relaxed text-slate-500">
        Video stays in this browser tab only. Closing the tab or pressing Clear
        removes the take so it does not keep using memory.
      </p>
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
    gazeX: lerp(prev.face.gazeX ?? 0, next.face.gazeX ?? 0),
    gazeY: lerp(prev.face.gazeY ?? 0, next.face.gazeY ?? 0),
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
