"use client";

import type { ReactNode } from "react";
import { SvgIdeasPanel } from "./SvgIdeasPanel";

export type HelpModalId =
  | "quickstart"
  | "shortcuts"
  | "tracking"
  | "svg"
  | "about"
  | null;

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2
            id="help-modal-title"
            className="font-[family-name:var(--font-display)] text-xl text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--muted)] hover:bg-white/5 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function HelpModals({
  id,
  onClose,
}: {
  id: HelpModalId;
  onClose: () => void;
}) {
  if (!id) return null;

  if (id === "quickstart") {
    return (
      <ModalShell title="Quick start" onClose={onClose}>
        <ol className="list-decimal space-y-2 pl-5 text-[var(--foreground)]">
          <li>Pick a puppet in the Puppet tab.</li>
          <li>Press Try without a camera, or Start camera then Calibrate.</li>
          <li>Record a take, scrub the timeline, then Export as MP4 or MOV.</li>
        </ol>
        <p>
          Your camera stays on your device. Nothing is uploaded. Replay the
          guided tour any time from Help, Demo video.
        </p>
      </ModalShell>
    );
  }

  if (id === "shortcuts") {
    return (
      <ModalShell title="Keyboard shortcuts" onClose={onClose}>
        <ul className="space-y-2 text-[var(--foreground)]">
          <li>
            <span className="wp-kbd">Space</span> Play or pause
          </li>
          <li>
            <span className="wp-kbd">R</span> Record
          </li>
          <li>
            <span className="wp-kbd">S</span> Stop
          </li>
          <li>
            <span className="wp-kbd">C</span> Calibrate
          </li>
          <li>
            <span className="wp-kbd">T</span> Toggle tracking
          </li>
          <li>
            <span className="wp-kbd">F</span> Fit stage
          </li>
          <li>
            <span className="wp-kbd">Ctrl/Cmd+Z</span> Undo
          </li>
          <li>
            <span className="wp-kbd">Ctrl/Cmd+Shift+Z</span> Redo
          </li>
          <li>
            <span className="wp-kbd">Ctrl/Cmd+E</span> Export
          </li>
          <li>
            <span className="wp-kbd">?</span> Open shortcuts
          </li>
        </ul>
      </ModalShell>
    );
  }

  if (id === "tracking") {
    return (
      <ModalShell title="How tracking works" onClose={onClose}>
        <p className="text-[var(--foreground)]">
          Face tracking runs entirely in your browser. Video from your camera is
          processed on your device and never sent to a server.
        </p>
        <p>
          For best results, sit in even light, look straight ahead, then press
          Calibrate. If tracking feels slow, close other tabs that use the
          camera or GPU.
        </p>
      </ModalShell>
    );
  }

  if (id === "svg") {
    return (
      <ModalShell title="SVG character ideas" onClose={onClose}>
        <SvgIdeasPanel />
      </ModalShell>
    );
  }

  return (
    <ModalShell title="About WebPuppet" onClose={onClose}>
      <p className="text-[var(--foreground)]">
        WebPuppet is a face puppet studio that runs in your browser. Make a
        character copy your face, record a take, and export video without leaving
        this page.
      </p>
      <p>
        Built with Next.js, Pixi.js, and on device face tracking. Report a
        problem on the project repository if something breaks.
      </p>
    </ModalShell>
  );
}
