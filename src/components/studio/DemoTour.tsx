"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export const TOUR_STORAGE_KEY = "webpuppet.tourSeen";

const TOUR_TARGETS = [
  "puppet-tab",
  "try-without-camera",
  "record",
  "timeline",
  "export",
  "help",
] as const;

type TourTarget = (typeof TOUR_TARGETS)[number];

type TourStep = {
  id: string;
  title: string;
  body: string;
  target?: TourTarget;
  tryWithoutCamera?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    body: "Meet WebPuppet. Make a character copy your face, right in your browser.",
  },
  {
    id: "privacy",
    title: "Privacy",
    body: "Your camera stays on your device. Nothing is uploaded.",
  },
  {
    id: "choose-puppet",
    title: "Choose a puppet",
    body: "Open the Puppet tab to pick who performs.",
    target: "puppet-tab",
  },
  {
    id: "no-camera",
    title: "Start with no camera",
    body: "No camera? Try the sample face.",
    target: "try-without-camera",
    tryWithoutCamera: true,
  },
  {
    id: "start-camera",
    title: "Or start your camera",
    body: "Look straight ahead, then press Calibrate after starting tracking.",
  },
  {
    id: "behaviors",
    title: "Behaviors",
    body: "Toggle head, eyes, and lip sync to change how the puppet responds.",
  },
  {
    id: "record",
    title: "Record",
    body: "Press Record for a short countdown, then perform.",
    target: "record",
  },
  {
    id: "timeline",
    title: "Timeline",
    body: "Scrub, play, and loop your take.",
    target: "timeline",
  },
  {
    id: "export",
    title: "Export",
    body: "Open Export after you record to download MP4 or MOV.",
    target: "export",
  },
  {
    id: "help",
    title: "Help",
    body: "Replay this tour any time from Help, Demo video.",
    target: "help",
  },
];

const AUTO_ADVANCE_MS = 7000;
const CURSOR_SIZE = 18;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function targetCenter(selector: string): { x: number; y: number } | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function WelcomeCard({
  onWatch,
  onSkip,
}: {
  onWatch: () => void;
  onSkip: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      >
        <h2
          id={titleId}
          className="text-xl font-semibold tracking-tight text-[var(--foreground)]"
        >
          Meet WebPuppet
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Make a character copy your face, right in your browser.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Your camera stays on your device. Nothing is uploaded.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] px-4 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
          >
            Skip, take me to the studio
          </button>
          <button
            type="button"
            onClick={onWatch}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-medium text-white transition hover:brightness-110"
          >
            Watch the tour
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoTour({
  open,
  onClose,
  onTryWithoutCamera,
}: {
  open: boolean;
  onClose: (finished: boolean) => void;
  onTryWithoutCamera: () => void;
}) {
  const titleId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [showCursor, setShowCursor] = useState(false);
  const tryCameraFired = useRef<string | null>(null);
  const total = TOUR_STEPS.length;
  const step = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];
  const progress = ((stepIndex + 1) / total) * 100;

  const finish = useCallback(
    (finished: boolean) => {
      onClose(finished);
    },
    [onClose],
  );

  const goNext = useCallback(() => {
    if (stepIndex >= total - 1) {
      finish(true);
      return;
    }
    setStepIndex((i) => i + 1);
  }, [finish, stepIndex, total]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  // Reset when opened
  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setPaused(false);
    tryCameraFired.current = null;
    setCursorPos(null);
    setShowCursor(false);
  }, [open]);

  // Esc closes without finishing
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish]);

  // Entering "try without camera" step
  useEffect(() => {
    if (!open) return;
    const current = TOUR_STEPS[stepIndex];
    if (!current?.tryWithoutCamera) return;
    if (tryCameraFired.current === current.id) return;
    tryCameraFired.current = current.id;
    onTryWithoutCamera();
  }, [open, stepIndex, onTryWithoutCamera]);

  // Cursor toward data-tour targets (skipped when reduced motion)
  useEffect(() => {
    if (!open || reducedMotion) {
      setShowCursor(false);
      return;
    }

    const current = TOUR_STEPS[stepIndex];
    if (!current?.target) {
      setShowCursor(false);
      return;
    }

    const selector = `[data-tour="${current.target}"]`;
    let cancelled = false;
    let raf = 0;

    const place = (animate: boolean) => {
      const center = targetCenter(selector);
      if (cancelled) return;
      if (!center) {
        setShowCursor(false);
        return;
      }
      setShowCursor(true);
      if (!animate || paused) {
        setCursorPos(center);
        return;
      }
      setCursorPos((prev) => prev ?? center);
      raf = requestAnimationFrame(() => {
        if (!cancelled) setCursorPos(center);
      });
    };

    place(true);
    const onLayout = () => place(false);
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, stepIndex, reducedMotion, paused]);

  // Auto advance when not paused
  useEffect(() => {
    if (!open || paused || reducedMotion) return;
    const timer = window.setTimeout(() => {
      goNext();
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [open, paused, reducedMotion, stepIndex, goNext]);

  if (!open) return null;

  const cursorStyle: CSSProperties | undefined =
    showCursor && cursorPos
      ? {
          left: cursorPos.x - CURSOR_SIZE / 2,
          top: cursorPos.y - CURSOR_SIZE / 2,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          transition: reducedMotion
            ? undefined
            : "left 450ms ease, top 450ms ease",
        }
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/55"
        aria-hidden="true"
        onClick={() => finish(false)}
      />

      {showCursor && cursorStyle ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-[91] rounded-full border-2 border-white bg-[var(--accent)] shadow-[0_0_0_4px_rgba(59,158,255,0.35)]"
          style={cursorStyle}
        />
      ) : null}

      <div className="relative z-[92] mx-auto mb-6 w-full max-w-lg px-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
          <div
            className="mb-3 h-1 overflow-hidden rounded-full bg-[var(--surface-4)]"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={stepIndex + 1}
            aria-label="Tour progress"
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs font-medium tracking-wide text-[var(--faint)] uppercase">
            {stepIndex + 1} of {total}
          </p>
          <h2
            id={titleId}
            className="mt-1 text-base font-semibold text-[var(--foreground)]"
          >
            {step.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
            {step.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => finish(false)}
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0}
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)] disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent)] px-3 text-sm font-medium text-white transition hover:brightness-110"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="ml-auto inline-flex h-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-[var(--foreground)]"
            >
              Pause
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
