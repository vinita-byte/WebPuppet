"use client";

import { IconButton } from "@/components/ui/IconButton";

export function ToolStrip({
  cameraOn,
  demoOn,
  canCalibrate,
  recording,
  onCamera,
  onTryWithoutCamera,
  onCalibrate,
  onRecord,
}: {
  cameraOn: boolean;
  demoOn: boolean;
  canCalibrate: boolean;
  recording: boolean;
  onCamera: () => void;
  onTryWithoutCamera: () => void;
  onCalibrate: () => void;
  onRecord: () => void;
}) {
  return (
    <nav
      className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-[var(--border)] bg-[var(--surface-2)] py-2 md:flex"
      aria-label="Primary tools"
    >
      <IconButton
        label={cameraOn ? "Stop camera" : "Start camera"}
        shortcut="T"
        active={cameraOn}
        tone="accent"
        onClick={onCamera}
      >
        <CameraIcon />
      </IconButton>
      <IconButton
        label="Try without a camera"
        shortcut=""
        active={demoOn}
        data-tour="try-without-camera"
        onClick={onTryWithoutCamera}
      >
        <DemoIcon />
      </IconButton>
      <IconButton
        label="Calibrate neutral"
        shortcut="C"
        disabled={!canCalibrate}
        onClick={onCalibrate}
      >
        <CalibrateIcon />
      </IconButton>
      <IconButton
        label={recording ? "Stop recording" : "Record take"}
        shortcut="R"
        active={recording}
        tone="record"
        data-tour="record"
        onClick={onRecord}
      >
        <RecordIcon />
      </IconButton>
    </nav>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h7A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 15.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 10.5 20 8v8l-4-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DemoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" />
    </svg>
  );
}

function CalibrateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RecordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
