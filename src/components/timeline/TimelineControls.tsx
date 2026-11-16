"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLayoutStore } from "@/store/layoutStore";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useVideoStore } from "@/store/videoStore";
import type { Keyframe } from "@/store/types";

function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface TimelineControlsProps {
  getAudioStream?: () => MediaStream | null;
  compact?: boolean;
  onRequestClear?: () => void;
  exportOpen?: boolean;
  onExportOpenChange?: (open: boolean) => void;
  countdown?: number | null;
  onStartRecord?: () => void;
}

export function TimelineControls({
  getAudioStream,
  compact = false,
  onRequestClear,
  exportOpen,
  onExportOpenChange,
  countdown = null,
  onStartRecord,
}: TimelineControlsProps) {
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

  const timelineOpen = useLayoutStore((s) => s.timelineOpen);
  const setTimelineOpen = useLayoutStore((s) => s.setTimelineOpen);
  const timelineHeight = useLayoutStore((s) => s.timelineHeight);
  const setTimelineHeight = useLayoutStore((s) => s.setTimelineHeight);

  const [zoom, setZoom] = useState(1);
  const [localExportOpen, setLocalExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"mp4" | "mov">("mp4");
  const dialogOpen = exportOpen ?? localExportOpen;
  const setDialogOpen = onExportOpenChange ?? setLocalExportOpen;

  const recordStartRef = useRef(0);
  const playStartRef = useRef(0);
  const rafRef = useRef(0);
  const rulerRef = useRef<HTMLDivElement>(null);
  const dragResizeRef = useRef<{ startY: number; startH: number } | null>(null);

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
  }, [state, durationMs, loop, keyframes, playheadMs, pause, setPlayhead]);

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

  const beginRecord = useCallback(async () => {
    if (onStartRecord) {
      onStartRecord();
      return;
    }
    arm();
    startRecording();
    await startTake(getAudioStream?.() ?? null);
  }, [arm, startRecording, startTake, getAudioStream, onStartRecord]);

  const onStop = async () => {
    stopRecording();
    await stopTake();
  };

  const scrubTo = (clientX: number) => {
    const el = rulerRef.current;
    if (!el || durationMs <= 0) return;
    const rect = el.getBoundingClientRect();
    const u = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const t = u * durationMs;
    setPlayhead(t);
    if (state !== "recording") applyKeyframeAt(t, keyframes);
  };

  const onResizePointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    dragResizeRef.current = { startY: e.clientY, startH: timelineHeight };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onResizePointerMove = (e: ReactPointerEvent) => {
    if (!dragResizeRef.current) return;
    const dy = dragResizeRef.current.startY - e.clientY;
    setTimelineHeight(dragResizeRef.current.startH + dy);
  };

  const onResizePointerUp = () => {
    dragResizeRef.current = null;
  };

  const canExportVideo = hasVideo && videoStatus !== "exporting";
  const viewDuration = Math.max(durationMs, 4000) / zoom;
  const tickSeconds = Math.max(1, Math.round(viewDuration / 1000 / 8));
  const ticks: number[] = [];
  for (let s = 0; s * 1000 <= Math.max(durationMs, viewDuration); s += tickSeconds) {
    ticks.push(s);
  }

  const transport = (
    <div className="flex flex-wrap items-center gap-2" data-tour="timeline">
      {countdown != null ? (
        <span
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[var(--record-soft)] text-lg font-semibold text-[var(--record)]"
          aria-live="assertive"
        >
          {countdown}
        </span>
      ) : state === "recording" ? (
        <button
          type="button"
          aria-label="Stop recording"
          onClick={() => void onStop()}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] bg-[var(--record)] px-3 font-medium text-white"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
          Stop
        </button>
      ) : (
        <button
          type="button"
          data-tour="record"
          aria-label="Record take"
          onClick={() => void beginRecord()}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-control)] bg-[var(--record)] px-3 font-medium text-white hover:brightness-110"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
          Record
        </button>
      )}

      <button
        type="button"
        aria-label={state === "playing" ? "Pause" : "Play"}
        disabled={keyframes.length < 2}
        onClick={() => (state === "playing" ? pause() : play())}
        className="inline-flex h-11 items-center rounded-[var(--radius-control)] bg-[var(--accent)] px-3 font-medium text-white disabled:opacity-40"
      >
        {state === "playing" ? "Pause" : "Play"}
      </button>

      <button
        type="button"
        aria-label="Loop playback"
        aria-pressed={loop}
        onClick={() => setLoop(!loop)}
        className={`inline-flex h-11 items-center rounded-[var(--radius-control)] border px-3 ${
          loop
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
            : "border-[var(--border)] text-[var(--muted)] hover:bg-white/5"
        }`}
      >
        Loop
      </button>

      <button
        type="button"
        data-tour="export"
        aria-label="Export video"
        onClick={() => setDialogOpen(true)}
        className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-[var(--foreground)] hover:bg-white/5"
      >
        Export
      </button>

      <button
        type="button"
        aria-label={timelineOpen ? "Collapse timeline" : "Expand timeline"}
        onClick={() => setTimelineOpen(!timelineOpen)}
        className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-[var(--muted)] hover:bg-white/5"
      >
        {timelineOpen ? "Collapse" : "Expand"}
      </button>

      <span className="ml-auto tabular-nums text-xs text-[var(--muted)]">
        {formatClock(playheadMs)} / {formatClock(durationMs)}
      </span>
    </div>
  );

  return (
    <div
      className="relative shrink-0 border-t border-[var(--border)] bg-[var(--surface-2)]"
      style={
        timelineOpen && !compact
          ? { height: timelineHeight }
          : compact
            ? undefined
            : { height: 56 }
      }
    >
      {!compact ? (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize timeline"
          tabIndex={0}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
          className="absolute inset-x-0 top-0 z-10 h-2 cursor-ns-resize"
        />
      ) : null}

      <div className="flex h-full flex-col gap-2 overflow-hidden px-3 py-2">
        {transport}

        {timelineOpen && !compact ? (
          <>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="font-medium text-[var(--foreground)]">
                Face capture
              </span>
              <button
                type="button"
                aria-label="Zoom timeline out"
                onClick={() => setZoom((z) => Math.max(0.5, z / 1.25))}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] hover:bg-white/5"
              >
                −
              </button>
              <button
                type="button"
                aria-label="Zoom timeline in"
                onClick={() => setZoom((z) => Math.min(4, z * 1.25))}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] hover:bg-white/5"
              >
                +
              </button>
              {onRequestClear ? (
                <button
                  type="button"
                  aria-label="Clear recording"
                  disabled={keyframes.length === 0 && !hasVideo}
                  onClick={onRequestClear}
                  className="ml-2 rounded border border-[var(--border)] px-2 py-1 hover:bg-white/5 disabled:opacity-40"
                >
                  Clear…
                </button>
              ) : null}
              {videoStatus === "recording" ? (
                <span className="text-[var(--record)]">Capturing stage</span>
              ) : null}
              {videoStatus === "ready" ? (
                <span className="text-[var(--success)]">Take ready</span>
              ) : null}
            </div>

            <div
              ref={rulerRef}
              className="relative min-h-0 flex-1 overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-0)]"
              onPointerDown={(e) => scrubTo(e.clientX)}
              role="slider"
              aria-label="Timeline playhead"
              aria-valuemin={0}
              aria-valuemax={Math.max(durationMs, 1)}
              aria-valuenow={playheadMs}
              tabIndex={0}
            >
              <div className="absolute inset-x-0 top-0 h-5 border-b border-[var(--border)]">
                {ticks.map((s) => (
                  <span
                    key={s}
                    className="absolute top-0.5 text-[10px] text-[var(--faint)]"
                    style={{
                      left: `${(s * 1000) / Math.max(durationMs || viewDuration, 1) * 100}%`,
                    }}
                  >
                    {s}s
                  </span>
                ))}
              </div>

              {durationMs > 0 ? (
                <div
                  className="absolute top-6 bottom-2 left-0 rounded-sm bg-[var(--accent-soft)]"
                  style={{
                    width: `${(durationMs / Math.max(durationMs, 1)) * 100}%`,
                  }}
                  aria-hidden
                />
              ) : (
                <p className="absolute inset-x-3 top-7 text-xs text-[var(--faint)]">
                  Record a take to fill this track
                </p>
              )}

              {durationMs > 0
                ? keyframes
                    .filter(
                      (_, i) =>
                        i %
                          Math.max(1, Math.floor(keyframes.length / 64)) ===
                        0,
                    )
                    .map((kf) => (
                      <span
                        key={kf.timeMs}
                        className="absolute top-6 h-4 w-0.5 bg-[var(--accent)]"
                        style={{
                          left: `${(kf.timeMs / Math.max(durationMs, 1)) * 100}%`,
                        }}
                      />
                    ))
                : null}

              {durationMs > 0 ? (
                <span
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                  style={{
                    left: `${(playheadMs / Math.max(durationMs, 1)) * 100}%`,
                  }}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-[75] flex items-end justify-center bg-black/55 p-3 sm:items-center"
          role="presentation"
          onClick={() => setDialogOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="export-title"
              className="font-[family-name:var(--font-display)] text-xl text-white"
            >
              Export video
            </h2>
            {!hasVideo ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Record a take first. Export turns your stage recording into MP4
                or MOV on this device.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <fieldset>
                  <legend className="mb-2 text-sm text-[var(--muted)]">
                    Format
                  </legend>
                  <div className="flex gap-2">
                    {(["mp4", "mov"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        aria-pressed={exportFormat === fmt}
                        onClick={() => setExportFormat(fmt)}
                        className={`min-h-11 flex-1 rounded-[var(--radius-control)] border px-3 uppercase ${
                          exportFormat === fmt
                            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                            : "border-[var(--border)] text-[var(--muted)]"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <p className="text-xs text-[var(--faint)]">
                  Resolution matches the stage frame you recorded.
                </p>
                {videoStatus === "exporting" ? (
                  <div
                    className="h-2 overflow-hidden rounded bg-black/40"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(exportProgress * 100)}
                  >
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{ width: `${Math.round(exportProgress * 100)}%` }}
                    />
                  </div>
                ) : null}
                {exportLabel ? (
                  <p className="text-xs text-[var(--muted)]">{exportLabel}</p>
                ) : null}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="min-h-11 rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-sm"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!canExportVideo}
                onClick={() =>
                  void (exportFormat === "mp4" ? downloadMp4() : downloadMov())
                }
                className="min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-3 text-sm font-medium text-white disabled:opacity-40"
              >
                Download {exportFormat.toUpperCase()}
              </button>
            </div>
            {videoError ? (
              <p className="mt-3 rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100">
                {videoError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
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

/** Used by StudioShell countdown path to start capture after 3 2 1. */
export async function startRecordingTake(
  getAudioStream?: () => MediaStream | null,
): Promise<void> {
  const rec = useRecordingStore.getState();
  const video = useVideoStore.getState();
  rec.arm();
  rec.startRecording();
  await video.startTake(getAudioStream?.() ?? null);
}
