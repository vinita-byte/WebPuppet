"use client";

import { useCallback, useState } from "react";
import { getCharacter } from "@/puppets/registry";
import { exportPuppetZip } from "@/puppets/exportPuppet";
import { usePuppetStore } from "@/store/puppetStore";

export function ExportPuppetButton() {
  const characterId = usePuppetStore((s) => s.characterId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onExport = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const character = getCharacter(characterId);
      await exportPuppetZip(character);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not export puppet";
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [characterId]);

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Export
      </h2>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Download the active puppet as a zip with puppet.json and layer PNGs.
        Camera and mic data are never included.
      </p>
      <button
        type="button"
        data-testid="export-puppet"
        onClick={() => void onExport()}
        disabled={busy}
        className="w-full rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-50"
      >
        {busy ? "Exporting…" : "Export puppet zip"}
      </button>
      {error ? (
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
