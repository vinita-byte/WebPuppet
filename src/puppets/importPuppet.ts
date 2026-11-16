"use client";

import { unzipSync, strFromU8 } from "fflate";
import { createIdentityTransform } from "@/store/types";
import {
  PUPPET_FORMAT_ID,
  PUPPET_FORMAT_VERSION,
  type PuppetPackageJson,
} from "./packageFormat";
import { getCharacter } from "./registry";
import type { CharacterDef, LayerDef } from "./types";

export type ImportResult =
  | { kind: "builtin"; characterId: string; character: CharacterDef }
  | { kind: "custom"; character: CharacterDef; objectUrls: string[] };

function mimeForAsset(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

/**
 * Preferred external character format:
 *   name.webpuppet.zip
 *     puppet.json
 *     assets/layers/<id>.svg   (preferred) or .png
 *
 * SVG keeps vector edges crisp and is the right format when authoring outside
 * WebPuppet. PNG is fine for pixel art or baked raster layers.
 */
export async function importPuppetZip(file: File): Promise<ImportResult> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buf);
  } catch {
    throw new Error("That file is not a valid zip.");
  }

  const jsonBytes = files["puppet.json"];
  if (!jsonBytes) {
    throw new Error("Missing puppet.json. Use a .webpuppet.zip package.");
  }

  let pkg: PuppetPackageJson;
  try {
    pkg = JSON.parse(strFromU8(jsonBytes)) as PuppetPackageJson;
  } catch {
    throw new Error("puppet.json could not be parsed.");
  }

  if (pkg.format !== PUPPET_FORMAT_ID) {
    throw new Error(`Unknown package format: ${String(pkg.format)}`);
  }
  if (pkg.version > PUPPET_FORMAT_VERSION) {
    throw new Error(
      `This package uses format version ${pkg.version}. Update WebPuppet to open it.`,
    );
  }

  // Round trip of a built in character just selects it.
  if (pkg.source?.kind === "builtin" && pkg.source.builtinId) {
    const character = getCharacter(pkg.source.builtinId);
    if (character.id === pkg.source.builtinId) {
      return {
        kind: "builtin",
        characterId: character.id,
        character,
      };
    }
  }

  const objectUrls: string[] = [];
  const layers: LayerDef[] = pkg.puppet.layers.map((layer) => {
    let assetUrl: string | undefined;
    if (layer.asset) {
      const bytes = files[layer.asset];
      if (bytes) {
        const blob = new Blob([new Uint8Array(bytes)], {
          type: mimeForAsset(layer.asset),
        });
        assetUrl = URL.createObjectURL(blob);
        objectUrls.push(assetUrl);
      }
    }
    return {
      id: layer.id,
      parentId: layer.parentId,
      tag: layer.tag,
      rest: createIdentityTransform(layer.rest ?? {}),
      zIndex: layer.zIndex ?? 0,
      visible: layer.visible ?? true,
      swapSet: layer.swapSet,
      assetUrl,
      draw: () => {
        // Asset layers are drawn as sprites in PuppetRig.
      },
    };
  });

  const character: CharacterDef = {
    id: pkg.puppet.id || `custom-${Date.now()}`,
    name: pkg.puppet.name || "Imported puppet",
    shortName: pkg.puppet.shortName || "Custom",
    description:
      pkg.puppet.description ||
      "Imported .webpuppet.zip package. Prefer SVG layer assets for crisp vector puppets.",
    accent: pkg.puppet.accent || "#38bdf8",
    fitHeight: pkg.puppet.fitHeight || 420,
    layers,
    swapSets: pkg.puppet.swapSets ?? [],
    triggers: pkg.puppet.triggers ?? [],
    physics: pkg.puppet.physics ?? [],
  };

  return { kind: "custom", character, objectUrls };
}
