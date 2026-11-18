"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { HiddenSafe } from "./HiddenSafe";
import { advanceProgress, COMPASS_READY, installDevReset, RUNE_READY, SAFE_FOUND, useVaultProgress, VAULT_UNLOCKED } from "./progress";
import type { useVaultAudio } from "./useVaultAudio";
import styles from "./studyVault.module.css";

const compassShape = "M885 487 Q891 479 925 480 L925 473 Q925 458 946 452 Q965 444 975 455 Q986 468 975 483 Q963 497 950 496 L950 504 Q933 515 902 512 Q885 510 884 501Z";
const runeShape = "M548 219 L550 198 L555 189 L564 181 L573 178 L582 185 L587 198 L585 214 L580 226 L553 226Z";
const portraitShape = "polygon(0% 0%, 12% 0%, 99% 14%, 99% 100%, 3% 98%)";

function activateWithKey(event: KeyboardEvent<SVGPathElement>, activate: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  if (!event.repeat) activate();
}

export function StudyVault({ lampOn, play, obstructed }: {
  lampOn: boolean;
  play: ReturnType<typeof useVaultAudio>["play"];
  obstructed: boolean;
}) {
  const progress = useVaultProgress();
  const [swing, setSwing] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [portraitMoving, setPortraitMoving] = useState(false);
  const safeTrigger = useRef<HTMLButtonElement>(null);
  const compass = useRef<SVGPathElement>(null);
  const rune = useRef<SVGPathElement>(null);
  const restoreFocus = useRef(false);
  const timer = useRef<number>(0);

  const compassActive = progress >= COMPASS_READY && progress < RUNE_READY;
  const runeActive = progress === RUNE_READY || progress === VAULT_UNLOCKED;
  const frameOpen = progress >= SAFE_FOUND;
  const unlocked = progress === VAULT_UNLOCKED;
  const compassTurns = swing ? 5 : Math.max(0, progress - COMPASS_READY);
  const preparingPortrait = compassActive || progress === RUNE_READY;

  useEffect(() => installDevReset(), []);
  useEffect(() => {
    if (!preparingPortrait) return;
    const portrait = new window.Image();
    portrait.src = lampOn ? "/media/vault/portrait-on.webp" : "/media/vault/portrait-off.webp";
  }, [preparingPortrait, lampOn]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!restoreFocus.current) return;
    if (progress === RUNE_READY) {
      rune.current?.focus();
      restoreFocus.current = false;
    }
    if (frameOpen && !portraitMoving) {
      safeTrigger.current?.focus();
      restoreFocus.current = false;
    }
  }, [progress, frameOpen, portraitMoving]);

  function turnCompass() {
    if (!compassActive || obstructed || !advanceProgress(progress)) return;
    const final = progress + 1 === RUNE_READY;
    restoreFocus.current = final && document.activeElement === compass.current;
    play("compass");
    if (final) {
      setSwing(true);
      play("compass", .2);
      play("compass", .37);
      play("awaken", .58);
      timer.current = window.setTimeout(() => setSwing(false), 1500);
    }
  }

  function touchRune() {
    if (!runeActive || obstructed) return;
    if (unlocked) {
      // The safe trigger is the natural focus return point even from the shortcut.
      setInspecting(true);
      return;
    }
    if (!advanceProgress(RUNE_READY)) return;
    window.clearTimeout(timer.current);
    setSwing(false);
    restoreFocus.current = document.activeElement === rune.current;
    setTransfer(true);
    setPortraitMoving(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    play("pulse");
    play("hinge", reduced ? 0 : .64);
    timer.current = window.setTimeout(() => {
      setTransfer(false);
      setPortraitMoving(false);
    }, reduced ? 0 : 1750);
  }

  return (
    <>
      <span className="sr-only" role="status">
        {compassActive ? "A latch clicks. The brass compass catches the light."
          : progress === RUNE_READY ? "The compass points toward the glowing rune stone."
          : progress === SAFE_FOUND && !portraitMoving ? "The frame swings open, revealing a concealed safe."
          : ""}
      </span>
      <svg viewBox="0 0 1000 562.5" preserveAspectRatio="none" className={styles.hotspots}>
        {compassActive && (
          <path ref={compass} className={styles.compassTarget} d={compassShape}
            role="button" aria-label="Turn the brass compass" tabIndex={obstructed ? -1 : 0}
            onClick={turnCompass} onKeyDown={(event) => activateWithKey(event, turnCompass)} />
        )}
        {(compassActive || swing) && (
          <g aria-hidden="true" pointerEvents="none" className={swing ? styles.compassFade : undefined}>
            <path d={compassShape} className={styles.compassGlow} />
            <g transform="translate(917 489) scale(1 .53)">
              <g className={styles.needle} style={{
                opacity: compassTurns > 0 ? 1 : 0,
                transform: `rotate(${[0, 52, 88, 123, 160, 687][compassTurns]}deg)`,
              }}>
                <path d="M0 -19 3 0 0 16 -3 0Z" fill="#34271c" stroke="#e8bc70" strokeWidth=".75" />
                <path d="M0 -19 3 0 -3 0Z" fill="#e2c18a" />
                <circle r="2" fill="#ae7f49" stroke="#33261a" strokeWidth=".7" />
              </g>
            </g>
          </g>
        )}
        {runeActive && (
          <path ref={rune} className={styles.runeTarget} d={runeShape}
            role="button" aria-label={unlocked ? "Return to the hidden entrance" : "Touch the glowing rune stone"}
            aria-haspopup={unlocked ? "dialog" : undefined} tabIndex={obstructed ? -1 : 0}
            onClick={touchRune} onKeyDown={(event) => activateWithKey(event, touchRune)} />
        )}
        {(runeActive || transfer) && (
          <g aria-hidden="true" pointerEvents="none">
            <path d={runeShape} className={styles.runeGlow} data-transfer={transfer} />
            {!unlocked && [0, 1, 2, 3].map((i) => (
              <circle key={i} cx={554 + i * 8} cy={200} r={.8 + i * .14} fill="#a7d2ff"
                className={styles.spark} style={{ animationDelay: `${i * -.8}s` }} />
            ))}
          </g>
        )}
        {transfer && (
          <g aria-hidden="true" pointerEvents="none" className={styles.transfer}>
            <path d="M567 202 Q469 90 356 107" pathLength="100" />
            <ellipse cx="356" cy="107" rx="83" ry="96" />
          </g>
        )}
      </svg>
      {frameOpen && (
        <div className={styles.recess} data-moving={portraitMoving} data-lit={lampOn}>
          <div className={styles.wallCutout} style={{ clipPath: portraitShape }}>
            <button type="button" ref={safeTrigger} className={styles.recessSafe} aria-haspopup="dialog"
              aria-label={unlocked ? "Open the hidden passage" : "Inspect the concealed safe"}
              disabled={portraitMoving || obstructed} onClick={() => setInspecting(true)} data-unlocked={unlocked}>
              <span className={styles.miniWheel} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.portrait} aria-hidden="true">
            <div className={styles.portraitFront} style={{ clipPath: portraitShape }} />
            <div className={styles.portraitBack} />
          </div>
        </div>
      )}
      {inspecting && (
        <HiddenSafe unlocked={unlocked} lampOn={lampOn} trigger={safeTrigger} sound={play}
          onClose={() => setInspecting(false)} />
      )}
    </>
  );
}
