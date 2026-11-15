"use client";

import { useCallback } from "react";
import { TimelineControls } from "@/components/timeline";
import { PuppetViewport } from "@/components/viewport";
import { useKeyboardTriggers } from "@/hooks/useKeyboardTriggers";
import { usePuppetPipeline } from "@/hooks/usePuppetPipeline";
import { useLipSync } from "@/services/audio";
import { useFaceTracking } from "@/services/vision";
import { useAppStore, type BehaviorKey } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { CharacterPicker } from "./CharacterPicker";
import { ControlsPanel } from "./ControlsPanel";
import { WebcamPreview } from "./WebcamPreview";

const BEHAVIOR_LABELS: { key: BehaviorKey; label: string }[] = [
  { key: "headTracking", label: "Head tracking" },
  { key: "blink", label: "Face blink" },
  { key: "autoBlink", label: "Auto blink" },
  { key: "eyeGaze", label: "Eye gaze" },
  { key: "lipSync", label: "Lip sync (visemes)" },
  { key: "nutcrackerJaw", label: "Nutcracker jaw" },
  { key: "breathe", label: "Breathe" },
  { key: "physics", label: "Physics" },
  { key: "walk", label: "Walk cycle" },
  { key: "dragger", label: "Dragger" },
];

export function StudioShell() {
  usePuppetPipeline();
  useKeyboardTriggers();

  const tracking = useFaceTracking({ targetFps: 30 });
  const lipSync = useLipSync();

  const status = useAppStore((s) => s.status);
  const statusMessage = useAppStore((s) => s.statusMessage);
  const behaviors = useAppStore((s) => s.behaviors);
  const toggleBehavior = useAppStore((s) => s.toggleBehavior);
  const sharedBufferAvailable = useAppStore((s) => s.sharedBufferAvailable);
  const fps = usePuppetStore((s) => s.fps);
  const characterName = usePuppetStore((s) => s.character.shortName);
  const captureNeutralPose = usePuppetStore((s) => s.captureNeutralPose);
  const resetDriven = usePuppetStore((s) => s.resetDriven);

  const startAll = useCallback(async () => {
    await tracking.start();
    try {
      await lipSync.start();
    } catch {
      // Mic optional
    }
  }, [tracking, lipSync]);

  const stopAll = useCallback(() => {
    tracking.stop();
    lipSync.stop();
    resetDriven();
  }, [tracking, lipSync, resetDriven]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f14] text-slate-100">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.28em] text-sky-400/90 uppercase">
            WebPuppet
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-white">
            Real-time Face Puppet Studio
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden rounded bg-white/5 px-2 py-1 sm:inline">
            {characterName}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
              status === "running"
                ? "bg-emerald-500/15 text-emerald-300"
                : status === "error"
                  ? "bg-rose-500/15 text-rose-300"
                  : "bg-white/5 text-slate-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "running"
                  ? "bg-emerald-400"
                  : status === "error"
                    ? "bg-rose-400"
                    : "bg-slate-500"
              }`}
            />
            {statusMessage}
          </span>
          <span className="tabular-nums">{fps || 0} FPS</span>
          <span className="hidden sm:inline">
            SAB {sharedBufferAvailable ? "on" : "fallback"}
          </span>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside className="flex max-h-[calc(100vh-8rem)] flex-col gap-4 overflow-y-auto border-r border-white/10 bg-[#0e141c] p-4">
          <CharacterPicker />

          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Capture
            </h2>
            <div className="aspect-video overflow-hidden rounded border border-white/10 bg-black/40">
              {tracking.video ? (
                <WebcamPreview video={tracking.video} />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Camera idle
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!tracking.isRunning ? (
                <button
                  type="button"
                  onClick={() => void startAll()}
                  className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
                >
                  Start Tracking
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAll}
                  className="rounded border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
                >
                  Stop
                </button>
              )}
              <button
                type="button"
                onClick={captureNeutralPose}
                disabled={!tracking.isRunning}
                className="rounded border border-white/15 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-40"
              >
                Calibrate Neutral
              </button>
            </div>
            {!lipSync.isRunning && tracking.isRunning ? (
              <button
                type="button"
                onClick={() => void lipSync.start()}
                className="w-full rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/20"
              >
                Enable Mic Lip-Sync
              </button>
            ) : null}
          </section>

          <ControlsPanel />

          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Behaviors
            </h2>
            {BEHAVIOR_LABELS.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded border border-white/10 px-3 py-2 text-sm"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={behaviors[key]}
                  onChange={() => toggleBehavior(key)}
                  className="accent-sky-500"
                />
              </label>
            ))}
          </section>

          <section className="space-y-1 text-[11px] leading-relaxed text-slate-500">
            <p>
              Layer tags, swap sets, keyboard triggers, auto-blink, breathe,
              eye gaze, nutcracker jaw, physics, walk, and dragger — Character
              Animator–style drivers on a WebWorker vision pipeline.
            </p>
          </section>
        </aside>

        <main className="relative min-h-[420px]">
          <PuppetViewport className="absolute inset-0" />
        </main>
      </div>

      <TimelineControls />
    </div>
  );
}
