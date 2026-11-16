"use client";

import { useCallback, useEffect } from "react";
import { TimelineControls } from "@/components/timeline";
import { PuppetViewport } from "@/components/viewport";
import { useKeyboardTriggers } from "@/hooks/useKeyboardTriggers";
import { usePersistence } from "@/hooks/usePersistence";
import { usePuppetPipeline } from "@/hooks/usePuppetPipeline";
import { useLipSync } from "@/services/audio";
import { useFaceTracking } from "@/services/vision";
import { useAppStore, type BehaviorKey } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { CharacterPicker } from "./CharacterPicker";
import { ControlsPanel } from "./ControlsPanel";
import { ExportPuppetButton } from "./ExportPuppetButton";
import { WebcamPreview } from "./WebcamPreview";

const BEHAVIOR_LABELS: { key: BehaviorKey; label: string }[] = [
  { key: "headTracking", label: "Head tracking" },
  { key: "blink", label: "Face blink" },
  { key: "autoBlink", label: "Auto blink" },
  { key: "eyeGaze", label: "Eye gaze" },
  { key: "lipSync", label: "Lip sync" },
  { key: "nutcrackerJaw", label: "Nutcracker jaw" },
  { key: "breathe", label: "Breathe" },
  { key: "physics", label: "Physics" },
  { key: "walk", label: "Walk cycle" },
  { key: "dragger", label: "Dragger" },
];

function qualityLabel(q: "good" | "slow" | "off"): string {
  if (q === "good") return "Good";
  if (q === "slow") return "Slow";
  return "Off";
}

export function StudioShell() {
  usePersistence();
  usePuppetPipeline();
  useKeyboardTriggers();

  useEffect(() => {
    // Debug beacon for hydration checks in automated tests
    document.documentElement.dataset.webpuppetHydrated = "1";
  }, []);

  const tracking = useFaceTracking({ targetFps: 30 });
  const lipSync = useLipSync();

  const status = useAppStore((s) => s.status);
  const statusMessage = useAppStore((s) => s.statusMessage);
  const behaviors = useAppStore((s) => s.behaviors);
  const toggleBehavior = useAppStore((s) => s.toggleBehavior);
  const trackingQuality = useAppStore((s) => s.trackingQuality);
  const mobilePanel = useAppStore((s) => s.mobilePanel);
  const setMobilePanel = useAppStore((s) => s.setMobilePanel);
  const fps = usePuppetStore((s) => s.fps);
  const characterName = usePuppetStore((s) => s.character.shortName);
  const captureNeutralPose = usePuppetStore((s) => s.captureNeutralPose);
  const resetDriven = usePuppetStore((s) => s.resetDriven);

  const startAll = useCallback(async () => {
    await tracking.start();
    if (useAppStore.getState().status === "error") return;
    try {
      await lipSync.start();
    } catch {
      // Mic is optional
    }
  }, [tracking, lipSync]);

  const startDemo = useCallback(async () => {
    lipSync.stop();
    await tracking.startDemo();
  }, [tracking, lipSync]);

  const stopAll = useCallback(() => {
    tracking.stop();
    lipSync.stop();
    resetDriven();
  }, [tracking, lipSync, resetDriven]);

  const qualityTone =
    trackingQuality === "good"
      ? "bg-emerald-500/15 text-emerald-300"
      : trackingQuality === "slow"
        ? "bg-amber-500/15 text-amber-200"
        : "bg-white/5 text-slate-400";

  const statusTone =
    status === "running" || status === "demo"
      ? "bg-emerald-500/15 text-emerald-300"
      : status === "error" || status === "tracking-lost"
        ? "bg-rose-500/15 text-rose-300"
        : "bg-white/5 text-slate-400";

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#0b0f14] text-slate-100">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2 sm:px-5 sm:py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.28em] text-sky-400/90 uppercase sm:text-[11px]">
            WebPuppet
          </p>
          <h1 className="truncate font-[family-name:var(--font-display)] text-base tracking-tight text-white sm:text-xl">
            Face Puppet Studio
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 text-[11px] text-slate-400 sm:gap-3 sm:text-xs">
          <span className="hidden rounded bg-white/5 px-2 py-1 md:inline">
            {characterName}
          </span>
          <span
            className={`inline-flex max-w-[10rem] items-center gap-1.5 truncate rounded-full px-2 py-1 sm:max-w-none ${statusTone}`}
            title={statusMessage}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                status === "running" || status === "demo"
                  ? "bg-emerald-400"
                  : status === "error" || status === "tracking-lost"
                    ? "bg-rose-400"
                    : "bg-slate-500"
              }`}
            />
            <span className="truncate">{statusMessage}</span>
          </span>
          <span className={`rounded-full px-2 py-1 ${qualityTone}`}>
            Tracking {qualityLabel(trackingQuality)}
          </span>
          <span className="hidden tabular-nums sm:inline">{fps || 0} FPS</span>
        </div>
      </header>

      {/* Mobile panel switcher */}
      <div className="flex shrink-0 gap-1 border-b border-white/10 bg-[#0e141c] p-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel("stage")}
          className={`flex-1 rounded px-3 py-2 text-sm ${
            mobilePanel === "stage"
              ? "bg-sky-600 text-white"
              : "bg-white/5 text-slate-300"
          }`}
        >
          Stage
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel("controls")}
          className={`flex-1 rounded px-3 py-2 text-sm ${
            mobilePanel === "controls"
              ? "bg-sky-600 text-white"
              : "bg-white/5 text-slate-300"
          }`}
        >
          Controls
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr]">
        <aside
          className={`min-h-0 flex-col overflow-hidden border-r border-white/10 bg-[#0e141c] ${
            mobilePanel === "controls" ? "flex" : "hidden"
          } lg:flex`}
        >
          {/* Sticky capture actions so Start Tracking stays visible */}
          <div className="sticky top-0 z-10 shrink-0 space-y-2 border-b border-white/10 bg-[#0e141c] p-3 sm:p-4">
            <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Capture
            </h2>
            <div className="aspect-video max-h-28 overflow-hidden rounded border border-white/10 bg-black/40 sm:max-h-36 lg:max-h-none">
              {tracking.video ? (
                <WebcamPreview video={tracking.video} />
              ) : tracking.isDemo ? (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-sky-200/80">
                  Sample performance playing
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Camera idle
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {!tracking.isRunning ? (
                <>
                  <button
                    type="button"
                    onClick={() => void startAll()}
                    className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
                  >
                    Start Tracking
                  </button>
                  <button
                    type="button"
                    data-testid="try-without-camera"
                    onClick={() => void startDemo()}
                    className="rounded border border-white/15 px-3 py-2 text-sm hover:bg-white/5"
                  >
                    Try without a camera
                  </button>
                </>
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
            {(status === "error" || status === "tracking-lost") && (
              <p className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs leading-relaxed text-rose-100">
                {statusMessage}
              </p>
            )}
            {!lipSync.isRunning && tracking.isRunning && !tracking.isDemo ? (
              <button
                type="button"
                onClick={() => void lipSync.start()}
                className="w-full rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100 hover:bg-amber-500/20"
              >
                Enable mic lip sync
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
            <CharacterPicker />
            <ExportPuppetButton />
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
            <p className="text-[11px] leading-relaxed text-slate-500">
              Face tracking and lip sync run on your device. Camera and mic
              data never leave your browser.
            </p>
          </div>
        </aside>

        <main
          className={`relative min-h-0 min-w-0 ${
            mobilePanel === "stage" ? "block" : "hidden"
          } lg:block`}
        >
          <PuppetViewport className="absolute inset-0" />
        </main>
      </div>

      <div className="shrink-0">
        <TimelineControls getAudioStream={lipSync.getMediaStream} />
      </div>
    </div>
  );
}
