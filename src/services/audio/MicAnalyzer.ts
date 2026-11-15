import { calculateVisemes } from "./VisemeCalculator";
import type { AudioAnalysisFrame, AudioListener } from "./types";

/**
 * Web Audio mic analyser producing volume / brightness / viseme weights
 * at ~60 Hz without blocking the render thread.
 */
export class MicAnalyzer {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private rafId = 0;
  private running = false;
  private readonly listeners = new Set<AudioListener>();
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private timeData: Uint8Array<ArrayBuffer> | null = null;

  subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.7;

    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.source.connect(this.analyser);

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);

    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;

    this.source?.disconnect();
    this.source = null;
    this.analyser = null;

    void this.ctx?.close();
    this.ctx = null;

    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  private tick = (): void => {
    if (!this.running || !this.analyser || !this.freqData || !this.timeData) {
      return;
    }
    this.rafId = requestAnimationFrame(this.tick);

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    const frame = this.analyze(this.freqData, this.timeData);
    for (const listener of this.listeners) {
      listener(frame);
    }
  };

  private analyze(
    freq: Uint8Array,
    time: Uint8Array,
  ): AudioAnalysisFrame {
    let sumSq = 0;
    for (let i = 0; i < time.length; i++) {
      const v = (time[i] - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / time.length);
    const volume = Math.min(1, rms * 3.2);

    const n = freq.length;
    const lowEnd = Math.floor(n * 0.12);
    const midStart = Math.floor(n * 0.15);
    const midEnd = Math.floor(n * 0.55);

    let bass = 0;
    for (let i = 0; i < lowEnd; i++) bass += freq[i];
    bass = bass / (lowEnd * 255);

    let brightSum = 0;
    let brightWeight = 0;
    for (let i = midStart; i < midEnd; i++) {
      const v = freq[i] / 255;
      brightSum += v * ((i - midStart) / (midEnd - midStart));
      brightWeight += v;
    }
    const brightness =
      brightWeight > 1e-4 ? Math.min(1, brightSum / brightWeight) : 0;

    return {
      timestampMs: performance.now(),
      volume,
      brightness,
      bass,
      visemeWeights: calculateVisemes(volume, brightness, bass),
    };
  }
}
