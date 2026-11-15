"use client";

import { useCallback, useRef, useState } from "react";
import { getCharacter } from "@/puppets/registry";
import { exportPuppetZip } from "@/puppets/exportPuppet";
import { importPuppetZip } from "@/puppets/importPuppet";
import { usePuppetStore } from "@/store/puppetStore";

/** Object URLs created for imported SVG/PNG layers; revoked on next import. */
let importedObjectUrls: string[] = [];

function revokeImportedUrls(): void {
  for (const url of importedObjectUrls) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
  importedObjectUrls = [];
}

export function ExportPuppetButton() {
  const characterId = usePuppetStore((s) => s.characterId);
  const setCharacter = usePuppetStore((s) => s.setCharacter);
  const setCustomCharacter = usePuppetStore((s) => s.setCustomCharacter);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onExport = useCallback(async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const character = usePuppetStore.getState().character;
      await exportPuppetZip(character);
      setMessage("Downloaded .webpuppet.zip");
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "Could not export puppet";
      setError(text);
    } finally {
      setBusy(false);
    }
  }, []);

  const onImportFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      setMessage(null);
      try {
        const result = await importPuppetZip(file);
        revokeImportedUrls();
        if (result.kind === "builtin") {
          setCharacter(result.characterId);
          setMessage(`Loaded built in character: ${result.character.shortName}`);
        } else {
          importedObjectUrls = result.objectUrls;
          setCustomCharacter(result.character);
          setMessage(
            `Imported ${result.character.shortName}. Prefer SVG layers in the zip for crisp vector puppets.`,
          );
        }
      } catch (err) {
        const text =
          err instanceof Error ? err.message : "Could not import puppet";
        setError(text);
      } finally {
        setBusy(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [setCharacter, setCustomCharacter],
  );

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Character package
      </h2>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Right format for outside characters: a{" "}
        <span className="text-slate-300">.webpuppet.zip</span> with{" "}
        <span className="text-slate-300">puppet.json</span> plus layer art under{" "}
        <span className="text-slate-300">assets/layers/</span>. Prefer{" "}
        <span className="text-slate-300">SVG</span> for vector puppets; PNG is
        fine for pixel art. Camera and mic data are never included.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          data-testid="export-puppet"
          onClick={() => void onExport()}
          disabled={busy}
          className="w-full rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {busy ? "Working…" : "Export .webpuppet.zip"}
        </button>
        <button
          type="button"
          data-testid="import-puppet"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full rounded border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-100 hover:bg-sky-500/20 disabled:opacity-50"
        >
          Import .webpuppet.zip
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => void onImportFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <p className="text-[10px] leading-relaxed text-slate-600">
        Active character id: {characterId}
      </p>
      {message ? (
        <p className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-100">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  );
}
