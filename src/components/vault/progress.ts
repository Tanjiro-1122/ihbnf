"use client";

import { useSyncExternalStore } from "react";

export const COMPASS_READY = 7;
export const RUNE_READY = 12;
export const SAFE_FOUND = 13;
export const VAULT_UNLOCKED = 14;

const key = "ihbnf.study-vault.v1";
const change = "ihbnf-vault-progress";
let temporaryProgress = 0;

// The puzzle is a per-visit Easter egg, not an account unlock.
// Older releases saved a permanent localStorage flag. Clear it so that an
// earlier unlock can never silently carry into this visit.
function clearLegacyProgress() {
  try { localStorage.removeItem(key); } catch { /* Storage may be disabled. */ }
}

export function readProgress() {
  if (typeof window === "undefined") return 0;
  clearLegacyProgress();
  try {
    const value = Number(sessionStorage.getItem(key));
    return Number.isInteger(value) && value >= 0 && value <= VAULT_UNLOCKED
      ? value : 0;
  } catch {
    return temporaryProgress;
  }
}

function saveProgress(value: number) {
  temporaryProgress = value;
  clearLegacyProgress();
  try {
    if (value === 0) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, String(value));
  } catch {
    // Keep the puzzle functional during this page when storage is blocked.
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
  // A page exit (closing the tab, navigating to another website, or reloading)
  // ends the puzzle visit. Client-side navigation between / and /vault does not
  // unload the document, so the unlocked vault remains accessible.
  const leave = () => {
    temporaryProgress = 0;
    try { sessionStorage.removeItem(key); } catch { /* Storage blocked. */ }
    clearLegacyProgress();
  };
  // A bfcache restore can bring back React state without remounting; notify
  // subscribers to reread the now-reset progress.
  const returnFromHistory = () => listener();
  window.addEventListener(change, listener);
  window.addEventListener("storage", storage);
  window.addEventListener("pagehide", leave);
  window.addEventListener("pageshow", returnFromHistory);
  return () => {
    window.removeEventListener(change, listener);
    window.removeEventListener("storage", storage);
    window.removeEventListener("pagehide", leave);
    window.removeEventListener("pageshow", returnFromHistory);
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
