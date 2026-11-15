"use client";

import { CHARACTERS } from "@/puppets/registry";
import { usePuppetStore } from "@/store/puppetStore";

export function CharacterPicker() {
  const characterId = usePuppetStore((s) => s.characterId);
  const setCharacter = usePuppetStore((s) => s.setCharacter);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Characters
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0">
        {CHARACTERS.map((c) => {
          const active = c.id === characterId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCharacter(c.id)}
              className={`min-w-[8.5rem] shrink-0 rounded border px-2.5 py-2 text-left transition lg:min-w-0 ${
                active
                  ? "border-sky-400/50 bg-sky-500/15"
                  : "border-white/10 bg-black/20 hover:bg-white/5"
              }`}
            >
              <span
                className="mb-1 block h-1 w-8 rounded"
                style={{ background: c.accent }}
              />
              <span className="block text-sm font-medium text-white">
                {c.shortName}
              </span>
              <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">
                {c.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
