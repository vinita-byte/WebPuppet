"use client";

export type VideoRecorderMime =
  | "video/webm;codecs=vp9,opus"
  | "video/webm;codecs=vp8,opus"
  | "video/webm"
  | "video/mp4"
  | "video/mp4;codecs=avc1.42E01E,mp4a.40.2";

function pickMimeType(): string {
  const candidates: VideoRecorderMime[] = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "video/webm";
}

/**
 * Records the Pixi stage canvas (and optional mic audio) via MediaRecorder.
 * Keeps chunks in memory only; never writes to disk or IndexedDB.
 */
export class VideoRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private stream: MediaStream | null = null;
  private mimeType = "";
  private ownedAudioTracks: MediaStreamTrack[] = [];

  get isRecording(): boolean {
    return this.recorder?.state === "recording";
  }

  async start(
    canvas: HTMLCanvasElement,
    options?: { fps?: number; audioStream?: MediaStream | null },
  ): Promise<void> {
    this.stopTracks();
    this.chunks = [];

    const fps = options?.fps ?? 30;
    const videoStream = canvas.captureStream(fps);
    const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];

    const audioStream = options?.audioStream;
    if (audioStream) {
      for (const track of audioStream.getAudioTracks()) {
        tracks.push(track);
      }
    } else {
      // Best effort: capture mic for talking takes. Fail soft if denied.
      try {
        const mic = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        for (const track of mic.getAudioTracks()) {
          tracks.push(track);
          this.ownedAudioTracks.push(track);
        }
      } catch {
        // Video only
      }
    }

    this.stream = new MediaStream(tracks);
    this.mimeType = pickMimeType();
    const recorder = new MediaRecorder(this.stream, {
      mimeType: this.mimeType,
      videoBitsPerSecond: 4_000_000,
    });
    this.recorder = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };

    recorder.start(250);
  }

  stop(): Promise<{ blob: Blob; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const recorder = this.recorder;
      if (!recorder || recorder.state === "inactive") {
        this.stopTracks();
        reject(new Error("No active recording"));
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mimeType || "video/webm",
        });
        this.chunks = [];
        this.recorder = null;
        this.stopTracks();
        resolve({ blob, mimeType: blob.type || this.mimeType });
      };

      recorder.onerror = () => {
        this.stopTracks();
        reject(new Error("Recording failed"));
      };

      recorder.stop();
    });
  }

  discard(): void {
    try {
      if (this.recorder && this.recorder.state !== "inactive") {
        this.recorder.onstop = null;
        this.recorder.stop();
      }
    } catch {
      // ignore
    }
    this.recorder = null;
    this.chunks = [];
    this.stopTracks();
  }

  private stopTracks(): void {
    const owned = new Set(this.ownedAudioTracks);
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        // Always stop canvas capture video tracks we created.
        // Only stop mic tracks we opened ourselves (not a shared lip sync stream).
        if (track.kind === "video" || owned.has(track)) {
          try {
            track.stop();
          } catch {
            // ignore
          }
        }
      }
    }
    this.ownedAudioTracks = [];
    this.stream = null;
  }
}
