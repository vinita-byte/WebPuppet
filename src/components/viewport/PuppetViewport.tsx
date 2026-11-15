"use client";

import { Application, Container, Graphics, Text } from "pixi.js";
import { useEffect, useRef } from "react";
import { usePuppetStore } from "@/store/puppetStore";
import type { HeadRotation } from "@/store/types";
import { PuppetRig } from "./PuppetRig";

export interface PuppetViewportProps {
  className?: string;
  headRotationOverride?: HeadRotation | null;
}

export function PuppetViewport({
  className,
  headRotationOverride,
}: PuppetViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const stageRef = useRef<Container | null>(null);
  const washRef = useRef<Graphics | null>(null);
  const rigRef = useRef<PuppetRig | null>(null);
  const debugTextRef = useRef<Text | null>(null);
  const overrideRef = useRef(headRotationOverride);
  const characterId = usePuppetStore((s) => s.characterId);
  const fitHeight = usePuppetStore((s) => s.character.fitHeight);

  useEffect(() => {
    overrideRef.current = headRotationOverride;
  }, [headRotationOverride]);

  // Boot Pixi once
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
      stageRef.current = stageRoot;

      const wash = new Graphics();
      washRef.current = wash;
      stageRoot.addChild(wash);

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

      const placeRig = () => {
        const rig = rigRef.current;
        if (!rig) return;
        const state = usePuppetStore.getState();
        rig.root.position.set(app.screen.width / 2, app.screen.height * 0.5);
        const scale =
          Math.min(app.screen.width, app.screen.height) /
          Math.max(360, state.character.fitHeight);
        rig.root.scale.set(scale);

        const w = app.screen.width;
        const h = app.screen.height;
        wash.clear();
        wash.rect(0, 0, w, h);
        wash.fill({ color: 0x0f1419 });
        wash.circle(w * 0.5, h * 0.45, Math.min(w, h) * 0.4);
        wash.fill({ color: 0x1a2733, alpha: 0.9 });
      };

      window.addEventListener("resize", placeRig);

      app.ticker.add(() => {
        const state = usePuppetStore.getState();
        const rig = rigRef.current;
        if (!rig) return;
        // Drop frames from a previous character while the new rig mounts.
        if (rig.characterId !== state.characterId) return;
        const rotation = overrideRef.current ?? state.displayRotation;
        rig.syncFromStore(state.layers, rotation);
        if (debugTextRef.current) {
          debugTextRef.current.text = [
            state.character.shortName,
            `fps ${state.fps || "-"}`,
            `yaw ${rotation.yaw.toFixed(1)} deg`,
            `pitch ${rotation.pitch.toFixed(1)} deg`,
            `roll ${rotation.roll.toFixed(1)} deg`,
            state.trackingActive ? "TRACK" : "IDLE",
          ].join("  |  ");
        }
      });

      // Pointer drag (Dragger)
      let dragging: string | null = null;
      const onPointerDown = (e: PointerEvent) => {
        if (!usePuppetStore.getState().character) return;
        // Prefer head as drag target when enabled
        const enabled = true;
        if (!enabled) return;
        const state = usePuppetStore.getState();
        if (!state.layers.head) return;
        dragging = "head";
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging || !rigRef.current) return;
        const scale = rigRef.current.root.scale.x || 1;
        usePuppetStore.getState().setDragOffset(dragging, {
          x: (e.movementX || 0) / scale +
            (usePuppetStore.getState().dragOffsets[dragging]?.x ?? 0),
          y: (e.movementY || 0) / scale +
            (usePuppetStore.getState().dragOffsets[dragging]?.y ?? 0),
        });
      };
      const onPointerUp = () => {
        dragging = null;
      };
      app.canvas.addEventListener("pointerdown", onPointerDown);
      app.canvas.addEventListener("pointermove", onPointerMove);
      app.canvas.addEventListener("pointerup", onPointerUp);

      (app as Application & { __cleanup?: () => void }).__cleanup = () => {
        window.removeEventListener("resize", placeRig);
        app.canvas.removeEventListener("pointerdown", onPointerDown);
        app.canvas.removeEventListener("pointermove", onPointerMove);
        app.canvas.removeEventListener("pointerup", onPointerUp);
      };

      // Initial build
      const state = usePuppetStore.getState();
      const rig = new PuppetRig(state.character, state.layers);
      rigRef.current = rig;
      stageRoot.addChild(rig.root);
      placeRig();
    })();

    return () => {
      disposed = true;
      const current = appRef.current;
      if (current) {
        (current as Application & { __cleanup?: () => void }).__cleanup?.();
        current.destroy(true, { children: true });
      }
      appRef.current = null;
      stageRef.current = null;
      washRef.current = null;
      rigRef.current?.destroy();
      rigRef.current = null;
      if (host.firstChild) host.removeChild(host.firstChild);
    };
  }, []);

  // Rebuild rig when character changes
  useEffect(() => {
    const app = appRef.current;
    const stage = stageRef.current;
    if (!app || !stage) return;

    const prev = rigRef.current;
    if (prev) {
      stage.removeChild(prev.root);
      prev.destroy();
      rigRef.current = null;
    }

    const state = usePuppetStore.getState();
    const rig = new PuppetRig(state.character, state.layers);
    rigRef.current = rig;
    // Keep wash (0) and debug text on top — insert puppet after wash.
    stage.addChildAt(rig.root, Math.min(1, stage.children.length));
    rig.root.position.set(app.screen.width / 2, app.screen.height * 0.5);
    const scale =
      Math.min(app.screen.width, app.screen.height) / Math.max(360, fitHeight);
    rig.root.scale.set(scale);
  }, [characterId, fitHeight]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 0, touchAction: "none" }}
    />
  );
}
