"use client";

export function StageMark({
  className = "h-7 w-7",
  title = "Stage",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="64" height="64" rx="14" fill="var(--surface-3)" />
      <path
        d="M10 14c8 0 12 6 22 6s14-6 22-6v8c-8 0-12 5-22 5S18 22 10 22V14Z"
        fill="var(--record)"
        opacity="0.9"
      />
      <path
        d="M10 50c8 0 12-6 22-6s14 6 22 6v-8c-8 0-12-5-22-5S18 42 10 42v8Z"
        fill="var(--record)"
        opacity="0.9"
      />
      <circle cx="32" cy="32" r="11" fill="var(--accent)" />
      <circle cx="32" cy="32" r="5.5" fill="#fff8e7" />
    </svg>
  );
}

export function StageLogo({
  className = "",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <StageMark className="h-7 w-7 shrink-0" />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--foreground)]">
          Stage
        </span>
      ) : null}
    </div>
  );
}
