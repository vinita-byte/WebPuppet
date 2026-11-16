"use client";

import { Application, Container, Graphics, Text } from "pixi.js";
import { useEffect, useRef } from "react";
import { isRecordingHudHidden } from "@/lib/recordingHudBridge";
import { registerViewportCanvas } from "@/lib/viewportBridge";
import { usePuppetStore } from "@/store/puppetStore";
import { useSceneStore } from "@/store/sceneStore";
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
  const sceneFarRef = useRef<Graphics | null>(null);
  const sceneMidRef = useRef<Graphics | null>(null);
  const scenePropsRef = useRef<Container | null>(null);
  const propGraphicsRef = useRef<Map<string, Graphics>>(new Map());
  const rigRef = useRef<PuppetRig | null>(null);
  const debugTextRef = useRef<Text | null>(null);
  const overrideRef = useRef(headRotationOverride);
  const paintSceneRef = useRef<() => void>(() => {});
  const characterId = usePuppetStore((s) => s.characterId);
  const fitHeight = usePuppetStore((s) => s.character.fitHeight);
  const sceneId = useSceneStore((s) => s.sceneId);

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
      registerViewportCanvas(app.canvas);

      const stageRoot = new Container();
      stageRoot.sortableChildren = true;
      app.stage.addChild(stageRoot);
      stageRef.current = stageRoot;

      const sceneFar = new Graphics();
      sceneFar.zIndex = 0;
      sceneFarRef.current = sceneFar;
      stageRoot.addChild(sceneFar);

      const sceneMid = new Graphics();
      sceneMid.zIndex = 1;
      sceneMidRef.current = sceneMid;
      stageRoot.addChild(sceneMid);

      const sceneProps = new Container();
      sceneProps.sortableChildren = true;
      sceneProps.zIndex = 2;
      scenePropsRef.current = sceneProps;
      stageRoot.addChild(sceneProps);

      const debug = new Text({
        text: "",
        style: {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          fill: 0x9ec5e8,
        },
      });
      debug.zIndex = 100;
      debug.position.set(12, 12);
      stageRoot.addChild(debug);
      debugTextRef.current = debug;

      const paintScene = () => {
        const far = sceneFarRef.current;
        const mid = sceneMidRef.current;
        const props = scenePropsRef.current;
        if (!far || !mid || !props) return;
        const w = app.screen.width;
        const h = app.screen.height;
        const scene = useSceneStore.getState().scene;

        // Scene artists draw in centered coordinates; anchor containers mid stage.
        far.position.set(w / 2, h / 2);
        mid.position.set(w / 2, h / 2);
        props.position.set(w / 2, h / 2);

        far.clear();
        scene.drawFar(far, w, h);
        mid.clear();
        scene.drawMid(mid, w, h);

        props.removeChildren();
        propGraphicsRef.current.clear();
        for (const prop of scene.props) {
          const g = new Graphics();
          g.zIndex = prop.zIndex ?? 0;
          prop.draw(g, w, h);
          props.addChild(g);
          propGraphicsRef.current.set(prop.id, g);
        }
      };
      paintSceneRef.current = paintScene;

      const placeRig = () => {
        const rig = rigRef.current;
        if (!rig) return;
        const state = usePuppetStore.getState();
        // Keep the full puppet inside the frame with a comfortable margin.
        const fit = Math.max(360, state.character.fitHeight);
        const short = app.screen.height < 360;
        const pad = short ? 0.68 : 0.78;
        const scale =
          (Math.min(app.screen.width, app.screen.height) * pad) / fit;
        rig.root.scale.set(scale);
        rig.root.position.set(
          app.screen.width / 2,
          app.screen.height * (short ? 0.5 : 0.54),
        );
        paintScene();
      };

      window.addEventListener("resize", placeRig);

      app.ticker.add(() => {
        const state = usePuppetStore.getState();
        const rig = rigRef.current;
        if (!rig) return;
        if (rig.characterId !== state.characterId) return;
        const rotation = overrideRef.current ?? state.displayRotation;
        rig.syncFromStore(state.layers, rotation);

        const scene = useSceneStore.getState().scene;
        const t = (performance.now() % 8000) / 8000;
        const w = app.screen.width;
        const h = app.screen.height;
        for (const prop of scene.props) {
          if (!prop.animate) continue;
          const g = propGraphicsRef.current.get(prop.id);
          if (!g) continue;
          g.clear();
          prop.draw(g, w, h);
          prop.animate(g, t, w, h);
        }

        if (debugTextRef.current) {
          const hideHud = isRecordingHudHidden();
          debugTextRef.current.visible = !hideHud;
          if (!hideHud) {
            debugTextRef.current.text = [
              state.character.shortName,
              scene.shortName,
              `fps ${state.fps || "-"}`,
              state.trackingActive ? "TRACK" : "IDLE",
            ].join("  |  ");
          }
        }
      });

      let dragging: string | null = null;
      const onPointerDown = (e: PointerEvent) => {
        const state = usePuppetStore.getState();
        if (!state.layers.head) return;
        dragging = "head";
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging || !rigRef.current) return;
        const scale = rigRef.current.root.scale.x || 1;
        usePuppetStore.getState().setDragOffset(dragging, {
          x:
            (e.movementX || 0) / scale +
            (usePuppetStore.getState().dragOffsets[dragging]?.x ?? 0),
          y:
            (e.movementY || 0) / scale +
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

      const state = usePuppetStore.getState();
      const rig = new PuppetRig(state.character, state.layers);
      rig.root.zIndex = 10;
      rigRef.current = rig;
      stageRoot.addChild(rig.root);
      placeRig();
    })();

    return () => {
      disposed = true;
      registerViewportCanvas(null);
      const current = appRef.current;
      if (current) {
        (current as Application & { __cleanup?: () => void }).__cleanup?.();
        current.destroy(true, { children: true });
      }
      appRef.current = null;
      stageRef.current = null;
      sceneFarRef.current = null;
      sceneMidRef.current = null;
      scenePropsRef.current = null;
      propGraphicsRef.current.clear();
      rigRef.current?.destroy();
      rigRef.current = null;
      if (host.firstChild) host.removeChild(host.firstChild);
    };
  }, []);

  useEffect(() => {
    paintSceneRef.current();
  }, [sceneId]);

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
    rig.root.zIndex = 10;
    rigRef.current = rig;
    stage.addChild(rig.root);
    rig.root.position.set(app.screen.width / 2, app.screen.height * 0.58);
    const fit = Math.max(360, fitHeight);
    const scale = (Math.min(app.screen.width, app.screen.height) * 0.82) / fit;
    rig.root.scale.set(scale);
    rig.root.position.set(app.screen.width / 2, app.screen.height * 0.52);
  }, [characterId, fitHeight]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: "100%", height: "100%", minHeight: 0, touchAction: "none" }}
    />
  );
}
