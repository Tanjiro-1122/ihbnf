"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

type Props = {
  lampOn: boolean;
  onToggleLamp: (trusted: boolean) => void;
  onPullStart?: () => void;
  muted?: boolean;
  reducedMotion?: boolean;
  onHoverChange?: (hovered: boolean) => void;
};

/**
 * Realistic Interactive Green Glass Banker's Lamp & Physical Brass Pull-Chain:
 * - Silhouetted glass shade & brass stem highlight on hover/focus (zero rectangular hotspot box).
 * - Separately animated physical brass beaded pull-chain + bottom brass acorn/ball aligned to the
 *   exact socket position under the green glass shade (`x = 25.55%, y = 45.4%` in the 16:9 study).
 * - Clicking/tapping pulls the chain & brass ball visibly downward (`+22px` travel), stretches the
 *   beaded chain links, fires `/media/audio/lamp-chain-approved.mp3` and toggles the room's lamp state
 *   at the exact lowest point of the pull (`175ms`), and retracts with a natural damped pendulum swing.
 */
export function BankersLampControl({
  lampOn,
  onToggleLamp,
  onPullStart,
  muted = false,
  reducedMotion = false,
  onHoverChange,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [pullState, setPullState] = useState<"idle" | "pulling-down" | "swinging-back">("idle");
  const [pullOffsetPx, setPullOffsetPx] = useState(0);
  const [swingAngleDeg, setSwingAngleDeg] = useState(0);

  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const onToggleRef = useRef(onToggleLamp);
  useEffect(() => {
    onToggleRef.current = onToggleLamp;
  }, [onToggleLamp]);

  const animFrameRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/media/audio/lamp-chain-approved.mp3");
    audio.preload = "auto";
    clickAudioRef.current = audio;
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const playSwitchClick = useCallback(() => {
    if (mutedRef.current || !clickAudioRef.current) return;
    try {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.volume = 1;
      clickAudioRef.current.play().catch(() => {});
    } catch {
      // Ignore autoplay restrictions
    }
  }, []);

  const handlePullChain = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const trusted = event.isTrusted;
    if (trusted) onPullStart?.();
    // Allow rapid re-triggering cleanly by canceling any previous swing tail
    cancelAnimationFrame(animFrameRef.current);

    if (reducedMotion) {
      playSwitchClick();
      onToggleRef.current(trusted);
      return;
    }

    isAnimatingRef.current = true;
    setPullState("pulling-down");
    const startTime = performance.now();
    let clickedAtBottom = false;

    const DOWN_DURATION = 175; // ms to reach lowest point of the pull
    const TOTAL_DURATION = 860; // ms for full retraction + damped pendulum swing
    const MAX_PULL_PX = 24; // visible downward travel of the brass chain & ball

    const step = (now: number) => {
      const elapsed = now - startTime;

      if (elapsed <= DOWN_DURATION) {
        // Phase A: Invisible hand pulls the brass chain & ball downward
        const t = elapsed / DOWN_DURATION;
        // Ease-out quad to the bottom stop
        const eased = 1 - (1 - t) * (1 - t);
        setPullOffsetPx(eased * MAX_PULL_PX);
        setSwingAngleDeg(-1.8 * eased);
        animFrameRef.current = requestAnimationFrame(step);
        return;
      }

      // At the exact lowest point of the pull: play the crisp mechanical switch click and flip the lamp state!
      if (!clickedAtBottom) {
        clickedAtBottom = true;
        playSwitchClick();
        onToggleRef.current(trusted);
        setPullState("swinging-back");
      }

      const retractElapsed = elapsed - DOWN_DURATION;
      const retractDuration = TOTAL_DURATION - DOWN_DURATION;

      if (retractElapsed < retractDuration) {
        const rt = retractElapsed / retractDuration;
        // Spring retraction of vertical chain length (snaps back up over ~190ms with slight bounce)
        const verticalDecay = Math.exp(-rt * 8.5) * Math.cos(rt * Math.PI * 3.5);
        const currentPull = Math.max(-2, verticalDecay * MAX_PULL_PX);

        // Damped pendulum swing as the chain settles
        const swing = Math.exp(-rt * 4.2) * Math.sin(rt * Math.PI * 5.5) * 8.5;

        setPullOffsetPx(currentPull);
        setSwingAngleDeg(swing);
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        isAnimatingRef.current = false;
        setPullOffsetPx(0);
        setSwingAngleDeg(0);
        setPullState("idle");
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [onPullStart, playSwitchClick, reducedMotion]);

  const handleEnter = () => {
    setHovered(true);
    onHoverChange?.(true);
  };

  const handleLeave = () => {
    setHovered(false);
    onHoverChange?.(false);
  };

  // Number of brass beads visible along the chain (stretches naturally as pulled)
  const baseChainHeightPx = 38;
  const currentChainHeightPx = baseChainHeightPx + pullOffsetPx;

  return (
    <div
      data-testid="bankers-lamp-layer"
      data-lamp-state={lampOn ? "on" : "off"}
      data-chain-state={pullState}
      style={{
        left: "13.6%",
        top: "33.8%",
        width: "18.8%",
        height: "36.2%",
      }}
      className="pointer-events-none absolute z-30"
    >
      {/* ── 1. SILHOUETTE-CONFORMING LAMP GLOW ON HOVER/FOCUS (ZERO RECTANGULAR HOTSPOT BOX) ── */}
      <svg
        aria-hidden="true"
          viewBox="227 318 315 349"
          preserveAspectRatio="none"
        className={`pointer-events-none h-full w-full overflow-visible transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <defs>
          <filter id="lamp-silhouette-glow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="shade-rim-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe7b2" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ffd27a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#e9a94d" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <path
          d="M253 385 262 375 275 360 285 350 300 341 330 333 397 335 440 338 490 343 515 360 527 385 533 415 530 420 397 431 322 430 322 450 327 467 340 487 358 513 367 533 383 550 387 562 373 580 390 603 417 613 430 627 445 640 443 655 397 667 313 665 277 657 273 647 280 630 302 615 330 603 340 583 332 563 340 547 347 527 347 517 320 477 310 450 312 432 280 425 278 417 280 393 257 395Z"
          fill="rgba(255, 205, 126, 0.09)"
          stroke="url(#shade-rim-grad)"
          strokeWidth="3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter="url(#lamp-silhouette-glow)"
        />
      </svg>

      {/* ── 2. SEPARATELY ANIMATED PHYSICAL BRASS PULL-CHAIN & BOTTOM BRASS BALL LAYER ──
             Aligned to the exact socket exit beneath the right side of the green glass shade */}
      <div
        data-testid="lamp-pull-chain-visual"
        data-pull-offset={Math.round(pullOffsetPx)}
        style={{
          left: "63.2%",
          top: "33.5%",
          transform: `rotate(${swingAngleDeg.toFixed(2)}deg)`,
          transformOrigin: "top center",
        }}
        className="pointer-events-none absolute flex flex-col items-center"
      >
        {/* Brass Socket Eyelet Collar under the Shade */}
        <div className="h-1.5 w-2.5 rounded-b-full border border-[#fef08a]/60 bg-gradient-to-r from-[#784b16] via-[#facc15] to-[#784b16] shadow-[0_2px_6px_rgba(0,0,0,0.85)]" />

        {/* Dynamic Beaded Brass Chain Segment that physically stretches & travels downward */}
        <svg
          width="18"
          height={Math.round(currentChainHeightPx + 20)}
          viewBox={`0 0 18 ${Math.round(currentChainHeightPx + 20)}`}
          className="overflow-visible drop-shadow-[0_3px_5px_rgba(0,0,0,0.85)]"
        >
          <defs>
            <radialGradient id="brass-bead-grad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#422006" />
            </radialGradient>
            <radialGradient id="brass-ball-grad" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#ca8a04" />
              <stop offset="92%" stopColor="#713f12" />
              <stop offset="100%" stopColor="#3b1d06" />
            </radialGradient>
          </defs>

          {/* Thin metallic connecting wire inside the beads (visible as chain stretches under tension) */}
          <line
            x1="9"
            y1="0"
            x2="9"
            y2={currentChainHeightPx}
            stroke="#ca8a04"
            strokeWidth="1.35"
          />

          {/* Individual Brass Chain Beads */}
          {Array.from({ length: 9 }, (_, i) => {
            const cy = 3 + (i / 8) * (currentChainHeightPx - 6);
            return (
              <circle
                key={i}
                cx="9"
                cy={cy}
                r="2.1"
                fill="url(#brass-bead-grad)"
              />
            );
          })}

          {/* Flared Brass Bell Cap & Weighted Bottom Brass Pull-Ball / Acorn */}
          <g
            data-testid="lamp-pull-chain-ball"
            transform={`translate(9, ${currentChainHeightPx + 5.5})`}
          >
            {/* Top cap ring */}
            <path
              d="M -3 -5 L 3 -5 L 4.2 -2 L -4.2 -2 Z"
              fill="url(#brass-bead-grad)"
            />
            {/* Main weighted brass pull-ball */}
            <circle
              cx="0"
              cy="1.8"
              r="5.2"
              fill="url(#brass-ball-grad)"
              stroke={hovered ? "#fef08a" : "rgba(66,32,6,0.7)"}
              strokeWidth={hovered ? "1.1" : "0.6"}
            />
            {/* Bottom finial tip */}
            <circle cx="0" cy="7.3" r="1.4" fill="#a16207" />
          </g>
        </svg>
      </div>

      {/* ── 3. INVISIBLE CONTOURED INTERACTION TARGETS (Shade + Pull-Chain Hit Area) ── */}
      <button
        type="button"
        data-testid="workspace-lamp"
        onClick={handlePullChain}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        aria-pressed={lampOn}
        style={{ clipPath: "polygon(8.25% 19.20%, 11.11% 16.33%, 15.24% 12.03%, 18.41% 9.17%, 23.17% 6.59%, 32.70% 4.30%, 53.97% 4.87%, 67.62% 5.73%, 83.49% 7.16%, 91.43% 12.03%, 95.24% 19.20%, 97.14% 27.79%, 96.19% 29.23%, 53.97% 32.38%, 30.16% 32.09%, 30.16% 37.82%, 31.75% 42.69%, 35.87% 48.43%, 41.59% 55.87%, 44.44% 61.60%, 49.52% 66.48%, 50.79% 69.05%, 46.35% 75.50%, 51.75% 81.66%, 60.32% 84.24%, 64.44% 88.54%, 69.21% 92.55%, 68.57% 96.56%, 53.97% 100%, 27.30% 99.43%, 15.87% 97.13%, 14.60% 94.27%, 16.83% 89.40%, 23.81% 85.10%, 35.56% 81.66%, 35.87% 76.22%, 33.33% 70.19%, 35.87% 65.62%, 38.10% 59.88%, 38.10% 57.02%, 29.52% 45.56%, 26.35% 37.82%, 26.98% 32.67%, 16.83% 30.66%, 16.19% 28.37%, 16.83% 21.49%, 9.52% 22.06%)" }}
        aria-label={`Classic green glass banker's lamp shade — ${
          lampOn ? "click to switch study light off" : "click to switch study light on"
        }`}
        className="pointer-events-auto absolute inset-0 h-full w-full cursor-pointer bg-transparent p-0 outline-none focus-visible:outline-none"
      >
        <span className="sr-only">Click the lamp shade to toggle study lighting</span>
      </button>
      <button
        type="button"
        data-testid="workspace-lamp-chain"
        onClick={handlePullChain}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        aria-pressed={lampOn}
        aria-label={`Pull brass chain to turn the lamp ${lampOn ? "off" : "on"}`}
        style={{
          left: "63.2%",
          top: "43.5%",
          width: "15.5%",
          height: "31%",
          minWidth: "44px",
          minHeight: "44px",
          transform: "translate(-50%, -50%)",
        }}
        className="pointer-events-auto absolute z-10 cursor-pointer rounded-full bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-200/80"
      />
    </div>
  );
}
