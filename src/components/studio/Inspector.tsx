"use client";

import { CAST_CHARACTERS, LEGACY_CHARACTERS } from "@/puppets/registry";
import { ASPECT_PRESETS, SCENES } from "@/puppets/scenes";
import {
  DEFAULT_BEHAVIORS,
  useAppStore,
  type BehaviorKey,
} from "@/store/appStore";
import { useLayoutStore, type InspectorTab } from "@/store/layoutStore";
import { usePuppetStore } from "@/store/puppetStore";
import { useSceneStore } from "@/store/sceneStore";
import { ScenePicker } from "./ScenePicker";

const BEHAVIOR_LABELS: { key: BehaviorKey; label: string; tip: string }[] = [
  { key: "headTracking", label: "Head tracking", tip: "Turn the head with your face" },
  { key: "blink", label: "Blink from face", tip: "Blink when you blink" },
  { key: "autoBlink", label: "Auto blink", tip: "Soft blinks when idle" },
  { key: "eyeGaze", label: "Eye gaze", tip: "Eyes follow your look" },
  { key: "lipSync", label: "Lip sync", tip: "Mouth follows speech" },
  { key: "nutcrackerJaw", label: "Jaw open", tip: "Lower jaw drops with mouth open" },
  { key: "breathe", label: "Breathe", tip: "Gentle idle breathing" },
  { key: "physics", label: "Soft physics", tip: "Hair and cloth sway" },
  { key: "walk", label: "Walk cycle", tip: "Idle walk loop" },
  { key: "dragger", label: "Dragger", tip: "Drag limbs on stage" },
];

const TABS: { id: InspectorTab; label: string }[] = [
  { id: "puppet", label: "Puppet" },
  { id: "behaviors", label: "Behaviors" },
  { id: "frame", label: "Frame" },
];

export function Inspector({ className = "" }: { className?: string }) {
  const tab = useLayoutStore((s) => s.inspectorTab);
  const setTab = useLayoutStore((s) => s.setInspectorTab);
  const setOpen = useLayoutStore((s) => s.setInspectorOpen);
  const characterId = usePuppetStore((s) => s.characterId);
  const setCharacter = usePuppetStore((s) => s.setCharacter);
  const behaviors = useAppStore((s) => s.behaviors);
  const toggleBehavior = useAppStore((s) => s.toggleBehavior);
  const setBehaviors = useAppStore((s) => s.setBehaviors);
  const aspectMode = useSceneStore((s) => s.aspectMode);
  const setAspectMode = useSceneStore((s) => s.setAspectMode);
  const sceneId = useSceneStore((s) => s.sceneId);
  const setScene = useSceneStore((s) => s.setScene);
  const showSafeArea = useLayoutStore((s) => s.showSafeArea);
  const setShowSafeArea = useLayoutStore((s) => s.setShowSafeArea);

  const puppets = [...CAST_CHARACTERS, ...LEGACY_CHARACTERS];

  return (
    <aside
      className={`flex min-h-0 w-full flex-col border-l border-[var(--border)] bg-[var(--surface-2)] ${className}`}
      aria-label="Inspector"
    >
      <div className="sticky top-0 z-10 flex shrink-0 items-center gap-1 border-b border-[var(--border)] bg-[var(--surface-2)] p-2">
        <div className="flex min-w-0 flex-1 gap-1" role="tablist" aria-label="Inspector tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tour={t.id === "puppet" ? "puppet-tab" : undefined}
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-11 flex-1 rounded-[var(--radius-control)] px-2 text-sm ${
                tab === t.id
                  ? "bg-[var(--accent-soft)] text-white"
                  : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Hide inspector"
          title="Hide inspector"
          onClick={() => setOpen(false)}
          className="hidden h-11 w-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--muted)] hover:bg-white/5 hover:text-white xl:inline-flex"
        >
          ×
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3" role="tabpanel">
        {tab === "puppet" ? (
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-sm font-medium text-white">Puppets</h2>
              <div className="grid grid-cols-2 gap-2">
                {puppets.map((c) => {
                  const active = c.id === characterId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={`Select ${c.name}`}
                      aria-pressed={active}
                      onClick={() => setCharacter(c.id)}
                      className={`min-h-11 rounded-[var(--radius-card)] border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--surface-1)] hover:bg-white/5"
                      }`}
                    >
                      <span
                        className="mb-1.5 block h-8 w-full rounded-[var(--radius-control)]"
                        style={{
                          background: `linear-gradient(135deg, ${c.accent}, ${c.accent}55)`,
                        }}
                        aria-hidden
                      />
                      <span className="block text-sm font-medium text-white">
                        {c.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-medium text-white">
                Scene background
              </h2>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  aria-pressed={sceneId === "none"}
                  onClick={() => setScene(SCENES[0]?.id ?? "cloudtop-weather")}
                  className="sr-only"
                >
                  Keep scene
                </button>
              </div>
              <ScenePicker />
            </div>
          </div>
        ) : null}

        {tab === "behaviors" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-white">Behaviors</h2>
              <button
                type="button"
                onClick={() => setBehaviors({ ...DEFAULT_BEHAVIORS })}
                className="min-h-11 rounded-[var(--radius-control)] border border-[var(--border)] px-3 text-sm text-[var(--muted)] hover:bg-white/5 hover:text-white"
              >
                Reset defaults
              </button>
            </div>
            {BEHAVIOR_LABELS.map(({ key, label, tip }) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-2"
                title={tip}
              >
                <span>
                  <span className="block text-sm text-white">{label}</span>
                  <span className="block text-xs text-[var(--faint)]">{tip}</span>
                </span>
                <input
                  type="checkbox"
                  checked={behaviors[key]}
                  onChange={() => toggleBehavior(key)}
                  className="h-5 w-5 accent-[var(--accent)]"
                  aria-label={label}
                />
              </label>
            ))}
          </div>
        ) : null}

        {tab === "frame" ? (
          <div className="space-y-4">
            <div>
              <h2 className="mb-2 text-sm font-medium text-white">Frame</h2>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-label="Frame ratio"
              >
                {(Object.keys(ASPECT_PRESETS) as Array<keyof typeof ASPECT_PRESETS>).map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={aspectMode === mode}
                      onClick={() => setAspectMode(mode)}
                      className={`min-h-11 rounded-[var(--radius-control)] border px-3 text-sm ${
                        aspectMode === mode
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-white"
                          : "border-[var(--border)] text-[var(--muted)] hover:bg-white/5"
                      }`}
                    >
                      {ASPECT_PRESETS[mode].label}
                    </button>
                  ),
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Record horizontal 16:9 or vertical 9:16. The stage always fits
                inside its frame.
              </p>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-[var(--radius-card)] border border-[var(--border)] px-3 py-2">
              <span className="text-sm text-white">Safe area guides</span>
              <input
                type="checkbox"
                checked={showSafeArea}
                onChange={(e) => setShowSafeArea(e.target.checked)}
                className="h-5 w-5 accent-[var(--accent)]"
                aria-label="Safe area guides"
              />
            </label>
            <div>
              <h2 className="mb-2 text-sm font-medium text-white">Background</h2>
              <ScenePicker />
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
