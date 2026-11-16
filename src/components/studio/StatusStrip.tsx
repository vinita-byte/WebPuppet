"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import type { PipelineStatus, TrackingQuality } from "@/store/appStore";

function cameraLabel(status: PipelineStatus, demo: boolean): string {
  if (demo) return "Sample";
  if (status === "requesting-permissions" || status === "loading-model") {
    return "Starting";
  }
  if (status === "running") return "Live";
  if (status === "error") return "Blocked";
  if (status === "tracking-lost") return "Lost";
  return "Off";
}

function qualityLabel(q: TrackingQuality): string {
  if (q === "good") return "Good";
  if (q === "slow") return "Slow";
  return "Off";
}

export function StatusStrip({
  status,
  demoMode,
  trackingQuality,
  fps,
  savedLabel,
  characterName,
  sceneName,
  frameLabel,
}: {
  status: PipelineStatus;
  demoMode: boolean;
  trackingQuality: TrackingQuality;
  fps: number;
  savedLabel: string;
  characterName: string;
  sceneName: string;
  frameLabel: string;
}) {
  const items = [
    {
      label: "Camera",
      value: cameraLabel(status, demoMode),
      tip: "Camera state for face tracking",
    },
    {
      label: "Tracking",
      value: qualityLabel(trackingQuality),
      tip: "How steady face tracking feels right now",
    },
    {
      label: "FPS",
      value:
        status === "running" || status === "demo" ? String(fps || 0) : "-",
      tip: "Frames per second while tracking",
    },
    {
      label: "Puppet",
      value: characterName,
      tip: "Active puppet",
    },
    {
      label: "Scene",
      value: sceneName,
      tip: "Active scene background",
    },
    {
      label: "Frame",
      value: frameLabel,
      tip: "Stage frame ratio",
    },
    {
      label: "Saved",
      value: savedLabel,
      tip: "Session save state",
    },
  ];

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--muted)]"
      role="status"
      aria-live="polite"
    >
      {items.map((item) => (
        <Tooltip key={item.label} label={item.tip}>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[var(--faint)]">{item.label}</span>
            <span className="font-medium text-[var(--foreground)]">
              {item.value}
            </span>
          </span>
        </Tooltip>
      ))}
    </div>
  );
}
