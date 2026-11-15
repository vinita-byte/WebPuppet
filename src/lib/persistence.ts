"use client";

import type { BehaviorKey } from "@/store/appStore";
import type { CalibrationOffsets, Keyframe } from "@/store/types";

const DB_NAME = "webpuppet";
const DB_VERSION = 1;
const STORE = "app";

export interface PersistedSettings {
  version: 1;
  characterId: string;
  behaviors: Record<BehaviorKey, boolean>;
  calibration: CalibrationOffsets;
  loop: boolean;
  updatedAt: number;
}

export interface PersistedRecording {
  version: 1;
  keyframes: Keyframe[];
  durationMs: number;
  characterId: string;
  updatedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB put failed"));
  });
}

export async function loadSettings(): Promise<PersistedSettings | null> {
  try {
    return await idbGet<PersistedSettings>("settings");
  } catch {
    return null;
  }
}

export async function saveSettings(settings: PersistedSettings): Promise<void> {
  try {
    await idbSet("settings", settings);
  } catch {
    // Persistence is best effort
  }
}

export async function loadRecording(): Promise<PersistedRecording | null> {
  try {
    return await idbGet<PersistedRecording>("recording");
  } catch {
    return null;
  }
}

export async function saveRecording(
  recording: PersistedRecording,
): Promise<void> {
  try {
    await idbSet("recording", recording);
  } catch {
    // Persistence is best effort
  }
}
