import type { VisemeId } from "./types";

const VISEMES: VisemeId[] = [
  "rest",
  "A",
  "E",
  "I",
  "O",
  "U",
  "closed",
  "wide",
];

/**
 * Lightweight amplitude + spectral-shape → viseme blender.
 * Not phonetic ASR — designed for responsive Character-Animator style lipsync.
 */
export function calculateVisemes(
  volume: number,
  brightness: number,
  bass: number,
): Record<VisemeId, number> {
  const weights = Object.fromEntries(VISEMES.map((v) => [v, 0])) as Record<
    VisemeId,
    number
  >;

  if (volume < 0.04) {
    weights.rest = 1;
    weights.closed = Math.min(1, (0.04 - volume) * 12);
    return normalize(weights);
  }

  // Open vowels when loud + mid/high brightness
  weights.A = volume * (1 - Math.abs(brightness - 0.45) * 1.6) * (0.6 + bass);
  weights.O = volume * (1 - Math.abs(brightness - 0.3) * 2) * (0.5 + bass * 0.8);
  weights.U = volume * Math.max(0, 0.55 - brightness) * 1.4;
  weights.E = volume * (1 - Math.abs(brightness - 0.62) * 1.8);
  weights.I = volume * Math.max(0, brightness - 0.55) * 1.5;
  weights.wide = volume * Math.max(0, brightness - 0.7);
  weights.closed = Math.max(0, 0.12 - volume) * 4;
  weights.rest = Math.max(0, 0.08 - volume) * 6;

  return normalize(weights);
}

function normalize(
  weights: Record<VisemeId, number>,
): Record<VisemeId, number> {
  const sum = Object.values(weights).reduce((a, b) => a + Math.max(0, b), 0);
  if (sum <= 1e-6) {
    return { ...weights, rest: 1 };
  }
  const out = { ...weights };
  for (const key of VISEMES) {
    out[key] = Math.max(0, weights[key]) / sum;
  }
  return out;
}

/** Map viseme mix → mouth scale factors for the 2D puppet. */
export function visemesToMouthShape(weights: Record<string, number>): {
  scaleX: number;
  scaleY: number;
  open: number;
} {
  const open =
    (weights.A ?? 0) * 1 +
    (weights.O ?? 0) * 0.85 +
    (weights.E ?? 0) * 0.45 +
    (weights.I ?? 0) * 0.35 +
    (weights.U ?? 0) * 0.55 +
    (weights.wide ?? 0) * 0.4;

  const wide =
    (weights.E ?? 0) * 0.35 +
    (weights.I ?? 0) * 0.5 +
    (weights.wide ?? 0) * 0.7 -
    (weights.O ?? 0) * 0.25 -
    (weights.U ?? 0) * 0.35;

  return {
    scaleX: 1 + wide * 0.55,
    scaleY: 0.6 + open * 0.95,
    open,
  };
}
