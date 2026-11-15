"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { FaceTrackingService } from "./FaceTrackingService";
import type { NormalizedTrackingFrame } from "./normalize";
import type { FaceTrackingOptions } from "./types";

export interface UseFaceTrackingResult {
  start: () => Promise<void>;
  stop: () => void;
  video: HTMLVideoElement | null;
  lastFrame: NormalizedTrackingFrame | null;
  isRunning: boolean;
}

export function useFaceTracking(
  options: FaceTrackingOptions = {},
): UseFaceTrackingResult {
  const optionsRef = useRef(options);
  const serviceRef = useRef<FaceTrackingService | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [lastFrame, setLastFrame] = useState<NormalizedTrackingFrame | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);
  const fpsSamples = useRef<number[]>([]);
  const lastTick = useRef(0);

  const setStatus = useAppStore((s) => s.setStatus);
  const setCameraEnabled = useAppStore((s) => s.setCameraEnabled);
  const setSharedBufferAvailable = useAppStore(
    (s) => s.setSharedBufferAvailable,
  );
  const setFace = usePuppetStore((s) => s.setFace);
  const setRotation = usePuppetStore((s) => s.setRotation);
  const setTrackingActive = usePuppetStore((s) => s.setTrackingActive);
  const setFps = usePuppetStore((s) => s.setFps);

  useEffect(() => {
    return () => {
      serviceRef.current?.stop();
      serviceRef.current = null;
    };
  }, []);

  const onFrame = useCallback(
    (frame: NormalizedTrackingFrame) => {
      setLastFrame(frame);
      if (frame.faceDetected) {
        setRotation(frame.rotation);
        setFace({
          blinkLeft: frame.blinkLeft,
          blinkRight: frame.blinkRight,
          mouthOpen: frame.mouthOpen,
          mouthSmile: frame.mouthSmile,
          browInnerUp: frame.browInnerUp,
        });
      }

      const now = performance.now();
      if (lastTick.current > 0) {
        fpsSamples.current.push(1000 / (now - lastTick.current));
        if (fpsSamples.current.length > 30) fpsSamples.current.shift();
        const avg =
          fpsSamples.current.reduce((a, b) => a + b, 0) /
          fpsSamples.current.length;
        setFps(Math.round(avg));
      }
      lastTick.current = now;
    },
    [setFace, setFps, setRotation],
  );

  const start = useCallback(async () => {
    if (serviceRef.current) return;

    setStatus("requesting-permissions", "Requesting camera…");
    const service = new FaceTrackingService(optionsRef.current);
    serviceRef.current = service;
    setSharedBufferAvailable(service.usesSharedArrayBuffer);

    const unsub = service.subscribe(onFrame);

    try {
      setStatus("loading-model", "Loading MediaPipe Face Landmarker…");
      await service.start();
      setVideo(service.getVideoElement());
      setIsRunning(true);
      setCameraEnabled(true);
      setTrackingActive(true);
      setStatus("running", "Tracking");
    } catch (err) {
      unsub();
      service.stop();
      serviceRef.current = null;
      const message = err instanceof Error ? err.message : String(err);
      setStatus("error", message);
      setIsRunning(false);
      setCameraEnabled(false);
      setTrackingActive(false);
      throw err;
    }
  }, [
    onFrame,
    setCameraEnabled,
    setSharedBufferAvailable,
    setStatus,
    setTrackingActive,
  ]);

  const stop = useCallback(() => {
    serviceRef.current?.stop();
    serviceRef.current = null;
    setVideo(null);
    setIsRunning(false);
    setCameraEnabled(false);
    setTrackingActive(false);
    setStatus("idle", "Idle");
  }, [setCameraEnabled, setStatus, setTrackingActive]);

  return { start, stop, video, lastFrame, isRunning };
}
