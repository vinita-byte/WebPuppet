"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "stage.teleprompter";

export function Teleprompter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState(
    "Welcome to Stage.\n\nLook at the camera, speak clearly, and let your puppet follow along.\n\nUse this teleprompter to keep your script in view while you perform.",
  );
  const [speed, setSpeed] = useState(28);
  const [fontSize, setFontSize] = useState(28);
  const [playing, setPlaying] = useState(false);
  const [mirror, setMirror] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        text?: string;
        speed?: number;
        fontSize?: number;
        mirror?: boolean;
      };
      if (parsed.text) setText(parsed.text);
      if (parsed.speed) setSpeed(parsed.speed);
      if (parsed.fontSize) setFontSize(parsed.fontSize);
      if (typeof parsed.mirror === "boolean") setMirror(parsed.mirror);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ text, speed, fontSize, mirror }),
      );
    } catch {
      // ignore
    }
  }, [text, speed, fontSize, mirror]);

  useEffect(() => {
    if (!open || !playing) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    lastRef.current = performance.now();
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const el = scrollerRef.current;
      if (!el) return;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      el.scrollTop += speed * dt;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, playing, speed]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-24 z-[60] mx-auto flex max-w-3xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-3)]/95 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-28 sm:left-auto sm:w-[min(100%,28rem)]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="teleprompter-title"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
        <h2
          id="teleprompter-title"
          className="font-[family-name:var(--font-display)] text-base text-[var(--foreground)]"
        >
          Teleprompter
        </h2>
        <button
          type="button"
          aria-label="Close teleprompter"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <label className="block border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)]">
        Script
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-1 w-full resize-y rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-1)] px-2 py-2 text-sm text-[var(--foreground)]"
          placeholder="Paste or type the words you want to read"
        />
      </label>

      <div
        ref={scrollerRef}
        className="max-h-48 overflow-y-auto px-4 py-6 text-center leading-relaxed text-[var(--foreground)] sm:max-h-56"
        style={{
          fontSize,
          transform: mirror ? "scaleX(-1)" : undefined,
        }}
        aria-live="off"
      >
        {text.split("\n").map((line, i) => (
          <p key={i} className="mb-3 min-h-[1em]">
            {line || "\u00A0"}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[var(--border)] p-3 text-xs text-[var(--muted)] sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          Speed
          <input
            type="range"
            min={8}
            max={80}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            aria-label="Scroll speed"
          />
        </label>
        <label className="flex flex-col gap-1">
          Size
          <input
            type="range"
            min={18}
            max={48}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            aria-label="Font size"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={mirror}
            onChange={(e) => setMirror(e.target.checked)}
          />
          Mirror text
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            className="min-h-11 flex-1 rounded-[var(--radius-control)] bg-[var(--accent)] px-2 font-medium text-white"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "Pause" : "Scroll"}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--border)] px-2"
            onClick={() => {
              setPlaying(false);
              if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
