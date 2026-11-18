"use client";

import { useSyncExternalStore } from "react";

export const COMPASS_READY = 7;
export const RUNE_READY = 12;
export const SAFE_FOUND = 13;
export const VAULT_UNLOCKED = 14;

const key = "ihbnf.study-vault.v1";
const change = "ihbnf-vault-progress";
let temporaryProgress = 0;

export function readProgress() {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isInteger(value) && value >= 0 && value <= VAULT_UNLOCKED ? value : 0;
  } catch {
    return temporaryProgress;
  }
}

function saveProgress(value: number) {
  temporaryProgress = value;
  try {
    if (value === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, String(value));
  } catch {
    // Keep the experience playable for the current page when storage is blocked.
  }
  window.dispatchEvent(new Event(change));
}

export function advanceProgress(from: number) {
  if (readProgress() !== from || from >= VAULT_UNLOCKED) return false;
  saveProgress(from + 1);
  return true;
}

function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener(change, listener);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(change, listener);
    window.removeEventListener("storage", storage);
  };
}

export function useVaultProgress() {
  return useSyncExternalStore(subscribe, readProgress, () => 0);
}

export function installDevReset() {
  if (process.env.NODE_ENV !== "development") return;
  const reset = () => {
    saveProgress(0);
    window.location.replace("/");
  };
  const dev = window as Window & { resetStudyVault?: () => void };
  dev.resetStudyVault = reset;
  return () => { delete dev.resetStudyVault; };
}
