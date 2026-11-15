/**
 * MediaPipe Face Mesh landmark indices used by the puppet drivers.
 * @see https://developers.google.com/mediapipe/solutions/vision/face_landmarker
 */

export const FACE_LANDMARK = {
  noseTip: 1,
  chin: 152,
  forehead: 10,
  leftEyeOuter: 33,
  leftEyeInner: 133,
  leftEyeUpper: 159,
  leftEyeLower: 145,
  rightEyeOuter: 263,
  rightEyeInner: 362,
  rightEyeUpper: 386,
  rightEyeLower: 374,
  leftIris: 468,
  rightIris: 473,
  mouthLeft: 61,
  mouthRight: 291,
  upperLip: 13,
  lowerLip: 14,
} as const;

/** Ordered subset packed into the shared landmark buffer. */
export const PACKED_LANDMARK_IDS = [
  FACE_LANDMARK.noseTip,
  FACE_LANDMARK.chin,
  FACE_LANDMARK.forehead,
  FACE_LANDMARK.leftEyeOuter,
  FACE_LANDMARK.leftEyeInner,
  FACE_LANDMARK.leftEyeUpper,
  FACE_LANDMARK.leftEyeLower,
  FACE_LANDMARK.rightEyeOuter,
  FACE_LANDMARK.rightEyeInner,
  FACE_LANDMARK.rightEyeUpper,
  FACE_LANDMARK.rightEyeLower,
  FACE_LANDMARK.leftIris,
  FACE_LANDMARK.rightIris,
  FACE_LANDMARK.mouthLeft,
  FACE_LANDMARK.mouthRight,
  FACE_LANDMARK.upperLip,
  FACE_LANDMARK.lowerLip,
] as const;

export type PackedLandmarkName =
  | "noseTip"
  | "chin"
  | "forehead"
  | "leftEyeOuter"
  | "leftEyeInner"
  | "leftEyeUpper"
  | "leftEyeLower"
  | "rightEyeOuter"
  | "rightEyeInner"
  | "rightEyeUpper"
  | "rightEyeLower"
  | "leftIris"
  | "rightIris"
  | "mouthLeft"
  | "mouthRight"
  | "upperLip"
  | "lowerLip";

export const PACKED_LANDMARK_NAMES: PackedLandmarkName[] = [
  "noseTip",
  "chin",
  "forehead",
  "leftEyeOuter",
  "leftEyeInner",
  "leftEyeUpper",
  "leftEyeLower",
  "rightEyeOuter",
  "rightEyeInner",
  "rightEyeUpper",
  "rightEyeLower",
  "leftIris",
  "rightIris",
  "mouthLeft",
  "mouthRight",
  "upperLip",
  "lowerLip",
];
