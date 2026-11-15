"use client";

import { useEffect, useRef } from "react";

export function WebcamPreview({
  video,
}: {
  video: HTMLVideoElement | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (video.readyState < 2) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.save();
      // Mirror like a vanity cam
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      ctx.restore();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [video]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={240}
      className="h-full w-full rounded object-cover"
    />
  );
}
