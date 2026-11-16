"use client";

import { ASPECT_PRESETS, type AspectMode } from "@/puppets/scenes";
import { useSceneStore } from "@/store/sceneStore";

const MODES: AspectMode[] = ["landscape", "portrait", "fill"];

export function AspectPicker() {
  const aspectMode = useSceneStore((s) => s.aspectMode);
  const setAspectMode = useSceneStore((s) => s.setAspectMode);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Frame
      </h2>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Record horizontal 16:9 or vertical 9:16. The stage letterboxes to match
        your take.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => {
          const preset = ASPECT_PRESETS[mode];
          const active = aspectMode === mode;
          return (
            <button
              key={mode}
              type="button"
              data-testid={`aspect-${mode}`}
              onClick={() => setAspectMode(mode)}
              className={`rounded border px-2 py-2 text-center transition ${
                active
                  ? "border-sky-400/50 bg-sky-500/15 text-white"
                  : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/5"
              }`}
            >
              <span className="block text-sm font-medium">{preset.label}</span>
              <span className="mt-0.5 block text-[10px] text-slate-500">
                {preset.hint}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
