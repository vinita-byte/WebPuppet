"use client";

import { useEffect } from "react";
import { usePuppetStore } from "@/store/puppetStore";

/** Wire Character Animator–style keyboard triggers for the active puppet. */
export function useKeyboardTriggers(): void {
  const characterId = usePuppetStore((s) => s.characterId);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const { character, setTrigger, toggleTrigger } =
        usePuppetStore.getState();
      const key = e.key.toLowerCase();
      const trigger = character.triggers.find((t) => t.key === key);
      if (!trigger) return;
      e.preventDefault();
      if (trigger.mode === "toggle") {
        if (!e.repeat) toggleTrigger(trigger.id);
      } else {
        setTrigger(trigger.id, true);
      }
    };

    const onUp = (e: KeyboardEvent) => {
      const { character, setTrigger } = usePuppetStore.getState();
      const key = e.key.toLowerCase();
      const trigger = character.triggers.find((t) => t.key === key);
      if (!trigger || trigger.mode !== "hold") return;
      setTrigger(trigger.id, false);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [characterId]);
}
