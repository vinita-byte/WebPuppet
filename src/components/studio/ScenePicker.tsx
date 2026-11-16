"use client";

import { SCENES } from "@/puppets/scenes";
import { useSceneStore } from "@/store/sceneStore";

export function ScenePicker() {
  const sceneId = useSceneStore((s) => s.sceneId);
  const setScene = useSceneStore((s) => s.setScene);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Scenes
      </h2>
      <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
        {SCENES.map((scene) => {
          const active = scene.id === sceneId;
          return (
            <button
              key={scene.id}
              type="button"
              aria-label={`Scene ${scene.name}`}
              aria-pressed={active}
              onClick={() => setScene(scene.id)}
              className={`w-full min-h-11 rounded border px-2.5 py-2 text-left transition ${
                active
                  ? "border-amber-400/50 bg-amber-500/10"
                  : "border-white/10 bg-black/20 hover:bg-white/5"
              }`}
            >
              <span className="block text-sm font-medium text-white">
                {scene.shortName}
              </span>
              <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">
                {scene.mood}
              </span>
              <span className="mt-1 block text-[10px] text-slate-600">
                {scene.palette}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
