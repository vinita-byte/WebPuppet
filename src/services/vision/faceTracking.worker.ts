/// <reference lib="webworker" />

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { TRACKING_BUFFER_FLOATS } from "./bufferLayout";
import { PACKED_LANDMARK_IDS } from "./landmarks";
import {
  matrixToEuler,
  readBlendshapeScore,
  writeTrackingFrame,
} from "./normalize";
import type { WorkerInboundMessage, WorkerOutboundMessage } from "./types";

declare const self: DedicatedWorkerGlobalScope;

let landmarker: FaceLandmarker | null = null;
let sharedView: Float32Array | null = null;
let sequence = 0;
let lastTimestamp = -1;

function post(msg: WorkerOutboundMessage): void {
  self.postMessage(msg);
}

function extractPackedLandmarks(
  result: FaceLandmarkerResult,
): Array<{ x: number; y: number; z: number }> {
  const face = result.faceLandmarks[0];
  if (!face) return [];

  return PACKED_LANDMARK_IDS.map((id) => {
    const lm = face[id] ?? { x: 0, y: 0, z: 0 };
    return { x: lm.x, y: lm.y, z: lm.z };
  });
}

function processResult(result: FaceLandmarkerResult, timestampMs: number): void {
  sequence += 1;
  const faceDetected = result.faceLandmarks.length > 0;

  let rotation = { yaw: 0, pitch: 0, roll: 0 };
  if (result.facialTransformationMatrixes?.[0]) {
    const m = result.facialTransformationMatrixes[0];
    const data = m.data ?? [];
    rotation = matrixToEuler(
      data instanceof Float32Array ? data : Float32Array.from(data),
    );
  }

  const categories = result.faceBlendshapes?.[0]?.categories ?? [];
  const blinkLeft = readBlendshapeScore(categories, "eyeBlinkLeft");
  const blinkRight = readBlendshapeScore(categories, "eyeBlinkRight");
  const mouthOpen = Math.max(
    readBlendshapeScore(categories, "jawOpen"),
    readBlendshapeScore(categories, "mouthOpen"),
  );
  const mouthSmile = Math.max(
    readBlendshapeScore(categories, "mouthSmileLeft"),
    readBlendshapeScore(categories, "mouthSmileRight"),
  );
  const browInnerUp = readBlendshapeScore(categories, "browInnerUp");

  const landmarks = extractPackedLandmarks(result);
  const payload = {
    sequence,
    faceDetected,
    timestampMs,
    rotation,
    blinkLeft,
    blinkRight,
    mouthOpen,
    mouthSmile,
    browInnerUp,
    landmarks,
  };

  if (sharedView) {
    writeTrackingFrame(sharedView, payload);
    post({ type: "result", sequence, faceDetected });
  } else {
    const buffer = new Float32Array(TRACKING_BUFFER_FLOATS);
    writeTrackingFrame(buffer, payload);
    // Transfer ownership of the underlying ArrayBuffer when possible.
    self.postMessage(
      { type: "result", sequence, faceDetected, buffer } satisfies WorkerOutboundMessage,
      [buffer.buffer],
    );
  }
}

async function init(wasmPath: string, modelPath: string): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(wasmPath);
  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelPath,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
  post({ type: "ready" });
}

self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case "init": {
        if (msg.sharedBuffer) {
          sharedView = new Float32Array(msg.sharedBuffer);
        }
        await init(msg.wasmPath, msg.modelPath);
        break;
      }
      case "frame": {
        if (!landmarker) {
          msg.bitmap.close();
          return;
        }
        // MediaPipe requires strictly increasing timestamps.
        let ts = msg.timestampMs;
        if (ts <= lastTimestamp) {
          ts = lastTimestamp + 1;
        }
        lastTimestamp = ts;

        const result = landmarker.detectForVideo(msg.bitmap, ts);
        msg.bitmap.close();
        processResult(result, ts);
        break;
      }
      case "dispose": {
        landmarker?.close();
        landmarker = null;
        sharedView = null;
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    post({ type: "error", message });
  }
};
