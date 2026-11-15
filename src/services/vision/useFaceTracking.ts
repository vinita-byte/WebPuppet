"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { DemoTrackingService } from "./DemoTrackingService";
import { FaceTrackingService } from "./FaceTrackingService";
import type { NormalizedTrackingFrame } from "./normalize";
import {
  DEFAULT_MODEL_PATH,
  DEFAULT_WASM_PATH,
  classifyCameraError,
  type FaceTrackingOptions,
} from "./types";

export interface UseFaceTrackingResult {
  start: () => Promise<void>;
  startDemo: () => Promise<void>;
  stop: () => void;
  video: HTMLVideoElement | null;
  lastFrame: NormalizedTrackingFrame | null;
  isRunning: boolean;
  isDemo: boolean;
}

const LOST_MS = 900;

export function useFaceTracking(
  options: FaceTrackingOptions = {},
): UseFaceTrackingResult {
  const optionsRef = useRef({
    wasmPath: DEFAULT_WASM_PATH,
    modelPath: DEFAULT_MODEL_PATH,
    ...options,
  });
  const cameraRef = useRef<FaceTrackingService | null>(null);
  const demoRef = useRef<DemoTrackingService | null>(null);
  const lostTimer = useRef<number | null>(null);

  useEffect(() => {
    optionsRef.current = {
      wasmPath: DEFAULT_WASM_PATH,
      modelPath: DEFAULT_MODEL_PATH,
      ...options,
    };
  }, [options]);

  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [lastFrame, setLastFrame] = useState<NormalizedTrackingFrame | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const fpsSamples = useRef<number[]>([]);
  const lastTick = useRef(0);

  const setStatus = useAppStore((s) => s.setStatus);
  const setCameraEnabled = useAppStore((s) => s.setCameraEnabled);
  const setSharedBufferAvailable = useAppStore(
    (s) => s.setSharedBufferAvailable,
  );
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const setTrackingQuality = useAppStore((s) => s.setTrackingQuality);
  const setFace = usePuppetStore((s) => s.setFace);
  const setRotation = usePuppetStore((s) => s.setRotation);
  const setTrackingActive = usePuppetStore((s) => s.setTrackingActive);
  const setFps = usePuppetStore((s) => s.setFps);

  useEffect(() => {
    return () => {
      cameraRef.current?.stop();
      demoRef.current?.stop();
      cameraRef.current = null;
      demoRef.current = null;
      if (lostTimer.current) window.clearTimeout(lostTimer.current);
    };
  }, []);

  const markFaceSeen = useCallback(
    (demo: boolean) => {
      if (lostTimer.current) window.clearTimeout(lostTimer.current);
      lostTimer.current = window.setTimeout(() => {
        if (!demo) {
          setStatus(
            "tracking-lost",
            "Tracking lost. Face the camera or move closer.",
          );
          setTrackingQuality("off");
        }
      }, LOST_MS);
    },
    [setStatus, setTrackingQuality],
  );

  const onFrame = useCallback(
    (frame: NormalizedTrackingFrame, demo: boolean) => {
      setLastFrame(frame);
      if (frame.faceDetected) {
        setRotation(frame.rotation);
        setFace({
          blinkLeft: frame.blinkLeft,
          blinkRight: frame.blinkRight,
          mouthOpen: frame.mouthOpen,
          mouthSmile: frame.mouthSmile,
          browInnerUp: frame.browInnerUp,
          gazeX: frame.rotation.yaw / 55,
          gazeY: frame.rotation.pitch / 40,
        });
        markFaceSeen(demo);
        if (!demo) {
          const status = useAppStore.getState().status;
          if (status === "tracking-lost" || status === "running") {
            setStatus("running", "Tracking");
          }
        }
      }

      const now = performance.now();
      if (lastTick.current > 0) {
        fpsSamples.current.push(1000 / (now - lastTick.current));
        if (fpsSamples.current.length > 30) fpsSamples.current.shift();
        const avg =
          fpsSamples.current.reduce((a, b) => a + b, 0) /
          fpsSamples.current.length;
        const fps = Math.round(avg);
        setFps(fps);
        if (demo) {
          setTrackingQuality("good");
        } else if (fps >= 20) {
          setTrackingQuality("good");
        } else if (fps >= 8) {
          setTrackingQuality("slow");
        } else {
          setTrackingQuality("off");
        }
      }
      lastTick.current = now;
    },
    [
      markFaceSeen,
      setFace,
      setFps,
      setRotation,
      setStatus,
      setTrackingQuality,
    ],
  );

  const stop = useCallback(() => {
    cameraRef.current?.stop();
    demoRef.current?.stop();
    cameraRef.current = null;
    demoRef.current = null;
    if (lostTimer.current) window.clearTimeout(lostTimer.current);
    setVideo(null);
    setIsRunning(false);
    setIsDemo(false);
    setDemoMode(false);
    setCameraEnabled(false);
    setTrackingActive(false);
    setTrackingQuality("off");
    setFps(0);
    setStatus("idle", "Idle");
  }, [
    setCameraEnabled,
    setDemoMode,
    setFps,
    setStatus,
    setTrackingActive,
    setTrackingQuality,
  ]);

  const start = useCallback(async () => {
    stop();

    setStatus("requesting-permissions", "Asking for camera access…");
    const service = new FaceTrackingService(optionsRef.current);
    cameraRef.current = service;
    setSharedBufferAvailable(service.usesSharedArrayBuffer);

    const unsub = service.subscribe((frame) => onFrame(frame, false));

    try {
      setStatus("loading-model", "Loading face tracker…");
      await service.start();
      setVideo(service.getVideoElement());
      setIsRunning(true);
      setIsDemo(false);
      setDemoMode(false);
      setCameraEnabled(true);
      setTrackingActive(true);
      setStatus("running", "Tracking");
      setTrackingQuality("good");
    } catch (err) {
      unsub();
      service.stop();
      cameraRef.current = null;
      const { message } = classifyCameraError(err);
      setStatus("error", message);
      setIsRunning(false);
      setCameraEnabled(false);
      setTrackingActive(false);
      setTrackingQuality("off");
    }
  }, [
    onFrame,
    setCameraEnabled,
    setDemoMode,
    setSharedBufferAvailable,
    setStatus,
    setTrackingActive,
    setTrackingQuality,
    stop,
  ]);

  const startDemo = useCallback(async () => {
    stop();
    setStatus("loading-model", "Starting sample performance…");
    const demo = new DemoTrackingService();
    demoRef.current = demo;
    demo.subscribe((frame) => onFrame(frame, true));
    await demo.start();
    setIsRunning(true);
    setIsDemo(true);
    setDemoMode(true);
    setCameraEnabled(false);
    setTrackingActive(true);
    setTrackingQuality("good");
    setStatus("demo", "Sample performance (no camera)");
  }, [
    onFrame,
    setCameraEnabled,
    setDemoMode,
    setStatus,
    setTrackingActive,
    setTrackingQuality,
    stop,
  ]);

  return { start, startDemo, stop, video, lastFrame, isRunning, isDemo };
}
