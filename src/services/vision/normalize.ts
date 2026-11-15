import type { HeadRotation, Vec3 } from "@/store/types";
import { IDX, LANDMARK_SLOT_COUNT } from "./bufferLayout";
import { PACKED_LANDMARK_NAMES, type PackedLandmarkName } from "./landmarks";

export interface NormalizedTrackingFrame {
  sequence: number;
  faceDetected: boolean;
  timestampMs: number;
  rotation: HeadRotation;
  blinkLeft: number;
  blinkRight: number;
  mouthOpen: number;
  mouthSmile: number;
  browInnerUp: number;
  landmarks: Partial<Record<PackedLandmarkName, Vec3>>;
}

/**
 * Decompose a column-major 4x4 facial transformation matrix into yaw/pitch/roll
 * degrees. MediaPipe matrices map canonical face → detected face.
 */
export function matrixToEuler(matrix: Float32Array | number[]): HeadRotation {
  // Column-major: indices 0..15
  const r00 = matrix[0];
  const r01 = matrix[4];
  const r10 = matrix[1];
  const r11 = matrix[5];
  const r20 = matrix[2];
  const r21 = matrix[6];
  const r22 = matrix[10];

  let pitch: number;
  let yaw: number;
  let roll: number;

  if (Math.abs(r20) < 0.99999) {
    pitch = Math.asin(-r20);
    yaw = Math.atan2(r10, r00);
    roll = Math.atan2(r21, r22);
  } else {
    // Gimbal lock
    pitch = r20 > 0 ? -Math.PI / 2 : Math.PI / 2;
    yaw = Math.atan2(-r01, r11);
    roll = 0;
  }

  const toDeg = 180 / Math.PI;
  return {
    yaw: yaw * toDeg,
    pitch: pitch * toDeg,
    roll: roll * toDeg,
  };
}

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function readBlendshapeScore(
  categories: Array<{ categoryName?: string; displayName?: string; score: number }>,
  name: string,
): number {
  const hit = categories.find(
    (c) => c.categoryName === name || c.displayName === name,
  );
  return hit ? clamp01(hit.score) : 0;
}

export function writeTrackingFrame(
  view: Float32Array,
  frame: {
    sequence: number;
    faceDetected: boolean;
    timestampMs: number;
    rotation: HeadRotation;
    blinkLeft: number;
    blinkRight: number;
    mouthOpen: number;
    mouthSmile: number;
    browInnerUp: number;
    landmarks: Array<{ x: number; y: number; z: number }>;
  },
): void {
  view[IDX.sequence] = frame.sequence;
  view[IDX.faceDetected] = frame.faceDetected ? 1 : 0;
  view[IDX.timestampMs] = frame.timestampMs;
  view[IDX.yaw] = frame.rotation.yaw;
  view[IDX.pitch] = frame.rotation.pitch;
  view[IDX.roll] = frame.rotation.roll;
  view[IDX.blinkLeft] = frame.blinkLeft;
  view[IDX.blinkRight] = frame.blinkRight;
  view[IDX.mouthOpen] = frame.mouthOpen;
  view[IDX.mouthSmile] = frame.mouthSmile;
  view[IDX.browInnerUp] = frame.browInnerUp;

  const count = Math.min(frame.landmarks.length, LANDMARK_SLOT_COUNT);
  view[IDX.landmarkCount] = count;

  for (let i = 0; i < count; i++) {
    const base = IDX.landmarks + i * 3;
    const lm = frame.landmarks[i];
    view[base] = lm.x;
    view[base + 1] = lm.y;
    view[base + 2] = lm.z;
  }
}

export function readTrackingFrame(view: Float32Array): NormalizedTrackingFrame {
  const count = Math.min(view[IDX.landmarkCount] | 0, LANDMARK_SLOT_COUNT);
  const landmarks: Partial<Record<PackedLandmarkName, Vec3>> = {};

  for (let i = 0; i < count; i++) {
    const name = PACKED_LANDMARK_NAMES[i];
    if (!name) break;
    const base = IDX.landmarks + i * 3;
    landmarks[name] = {
      x: view[base],
      y: view[base + 1],
      z: view[base + 2],
    };
  }

  return {
    sequence: view[IDX.sequence] | 0,
    faceDetected: view[IDX.faceDetected] > 0.5,
    timestampMs: view[IDX.timestampMs],
    rotation: {
      yaw: view[IDX.yaw],
      pitch: view[IDX.pitch],
      roll: view[IDX.roll],
    },
    blinkLeft: view[IDX.blinkLeft],
    blinkRight: view[IDX.blinkRight],
    mouthOpen: view[IDX.mouthOpen],
    mouthSmile: view[IDX.mouthSmile],
    browInnerUp: view[IDX.browInnerUp],
    landmarks,
  };
}

/** Apply calibration offsets so neutral pose reads as ~0. */
export function applyCalibration(
  rotation: HeadRotation,
  offsets: HeadRotation,
): HeadRotation {
  return {
    yaw: rotation.yaw - offsets.yaw,
    pitch: rotation.pitch - offsets.pitch,
    roll: rotation.roll - offsets.roll,
  };
}
