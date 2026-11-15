export type VisemeId =
  | "rest"
  | "A"
  | "E"
  | "I"
  | "O"
  | "U"
  | "closed"
  | "wide";

export interface AudioAnalysisFrame {
  timestampMs: number;
  /** Overall loudness 0–1 after soft compression. */
  volume: number;
  /** Spectral centroid proxy 0–1 (higher = brighter / more open vowels). */
  brightness: number;
  /** Low-band energy for plosive / jaw emphasis. */
  bass: number;
  visemeWeights: Record<VisemeId, number>;
}

export type AudioListener = (frame: AudioAnalysisFrame) => void;
