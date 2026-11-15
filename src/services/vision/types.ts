import type { NormalizedTrackingFrame } from "./normalize";

export type WorkerInboundMessage =
  | {
      type: "init";
      wasmPath: string;
      modelPath: string;
      sharedBuffer?: SharedArrayBuffer;
    }
  | { type: "frame"; bitmap: ImageBitmap; timestampMs: number }
  | { type: "dispose" };

export type WorkerOutboundMessage =
  | { type: "ready" }
  | { type: "error"; message: string }
  | {
      type: "result";
      /** Present when SharedArrayBuffer is unavailable. */
      buffer?: Float32Array;
      sequence: number;
      faceDetected: boolean;
    };

export type TrackingListener = (frame: NormalizedTrackingFrame) => void;

export interface FaceTrackingOptions {
  /** CDN or same-origin path to MediaPipe vision WASM assets. */
  wasmPath?: string;
  /** Path to the face_landmarker.task model. */
  modelPath?: string;
  /** Target inference FPS (main thread throttles frame submission). */
  targetFps?: number;
}

export const DEFAULT_WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";

export const DEFAULT_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
