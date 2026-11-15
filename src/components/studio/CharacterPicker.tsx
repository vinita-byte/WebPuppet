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
      <div className="grid grid-cols-2 gap-2">
        {CHARACTERS.map((c) => {
          const active = c.id === characterId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCharacter(c.id)}
              className={`rounded border px-2.5 py-2 text-left transition ${
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
