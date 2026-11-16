"use client";

import { create } from "zustand";

export type ThemeMode = "dark" | "light" | "system";

const STORAGE_KEY = "stage.theme";

function resolveTheme(mode: ThemeMode): "dark" | "light" {
  if (mode === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(mode);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  cycle: () => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "dark",

  setMode: (mode) => {
    set({ mode });
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
    applyTheme(mode);
  },

  cycle: () => {
    const order: ThemeMode[] = ["dark", "light", "system"];
    const next = order[(order.indexOf(get().mode) + 1) % order.length];
    get().setMode(next);
  },

  hydrate: () => {
    let mode: ThemeMode = "dark";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light" || saved === "system") {
        mode = saved;
      }
    } catch {
      // ignore
    }
    set({ mode });
    applyTheme(mode);
  },
}));
