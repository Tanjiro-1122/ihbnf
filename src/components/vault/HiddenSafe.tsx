"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/content/site";
import { advanceProgress, SAFE_FOUND } from "./progress";
import styles from "./studyVault.module.css";

type Sound = "key" | "reject" | "bolt" | "door" | "entry";
const combination = "45425";
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

export function HiddenSafe({ unlocked, lampOn, sound, onClose }: {
  unlocked: boolean;
  lampOn: boolean;
  sound: (cue: Sound, offset?: number) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const passage = useRef<HTMLButtonElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(0);
  const [code, setCode] = useState("");
  const [failed, setFailed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [entering, setEntering] = useState(false);
  const [ready, setReady] = useState(unlocked);

  useEffect(() => {
    const panel = dialog.current;
    panel?.showModal();
    return () => {
      window.clearTimeout(timer.current);
      panel?.close();
    };
  }, []);

  // A second tab can solve the combination while this inspection is open.
  const canEnter = unlocked && (ready || !opening);

  function turnKey(key: string) {
    if (unlocked || opening) return;
    if (key === "Enter") {
      if (code.length !== combination.length) return;
      if (code !== combination) {
        sound("reject");
        setFailed(true);
        setCode("");
        return;
      }
      setOpening(true);
      advanceProgress(SAFE_FOUND);
      sound("bolt");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sound("door", reduced ? 0 : .48);
      timer.current = window.setTimeout(() => {
        setReady(true);
        requestAnimationFrame(() => passage.current?.focus());
      }, reduced ? 0 : 1480);
      return;
    }
    if (key !== "Backspace" && code.length >= combination.length) return;
    sound("key");
    setFailed(false);
    setCode(key === "Backspace" ? code.slice(0, -1) : code + key);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    const key = event.key;
    if (digits.includes(key) || key === "Backspace") {
      event.preventDefault();
      turnKey(key);
      if (!unlocked && digits.includes(key) && code.length === combination.length - 1) {
        submit.current?.focus({ preventScroll: true });
      }
    }
    if (key === "Enter" && event.target === event.currentTarget && !unlocked) {
      event.preventDefault();
      turnKey(key);
    }
  }

  function enter() {
    if (entering) return;
    setEntering(true);
    sound("entry");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => router.push("/vault"), reduced ? 0 : 760);
  }

  return (
    <dialog
      ref={dialog}
      className={styles.inspection}
      aria-labelledby="hidden-safe-title"
      data-entering={entering}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        if (!entering) onClose();
      }}
    >
      <div className={styles.inspectionHeader}>
        <h2 id="hidden-safe-title">The concealed safe</h2>
        <button type="button" autoFocus onClick={onClose} disabled={entering} className={styles.leave}>
          Step back <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className={styles.inspectionBody}>
        <div className={styles.mechanism} data-open={unlocked} data-opening={opening}>
          <button
            ref={passage}
            className={styles.passage}
            type="button"
            disabled={!canEnter || entering}
            tabIndex={canEnter ? 0 : -1}
            aria-hidden={!canEnter}
            onClick={enter}
          >
            <span>Enter the passage <span aria-hidden="true">→</span></span>
          </button>
          <div className={styles.safeDoor} inert={unlocked}>
            <div className={styles.doorFace}>
              <div className={styles.bolt} aria-hidden="true" />
              <div className={styles.lockAssembly}>
                <output className={styles.counter} aria-label={`${code.length} of five digits entered`}>
                  <span aria-hidden="true">{code.padEnd(5, "·").split("").join(" ")}</span>
                </output>
                <div className={styles.keypad} aria-label="Combination keypad" role="group">
                  {digits.slice(0, 9).map((digit) => (
                    <button key={digit} type="button" onClick={() => turnKey(digit)}>{digit}</button>
                  ))}
                  <button type="button" aria-label="Erase last digit" onClick={() => turnKey("Backspace")}>⌫</button>
                  <button type="button" onClick={() => turnKey("0")}>0</button>
                  <button ref={submit} type="button" aria-label="Try combination" aria-disabled={code.length !== 5} onClick={() => turnKey("Enter")}>↵</button>
                </div>
                <p className={styles.lockStatus} role="status">{failed ? "The bolt holds. Try again." : "Five tumblers"}</p>
              </div>
              <div className={styles.wheel} aria-hidden="true"><i /><i /><i /></div>
            </div>
          </div>
        </div>
        <aside className={styles.clue} aria-label="Inscription beside the safe">
          <div aria-hidden="true" className={styles.cluePortrait} data-lit={lampOn} />
          <blockquote>{site.motto}</blockquote>
          <p>Five words. Each has its measure. Read them as they were written.</p>
          <details>
            <summary>A closer look</summary>
            <p>Count the letters in each word on the frame. Give each word one tumbler, from left to right.</p>
          </details>
        </aside>
      </div>
      <span className="sr-only" role="status">{unlocked ? "The safe is unlocked." : ""}</span>
    </dialog>
  );
}
