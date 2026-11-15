"use client";

import { Application, Container, Graphics, Text } from "pixi.js";
import { useEffect, useRef } from "react";
import { usePuppetStore } from "@/store/puppetStore";
import type { HeadRotation } from "@/store/types";
import { PuppetRig } from "./PuppetRig";

export interface PuppetViewportProps {
  className?: string;
  /** Optional external head rotation override (e.g. playback). */
  headRotationOverride?: HeadRotation | null;
}

/**
 * Pixi.js canvas hosting the hierarchical sample puppet.
 * Subscribes to Zustand puppet transforms and syncs each RAF tick.
 */
export function PuppetViewport({
  className,
  headRotationOverride,
}: PuppetViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const rigRef = useRef<PuppetRig | null>(null);
  const debugTextRef = useRef<Text | null>(null);
  const overrideRef = useRef(headRotationOverride);

  useEffect(() => {
    overrideRef.current = headRotationOverride;
  }, [headRotationOverride]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const app = new Application();

    void (async () => {
      await app.init({
        background: "#0f1419",
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        resizeTo: host,
      });

      if (disposed) {
        app.destroy(true);
        return;
      }

      host.appendChild(app.canvas);
      appRef.current = app;

      const stageRoot = new Container();
      stageRoot.sortableChildren = true;
      app.stage.addChild(stageRoot);

      // Soft stage wash
      const wash = new Graphics();
      const redrawWash = () => {
        const w = app.screen.width;
        const h = app.screen.height;
        wash.clear();
        wash.rect(0, 0, w, h);
        wash.fill({ color: 0x0f1419 });
        wash.circle(w * 0.5, h * 0.42, Math.min(w, h) * 0.38);
        wash.fill({ color: 0x1a2733, alpha: 0.9 });
      };
      redrawWash();
      stageRoot.addChild(wash);

      const layers = usePuppetStore.getState().layers;
      const rig = new PuppetRig(layers);
      rigRef.current = rig;
      stageRoot.addChild(rig.root);

      const placeRig = () => {
        rig.root.position.set(app.screen.width / 2, app.screen.height * 0.48);
        const scale = Math.min(app.screen.width, app.screen.height) / 520;
        rig.root.scale.set(scale);
        redrawWash();
      };
      placeRig();

      const debug = new Text({
        text: "",
        style: {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          fill: 0x9ec5e8,
        },
      });
      debug.position.set(12, 12);
      stageRoot.addChild(debug);
      debugTextRef.current = debug;

      const onResize = () => placeRig();
      window.addEventListener("resize", onResize);

      app.ticker.add(() => {
        const state = usePuppetStore.getState();
        const rotation =
          overrideRef.current ?? state.displayRotation;
        rig.syncFromStore(state.layers, rotation);

        debug.text = [
          `fps ${state.fps || "—"}`,
          `yaw ${rotation.yaw.toFixed(1)}°`,
          `pitch ${rotation.pitch.toFixed(1)}°`,
          `roll ${rotation.roll.toFixed(1)}°`,
          state.trackingActive ? "TRACK" : "IDLE",
        ].join("  ·  ");
      });

      // Stash cleanup on the app instance
      (app as Application & { __cleanup?: () => void }).__cleanup = () => {
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      disposed = true;
      const current = appRef.current;
      if (current) {
        (current as Application & { __cleanup?: () => void }).__cleanup?.();
        current.destroy(true, { children: true });
      }
      appRef.current = null;
      rigRef.current?.destroy();
      rigRef.current = null;
      if (host.firstChild) {
        host.removeChild(host.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 320 }}
    />
  );
}
