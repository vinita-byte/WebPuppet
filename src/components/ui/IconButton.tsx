"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "./Tooltip";

export function IconButton({
  label,
  shortcut,
  active,
  tone = "default",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  shortcut?: string;
  active?: boolean;
  tone?: "default" | "record" | "accent";
  children: ReactNode;
}) {
  const toneClass =
    tone === "record"
      ? active
        ? "bg-[var(--record-soft)] text-[var(--record)]"
        : "text-[var(--record)] hover:bg-[var(--record-soft)]"
      : tone === "accent"
        ? active
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--accent)] hover:bg-[var(--accent-soft)]"
        : active
          ? "bg-[var(--accent-soft)] text-white"
          : "text-[var(--muted)] hover:bg-white/5 hover:text-white";

  return (
    <Tooltip label={label} shortcut={shortcut}>
      <button
        type="button"
        aria-label={label}
        title={shortcut ? `${label} (${shortcut})` : label}
        className={`inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-control)] border border-transparent px-2 transition duration-150 ${toneClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}
