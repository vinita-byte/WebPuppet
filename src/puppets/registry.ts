import { classicHost } from "./characters/classicHost";
import { cryptoBull } from "./characters/cryptoBull";
import { jester } from "./characters/jester";
import { owlMentor } from "./characters/owlMentor";
import { pixelKid } from "./characters/pixelKid";
import { robotIntern } from "./characters/robotIntern";
import {
  bigBram,
  bossy,
  bubbles,
  captainGruff,
  gordon,
  grumble,
  madameMochi,
  nimbus,
  pixelRobot,
  professorBiscuit,
} from "./characters/cast";
import type { CharacterDef, LayerTag } from "./types";

/** Original six studio puppets. */
export const LEGACY_CHARACTERS: CharacterDef[] = [
  jester,
  cryptoBull,
  robotIntern,
  owlMentor,
  pixelKid,
  classicHost,
];

/** New cast from the Character Animator layer briefs. */
export const CAST_CHARACTERS: CharacterDef[] = [
  nimbus,
  pixelRobot,
  professorBiscuit,
  madameMochi,
  gordon,
  captainGruff,
  bigBram,
  bubbles,
  bossy,
  grumble,
];

export const CHARACTERS: CharacterDef[] = [
  ...CAST_CHARACTERS,
  ...LEGACY_CHARACTERS,
];

export const CHARACTER_MAP = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
) as Record<string, CharacterDef>;

export function getCharacter(id: string): CharacterDef {
  return CHARACTER_MAP[id] ?? nimbus;
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
