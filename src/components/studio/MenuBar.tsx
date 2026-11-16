"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { CAST_CHARACTERS, LEGACY_CHARACTERS } from "@/puppets/registry";
import { SCENES } from "@/puppets/scenes";

export interface MenuBarActions {
  onNewSession: () => void;
  onSaveSession: () => void;
  onExportMp4: () => void;
  onExportMov: () => void;
  onExportJson: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearRecording: () => void;
  onZoom: (z: "fit" | 50 | 100 | 200) => void;
  onFrame: (mode: "landscape" | "portrait") => void;
  onToggleInspector: () => void;
  onToggleTimeline: () => void;
  onResetLayout: () => void;
  onFullscreen: () => void;
  onSelectCharacter: (id: string) => void;
  onSelectScene: (id: string) => void;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onTryWithoutCamera: () => void;
  onCalibrate: () => void;
  onRecord: () => void;
  onPlay: () => void;
  onStopPlayback: () => void;
  onDemoTour: () => void;
  onQuickStart: () => void;
  onShortcuts: () => void;
  onTrackingHelp: () => void;
  onSvgIdeas: () => void;
  onAbout: () => void;
  onReport: () => void;
}

export interface MenuBarProps extends MenuBarActions {
  statusPills?: ReactNode;
}

type MenuItem =
  | {
      kind: "action";
      id: string;
      label: string;
      shortcut?: string;
      hint?: string;
      disabled?: boolean;
      run: () => void;
    }
  | { kind: "separator"; id: string };

const MENU_LABELS = [
  "File",
  "Edit",
  "View",
  "Puppet",
  "Record",
  "Help",
] as const;

const CHARACTERS = [...CAST_CHARACTERS, ...LEGACY_CHARACTERS];

function buildMenus(actions: MenuBarActions): MenuItem[][] {
  return [
    [
      {
        kind: "action",
        id: "file-new",
        label: "New session",
        shortcut: "⌘N",
        run: actions.onNewSession,
      },
      {
        kind: "action",
        id: "file-open",
        label: "Open puppet",
        hint: "Coming soon",
        disabled: true,
        run: () => undefined,
      },
      {
        kind: "action",
        id: "file-save",
        label: "Save session",
        shortcut: "⌘S",
        run: actions.onSaveSession,
      },
      {
        kind: "action",
        id: "file-mp4",
        label: "Export video MP4",
        shortcut: "⌘E",
        run: actions.onExportMp4,
      },
      {
        kind: "action",
        id: "file-mov",
        label: "Export video MOV",
        shortcut: "⇧⌘E",
        run: actions.onExportMov,
      },
      {
        kind: "action",
        id: "file-json",
        label: "Export recording data JSON",
        run: actions.onExportJson,
      },
    ],
    [
      {
        kind: "action",
        id: "edit-undo",
        label: "Undo",
        shortcut: "⌘Z",
        run: actions.onUndo,
      },
      {
        kind: "action",
        id: "edit-redo",
        label: "Redo",
        shortcut: "⇧⌘Z",
        run: actions.onRedo,
      },
      {
        kind: "action",
        id: "edit-clear",
        label: "Clear recording",
        run: actions.onClearRecording,
      },
    ],
    [
      {
        kind: "action",
        id: "view-fit",
        label: "Zoom Fit",
        shortcut: "⌘0",
        run: () => actions.onZoom("fit"),
      },
      {
        kind: "action",
        id: "view-50",
        label: "Zoom 50",
        run: () => actions.onZoom(50),
      },
      {
        kind: "action",
        id: "view-100",
        label: "Zoom 100",
        shortcut: "⌘1",
        run: () => actions.onZoom(100),
      },
      {
        kind: "action",
        id: "view-200",
        label: "Zoom 200",
        shortcut: "⌘2",
        run: () => actions.onZoom(200),
      },
      {
        kind: "action",
        id: "view-169",
        label: "Frame 16:9",
        run: () => actions.onFrame("landscape"),
      },
      {
        kind: "action",
        id: "view-916",
        label: "Frame 9:16",
        run: () => actions.onFrame("portrait"),
      },
      {
        kind: "action",
        id: "view-inspector",
        label: "Show or hide Inspector",
        shortcut: "⌘I",
        run: actions.onToggleInspector,
      },
      {
        kind: "action",
        id: "view-timeline",
        label: "Show or hide Timeline",
        shortcut: "⌘T",
        run: actions.onToggleTimeline,
      },
      {
        kind: "action",
        id: "view-reset",
        label: "Reset layout",
        run: actions.onResetLayout,
      },
      {
        kind: "action",
        id: "view-fullscreen",
        label: "Full screen stage",
        shortcut: "F",
        run: actions.onFullscreen,
      },
    ],
    [
      ...CHARACTERS.map((c) => ({
        kind: "action" as const,
        id: `char-${c.id}`,
        label: c.shortName,
        run: () => actions.onSelectCharacter(c.id),
      })),
      { kind: "separator" as const, id: "puppet-sep" },
      ...SCENES.map((s) => ({
        kind: "action" as const,
        id: `scene-${s.id}`,
        label: `Scene: ${s.shortName}`,
        run: () => actions.onSelectScene(s.id),
      })),
    ],
    [
      {
        kind: "action",
        id: "rec-start",
        label: "Start tracking",
        shortcut: "⌘R",
        run: actions.onStartTracking,
      },
      {
        kind: "action",
        id: "rec-stop",
        label: "Stop tracking",
        shortcut: "⌘.",
        run: actions.onStopTracking,
      },
      {
        kind: "action",
        id: "rec-demo",
        label: "Try without a camera",
        run: actions.onTryWithoutCamera,
      },
      {
        kind: "action",
        id: "rec-calibrate",
        label: "Calibrate neutral",
        shortcut: "C",
        run: actions.onCalibrate,
      },
      {
        kind: "action",
        id: "rec-take",
        label: "Record take",
        shortcut: "R",
        run: actions.onRecord,
      },
      {
        kind: "action",
        id: "rec-play",
        label: "Play",
        shortcut: "Space",
        run: actions.onPlay,
      },
      {
        kind: "action",
        id: "rec-stop-play",
        label: "Stop",
        shortcut: "Esc",
        run: actions.onStopPlayback,
      },
    ],
    [
      {
        kind: "action",
        id: "help-demo",
        label: "Demo video",
        run: actions.onDemoTour,
      },
      {
        kind: "action",
        id: "help-quick",
        label: "Quick start",
        run: actions.onQuickStart,
      },
      {
        kind: "action",
        id: "help-keys",
        label: "Keyboard shortcuts",
        shortcut: "?",
        run: actions.onShortcuts,
      },
      {
        kind: "action",
        id: "help-tracking",
        label: "How tracking works",
        run: actions.onTrackingHelp,
      },
      {
        kind: "action",
        id: "help-svg",
        label: "SVG character ideas",
        run: actions.onSvgIdeas,
      },
      {
        kind: "action",
        id: "help-about",
        label: "About WebPuppet",
        run: actions.onAbout,
      },
      {
        kind: "action",
        id: "help-report",
        label: "Report a problem",
        run: actions.onReport,
      },
    ],
  ];
}

function actionItems(items: MenuItem[]): Extract<MenuItem, { kind: "action" }>[] {
  return items.filter(
    (item): item is Extract<MenuItem, { kind: "action" }> =>
      item.kind === "action",
  );
}

function MenuItemRow({
  item,
  focused,
  itemRef,
  onFocus,
  onHover,
  onActivate,
}: {
  item: Extract<MenuItem, { kind: "action" }>;
  focused: boolean;
  itemRef: (el: HTMLButtonElement | null) => void;
  onFocus: () => void;
  onHover: () => void;
  onActivate: () => void;
}) {
  return (
    <button
      ref={itemRef}
      type="button"
      role="menuitem"
      tabIndex={focused ? 0 : -1}
      aria-disabled={item.disabled ? true : undefined}
      onFocus={onFocus}
      onMouseEnter={onHover}
      onClick={() => {
        if (item.disabled) return;
        onActivate();
      }}
    >
      <span>{item.label}</span>
      {item.shortcut ? <span className="wp-kbd">{item.shortcut}</span> : null}
      {!item.shortcut && item.hint ? (
        <span className="wp-kbd">{item.hint}</span>
      ) : null}
    </button>
  );
}

export function MenuBar(props: MenuBarProps) {
  const { statusPills, ...actions } = props;
  const menus = buildMenus(actions);
  const baseId = useId();

  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [focusMenu, setFocusMenu] = useState(0);
  const [focusItem, setFocusItem] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<number | null>(null);

  const rootRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeMenus = useCallback(() => {
    setOpenMenu(null);
    setFocusItem(0);
  }, []);

  const openAt = useCallback((index: number) => {
    setOpenMenu(index);
    setFocusMenu(index);
    setFocusItem(0);
  }, []);

  const runItem = useCallback(
    (menuIndex: number, itemIndex: number) => {
      const items = actionItems(menus[menuIndex] ?? []);
      const item = items[itemIndex];
      if (!item || item.disabled) return;
      item.run();
      closeMenus();
      setMobileOpen(false);
      setMobileSection(null);
    },
    [closeMenus, menus],
  );

  useEffect(() => {
    if (openMenu === null) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [closeMenus, openMenu]);

  useEffect(() => {
    if (openMenu === null) return;
    const items = actionItems(menus[openMenu] ?? []);
    const el = itemRefs.current[Math.min(focusItem, items.length - 1)];
    el?.focus();
  }, [focusItem, menus, openMenu]);

  const onMenuButtonKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const last = MENU_LABELS.length - 1;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = index === last ? 0 : index + 1;
      setFocusMenu(next);
      buttonRefs.current[next]?.focus();
      if (openMenu !== null) openAt(next);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = index === 0 ? last : index - 1;
      setFocusMenu(next);
      buttonRefs.current[next]?.focus();
      if (openMenu !== null) openAt(next);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(index);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenus();
      buttonRefs.current[index]?.focus();
    }
  };

  const onMenuListKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    menuIndex: number,
  ) => {
    const items = actionItems(menus[menuIndex] ?? []);
    if (items.length === 0) return;
    const last = items.length - 1;
    const lastMenu = MENU_LABELS.length - 1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusItem((i) => (i >= last ? 0 : i + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusItem((i) => (i <= 0 ? last : i - 1));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setFocusItem(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setFocusItem(last);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = menuIndex === lastMenu ? 0 : menuIndex + 1;
      openAt(next);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = menuIndex === 0 ? lastMenu : menuIndex - 1;
      openAt(next);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      runItem(menuIndex, focusItem);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenus();
      buttonRefs.current[menuIndex]?.focus();
    }
  };

  return (
    <header
      ref={rootRef}
      className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-3"
    >
      <div className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--foreground)]">
        WebPuppet
      </div>

      <nav
        className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
        role="menubar"
        aria-label="Studio menu"
      >
        {MENU_LABELS.map((label, index) => {
          const menuId = `${baseId}-menu-${index}`;
          const buttonId = `${baseId}-btn-${index}`;
          const isOpen = openMenu === index;
          const items = menus[index] ?? [];
          let actionIndex = 0;

          return (
            <div key={label} className="relative">
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                id={buttonId}
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? menuId : undefined}
                tabIndex={focusMenu === index ? 0 : -1}
                className={`rounded-[var(--radius-control)] px-2.5 py-1.5 text-sm ${
                  isOpen
                    ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => {
                  if (isOpen) closeMenus();
                  else openAt(index);
                }}
                onFocus={() => setFocusMenu(index)}
                onKeyDown={(event) => onMenuButtonKeyDown(event, index)}
                onMouseEnter={() => {
                  if (openMenu !== null) openAt(index);
                }}
              >
                {label}
              </button>

              {isOpen ? (
                <div
                  id={menuId}
                  role="menu"
                  aria-labelledby={buttonId}
                  className="wp-menu absolute top-full left-0 z-50 mt-1 max-h-[min(70vh,32rem)] overflow-y-auto"
                  onKeyDown={(event) => onMenuListKeyDown(event, index)}
                >
                  {items.map((item) => {
                    if (item.kind === "separator") {
                      return (
                        <div
                          key={item.id}
                          role="separator"
                          className="my-1 h-px bg-[var(--border)]"
                        />
                      );
                    }
                    const itemIndex = actionIndex;
                    actionIndex += 1;
                    return (
                      <MenuItemRow
                        key={item.id}
                        item={item}
                        focused={focusItem === itemIndex}
                        itemRef={(el) => {
                          itemRefs.current[itemIndex] = el;
                        }}
                        onFocus={() => setFocusItem(itemIndex)}
                        onHover={() => setFocusItem(itemIndex)}
                        onActivate={() => runItem(index, itemIndex)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {statusPills ? (
          <div className="hidden items-center gap-2 lg:flex">{statusPills}</div>
        ) : null}

        <button
          type="button"
          className="rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls={`${baseId}-sheet`}
          onClick={() => setMobileOpen((open) => !open)}
        >
          Menu
        </button>
      </div>

      {mobileOpen ? (
        <div
          id={`${baseId}-sheet`}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--surface-1)] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Studio menu"
        >
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--border)] px-3">
            <div className="font-[family-name:var(--font-display)] text-lg tracking-tight">
              WebPuppet
            </div>
            <button
              type="button"
              className="rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-1.5 text-sm"
              onClick={() => {
                setMobileOpen(false);
                setMobileSection(null);
              }}
            >
              Close
            </button>
          </div>

          {statusPills ? (
            <div className="flex flex-wrap gap-2 border-b border-[var(--border)] px-3 py-2">
              {statusPills}
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto p-2">
            {MENU_LABELS.map((label, index) => {
              const expanded = mobileSection === index;
              const items = menus[index] ?? [];
              return (
                <div
                  key={label}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium text-[var(--foreground)]"
                    aria-expanded={expanded}
                    onClick={() =>
                      setMobileSection((current) =>
                        current === index ? null : index,
                      )
                    }
                  >
                    <span>{label}</span>
                    <span className="text-[var(--muted)]" aria-hidden>
                      {expanded ? "-" : "+"}
                    </span>
                  </button>
                  {expanded ? (
                    <div className="wp-menu mb-2 w-full border-0 bg-transparent p-0 shadow-none">
                      {items.map((item) => {
                        if (item.kind === "separator") {
                          return (
                            <div
                              key={item.id}
                              role="separator"
                              className="my-1 h-px bg-[var(--border)]"
                            />
                          );
                        }
                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="menuitem"
                            aria-disabled={item.disabled ? true : undefined}
                            onClick={() => {
                              if (item.disabled) return;
                              item.run();
                              setMobileOpen(false);
                              setMobileSection(null);
                            }}
                          >
                            <span>{item.label}</span>
                            {item.shortcut ? (
                              <span className="wp-kbd">{item.shortcut}</span>
                            ) : null}
                            {!item.shortcut && item.hint ? (
                              <span className="wp-kbd">{item.hint}</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
