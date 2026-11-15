"use client";

type FFmpegInstance = {
  load: (opts: {
    coreURL: string;
    wasmURL: string;
    workerURL?: string;
  }) => Promise<void>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array | string>;
  deleteFile: (path: string) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  on: (event: string, cb: (data: { progress: number }) => void) => void;
  off: (event: string, cb: (data: { progress: number }) => void) => void;
  terminate: () => void;
};

type FFmpegCtor = new () => FFmpegInstance;

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: FFmpegCtor; toBlobURL?: never };
  }
}

let ffmpegPromise: Promise<FFmpegInstance> | null = null;
let utilPromise: Promise<{
  toBlobURL: (url: string, mime: string) => Promise<string>;
  fetchFile: (data: Blob | string) => Promise<Uint8Array>;
}> | null = null;

async function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[data-ffmpeg="${src}"]`)) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.ffmpeg = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function getUtil() {
  if (!utilPromise) {
    // @ffmpeg/util is safe to bundle; keep ffmpeg core/worker on CDN UMD.
    utilPromise = import("@ffmpeg/util");
  }
  return utilPromise;
}

async function getFfmpeg(): Promise<FFmpegInstance> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      // UMD build avoids Turbopack analyzing the ESM Worker(new URL(...)) path.
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js",
      );
      const FFmpeg = window.FFmpegWASM?.FFmpeg;
      if (!FFmpeg) {
        throw new Error("FFmpeg failed to load in this browser.");
      }
      const { toBlobURL } = await getUtil();
      const base =
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(
          `${base}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
      return ffmpeg;
    })().catch((err) => {
      ffmpegPromise = null;
      throw err;
    });
  }
  return ffmpegPromise;
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("webm")) return "webm";
  return "webm";
}

/**
 * Transcode an in memory take into MP4 (H.264 + AAC) or MOV (same codecs).
 */
export async function convertTake(
  blob: Blob,
  mimeType: string,
  format: "mp4" | "mov",
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const ffmpeg = await getFfmpeg();
  const { fetchFile } = await getUtil();
  const inputExt = extensionForMime(mimeType);
  const inputName = `input.${inputExt}`;
  const outputName = `output.${format}`;

  await ffmpeg.writeFile(inputName, await fetchFile(blob));

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)));
  };
  ffmpeg.on("progress", progressHandler);

  try {
    await ffmpeg.exec([
      "-i",
      inputName,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "ultrafast",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputName,
    ]);
  } finally {
    ffmpeg.off("progress", progressHandler);
  }

  const data = await ffmpeg.readFile(outputName);
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  const bytes =
    data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(String(data));
  const outMime = format === "mov" ? "video/quicktime" : "video/mp4";
  return new Blob([new Uint8Array(bytes)], { type: outMime });
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

/** Drop the ffmpeg worker to free WASM memory after the session. */
export async function disposeFfmpeg(): Promise<void> {
  if (!ffmpegPromise) return;
  try {
    const ffmpeg = await ffmpegPromise;
    ffmpeg.terminate();
  } catch {
    // ignore
  }
  ffmpegPromise = null;
}
