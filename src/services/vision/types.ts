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
  /** Same origin path to MediaPipe vision WASM assets. */
  wasmPath?: string;
  /** Path to the face_landmarker.task model. */
  modelPath?: string;
  /** Target inference FPS (main thread throttles frame submission). */
  targetFps?: number;
}

/** Self hosted MediaPipe assets under /public/mediapipe. */
export const DEFAULT_WASM_PATH = "/mediapipe/wasm";
export const DEFAULT_MODEL_PATH = "/mediapipe/face_landmarker.task";

export type CameraErrorKind =
  | "denied"
  | "notFound"
  | "unavailable"
  | "secureContext"
  | "unknown";

export function classifyCameraError(err: unknown): {
  kind: CameraErrorKind;
  message: string;
} {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return {
      kind: "secureContext",
      message: "Camera needs a secure context (HTTPS or localhost).",
    };
  }

  const name =
    err && typeof err === "object" && "name" in err
      ? String((err as { name: string }).name)
      : "";
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";

  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    /permission|denied|notallowed/i.test(raw)
  ) {
    return {
      kind: "denied",
      message: "Camera access was denied. Allow the camera in your browser settings, or try without a camera.",
    };
  }

  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    /not found|no device|no camera/i.test(raw)
  ) {
    return {
      kind: "notFound",
      message: "No camera was found on this device. You can try without a camera.",
    };
  }

  if (
    name === "NotReadableError" ||
    name === "TrackStartError" ||
    name === "AbortError" ||
    /could not start|in use|busy/i.test(raw)
  ) {
    return {
      kind: "unavailable",
      message: "The camera is busy or unavailable. Close other apps using it, or try without a camera.",
    };
  }

  return {
    kind: "unknown",
    message: raw || "Camera could not start. You can try without a camera.",
  };
}
