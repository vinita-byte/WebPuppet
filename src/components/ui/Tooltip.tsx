"use client";

import { useId, useState, type ReactNode } from "react";

export function Tooltip({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span role="tooltip" id={id} className="wp-tooltip absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap">
          {label}
          {shortcut ? <span className="wp-kbd ml-2">{shortcut}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
