"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { usePuppetStore } from "@/store/puppetStore";
import { MicAnalyzer } from "./MicAnalyzer";
import type { AudioAnalysisFrame } from "./types";

export function useLipSync() {
  const analyzerRef = useRef<MicAnalyzer | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastFrame, setLastFrame] = useState<AudioAnalysisFrame | null>(null);

  const setMicEnabled = useAppStore((s) => s.setMicEnabled);
  const setStatus = useAppStore((s) => s.setStatus);
  const setVisemeWeights = usePuppetStore((s) => s.setVisemeWeights);

  useEffect(() => {
    return () => {
      analyzerRef.current?.stop();
      analyzerRef.current = null;
    };
  }, []);

  const start = useCallback(async () => {
    if (analyzerRef.current) return;
    const analyzer = new MicAnalyzer();
    analyzerRef.current = analyzer;

    analyzer.subscribe((frame) => {
      setLastFrame(frame);
      setVisemeWeights(frame.visemeWeights);
    });

    try {
      await analyzer.start();
      setIsRunning(true);
      setMicEnabled(true);
    } catch (err) {
      analyzer.stop();
      analyzerRef.current = null;
      const message = err instanceof Error ? err.message : String(err);
      setStatus("error", message);
      throw err;
    }
  }, [setMicEnabled, setStatus, setVisemeWeights]);

  const stop = useCallback(() => {
    analyzerRef.current?.stop();
    analyzerRef.current = null;
    setIsRunning(false);
    setMicEnabled(false);
    setVisemeWeights({ rest: 1 });
  }, [setMicEnabled, setVisemeWeights]);

  const getMediaStream = useCallback(
    () => analyzerRef.current?.getMediaStream() ?? null,
    [],
  );

  return { start, stop, isRunning, lastFrame, getMediaStream };
}
