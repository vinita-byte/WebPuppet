"use client";

import { usePuppetStore } from "@/store/puppetStore";

export function ControlsPanel() {
  const triggers = usePuppetStore((s) => s.character.triggers);
  const activeTriggers = usePuppetStore((s) => s.activeTriggers);
  const setTrigger = usePuppetStore((s) => s.setTrigger);
  const toggleTrigger = usePuppetStore((s) => s.toggleTrigger);
  const characterName = usePuppetStore((s) => s.character.name);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Controls · Triggers
      </h2>
      <p className="text-[11px] text-slate-500">
        {characterName}. Hold or toggle keys, or click below.
      </p>
      <div className="flex flex-wrap gap-2">
        {triggers.map((t) => {
          const on = !!activeTriggers[t.id];
          return (
            <button
              key={t.id}
              type="button"
              onMouseDown={() => {
                if (t.mode === "hold") setTrigger(t.id, true);
              }}
              onMouseUp={() => {
                if (t.mode === "hold") setTrigger(t.id, false);
              }}
              onMouseLeave={() => {
                if (t.mode === "hold") setTrigger(t.id, false);
              }}
              onClick={() => {
                if (t.mode === "toggle") toggleTrigger(t.id);
              }}
              className={`rounded border px-3 py-2 text-sm transition ${
                on
                  ? "border-amber-400/40 bg-amber-500/20 text-amber-100"
                  : "border-white/10 hover:bg-white/5"
              }`}
            >
              <span className="mr-2 inline-flex h-5 min-w-5 items-center justify-center rounded bg-black/40 px-1 font-mono text-[10px] text-slate-300">
                {t.key.toUpperCase()}
              </span>
              {t.label}
              <span className="ml-1 text-[10px] text-slate-500">
                {t.mode}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
