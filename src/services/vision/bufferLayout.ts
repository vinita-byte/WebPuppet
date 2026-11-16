/**
 * SharedArrayBuffer / transferable Float32 layout for face tracking results.
 *
 * Index map (Float32):
 *  0  sequence
 *  1  faceDetected (0|1)
 *  2  timestampMs
 *  3  yaw
 *  4  pitch
 *  5  roll
 *  6  blinkLeft
 *  7  blinkRight
 *  8  mouthOpen
 *  9  mouthSmile
 * 10  browInnerUp
 * 11  landmarkCount
 * 12+ landmarks as x,y,z triples (LANDMARK_SLOT_COUNT max)
 */

export const HEADER_FLOATS = 12;
export const LANDMARK_SLOT_COUNT = 32;
export const FLOATS_PER_LANDMARK = 3;
export const TRACKING_BUFFER_FLOATS =
  HEADER_FLOATS + LANDMARK_SLOT_COUNT * FLOATS_PER_LANDMARK;

export const IDX = {
  sequence: 0,
  faceDetected: 1,
  timestampMs: 2,
  yaw: 3,
  pitch: 4,
  roll: 5,
  blinkLeft: 6,
  blinkRight: 7,
  mouthOpen: 8,
  mouthSmile: 9,
  browInnerUp: 10,
  landmarkCount: 11,
  landmarks: 12,
} as const;

export function createTrackingBuffer(): {
  sab: SharedArrayBuffer | null;
  view: Float32Array;
} {
  if (typeof SharedArrayBuffer !== "undefined") {
    try {
      const sab = new SharedArrayBuffer(TRACKING_BUFFER_FLOATS * 4);
      return { sab, view: new Float32Array(sab) };
    } catch {
      // Cross-origin isolation may be unavailable.
    }
  }
  return { sab: null, view: new Float32Array(TRACKING_BUFFER_FLOATS) };
}

export function bytesForTrackingBuffer(): number {
  return TRACKING_BUFFER_FLOATS * 4;
}
