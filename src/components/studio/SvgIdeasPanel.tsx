"use client";

import { useState } from "react";
import {
  SVG_CHARACTER_PROMPTS,
  SVG_PACKAGE_RECIPE,
} from "@/data/svgCharacterPrompts";

export function SvgIdeasPanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          SVG character ideas
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          Steal a prompt, build layers in your SVG tool, then import a
          .webpuppet.zip. These ideas are meant to spark weird, memorable
          puppets.
        </p>
      </div>

      <div className="rounded border border-white/10 bg-black/20 p-2.5">
        <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          Package recipe
        </p>
        <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-slate-400">
          {SVG_PACKAGE_RECIPE.map((step) => (
            <li key={step}>• {step}</li>
          ))}
        </ul>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {SVG_CHARACTER_PROMPTS.map((idea) => (
          <article
            key={idea.id}
            className="rounded border border-white/10 bg-[#121820] p-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-white">{idea.title}</h3>
                <p className="text-[10px] text-amber-200/80">{idea.vibe}</p>
              </div>
              <button
                type="button"
                onClick={() => void copyText(idea.id, idea.prompt)}
                className="shrink-0 rounded border border-white/15 px-2 py-1 text-[10px] text-slate-200 hover:bg-white/5"
              >
                {copiedId === idea.id ? "Copied" : "Copy prompt"}
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              {idea.prompt}
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              Layers: {idea.layers.join(", ")}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-sky-200/70">
              Tip: {idea.tip}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
