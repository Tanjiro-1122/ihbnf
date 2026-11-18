"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  lampOn: boolean;
  onToggleLamp: () => void;
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
 *   beaded chain links, fires `/media/audio/lamp-switch-click.wav` and toggles the room's lamp state
 *   at the exact lowest point of the pull (`175ms`), and retracts with a natural damped pendulum swing.
 */
export function BankersLampControl({
  lampOn,
  onToggleLamp,
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
    const audio = new Audio("/media/audio/lamp-switch-click.wav");
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
      clickAudioRef.current.volume = 0.85;
      clickAudioRef.current.play().catch(() => {});
    } catch {
      // Ignore autoplay restrictions
    }
  }, []);

  const handlePullChain = useCallback(() => {
    // Allow rapid re-triggering cleanly by canceling any previous swing tail
    cancelAnimationFrame(animFrameRef.current);

    if (reducedMotion) {
      playSwitchClick();
      onToggleRef.current();
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
        onToggleRef.current();
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
  }, [playSwitchClick, reducedMotion]);

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
        viewBox="0 0 240 260"
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
            <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fde68a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Contoured silhouette path tracing ONLY the curved green glass dome, brass neck, and stepped circular base */}
        <path
          d="M 52 78 C 56 34, 88 18, 134 18 C 180 18, 212 36, 218 78 C 220 86, 212 90, 200 90 L 66 90 C 55 90, 50 86, 52 78 Z"
          fill="rgba(253, 230, 138, 0.08)"
          stroke="url(#shade-rim-grad)"
          strokeWidth="2.4"
          filter="url(#lamp-silhouette-glow)"
        />
        {/* Brass stem & stepped circular base silhouette trace */}
        <path
          d="M 118 90 L 112 205 C 82 210, 66 222, 62 238 L 172 238 C 168 222, 152 210, 124 205 L 122 90"
          fill="none"
          stroke="rgba(253, 224, 71, 0.55)"
          strokeWidth="2"
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
            {/* Subtle warm highlight halo around the brass ball when hovered */}
            {hovered && (
              <circle
                cx="0"
                cy="1"
                r="9"
                fill="rgba(253, 224, 71, 0.28)"
              />
            )}
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
        aria-label={`Classic green glass banker's lamp pull-chain — ${
          lampOn ? "pull chain to switch lamp off" : "pull chain to switch lamp on"
        }`}
        className="pointer-events-auto absolute inset-0 h-full w-full cursor-pointer bg-transparent p-0 outline-none focus-visible:outline-none"
      >
        <span className="sr-only">
          Pull brass chain on banker&apos;s lamp to toggle study lighting
        </span>
      </button>
    </div>
  );
}
