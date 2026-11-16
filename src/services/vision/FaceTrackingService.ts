import { createTrackingBuffer } from "./bufferLayout";
import { readTrackingFrame, type NormalizedTrackingFrame } from "./normalize";
import {
  DEFAULT_MODEL_PATH,
  DEFAULT_WASM_PATH,
  type FaceTrackingOptions,
  type TrackingListener,
  type WorkerOutboundMessage,
} from "./types";

/**
 * Owns the MediaPipe Face Landmarker WebWorker and camera frame pump.
 * Inference stays off the main thread; results arrive via SharedArrayBuffer
 * (preferred) or transferable Float32Array postMessage fallback.
 */
export class FaceTrackingService {
  private worker: Worker | null = null;
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private rafId = 0;
  private running = false;
  private lastSubmitMs = 0;
  private lastSequence = -1;
  private readonly targetIntervalMs: number;
  private readonly wasmPath: string;
  private readonly modelPath: string;
  private readonly listeners = new Set<TrackingListener>();
  private sab: SharedArrayBuffer | null = null;
  private view: Float32Array;
  private ready = false;

  constructor(options: FaceTrackingOptions = {}) {
    this.wasmPath = options.wasmPath ?? DEFAULT_WASM_PATH;
    this.modelPath = options.modelPath ?? DEFAULT_MODEL_PATH;
    this.targetIntervalMs = 1000 / (options.targetFps ?? 30);
    const buf = createTrackingBuffer();
    this.sab = buf.sab;
    this.view = buf.view;
  }

  get usesSharedArrayBuffer(): boolean {
    return this.sab !== null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.video;
  }

  subscribe(listener: TrackingListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    });

    this.video = document.createElement("video");
    this.video.srcObject = this.stream;
    this.video.muted = true;
    this.video.playsInline = true;
    await this.video.play();

    this.worker = new Worker(
      new URL("./faceTracking.worker.ts", import.meta.url),
      { type: "module" },
    );

    this.worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      this.handleWorkerMessage(event.data);
    };

    this.worker.onerror = (event) => {
      console.error("[FaceTrackingService] worker error", event);
    };

    await new Promise<void>((resolve, reject) => {
      const onReady = (event: MessageEvent<WorkerOutboundMessage>) => {
        if (event.data.type === "ready") {
          this.worker?.removeEventListener("message", onReady);
          this.ready = true;
          resolve();
        } else if (event.data.type === "error") {
          this.worker?.removeEventListener("message", onReady);
          reject(new Error(event.data.message));
        }
      };
      this.worker?.addEventListener("message", onReady);
      this.worker?.postMessage({
        type: "init",
        wasmPath: this.wasmPath,
        modelPath: this.modelPath,
        sharedBuffer: this.sab ?? undefined,
      });
    });

    this.running = true;
    this.pump();
  }

  stop(): void {
    this.running = false;
    this.ready = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;

    this.worker?.postMessage({ type: "dispose" });
    this.worker?.terminate();
    this.worker = null;

    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
  }

  /** Latest frame snapshot (SharedArrayBuffer path can also poll this). */
  readLatest(): NormalizedTrackingFrame {
    return readTrackingFrame(this.view);
  }

  private handleWorkerMessage(msg: WorkerOutboundMessage): void {
    if (msg.type === "error") {
      console.error("[FaceTrackingService]", msg.message);
      return;
    }
    if (msg.type !== "result") return;

    if (msg.buffer) {
      this.view.set(msg.buffer);
    }

    if (msg.sequence === this.lastSequence) return;
    this.lastSequence = msg.sequence;

    const frame = readTrackingFrame(this.view);
    for (const listener of this.listeners) {
      listener(frame);
    }
  }

  private pump = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.pump);

    if (!this.ready || !this.worker || !this.video) return;
    if (this.video.readyState < 2) return;

    const now = performance.now();
    if (now - this.lastSubmitMs < this.targetIntervalMs) return;
    this.lastSubmitMs = now;

    createImageBitmap(this.video)
      .then((bitmap) => {
        this.worker?.postMessage(
          { type: "frame", bitmap, timestampMs: now },
          [bitmap],
        );
      })
      .catch((err) => {
        console.warn("[FaceTrackingService] frame capture failed", err);
      });
  };
}
