"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  TimelineControls,
  startRecordingTake,
} from "@/components/timeline/TimelineControls";
import { PuppetViewport } from "@/components/viewport";
import { useKeyboardTriggers } from "@/hooks/useKeyboardTriggers";
import { usePersistence } from "@/hooks/usePersistence";
import { usePuppetPipeline } from "@/hooks/usePuppetPipeline";
import { ASPECT_PRESETS } from "@/puppets/scenes";
import { useLipSync } from "@/services/audio";
import { useFaceTracking } from "@/services/vision";
import { useAppStore } from "@/store/appStore";
import { useLayoutStore } from "@/store/layoutStore";
import { usePuppetStore } from "@/store/puppetStore";
import { useRecordingStore } from "@/store/recordingStore";
import { useSceneStore } from "@/store/sceneStore";
import { useVideoStore } from "@/store/videoStore";
import type { Keyframe } from "@/store/types";
import { DemoTour, TOUR_STORAGE_KEY, WelcomeCard } from "./DemoTour";
import { HelpModals, type HelpModalId } from "./HelpModals";
import { Inspector } from "./Inspector";
import { MenuBar } from "./MenuBar";
import { StatusStrip } from "./StatusStrip";
import { ToolStrip } from "./ToolStrip";
import { WebcamPreview } from "./WebcamPreview";

export function StudioShell() {
  usePersistence();
  usePuppetPipeline();
  useKeyboardTriggers();

  useEffect(() => {
    document.documentElement.dataset.webpuppetHydrated = "1";
  }, []);

  const tracking = useFaceTracking({ targetFps: 30 });
  const lipSync = useLipSync();

  const status = useAppStore((s) => s.status);
  const statusMessage = useAppStore((s) => s.statusMessage);
  const trackingQuality = useAppStore((s) => s.trackingQuality);
  const demoMode = useAppStore((s) => s.demoMode);
  const fps = usePuppetStore((s) => s.fps);
  const characterName = usePuppetStore((s) => s.character.shortName);
  const captureNeutralPose = usePuppetStore((s) => s.captureNeutralPose);
  const resetDriven = usePuppetStore((s) => s.resetDriven);
  const setCharacter = usePuppetStore((s) => s.setCharacter);
  const sceneName = useSceneStore((s) => s.scene.shortName);
  const aspectMode = useSceneStore((s) => s.aspectMode);
  const setAspectMode = useSceneStore((s) => s.setAspectMode);
  const setScene = useSceneStore((s) => s.setScene);

  const inspectorOpen = useLayoutStore((s) => s.inspectorOpen);
  const setInspectorOpen = useLayoutStore((s) => s.setInspectorOpen);
  const timelineOpen = useLayoutStore((s) => s.timelineOpen);
  const setTimelineOpen = useLayoutStore((s) => s.setTimelineOpen);
  const stageZoom = useLayoutStore((s) => s.stageZoom);
  const setStageZoom = useLayoutStore((s) => s.setStageZoom);
  const showSafeArea = useLayoutStore((s) => s.showSafeArea);
  const setShowSafeArea = useLayoutStore((s) => s.setShowSafeArea);
  const cameraPipCollapsed = useLayoutStore((s) => s.cameraPipCollapsed);
  const setCameraPipCollapsed = useLayoutStore((s) => s.setCameraPipCollapsed);
  const restoredNote = useLayoutStore((s) => s.restoredNote);
  const setRestoredNote = useLayoutStore((s) => s.setRestoredNote);
  const resetLayout = useLayoutStore((s) => s.resetLayout);
  const mobileSheet = useLayoutStore((s) => s.mobileSheet);
  const setMobileSheet = useLayoutStore((s) => s.setMobileSheet);

  const recState = useRecordingStore((s) => s.state);
  const playheadMs = useRecordingStore((s) => s.playheadMs);
  const clearKeyframes = useRecordingStore((s) => s.clearKeyframes);
  const play = useRecordingStore((s) => s.play);
  const pause = useRecordingStore((s) => s.pause);
  const stopRecording = useRecordingStore((s) => s.stopRecording);
  const clearTake = useVideoStore((s) => s.clearTake);
  const downloadMp4 = useVideoStore((s) => s.downloadMp4);
  const downloadMov = useVideoStore((s) => s.downloadMov);
  const stopTake = useVideoStore((s) => s.stopTake);
  const hasVideo = useVideoStore((s) => !!s.blob);

  const [helpModal, setHelpModal] = useState<HelpModalId>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [undoToast, setUndoToast] = useState<{
    keyframes: Keyframe[];
    durationMs: number;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pipPos, setPipPos] = useState({ x: 12, y: 12 });
  const [shortScreen, setShortScreen] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [mobile, setMobile] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const undoTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const pipDrag = useRef<{
    ox: number;
    oy: number;
    sx: number;
    sy: number;
  } | null>(null);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(TOUR_STORAGE_KEY) === "1";
      if (!seen) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      setShortScreen(window.innerHeight < 700);
      setNarrow(window.innerWidth < 1100);
      setMobile(window.innerWidth < 768);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (useRecordingStore.getState().keyframes.length > 0) {
      setRestoredNote(true);
    }
  }, [setRestoredNote]);

  const frameStyle = useMemo(() => {
    const ratio = ASPECT_PRESETS[aspectMode].ratio;
    const zoomScale =
      stageZoom === "fit" ? 1 : stageZoom === 50 ? 0.5 : stageZoom === 200 ? 2 : 1;
    if (!ratio) {
      return {
        width: "100%",
        height: "100%",
        transform: `scale(${zoomScale})`,
      } as const;
    }
    return {
      aspectRatio: String(ratio),
      height: "100%",
      width: "auto",
      maxWidth: "100%",
      maxHeight: "100%",
      transform: stageZoom === "fit" ? undefined : `scale(${zoomScale})`,
      transformOrigin: "center center",
    } as const;
  }, [aspectMode, stageZoom]);

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

  const toggleTracking = useCallback(() => {
    if (tracking.isRunning) stopAll();
    else void startAll();
  }, [tracking.isRunning, stopAll, startAll]);

  const markTourSeen = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const finishWelcome = useCallback(
    async (watch: boolean) => {
      setShowWelcome(false);
      markTourSeen();
      if (watch) {
        setTourOpen(true);
      } else {
        await startDemo();
      }
    },
    [markTourSeen, startDemo],
  );

  const onTourClose = useCallback(
    async (finished: boolean) => {
      setTourOpen(false);
      markTourSeen();
      if (!tracking.isRunning) await startDemo();
      void finished;
    },
    [markTourSeen, startDemo, tracking.isRunning],
  );

  const requestClear = useCallback(() => setConfirmClear(true), []);

  const doClear = useCallback(() => {
    const rec = useRecordingStore.getState();
    const snapshot = {
      keyframes: [...rec.keyframes],
      durationMs: rec.durationMs,
    };
    clearKeyframes();
    clearTake();
    setConfirmClear(false);
    if (snapshot.keyframes.length || hasVideo) {
      setUndoToast(snapshot);
      if (undoTimer.current) window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setUndoToast(null), 8000);
    }
  }, [clearKeyframes, clearTake, hasVideo]);

  const undoClear = useCallback(() => {
    if (!undoToast) return;
    useRecordingStore.setState({
      keyframes: undoToast.keyframes,
      durationMs: undoToast.durationMs,
      playheadMs: 0,
      state: "idle",
    });
    setUndoToast(null);
  }, [undoToast]);

  const beginCountdownRecord = useCallback(() => {
    if (countdown != null) return;
    setCountdown(3);
    let n = 3;
    if (countdownTimer.current) window.clearInterval(countdownTimer.current);
    countdownTimer.current = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (countdownTimer.current) window.clearInterval(countdownTimer.current);
        setCountdown(null);
        void startRecordingTake(() => lipSync.getMediaStream());
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [countdown, lipSync]);

  const stopPlaybackOrRecord = useCallback(async () => {
    if (recState === "recording") {
      stopRecording();
      await stopTake();
    } else if (recState === "playing") {
      pause();
    }
  }, [recState, stopRecording, stopTake, pause]);

  const exportJson = useCallback(() => {
    const rec = useRecordingStore.getState();
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 1,
            characterId: usePuppetStore.getState().characterId,
            durationMs: rec.durationMs,
            keyframes: rec.keyframes,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webpuppet-recording.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const newSession = useCallback(() => {
    stopAll();
    clearKeyframes();
    clearTake();
    resetDriven();
  }, [stopAll, clearKeyframes, clearTake, resetDriven]);

  const saveSession = useCallback(() => {
    setRestoredNote(false);
    window.dispatchEvent(new Event("webpuppet:force-save"));
  }, [setRestoredNote]);

  const enterFullscreen = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  }, []);

  // Studio keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelpModal("shortcuts");
        return;
      }
      if (e.key === "Escape") {
        setTourOpen(false);
        setHelpModal(null);
        setExportOpen(false);
        setConfirmClear(false);
        return;
      }
      if (mod && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setExportOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) return;
        if (undoToast) undoClear();
        return;
      }
      if (mod) return;
      const k = e.key.toLowerCase();
      if (k === " " || e.code === "Space") {
        e.preventDefault();
        const st = useRecordingStore.getState();
        if (st.state === "playing") pause();
        else if (st.keyframes.length >= 2) play();
        return;
      }
      if (k === "r") {
        e.preventDefault();
        beginCountdownRecord();
        return;
      }
      if (k === "s") {
        e.preventDefault();
        void stopPlaybackOrRecord();
        return;
      }
      if (k === "c") {
        e.preventDefault();
        if (tracking.isRunning) captureNeutralPose();
        return;
      }
      if (k === "t") {
        e.preventDefault();
        toggleTracking();
        return;
      }
      if (k === "f") {
        e.preventDefault();
        setStageZoom("fit");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    undoToast,
    undoClear,
    beginCountdownRecord,
    stopPlaybackOrRecord,
    tracking.isRunning,
    captureNeutralPose,
    toggleTracking,
    setStageZoom,
    pause,
    play,
  ]);

  const onPipDown = (e: ReactPointerEvent) => {
    pipDrag.current = {
      ox: pipPos.x,
      oy: pipPos.y,
      sx: e.clientX,
      sy: e.clientY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPipMove = (e: ReactPointerEvent) => {
    if (!pipDrag.current) return;
    setPipPos({
      x: Math.max(0, pipDrag.current.ox + (e.clientX - pipDrag.current.sx)),
      y: Math.max(0, pipDrag.current.oy + (e.clientY - pipDrag.current.sy)),
    });
  };
  const onPipUp = () => {
    pipDrag.current = null;
  };

  const recording = recState === "recording";
  const idleStage = !tracking.isRunning && status === "idle";

  const elapsedLabel = formatElapsed(playheadMs);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--surface-1)] text-[var(--foreground)]">
      <MenuBar
        statusPills={
          <span className="hidden text-xs text-[var(--muted)] xl:inline">
            {statusMessage}
          </span>
        }
        onNewSession={newSession}
        onSaveSession={saveSession}
        onExportMp4={() => {
          setExportOpen(true);
          void downloadMp4();
        }}
        onExportMov={() => {
          setExportOpen(true);
          void downloadMov();
        }}
        onExportJson={exportJson}
        onUndo={() => {
          if (undoToast) undoClear();
        }}
        onRedo={() => undefined}
        onClearRecording={requestClear}
        onZoom={setStageZoom}
        onFrame={setAspectMode}
        onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
        onToggleTimeline={() => setTimelineOpen(!timelineOpen)}
        onResetLayout={resetLayout}
        onFullscreen={enterFullscreen}
        onSelectCharacter={setCharacter}
        onSelectScene={setScene}
        onStartTracking={() => void startAll()}
        onStopTracking={stopAll}
        onTryWithoutCamera={() => void startDemo()}
        onCalibrate={captureNeutralPose}
        onRecord={beginCountdownRecord}
        onPlay={play}
        onStopPlayback={() => void stopPlaybackOrRecord()}
        onDemoTour={() => {
          markTourSeen();
          setTourOpen(true);
        }}
        onQuickStart={() => setHelpModal("quickstart")}
        onShortcuts={() => setHelpModal("shortcuts")}
        onTrackingHelp={() => setHelpModal("tracking")}
        onSvgIdeas={() => setHelpModal("svg")}
        onAbout={() => setHelpModal("about")}
        onReport={() => {
          window.open(
            "https://github.com/vinita-byte/WebPuppet/issues",
            "_blank",
            "noopener,noreferrer",
          );
        }}
      />

      {restoredNote ? (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2 text-sm">
          <p>Restored your last session.</p>
          <button
            type="button"
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--border)] px-3"
            onClick={() => {
              clearKeyframes();
              clearTake();
              setRestoredNote(false);
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1">
        {!mobile ? (
          <ToolStrip
            cameraOn={tracking.isRunning && !tracking.isDemo}
            demoOn={tracking.isDemo || demoMode}
            canCalibrate={tracking.isRunning}
            recording={recording}
            onCamera={toggleTracking}
            onTryWithoutCamera={() => void startDemo()}
            onCalibrate={captureNeutralPose}
            onRecord={
              recording
                ? () => void stopPlaybackOrRecord()
                : beginCountdownRecord
            }
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[var(--surface-0)] p-2 sm:p-3">
            <div
              ref={stageRef}
              className={`relative overflow-hidden rounded-[var(--radius-card)] border shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${
                recording
                  ? "border-[var(--record)] ring-2 ring-[var(--record)]/40"
                  : "border-[var(--border)]"
              }`}
              style={frameStyle}
              data-testid="stage-frame"
            >
              <PuppetViewport className="absolute inset-0" />
              {showSafeArea ? (
                <div
                  className="pointer-events-none absolute inset-[8%] border border-dashed border-white/25"
                  aria-hidden
                />
              ) : null}
              {recording || countdown != null ? (
                <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded bg-black/55 px-2 py-1 text-sm text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--record)]" />
                  {countdown != null ? (
                    <span aria-live="assertive">Starting in {countdown}</span>
                  ) : (
                    <span>
                      REC {elapsedLabel}
                    </span>
                  )}
                </div>
              ) : null}

              {idleStage ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/45 p-4 text-center">
                  <p className="max-w-sm font-[family-name:var(--font-display)] text-2xl text-white">
                    Make a character copy your face
                  </p>
                  <p className="max-w-sm text-sm text-[var(--muted)]">
                    Start your camera, or try the sample face with no camera.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => void startAll()}
                      className="min-h-11 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 font-medium text-white"
                    >
                      Start camera
                    </button>
                    <button
                      type="button"
                      data-testid="try-without-camera"
                      data-tour="try-without-camera"
                      onClick={() => void startDemo()}
                      className="min-h-11 rounded-[var(--radius-control)] border border-white/20 px-4 text-white hover:bg-white/5"
                    >
                      Try without a camera
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
                    onClick={() => setTourOpen(true)}
                  >
                    Take the tour
                  </button>
                </div>
              ) : null}

              {/* Stage toolbar */}
              <div className="absolute right-2 bottom-2 z-20 flex gap-1 rounded-[var(--radius-card)] border border-[var(--border)] bg-black/55 p-1 backdrop-blur">
                <button
                  type="button"
                  aria-label="Fit stage"
                  title="Fit stage (F)"
                  onClick={() => setStageZoom("fit")}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded px-2 text-xs text-white hover:bg-white/10"
                >
                  Fit
                </button>
                <button
                  type="button"
                  aria-label="Zoom 100 percent"
                  title="100 percent"
                  onClick={() => setStageZoom(100)}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded px-2 text-xs text-white hover:bg-white/10"
                >
                  100%
                </button>
                <button
                  type="button"
                  aria-label="Toggle safe area"
                  title="Safe area"
                  aria-pressed={showSafeArea}
                  onClick={() => setShowSafeArea(!showSafeArea)}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded px-2 text-xs text-white hover:bg-white/10"
                >
                  Safe
                </button>
                <button
                  type="button"
                  aria-label="Full screen stage"
                  title="Full screen"
                  onClick={enterFullscreen}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded px-2 text-xs text-white hover:bg-white/10"
                >
                  Full
                </button>
              </div>

              {/* Camera PiP */}
              {(tracking.video || tracking.isDemo) && !cameraPipCollapsed ? (
                <div
                  className="absolute z-30 w-36 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-black shadow-lg sm:w-44"
                  style={{ left: pipPos.x, top: pipPos.y }}
                  onPointerDown={onPipDown}
                  onPointerMove={onPipMove}
                  onPointerUp={onPipUp}
                >
                  <div className="flex items-center justify-between bg-black/70 px-2 py-1 text-[11px] text-[var(--muted)]">
                    <span>{tracking.isDemo ? "Sample" : "Camera"}</span>
                    <button
                      type="button"
                      aria-label="Collapse camera preview"
                      className="inline-flex h-8 w-8 items-center justify-center hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCameraPipCollapsed(true);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="aspect-video">
                    {tracking.video ? (
                      <WebcamPreview video={tracking.video} />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[11px] text-sky-200/80">
                        Sample performance
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              {cameraPipCollapsed && (tracking.video || tracking.isDemo) ? (
                <button
                  type="button"
                  aria-label="Show camera preview"
                  className="absolute top-2 left-2 z-30 min-h-11 rounded-[var(--radius-control)] border border-[var(--border)] bg-black/60 px-3 text-xs text-white"
                  onClick={() => setCameraPipCollapsed(false)}
                >
                  Show camera
                </button>
              ) : null}
            </div>

            {(status === "error" || status === "tracking-lost") && (
              <div className="absolute bottom-4 left-1/2 z-40 max-w-md -translate-x-1/2 rounded-[var(--radius-card)] border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-50">
                <p>{statusMessage}</p>
                <button
                  type="button"
                  className="mt-2 min-h-11 rounded border border-white/20 px-3"
                  onClick={() => void startAll()}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <TimelineControls
            getAudioStream={lipSync.getMediaStream}
            compact={shortScreen && !timelineOpen}
            onRequestClear={requestClear}
            exportOpen={exportOpen}
            onExportOpenChange={setExportOpen}
            countdown={countdown}
            onStartRecord={beginCountdownRecord}
          />
        </div>

        {!mobile && inspectorOpen && !narrow ? (
          <div className="hidden w-[300px] shrink-0 xl:flex 2xl:w-[320px]">
            <Inspector className="w-full" />
          </div>
        ) : null}

        {!mobile && inspectorOpen && narrow ? (
          <div className="absolute inset-y-0 right-0 z-40 flex w-[min(100%,320px)] shadow-2xl">
            <Inspector className="w-full" />
          </div>
        ) : null}

        {!mobile && !inspectorOpen ? (
          <button
            type="button"
            aria-label="Show inspector"
            className="hidden shrink-0 border-l border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--muted)] hover:text-white md:block"
            onClick={() => setInspectorOpen(true)}
          >
            Inspector
          </button>
        ) : null}
      </div>

      {mobile ? (
        <nav
          className="flex shrink-0 gap-1 border-t border-[var(--border)] bg-[var(--surface-2)] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-label="Mobile panels"
        >
          {(
            [
              ["puppet", "Puppet"],
              ["behaviors", "Behaviors"],
              ["record", "Record"],
              ["timeline", "Timeline"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() =>
                setMobileSheet(mobileSheet === id ? "none" : id)
              }
              className={`min-h-11 flex-1 rounded-[var(--radius-control)] text-sm ${
                mobileSheet === id
                  ? "bg-[var(--accent-soft)] text-white"
                  : "bg-white/5 text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      ) : null}

      {mobile && mobileSheet !== "none" ? (
        <div className="fixed inset-x-0 bottom-14 z-50 max-h-[70dvh] overflow-hidden rounded-t-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-2)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
            <span className="text-sm font-medium capitalize">{mobileSheet}</span>
            <button
              type="button"
              aria-label="Close panel"
              className="inline-flex h-11 w-11 items-center justify-center"
              onClick={() => setMobileSheet("none")}
            >
              ×
            </button>
          </div>
          <div className="max-h-[60dvh] overflow-y-auto">
            {mobileSheet === "puppet" || mobileSheet === "behaviors" ? (
              <Inspector />
            ) : null}
            {mobileSheet === "record" ? (
              <div className="space-y-2 p-3">
                <button
                  type="button"
                  className="min-h-11 w-full rounded bg-[var(--accent)] text-white"
                  onClick={() => void startAll()}
                >
                  Start camera
                </button>
                <button
                  type="button"
                  className="min-h-11 w-full rounded border border-[var(--border)]"
                  onClick={() => void startDemo()}
                >
                  Try without a camera
                </button>
                <button
                  type="button"
                  className="min-h-11 w-full rounded border border-[var(--border)]"
                  onClick={captureNeutralPose}
                  disabled={!tracking.isRunning}
                >
                  Calibrate
                </button>
                <button
                  type="button"
                  className="min-h-11 w-full rounded bg-[var(--record)] text-white"
                  onClick={beginCountdownRecord}
                >
                  Record
                </button>
              </div>
            ) : null}
            {mobileSheet === "timeline" ? (
              <TimelineControls
                getAudioStream={lipSync.getMediaStream}
                onRequestClear={requestClear}
                exportOpen={exportOpen}
                onExportOpenChange={setExportOpen}
                countdown={countdown}
                onStartRecord={beginCountdownRecord}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <StatusStrip
        status={status}
        demoMode={demoMode || tracking.isDemo}
        trackingQuality={trackingQuality}
        fps={fps}
        savedLabel={restoredNote ? "Restored" : "Autosaved"}
        characterName={characterName}
        sceneName={sceneName}
        frameLabel={ASPECT_PRESETS[aspectMode].label}
      />

      {confirmClear ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3"
          role="presentation"
          onClick={() => setConfirmClear(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="clear-title" className="text-lg text-white">
              Clear recording?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This removes the current take from memory. You can undo for a few
              seconds after.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="min-h-11 rounded border border-[var(--border)] px-3"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="min-h-11 rounded bg-[var(--record)] px-3 text-white"
                onClick={doClear}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {undoToast ? (
        <div
          className="fixed bottom-16 left-1/2 z-[85] flex -translate-x-1/2 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm shadow-xl"
          role="status"
        >
          <span>Recording cleared.</span>
          <button
            type="button"
            className="min-h-11 rounded bg-[var(--accent)] px-3 text-white"
            onClick={undoClear}
          >
            Undo
          </button>
        </div>
      ) : null}

      {showWelcome ? (
        <WelcomeCard
          onWatch={() => void finishWelcome(true)}
          onSkip={() => void finishWelcome(false)}
        />
      ) : null}

      <DemoTour
        open={tourOpen}
        onClose={(finished) => void onTourClose(finished)}
        onTryWithoutCamera={() => void startDemo()}
      />

      <HelpModals id={helpModal} onClose={() => setHelpModal(null)} />
    </div>
  );
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
