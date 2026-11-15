import { classicHost } from "./characters/classicHost";
import { cryptoBull } from "./characters/cryptoBull";
import { jester } from "./characters/jester";
import { owlMentor } from "./characters/owlMentor";
import { pixelKid } from "./characters/pixelKid";
import { robotIntern } from "./characters/robotIntern";
import type { CharacterDef, LayerTag } from "./types";

export const CHARACTERS: CharacterDef[] = [
  jester,
  cryptoBull,
  robotIntern,
  owlMentor,
  pixelKid,
  classicHost,
];

export const CHARACTER_MAP = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
) as Record<string, CharacterDef>;

export function getCharacter(id: string): CharacterDef {
  return CHARACTER_MAP[id] ?? jester;
}

export function layersByTag(
  character: CharacterDef,
  tag: LayerTag,
): string[] {
  return character.layers.filter((l) => l.tag === tag).map((l) => l.id);
}

export function firstLayerByTag(
  character: CharacterDef,
  tag: LayerTag,
): string | null {
  return layersByTag(character, tag)[0] ?? null;
}

export * from "./types";
