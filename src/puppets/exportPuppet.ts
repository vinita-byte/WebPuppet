"use client";

import { zipSync, strToU8 } from "fflate";
import { Application, Graphics } from "pixi.js";
import { createIdentityTransform } from "@/store/types";
import type { CharacterDef } from "./types";
import {
  PUPPET_FORMAT_ID,
  PUPPET_FORMAT_VERSION,
  type PackagedLayer,
  type PuppetPackageJson,
} from "./packageFormat";

const RENDER_SIZE = 512;

async function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))),
      "image/png",
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function rasterizeLayer(
  draw: CharacterDef["layers"][number]["draw"],
): Promise<Uint8Array | null> {
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-9999px;top:0;width:512px;height:512px;opacity:0;pointer-events:none;";
  document.body.appendChild(host);

  const canvas = document.createElement("canvas");
  canvas.width = RENDER_SIZE;
  canvas.height = RENDER_SIZE;
  host.appendChild(canvas);

  const app = new Application();
  try {
    await app.init({
      canvas,
      width: RENDER_SIZE,
      height: RENDER_SIZE,
      backgroundAlpha: 0,
      antialias: true,
      preference: "webgl",
      resolution: 1,
      autoDensity: false,
    });

    const g = new Graphics();
    draw(g);
    g.position.set(RENDER_SIZE / 2, RENDER_SIZE / 2);
    app.stage.addChild(g);
    app.renderer.render(app.stage);

    const extracted = app.renderer.extract.canvas(app.stage) as HTMLCanvasElement;
    if (!extracted) return null;
    return await canvasToPngBytes(extracted);
  } catch {
    return null;
  } finally {
    try {
      app.destroy(true, { children: true });
    } catch {
      // ignore destroy races after a failed init
    }
    host.remove();
  }
}

function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "puppet";
}

/**
 * Build a .webpuppet.zip for the given character and trigger a browser download.
 */
export async function exportPuppetZip(character: CharacterDef): Promise<void> {
  const files: Record<string, Uint8Array> = {};
  const packagedLayers: PackagedLayer[] = [];

  for (const layer of character.layers) {
    const rest = createIdentityTransform(layer.rest ?? {});
    let asset: string | undefined;

    // Root is usually an empty transform parent; still try other layers.
    if (layer.id !== "root") {
      const png = await rasterizeLayer(layer.draw);
      if (png && png.byteLength > 80) {
        asset = `assets/layers/${layer.id}.png`;
        files[asset] = png;
      }
    }

    packagedLayers.push({
      id: layer.id,
      parentId: layer.parentId,
      tag: layer.tag,
      rest,
      zIndex: layer.zIndex ?? 0,
      visible: layer.visible ?? true,
      swapSet: layer.swapSet,
      asset,
    });
  }

  const pkg: PuppetPackageJson = {
    format: PUPPET_FORMAT_ID,
    version: PUPPET_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      kind: "builtin",
      builtinId: character.id,
    },
    puppet: {
      id: character.id,
      name: character.name,
      shortName: character.shortName,
      description: character.description,
      accent: character.accent,
      fitHeight: character.fitHeight,
      layers: packagedLayers,
      swapSets: character.swapSets,
      triggers: character.triggers,
      physics: character.physics,
    },
  };

  files["puppet.json"] = strToU8(JSON.stringify(pkg, null, 2));
  files["README.txt"] = strToU8(
    [
      "WebPuppet puppet package",
      "",
      `Name: ${character.name}`,
      `Id: ${character.id}`,
      "",
      "Contents:",
      "  puppet.json   Layer tree, tags, mouth swap sets, triggers, physics",
      "  assets/layers PNG drawings for each visible layer",
      "",
      "Camera and mic data are never included. Everything in this zip is artwork and rig data only.",
    ].join("\n"),
  );

  const zipped = zipSync(files, { level: 6 });
  const blob = new Blob([new Uint8Array(zipped)], {
    type: "application/zip",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFileName(character.shortName || character.id)}.webpuppet.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
