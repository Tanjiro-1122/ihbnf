"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/content/site";
import { advanceProgress, SAFE_FOUND } from "./progress";
import styles from "./studyVault.module.css";

type Sound = "key" | "reject" | "dial" | "ratchet" | "bolt" | "door" | "entry";
type Phase = "locked" | "dialing" | "bolts" | "swinging" | "open";
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
  const timers = useRef<number[]>([]);
  const [code, setCode] = useState("");
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>(unlocked ? "open" : "locked");
  const [entering, setEntering] = useState(false);
  const [ready, setReady] = useState(unlocked);

  useEffect(() => {
    const panel = dialog.current;
    panel?.showModal();
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      panel?.close();
    };
  }, []);

  // A second tab can solve the combination while this inspection is open.
  const canEnter = unlocked && ready && phase === "open";

  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  };

  function turnKey(key: string) {
    if (unlocked || phase !== "locked") return;
    if (key === "Enter") {
      if (code.length !== combination.length) return;
      if (code !== combination) {
        sound("reject");
        setFailed(true);
        setCode("");
        return;
      }
      // One code submission starts the entire physical release. Never force a
      // second click on the wheel (the study already had that UX regression).
      if (!advanceProgress(SAFE_FOUND)) {
        setFailed(true);
        setCode("");
        return;
      }
      setFailed(false);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        sound("bolt");
        sound("door", .1);
        setPhase("open");
        setReady(true);
        schedule(() => passage.current?.focus({ preventScroll: true }), 25);
      } else {
        setPhase("dialing");
        sound("dial");
        sound("ratchet", .26);
        sound("ratchet", .64);
        sound("ratchet", 1.02);
        sound("bolt", 1.56);
        sound("door", 2.19);
        schedule(() => setPhase("bolts"), 1540);
        schedule(() => setPhase("swinging"), 2180);
        schedule(() => {
          setPhase("open");
          setReady(true);
          requestAnimationFrame(() => passage.current?.focus({ preventScroll: true }));
        }, 3660);
      }
      return;
    }
    if (key !== "Backspace" && code.length >= combination.length) return;
    sound("key");
    setFailed(false);
    setCode(key === "Backspace" ? code.slice(0, -1) : code + key);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || phase !== "locked") return;
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
    schedule(() => router.push("/vault"), reduced ? 0 : 760);
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
        <div className={styles.inspectionIdentity}>
          <span className={styles.inspectionEyebrow}>IHBNF · PRIVATE ARCHIVE · CONCEALED ENTRANCE</span>
          <h2 id="hidden-safe-title">The concealed vault</h2>
        </div>
        <button type="button" autoFocus onClick={onClose} disabled={entering} className={styles.leave}>
          Step back <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className={styles.mechanismIntro}>Five tumblers, a brass release wheel, and four locking bolts. Enter the code to start the mechanism.</p>
      <div className={styles.inspectionBody}>
        <div className={styles.mechanism} data-open={canEnter} data-phase={phase} data-failed={failed}>
          <div className={styles.vaultBezel} aria-hidden="true" />
          <div className={styles.vaultInnerWall} aria-hidden="true" />
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
          <div className={styles.safeDoor} inert={phase !== "locked"}>
            <div className={styles.doorThickness} aria-hidden="true" />
            <div className={styles.doorFace}>
              <div className={styles.doorSeal} aria-hidden="true" />
              <div className={styles.doorLabel} aria-hidden="true"><strong>IHBNF</strong><small>ARCHIVE · SECURE STORAGE</small></div>
              <div className={styles.rivets} aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
              <div className={styles.hingeRail} aria-hidden="true"><i/><i/><i/></div>
              <div className={styles.boltRail} aria-hidden="true"><span className={styles.bolt}/><span className={styles.bolt}/><span className={styles.bolt}/><span className={styles.bolt}/></div>
              <div className={styles.lockAssembly}>
                <div className={styles.keypadTitle}>FIVE-TUMBLER COMBINATION</div>
                <output className={styles.counter} aria-label={`${code.length} of five digits entered`}>
                  <span aria-hidden="true">{phase === "locked" ? code.padEnd(5, "·").split("").join(" ") : "✓ ✓ ✓ ✓ ✓"}</span>
                </output>
                <div className={styles.keypad} aria-label="Combination keypad" role="group">
                  {digits.slice(0, 9).map((digit) => (
                    <button key={digit} type="button" disabled={phase !== "locked"} onClick={() => turnKey(digit)}>{digit}</button>
                  ))}
                  <button type="button" disabled={phase !== "locked" || code.length === 0} aria-label="Erase last digit" onClick={() => turnKey("Backspace")}>⌫</button>
                  <button type="button" disabled={phase !== "locked"} onClick={() => turnKey("0")}>0</button>
                  <button ref={submit} type="button" aria-label="Try combination" disabled={phase !== "locked" || code.length !== 5} onClick={() => turnKey("Enter")}>↵</button>
                </div>
                <p className={styles.lockStatus} role="status" aria-live="polite">{failed ? "Incorrect combination" : phase === "locked" ? "Awaiting five digits" : phase === "dialing" ? "Brass wheel turning" : phase === "bolts" ? "Bolts disengaging" : phase === "swinging" ? "Door opening" : "Unlocked"}</p>
              </div>
              <div className={styles.wheelHousing} aria-hidden="true"><span className={styles.wheelLabel}>RELEASE WHEEL</span><div className={styles.wheelFrame}><div className={styles.wheelRotor}><div className={styles.wheel}><i /><i /><i /><b /></div></div></div><small>MECHANICAL · BRASS</small></div>
            </div>
          </div>
          <div className={styles.stageMeter} aria-hidden="true"><span>01 CODE</span><span>02 WHEEL</span><span>03 BOLTS</span><span>04 DOOR</span></div>
        </div>
        <aside className={styles.clue} aria-label="Inscription beside the safe">
          <div aria-hidden="true" className={styles.cluePortrait} data-lit={lampOn} />
          <blockquote>{site.motto}</blockquote>
          <p>Five words. Each has its measure. Read them as they were written.</p>
          <p className={styles.clueNote}>Once the correct combination is entered, the wheel, bolts and door move automatically. No second click.</p>
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
