"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProject } from "@/content/projects";
import { links, site, socials } from "@/content/site";
import { ExternalArrow, SocialIcon } from "@/components/ui/Icons";
import { EmailReveal } from "@/components/ui/EmailReveal";
import { BankersLampControl } from "@/components/ui/BankersLampControl";

type HoveredItem =
  | null
  | "why-henry"
  | "dream-payoff"
  | "laptop"
  | "smartphone"
  | "notebook"
  | "calendar"
  | "lamp"
  | "brand"
  | "contact";

/**
 * Five-stage state machine for the physical 3D book interactions on the shelf
 * (used by both "Why Henry?" and "The Dream of the Payoff"):
 * - "shelved": Sitting naturally in its carved walnut shelf niche
 * - "extracting": Sliding out of the shelf niche, moving forward with depth & rotating toward the viewer
 * - "open": Front cover swings open (-165deg) & pages fan open to reveal the parchment spread
 * - "closing-cover": Front cover & pages fold shut back into a closed 3D hardcover
 * - "returning": Book slides back into its exact walnut shelf position
 */
type BookStage = "shelved" | "extracting" | "floating" | "opening" | "open" | "closing-cover" | "returning";
type ShelfBookId = "why-henry" | "dream-payoff";

/**
 * Active in-room object overlay (for non-shelf-book objects: Wall Logo, Smartphone, Laptop, Notebook, Calendar, Contact).
 * The room remains visible behind every presentation.
 */
type ActiveRoomModal =
  | null
  | "brand"
  | "smartphone"
  | "laptop"
  | "notebook"
  | "calendar"
  | "contact";

const rainDrops = Array.from({ length: 18 }, (_, i) => ({
  left: `${8 + ((i * 19) % 84)}%`,
  top: `${(i * 23) % 65}%`,
  height: `${18 + (i % 4) * 9}px`,
  duration: `${2.8 + (i % 5) * 0.55}s`,
  delay: `-${(i * 0.43).toFixed(2)}s`,
}));

const dustMotes = Array.from({ length: 16 }, (_, i) => ({
  left: `${18 + ((i * 31) % 66)}%`,
  top: `${24 + ((i * 29) % 52)}%`,
  size: 2 + (i % 2),
  t: 14 + (i % 6) * 2.5,
  d: -(i * 1.3),
  dx: ((i % 5) - 2) * 12,
  o: 0.25 + (i % 3) * 0.14,
}));

const whyHenryIllustrations = [
  {
    src: "/media/why-henry/illustrations/03.webp",
    title: "The Underground Cavern",
    caption: "Below the roots, Dominick and Henry find a chamber hidden beneath the forest.",
  },
  {
    src: "/media/why-henry/illustrations/01.webp",
    title: "The Forgotten Map",
    caption: "An old map of Briar Glen, annotated in a worried hand.",
  },
  {
    src: "/media/why-henry/illustrations/02.webp",
    title: "The Ancient Hollow Tree",
    caption: "The oldest tree in the glen — a hiding place, a landmark, and a clue.",
  },
  {
    src: "/media/why-henry/illustrations/04.webp",
    title: "The First Stone Marker",
    caption: "The first piece of a mystery that keeps getting larger.",
  },
];

const memoirThemes = [
  "Growing up",
  "Family",
  "Relationships",
  "Fatherhood",
  "Work",
  "Sacrifice",
  "Financial struggle",
  "Dreams",
];

const philosophySteps = [
  "Create",
  "Build",
  "Break it",
  "Fix it",
  "Learn",
  "Keep moving",
];


/**
 * Highlights the object that is ALREADY painted into the approved study plate.
 * No duplicate composited phone/laptop/frame images: they were the source of
 * visible misregistration and exposed background artwork behind the overlays.
 * SVG is deliberately pointer-events-none; the original semantic button
 * handles touch, keyboard and click interactions.
 */
function ArtworkHotspotGlow({ active, color, points }: {
  active: boolean;
  color: "gold" | "lime" | "violet";
  points: string;
}) {
  const palette = {
    gold: { fill: "rgba(255,225,159,0.12)", stroke: "#ffe0a0", glow: "rgba(255,190,81,0.65)" },
    lime: { fill: "rgba(183,235,138,0.10)", stroke: "#d4f5a6", glow: "rgba(148,208,87,0.48)" },
    violet: { fill: "rgba(207,174,255,0.13)", stroke: "#ddc3ff", glow: "rgba(168,112,244,0.60)" },
  }[color];
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}>
      <polygon points={points} fill={palette.fill} stroke={palette.stroke}
        strokeWidth="0.9" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${palette.stroke}) drop-shadow(0 0 5px ${palette.glow})` }} />
    </svg>
  );
}

export function LivingWorkspace() {
  const whyHenry = getProject("why-henry")!;
  const memoir = getProject("the-dream-of-the-payoff")!;
  const unfiltr = getProject("unfiltr")!;
  const swh = getProject("sports-wager-helper")!;

  const [hovered, setHovered] = useState<HoveredItem>(null);
  const [lampOn, setLampOn] = useState(true);
  const [muted, setMuted] = useState(false);

  // Physical Shelf Book 3D Extraction State (Why Henry & The Dream of the Payoff)
  const [activeShelfBook, setActiveShelfBook] = useState<ShelfBookId>("why-henry");
  const [bookStage, setBookStage] = useState<BookStage>("shelved");
  const [extractStarted, setExtractStarted] = useState(false);
  const [flightDelta, setFlightDelta] = useState({ dx: 220, dy: -90, scale: 0.34 });
  const [henryArtIdx, setHenryArtIdx] = useState(0);

  // In-Room Object Presentation State (Brand Wall Frame, Phone, Laptop, Notebook, Calendar, Contact)
  const [activeModal, setActiveModal] = useState<ActiveRoomModal>(null);
  const [unfiltrScreenIdx, setUnfiltrScreenIdx] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const whyHenryBookRef = useRef<HTMLButtonElement>(null);
  const dreamPayoffBookRef = useRef<HTMLButtonElement>(null);
  const closeBookBtnRef = useRef<HTMLButtonElement>(null);
  const closeModalBtnRef = useRef<HTMLButtonElement>(null);
  const stageTimersRef = useRef<number[]>([]);

  // Book sound bank: pull off shelf -> cover creak -> page rustle, then thump shut -> settle on shelf
  const bookAudioRef = useRef<Record<string, HTMLAudioElement>>({});
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const files: Record<string, string> = {
      pull: "/media/audio/book-pull.wav",
      creak: "/media/audio/binding-creak.wav",
      rustle: "/media/audio/page-rustle.wav",
      thump: "/media/audio/book-close-thump.wav",
      settle: "/media/audio/shelf-settle.wav",
    };
    Object.entries(files).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      bookAudioRef.current[key] = audio;
    });
  }, []);

  const playBookSound = useCallback((key: string, volume = 0.7) => {
    if (mutedRef.current) return;
    const audio = bookAudioRef.current[key];
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {
      // Ignore autoplay restrictions
    }
  }, []);

  const clearStageTimers = useCallback(() => {
    stageTimersRef.current.forEach((id) => window.clearTimeout(id));
    stageTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearStageTimers();
  }, [clearStageTimers]);

  // Center the horizontal scroll on narrow mobile screens on initial mount so the desk & shelf are balanced
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth) {
      el.scrollLeft = Math.round((el.scrollWidth - el.clientWidth) * 0.42);
    }
  }, []);

  // Measure the selected shelf book's exact viewport coordinates so the 3D extraction originates from and returns to its true shelf slot
  const computeShelfDelta = useCallback((bookId: ShelfBookId) => {
    if (typeof window === "undefined") return;
    const targetEl =
      bookId === "why-henry" ? whyHenryBookRef.current : dreamPayoffBookRef.current;
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const bookCenterX = rect.left + rect.width / 2;
    const bookCenterY = rect.top + rect.height / 2;
    // The closed hardcover occupies the RIGHT half of the spread.
    // Anchor its center, not the spread's center, on the selected shelf slot.
    const spreadWidth = Math.min(960, window.innerWidth - (window.innerWidth >= 640 ? 48 : 24));
    const viewportCenterX = window.innerWidth / 2 + spreadWidth / 4;
    const viewportCenterY = window.innerHeight / 2;
    setFlightDelta({
      dx: Math.round(bookCenterX - viewportCenterX),
      dy: Math.round(bookCenterY - viewportCenterY),
      scale: Math.max(0.18, Math.min(0.48, +(rect.height / 480).toFixed(2))),
    });
  }, []);

  // Trigger physical extraction & cover opening sequence for either shelf book
  const handleExtractShelfBook = useCallback(
    (bookId: ShelfBookId) => {
      if (bookStage !== "shelved") return;
      setActiveModal(null);
      clearStageTimers();
      setActiveShelfBook(bookId);
      computeShelfDelta(bookId);
      setExtractStarted(false);
      setBookStage("extracting");
      playBookSound("pull", 0.8);

      const rafId = window.setTimeout(() => {
        setExtractStarted(true);
      }, 25);

      // Let the CLOSED book visibly travel out of its shelf slot before
      // opening. The original 620ms sequence opened while it was still flying.
      const floatTimer = window.setTimeout(() => setBookStage("floating"), 1150);
      const openingTimer = window.setTimeout(() => {
        setBookStage("opening");
        playBookSound("creak", 0.62);
      }, 1670);
      const rustleTimer = window.setTimeout(() => playBookSound("rustle", 0.48), 2030);
      const openedTimer = window.setTimeout(() => {
        setBookStage("open");
        closeBookBtnRef.current?.focus({ preventScroll: true });
      }, 2570);
      stageTimersRef.current.push(rafId, floatTimer, openingTimer, rustleTimer, openedTimer);
    },
    [bookStage, clearStageTimers, computeShelfDelta, playBookSound],
  );

  // Trigger reverse animation: fold cover shut -> slide back into walnut shelf slot
  const handleReturnShelfBook = useCallback(() => {
    if (bookStage === "shelved" || bookStage === "returning" || bookStage === "closing-cover") return;
    clearStageTimers();
    computeShelfDelta(activeShelfBook);
    setBookStage("closing-cover");

    const thumpTimer = window.setTimeout(() => playBookSound("thump", 0.75), 700);
    const settleTimer = window.setTimeout(() => playBookSound("settle", 0.6), 1960);

    const returnTimer = window.setTimeout(() => {
      setExtractStarted(false);
      setBookStage("returning");
    }, 1050);

    const shelvedTimer = window.setTimeout(() => {
      setBookStage("shelved");
      window.setTimeout(() => {
        const targetEl =
          activeShelfBook === "why-henry"
            ? whyHenryBookRef.current
            : dreamPayoffBookRef.current;
        targetEl?.focus({ preventScroll: true });
      }, 60);
    }, 2180);

    stageTimersRef.current.push(thumpTimer, settleTimer, returnTimer, shelvedTimer);
  }, [bookStage, activeShelfBook, clearStageTimers, computeShelfDelta, playBookSound]);

  // Open an in-room object overlay
  const openRoomModal = useCallback((modal: Exclude<ActiveRoomModal, null>) => {
    setActiveModal(modal);
    window.setTimeout(() => {
      closeModalBtnRef.current?.focus({ preventScroll: true });
    }, 80);
  }, []);

  const closeRoomModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Allow Escape key to close whichever book or in-room object presentation is active
  useEffect(() => {
    if (bookStage === "shelved" && !activeModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (bookStage !== "shelved") {
          handleReturnShelfBook();
        } else if (activeModal) {
          closeRoomModal();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bookStage, activeModal, handleReturnShelfBook, closeRoomModal]);

  const isBookOut = bookStage !== "shelved";
  const isWhyHenryOut = isBookOut && activeShelfBook === "why-henry";
  const isDreamPayoffOut = isBookOut && activeShelfBook === "dream-payoff";

  return (
    <section
      id="home"
      data-testid="hero-section"
      aria-label="Javier Huertas's Study — Interactive Point-and-Click Environment"
      className="relative isolate flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#050302] select-none"
    >
      {/* Ambient edge fill behind the 16:9 canvas on ultra-wide or tall monitors */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,rgba(54,30,14,0.42)_0%,rgba(12,7,4,0.96)_65%,#040201_100%)]"
      />

      {/* =====================================================================
          1. SCROLLABLE / PANNABLE 16:9 HIGH-RESOLUTION STUDY STAGE
             Preserves the exact 16:9 composition of the approved reference
             without stretching or distorting on any screen size.
         ===================================================================== */}
      <div
        ref={scrollContainerRef}
        className="relative flex h-full w-full items-center justify-start overflow-x-auto overflow-y-hidden lg:justify-center"
      >
        <div
          data-testid="walnut-desk-surface"
          className="relative mx-auto aspect-[16/9] h-full min-h-[500px] w-auto min-w-[888px] max-w-none shrink-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.95)] lg:h-auto lg:max-h-[100svh] lg:w-full lg:max-w-[177.78svh]"
        >
          {/* -----------------------------------------------------------------
              BASE LAYER: CLEAN 2K HIGH-RESOLUTION STUDY PLATES (LAMP-ON & LAMP-OFF)
              Cross-fades between the illuminated green banker's lamp plate and the
              extinguished lamp plate where the bulb is off, the green glass shade
              is dark, and the warm amber light cast on nearby books, the writing
              journal, walnut desk, and wall frame responds naturally.
             ----------------------------------------------------------------- */}
          <Image
            src="/media/study/study-clean-plate-off.webp"
            alt=""
            fill
            priority
            quality={95}
            sizes="100vw"
            className="pointer-events-none object-cover"
          />
          <Image
            src="/media/study/study-clean-plate.webp"
            alt="Javier Huertas's study — walnut desk, green banker's lamp, rain-streaked night window, and bookshelf"
            fill
            priority
            quality={95}
            sizes="100vw"
            className={`pointer-events-none object-cover transition-opacity duration-300 ${
              lampOn ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* -----------------------------------------------------------------
              AMBIENT LIVING MOTION LAYERS (RESTRAINED, SUBTLE & LIGHTWEIGHT)
             ----------------------------------------------------------------- */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {/* 1. Rain slowly streaking down the left casement window panes */}
            <div className="absolute left-[1.5%] top-[1%] h-[58%] w-[21%] overflow-hidden opacity-65">
              {rainDrops.map((drop, i) => (
                <span
                  key={i}
                  className="anim-rain absolute block w-[1px] bg-gradient-to-b from-transparent via-[#a8ccff]/55 to-transparent"
                  style={
                    {
                      left: drop.left,
                      top: drop.top,
                      height: drop.height,
                      "--rt": drop.duration,
                      "--rd": drop.delay,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            {/* 2. Subtle warm tungsten breathing glow from the green glass banker's lamp */}
            <div
              className={`anim-lamp absolute left-[9%] top-[33%] h-[42%] w-[28%] rounded-full bg-[radial-gradient(ellipse_at_48%_32%,rgba(255,212,128,0.26)_0%,rgba(196,138,52,0.10)_48%,transparent_75%)] blur-xl transition-opacity duration-700 ${
                lampOn ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* 3. Gentle warm steam wisps rising from the ceramic coffee mug on the desk */}
            <div className="absolute left-[36.2%] top-[44.5%] h-[14%] w-[5.5%] overflow-hidden">
              <span
                className="anim-steam absolute bottom-0 left-[28%] h-12 w-3 rounded-full bg-gradient-to-t from-white/20 via-white/10 to-transparent blur-[4px]"
                style={{ "--st": "5.2s", "--sd": "0s" } as React.CSSProperties}
              />
              <span
                className="anim-steam absolute bottom-1 left-[52%] h-14 w-3.5 rounded-full bg-gradient-to-t from-white/15 via-white/10 to-transparent blur-[5px]"
                style={{ "--st": "6.4s", "--sd": "-2.6s" } as React.CSSProperties}
              />
            </div>

            {/* 4. Subtle cyan magical pulse on the carved Briar Glen rune stone on the shelf */}
            <div className="anim-rune absolute left-[54.2%] top-[32.5%] h-[9.5%] w-[4.2%] rounded-full bg-[#38bdf8]/35" />

            {/* 5. Faint floating dust motes where illuminated by the lamp & shelf spotlights */}
            {lampOn &&
              dustMotes.map((m, i) => (
                <span
                  key={i}
                  className="particle absolute rounded-full bg-[#ffe2a8]"
                  style={
                    {
                      left: m.left,
                      top: m.top,
                      width: m.size,
                      height: m.size,
                      "--t": `${m.t}s`,
                      "--d": `${m.d}s`,
                      "--dx": `${m.dx}px`,
                      "--o": m.o,
                    } as React.CSSProperties
                  }
                />
              ))}
          </div>

          {/* =================================================================
              2. LAYERED PHYSICAL OBJECTS & EXACT-PERSPECTIVE OFFICIAL BRANDING
             ================================================================= */}

          {/* ── Bookcase Landmark Container for Automated Tests ── */}
          <div
            data-testid="workspace-bookshelf"
            aria-hidden="true"
            className="pointer-events-none absolute left-[48.5%] top-[0%] z-10 h-[56%] w-[49.5%]"
          />

          {/* -----------------------------------------------------------------
              OBJECT 7 (ESSENTIAL): FRAMED IHBNF WALL LOGO
              Overlays the official primary hands/soil/seedling emblem
              (/media/brand/ihbnf-icon.svg) seamlessly inside the ornate gold frame
              on the wall between the rain window and bookshelf.
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="hero-title"
            onClick={() => openRoomModal("brand")}
            onMouseEnter={() => setHovered("brand")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("brand")}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "brand"}
            aria-label="Framed IHBNF Wall Emblem — Idle Hands Bear No Fruit: Click to inspect the meaning of IHBNF"
            style={{
              left: "26.6%",
              top: "2.2%",
              width: "17.4%",
              height: "39.8%",
            }}
            className="group absolute z-20 cursor-pointer p-0 text-left outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.018] focus-visible:scale-[1.018]"
          >
            <ArtworkHotspotGlow active={hovered === "brand"} color="gold"
              points="2,2 96,3 99,98 2,97" />
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 1: "WHY HENRY?" PHYSICAL 3D HARDCOVER BOOK ON THE SHELF
              Positioned in the exact left shelf niche (x: 59.0%, y: 21.4%)
              over the clean walnut niche plate so extracting it leaves NO duplicate cover.
             ----------------------------------------------------------------- */}
          <div
            style={{
              left: "59.0%",
              top: "21.4%",
              width: "9.3%",
              height: "20.2%",
            }}
            className="absolute z-20 flex items-end justify-center"
          >
            {/* Warm shelf spotlight glow when hovering Why Henry */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,200,112,0.42)_0%,transparent_70%)] transition-opacity duration-300 ${
                hovered === "why-henry" && !isWhyHenryOut ? "opacity-100" : "opacity-0"
              }`}
            />

            <button
              ref={whyHenryBookRef}
              type="button"
              data-testid="why-henry-shelf-book"
              onClick={() => handleExtractShelfBook("why-henry")}
              onMouseEnter={() => setHovered("why-henry")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("why-henry")}
              onBlur={() => setHovered(null)}
              aria-haspopup="dialog"
              aria-expanded={isWhyHenryOut}
              aria-label="The Unwritten Journey — Book One: Why Henry? — Pull book from the shelf and open it"
              style={{
                transform: isWhyHenryOut
                  ? "perspective(800px) rotateY(-8deg) scale(0.9)"
                  : hovered === "why-henry"
                    ? "perspective(800px) rotateY(-4deg) rotateX(2deg) translateY(-5px) scale(1.045)"
                    : "perspective(800px) rotateY(-7deg) rotateX(2deg) rotateZ(-0.5deg)",
              }}
              className={`group relative flex h-full w-full cursor-pointer items-stretch p-0 text-left outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isWhyHenryOut ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <span aria-hidden="true" className="absolute -inset-2" />

              {/* Realistic contact shadow cast onto the walnut shelf back panel */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1.5 -left-2.5 -right-2 top-1.5 rounded-[3px] bg-black/85 blur-[6px] transition-all duration-500 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-black/95"
              />

              {/* Left 3D Hardcover Spine Edge */}
              <div
                aria-hidden="true"
                className="h-full w-[6px] shrink-0 rounded-l-[2px] border-y border-l border-[#a67846]/55 bg-gradient-to-r from-[#1c0f06] via-[#4a2b13] to-[#140a04] shadow-inner"
              />

              {/* Exact Official "Why Henry?" Book Cover Artwork */}
              <div
                className={`relative h-full flex-1 overflow-hidden rounded-r-[2px] bg-[#0c0907] shadow-[8px_12px_24px_rgba(0,0,0,0.92)] transition-all duration-300 ${
                  hovered === "why-henry"
                    ? "ring-2 ring-[#ffd584] shadow-[0_14px_34px_rgba(255,196,102,0.5)]"
                    : "ring-1 ring-[#d8b46a]/35"
                }`}
              >
                <Image
                  src="/media/why-henry/cover.webp"
                  alt="Cover of The Unwritten Journey — Book One: Why Henry? by Javier Huertas"
                  fill
                  priority
                  sizes="(min-width: 1024px) 180px, 130px"
                  className="object-fill"
                />
                {/* Top shelf downlight sheen */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#ffe2a8]/12 via-transparent to-black/35"
                />
              </div>

              {/* Right 3D Page Block Thickness */}
              <div
                aria-hidden="true"
                className="h-[97%] w-[5px] shrink-0 self-center rounded-r-[1px] bg-gradient-to-r from-[#dfd0b2] via-[#b8a07a] to-[#7a6444] shadow-[3px_0_6px_rgba(0,0,0,0.85)]"
              />
            </button>
          </div>

          {/* -----------------------------------------------------------------
              OBJECT 2: "THE DREAM OF THE PAYOFF" PHYSICAL 3D HARDCOVER BOOK ON THE SHELF
              Positioned in the exact right shelf niche (x: 71.1%, y: 20.5%)
              over the clean walnut niche plate so extracting it leaves NO duplicate cover.
             ----------------------------------------------------------------- */}
          <div
            style={{
              left: "71.1%",
              top: "20.5%",
              width: "9.4%",
              height: "20.9%",
            }}
            className="absolute z-20 flex items-end justify-center"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,200,112,0.42)_0%,transparent_70%)] transition-opacity duration-300 ${
                hovered === "dream-payoff" && !isDreamPayoffOut ? "opacity-100" : "opacity-0"
              }`}
            />

            <button
              ref={dreamPayoffBookRef}
              type="button"
              data-testid="dream-payoff-shelf-book"
              onClick={() => handleExtractShelfBook("dream-payoff")}
              onMouseEnter={() => setHovered("dream-payoff")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("dream-payoff")}
              onBlur={() => setHovered(null)}
              aria-haspopup="dialog"
              aria-expanded={isDreamPayoffOut}
              aria-label="The Dream of the Payoff — Pull published memoir book from the shelf and open it"
              style={{
                transform: isDreamPayoffOut
                  ? "perspective(800px) rotateY(-8deg) scale(0.9)"
                  : hovered === "dream-payoff"
                    ? "perspective(800px) rotateY(-5deg) rotateX(2deg) translateY(-5px) scale(1.045)"
                    : "perspective(800px) rotateY(-8deg) rotateX(2deg) rotateZ(-0.5deg)",
              }}
              className={`group relative flex h-full w-full cursor-pointer items-stretch p-0 text-left outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isDreamPayoffOut ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <span aria-hidden="true" className="absolute -inset-2" />

              {/* Realistic contact shadow cast onto the walnut shelf back panel */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1.5 -left-2.5 -right-2 top-1.5 rounded-[3px] bg-black/85 blur-[6px] transition-all duration-500 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-black/95"
              />

              {/* Left 3D Hardcover Spine Edge */}
              <div
                aria-hidden="true"
                className="h-full w-[6px] shrink-0 rounded-l-[2px] border-y border-l border-[#c9a45c]/55 bg-gradient-to-r from-[#1c1007] via-[#4a2e14] to-[#140b04] shadow-inner"
              />

              {/* Exact Official Published "The Dream of the Payoff" Book Cover */}
              <div
                className={`relative h-full flex-1 overflow-hidden rounded-r-[2px] bg-[#120d09] shadow-[8px_12px_24px_rgba(0,0,0,0.92)] transition-all duration-300 ${
                  hovered === "dream-payoff"
                    ? "ring-2 ring-[#ffd584] shadow-[0_14px_34px_rgba(255,196,102,0.5)]"
                    : "ring-1 ring-[#d8b46a]/35"
                }`}
              >
                <Image
                  src="/media/memoir/dream-payoff-cover.svg"
                  alt="Cover of The Dream of the Payoff by Javier Huertas"
                  fill
                  priority
                  sizes="(min-width: 1024px) 180px, 130px"
                  className="object-fill"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#ffe2a8]/12 via-transparent to-black/30"
                />
              </div>

              {/* Right 3D Page Block Thickness */}
              <div
                aria-hidden="true"
                className="h-[97%] w-[5px] shrink-0 self-center rounded-r-[1px] bg-gradient-to-r from-[#dfd0b2] via-[#b8a07a] to-[#7a6444] shadow-[3px_0_6px_rgba(0,0,0,0.85)]"
              />
            </button>
          </div>

          {/* -----------------------------------------------------------------
              OBJECT 4: STUDIO LAPTOP SHOWING OFFICIAL SPORTS WAGER HELPER
              Composited directly into the physical laptop bezel on the desk
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-laptop"
            onClick={() => openRoomModal("laptop")}
            onMouseEnter={() => setHovered("laptop")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("laptop")}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "laptop"}
            aria-label="Studio Laptop on desk: Open Sports Wager Helper in-room presentation"
            style={{
              left: "43.4%",
              top: "43.2%",
              width: "23.6%",
              height: "30.0%",
            }}
            className="group absolute z-20 cursor-pointer p-0 text-left outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.015] focus-visible:scale-[1.015]"
          >
            <ArtworkHotspotGlow active={hovered === "laptop"} color="lime"
              points="3,3 88,3 89,74 99,92 95,99 9,98 1,80" />
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 3: SMARTPHONE IN WOODEN DOCK SHOWING REAL UNFILTR SCREEN
              Composited directly onto the angled phone glass on the desk
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-smartphone"
            onClick={() => openRoomModal("smartphone")}
            onMouseEnter={() => setHovered("smartphone")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("smartphone")}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "smartphone"}
            aria-label="Smartphone on wooden dock: Open Unfiltr by Javier in-room presentation"
            style={{
              left: "67.8%",
              top: "50.5%",
              width: "8.8%",
              height: "24.8%",
            }}
            className="group absolute z-20 cursor-pointer p-0 text-left outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:scale-[1.03] focus-visible:-translate-y-1 focus-visible:scale-[1.03]"
          >
            <ArtworkHotspotGlow active={hovered === "smartphone"} color="violet"
              points="20,3 87,4 83,79 95,90 94,98 8,98 4,90 16,82" />
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 5: OPEN LEATHER WRITING JOURNAL ON THE DESK
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-notebook"
            onClick={() => openRoomModal("notebook")}
            onMouseEnter={() => setHovered("notebook")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("notebook")}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "notebook"}
            aria-label="Open Leather Writing Journal on the desk: Open Javier Huertas's writing and creative journey"
            style={{
              left: "15.5%",
              top: "67.5%",
              width: "35.5%",
              height: "20.5%",
            }}
            className="group absolute z-20 cursor-pointer rounded-[12px] p-0 text-left outline-none transition-all duration-300"
          >
            <div
              aria-hidden="true"
              style={{
                transform: "perspective(800px) rotateX(28deg) rotateZ(-4deg)",
              }}
              className={`pointer-events-none h-full w-full rounded-[10px] transition-all duration-300 ${
                hovered === "notebook"
                  ? "ring-2 ring-[#ffd584]/90 bg-[#ffd584]/[0.07] shadow-[0_0_35px_rgba(255,208,128,0.45)]"
                  : "ring-0"
              }`}
            />
          </button>

          {/* Secondary trigger for Creator Story (`hero-meet-creator-btn` compatibility) */}
          <button
            type="button"
            data-testid="hero-meet-creator-btn"
            onClick={() => openRoomModal("notebook")}
            className="sr-only"
          >
            Meet the Creator: {site.founder.name}
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 6: BRASS RING-BOUND DESK CALENDAR
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-calendar"
            onClick={() => openRoomModal("calendar")}
            onMouseEnter={() => setHovered("calendar")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("calendar")}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "calendar"}
            aria-label="Desk Calendar: Open confirmed project milestones and announcements"
            style={{
              left: "77.8%",
              top: "49.5%",
              width: "14.2%",
              height: "23.5%",
            }}
            className="group absolute z-20 cursor-pointer rounded-[10px] p-0 text-left outline-none transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div
              aria-hidden="true"
              style={{
                transform: "perspective(700px) rotateX(8deg) rotateY(-12deg) rotateZ(4deg)",
              }}
              className={`pointer-events-none h-full w-full rounded-[8px] transition-all duration-300 ${
                hovered === "calendar"
                  ? "ring-2 ring-[#ffd584]/90 bg-[#ffd584]/[0.07] shadow-[0_0_32px_rgba(255,208,128,0.45)]"
                  : "ring-0"
              }`}
            />
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 8: WAX-SEALED LETTER ON THE DESK (CONTACT & SOCIALS)
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-contact"
            onClick={() => openRoomModal("contact")}
            onMouseEnter={() => setHovered("contact")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("contact")}
            onBlur={() => setHovered(null)}
            aria-haspopup="dialog"
            aria-expanded={activeModal === "contact"}
            aria-label="Wax-Sealed Letter on the desk: Open verified contact information and social links"
            style={{
              left: "73.5%",
              top: "71.0%",
              width: "19.8%",
              height: "14.5%",
            }}
            className="group absolute z-20 cursor-pointer rounded-[10px] p-0 text-left outline-none transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div
              aria-hidden="true"
              style={{
                transform: "perspective(700px) rotateX(24deg) rotateZ(8deg)",
              }}
              className={`pointer-events-none h-full w-full rounded-[8px] transition-all duration-300 ${
                hovered === "contact"
                  ? "ring-2 ring-[#ffd584]/90 bg-[#ffd584]/[0.08] shadow-[0_0_32px_rgba(255,204,112,0.5)]"
                  : "ring-0"
              }`}
            />
          </button>

          {/* -----------------------------------------------------------------
              GREEN GLASS BANKER'S LAMP & PHYSICAL BRASS PULL-CHAIN ON THE DESK
             ----------------------------------------------------------------- */}
          <BankersLampControl
            lampOn={lampOn}
            onToggleLamp={() => setLampOn((v) => !v)}
            muted={muted}
            onHoverChange={(isHov) => setHovered(isHov ? "lamp" : null)}
          />

          {/* Subtle Top-Right Audio Mute Toggle */}
          <div className="absolute right-4 top-4 z-30">
            <button
              type="button"
              data-testid="audio-mute-toggle"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              aria-label={muted ? "Unmute study sound effects" : "Mute study sound effects"}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/35 bg-[#100a06]/85 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/90 shadow-lg backdrop-blur-md transition-colors hover:border-gold"
            >
              <span>{muted ? "🔇 Muted" : "🔊 Sound"}</span>
            </button>
          </div>

          {/* -----------------------------------------------------------------
              DISCREET IN-SCENE CAPTION PILL (BOTTOM EDGE OF THE STUDY)
             ----------------------------------------------------------------- */}
          <div
            aria-live="polite"
            className="pointer-events-none absolute inset-x-0 bottom-[2.2%] z-30 flex justify-center px-4"
          >
            <div
              className={`inline-flex items-center gap-2.5 rounded-full border border-[#c9a45c]/40 bg-[#0d0805]/88 px-4 py-1.5 text-xs text-bone/95 shadow-[0_10px_28px_rgba(0,0,0,0.9)] backdrop-blur-md transition-opacity duration-300 ${
                hovered ? "opacity-100" : "opacity-85"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#c9a45c]" />
              {hovered === "why-henry" && (
                <span>
                  <strong className="font-medium text-amber">The Unwritten Journey — Book One: Why Henry?</strong> · Pull hardcover from shelf
                </span>
              )}
              {hovered === "dream-payoff" && (
                <span>
                  <strong className="font-medium text-gold">The Dream of the Payoff</strong> · Pull published memoir from shelf
                </span>
              )}
              {hovered === "laptop" && (
                <span>
                  <strong className="font-medium text-[#a3e635]">Sports Wager Helper</strong> · Inspect S.A.L. Workstation
                </span>
              )}
              {hovered === "smartphone" && (
                <span>
                  <strong className="font-medium text-violet">Unfiltr by Javier</strong> · Inspect iOS &amp; Android AI Companion
                </span>
              )}
              {hovered === "notebook" && (
                <span>
                  <strong className="font-medium text-gold">Writing Journal</strong> · Open Javier&apos;s Writing &amp; Creative Journey
                </span>
              )}
              {hovered === "calendar" && (
                <span>
                  <strong className="font-medium text-bone">Desk Calendar</strong> · Confirmed Milestones &amp; Updates
                </span>
              )}
              {hovered === "contact" && (
                <span>
                  <strong className="font-medium text-gold">Wax-Sealed Letter</strong> · Open Verified Contact &amp; Social Links
                </span>
              )}
              {hovered === "lamp" && (
                <span>
                  <strong className="font-medium text-gold">Green Banker&apos;s Lamp</strong> · Click to toggle warm reading light
                </span>
              )}
              {hovered === "brand" && (
                <span>
                  <strong className="font-medium text-gold">IHBNF — Idle Hands Bear No Fruit</strong> · Inspect Framed Wall Emblem
                </span>
              )}
              {!hovered && (
                <span className="text-mute">
                  Explore the study — select the <strong className="font-normal text-gold">Framed IHBNF Emblem</strong>,{" "}
                  <strong className="font-normal text-amber">books on the shelf</strong>,{" "}
                  <strong className="font-normal text-[#a3e635]">laptop</strong>,{" "}
                  <strong className="font-normal text-violet">phone</strong>,{" "}
                  <strong className="font-normal text-gold">journal</strong>,{" "}
                  <strong className="font-normal text-bone">calendar</strong>, or{" "}
                  <strong className="font-normal text-gold">sealed letter</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. PHYSICAL 3D SHELF BOOK EXTRACTION, OPENING & RETURN STAGE
             (Supports BOTH "Why Henry?" AND "The Dream of the Payoff")
         ===================================================================== */}
      {isBookOut && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shelf-open-book-title"
          data-testid={
            activeShelfBook === "why-henry"
              ? "why-henry-open-book-stage"
              : "dream-payoff-open-book-stage"
          }
          data-book-stage={bookStage}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-3 sm:p-6 md:p-10"
        >
          {/* Warm vignette depth-of-field backdrop over the study room (room remains visible behind the book) */}
          <div
            data-testid="why-henry-stage-backdrop"
            onClick={handleReturnShelfBook}
            className={`fixed inset-0 bg-[#050302]/68 backdrop-blur-[4px] transition-opacity duration-500 ${
              bookStage !== "returning" ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* 3D Perspective Book Rig that physically travels from the shelf coordinates to the viewer */}
          <div
            data-testid="why-henry-3d-rig"
            style={{
              perspective: "2000px",
              transform:
                bookStage === "returning" || (bookStage === "extracting" && !extractStarted)
                  ? `translate3d(${flightDelta.dx}px, ${flightDelta.dy}px, -260px) scale(${flightDelta.scale}) rotateY(-18deg) rotateZ(-3deg)`
                  : bookStage === "extracting"
                    ? "translate3d(0px, -28px, 0px) scale(0.90) rotateX(9deg) rotateY(-12deg) rotateZ(2deg)"
                    : bookStage === "floating"
                      ? "translate3d(0px, -18px, 25px) scale(0.92) rotateX(2deg) rotateY(-5deg) rotateZ(-1deg)"
                      : "translate3d(0px, 0px, 0px) scale(1) rotateX(2deg) rotateY(0deg)",
              transition:
                bookStage === "extracting"
                  ? "transform 1100ms cubic-bezier(0.16, 1, 0.30, 1), opacity 900ms ease"
                  : bookStage === "returning"
                    ? "transform 1100ms cubic-bezier(0.38, 0, 0.65, 1), opacity 900ms ease"
                    : "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
              opacity: 1,
            }}
            className="relative z-10 my-auto flex w-full max-w-[960px] items-center justify-center"
          >
            {/* Deep realistic cast shadow beneath the extracted book */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-8 -bottom-8 h-16 rounded-full bg-black/90 blur-2xl transition-all duration-500 ${
                bookStage === "open" || bookStage === "opening" ? "scale-x-100 opacity-70" : "scale-x-50 opacity-45"
              }`}
            />

            {/* ── THE PHYSICAL HARDCOVER BOOK OBJECT (2-PAGE OPEN SPREAD + HINGED 3D FRONT COVER) ── */}
            <div
              style={{ transformStyle: "preserve-3d" }}
              className="relative grid w-full grid-cols-1 overflow-visible rounded-[8px] md:grid-cols-2"
            >
              {/* Leather Hardcover Outer Board & Gilded Page-Block Edges */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-[8px] rounded-[10px] border-2 border-[#6e4926] bg-gradient-to-b from-[#2c190c] via-[#1c0f07] to-[#120904] shadow-[0_35px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(217,140,63,0.18)] transition-opacity duration-300 ${
                  bookStage === "opening" || bookStage === "open" ? "opacity-100" : "opacity-0"
                }`}
              />

              {activeShelfBook === "why-henry" ? (
                <>
                  {/* ── WHY HENRY: LEFT OPEN PAGE (COVER PLATE & BRIAR GLEN ILLUSTRATION GALLERY) ── */}
                  <div
                    data-testid="why-henry-left-page"
                    className={`relative flex flex-col justify-between overflow-hidden rounded-t-[6px] border border-[#b89b72]/45 bg-gradient-to-br from-[#f3ead8] via-[#eadbc0] to-[#dcc69e] p-5 text-[#22170d] shadow-[inset_-18px_0_32px_rgba(68,42,18,0.22)] transition-all duration-500 sm:p-7 md:rounded-l-[6px] md:rounded-tr-none ${
                      (bookStage === "opening" || bookStage === "open")
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#8a683c]/30 pb-2.5">
                      <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#7a4b19]">
                        {whyHenry.details[0].value}
                      </span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#6e4e28]">
                        By {site.founder.name}
                      </span>
                    </div>

                    <div className="my-4 grid grid-cols-12 items-center gap-4">
                      <div className="col-span-5">
                        <div className="relative aspect-[1125/2000] w-full overflow-hidden rounded-[4px] border border-[#6e4c24]/45 bg-[#0d0a08] shadow-[6px_10px_22px_rgba(0,0,0,0.55)]">
                          <Image
                            src="/media/why-henry/cover.webp"
                            alt="Cover of The Unwritten Journey — Book One: Why Henry?"
                            fill
                            sizes="180px"
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="col-span-7 flex flex-col gap-2.5">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[4px] border border-[#8a683c]/40 bg-[#140e09] shadow-md">
                          <Image
                            src={whyHenryIllustrations[henryArtIdx].src}
                            alt={whyHenryIllustrations[henryArtIdx].title}
                            fill
                            sizes="240px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-display text-base font-semibold text-[#24160a]">
                            {whyHenryIllustrations[henryArtIdx].title}
                          </p>
                          <p className="text-xs leading-snug text-[#4d351e]">
                            {whyHenryIllustrations[henryArtIdx].caption}
                          </p>
                        </div>
                        {/* In-Book Illustration Plate Selector */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {whyHenryIllustrations.map((ill, idx) => (
                            <button
                              key={ill.src}
                              type="button"
                              onClick={() => setHenryArtIdx(idx)}
                              className={`cursor-pointer rounded px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-wider transition-colors ${
                                henryArtIdx === idx
                                  ? "bg-[#26170b] text-[#f3ead8]"
                                  : "bg-[#8a683c]/15 text-[#5c3e1e] hover:bg-[#8a683c]/30"
                              }`}
                            >
                              Plate 0{idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#8a683c]/30 pt-2.5 text-xs text-[#5c4022]">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em]">
                        Six Stone Markers · Briar Glen
                      </span>
                      <div aria-hidden="true" className="flex items-end gap-1">
                        {[10, 15, 9, 17, 12, 14].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: h }}
                            className="block w-1.5 rounded-t-full bg-gradient-to-t from-[#6e441b] to-[#c98a38]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── WHY HENRY: RIGHT OPEN PAGE (TITLE, OFFICIAL SYNOPSIS & AMAZON ACTION) ── */}
                  <div
                    data-testid="why-henry-right-page"
                    className="relative flex flex-col justify-between overflow-hidden rounded-b-[6px] border border-[#b89b72]/45 bg-gradient-to-bl from-[#f7efe0] via-[#efe1c8] to-[#e2cfa8] p-5 text-[#1f150c] shadow-[inset_18px_0_32px_rgba(68,42,18,0.18)] sm:p-7 md:rounded-r-[6px] md:rounded-bl-none"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 hidden w-5 bg-gradient-to-r from-[#2e1b0c]/30 via-[#2e1b0c]/10 to-transparent md:block"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 left-3 hidden h-16 w-2 bg-gradient-to-b from-[#962318] to-[#69150d] shadow-md md:block"
                    />

                    <div className="flex items-center justify-between gap-2 border-b border-[#8a683c]/30 pb-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8a5a24]/35 bg-[#8a5a24]/10 px-2.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#7a4b19]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b85d19]" />
                        {whyHenry.statusLabel} · {whyHenry.details[1].value}
                      </span>

                      <button
                        ref={closeBookBtnRef}
                        type="button"
                        data-testid="why-henry-return-shelf-btn"
                        onClick={handleReturnShelfBook}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#f3ead8] shadow-sm transition-colors hover:bg-[#3d2512]"
                      >
                        ← Return to Shelf
                      </button>
                    </div>

                    <div className="my-3.5 space-y-2.5">
                      <p className="font-mono text-[0.64rem] uppercase tracking-[0.26em] text-[#7a4b19]">
                        {whyHenry.title}
                      </p>
                      <h2
                        id="shelf-open-book-title"
                        className="font-display text-3xl leading-[0.98] text-[#170f07] sm:text-4xl"
                      >
                        {whyHenry.subtitle}
                      </h2>

                      <div className="space-y-2 pt-1 text-sm leading-relaxed text-[#382716] sm:text-[0.92rem]">
                        {whyHenry.description.map((para, idx) => (
                          <p
                            key={idx}
                            className={idx === 0 ? "font-display text-lg italic text-[#593818]" : ""}
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#8a683c]/30 pt-3.5">
                      <a
                        href={links.amazonWhyHenry}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="why-henry-modal-amazon-link"
                        className="inline-flex items-center gap-2 rounded-full bg-[#1c1209] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5dfb2] shadow-md transition-colors hover:bg-[#332010]"
                      >
                        Buy on Amazon <ExternalArrow className="h-3.5 w-3.5" />
                      </a>
                      <span className="font-display text-sm italic text-[#5c4022]">
                        “{whyHenry.tagline}”
                      </span>
                    </div>

                    {/* 3D HINGED FRONT COVER FOR WHY HENRY */}
                    <div
                      aria-hidden="true"
                      data-testid="why-henry-3d-front-cover"
                      style={{
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                        transform:
                          (bookStage === "opening" || bookStage === "open") ? "rotateY(-165deg)" : "rotateY(0deg)",
                        transition: "transform 850ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                      className={`pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-r-[6px] border-2 border-[#6e4926] bg-[#0d0a08] shadow-[16px_20px_48px_rgba(0,0,0,0.9)] ${
                        "opacity-100"
                      }`}
                    >
                      <Image
                        src="/media/why-henry/cover.webp"
                        alt=""
                        fill
                        sizes="420px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ── THE DREAM OF THE PAYOFF: LEFT OPEN PAGE (OFFICIAL PUBLISHED COVER & ARTWORK) ── */}
                  <div
                    data-testid="dream-payoff-left-page"
                    className={`relative flex flex-col justify-between overflow-hidden rounded-t-[6px] border border-[#b89b72]/45 bg-gradient-to-br from-[#f3ead8] via-[#eadbc0] to-[#dcc69e] p-5 text-[#22170d] shadow-[inset_-18px_0_32px_rgba(68,42,18,0.22)] transition-all duration-500 sm:p-7 md:rounded-l-[6px] md:rounded-tr-none ${
                      (bookStage === "opening" || bookStage === "open")
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#8a683c]/30 pb-2.5">
                      <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#7a4b19]">
                        {memoir.details[0].value}
                      </span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#6e4e28]">
                        By {site.founder.name}
                      </span>
                    </div>

                    <div className="my-4 grid grid-cols-12 items-center gap-4">
                      <div className="col-span-5">
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[4px] border border-[#6e4c24]/45 bg-[#120d09] shadow-[6px_10px_22px_rgba(0,0,0,0.55)]">
                          <Image
                            src="/media/memoir/dream-payoff-cover.svg"
                            alt="Cover of The Dream of the Payoff by Javier Huertas"
                            fill
                            sizes="180px"
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="col-span-7 flex flex-col gap-3">
                        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[4px] border border-[#8a683c]/40 bg-[#140e09] shadow-md">
                          <Image
                            src="/media/memoir/artwork.webp"
                            alt="Artwork for The Dream of the Payoff"
                            fill
                            sizes="240px"
                            className="object-cover"
                          />
                        </div>
                        <p className="font-display text-base italic leading-snug text-[#3d2814] sm:text-lg">
                          “{memoir.tagline}”
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {memoirThemes.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-[#8a683c]/35 bg-[#8a683c]/10 px-2 py-0.5 text-[0.62rem] text-[#4a3319]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#8a683c]/30 pt-2.5 text-xs text-[#5c4022]">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em]">
                        Published Memoir · Non-Fiction
                      </span>
                      <span className="font-display italic">A true story.</span>
                    </div>
                  </div>

                  {/* ── THE DREAM OF THE PAYOFF: RIGHT OPEN PAGE (DESCRIPTION & VERIFIED PURCHASE LINK) ── */}
                  <div
                    data-testid="dream-payoff-right-page"
                    className="relative flex flex-col justify-between overflow-hidden rounded-b-[6px] border border-[#b89b72]/45 bg-gradient-to-bl from-[#f7efe0] via-[#efe1c8] to-[#e2cfa8] p-5 text-[#1f150c] shadow-[inset_18px_0_32px_rgba(68,42,18,0.18)] sm:p-7 md:rounded-r-[6px] md:rounded-bl-none"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-0 hidden w-5 bg-gradient-to-r from-[#2e1b0c]/30 via-[#2e1b0c]/10 to-transparent md:block"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 left-3 hidden h-16 w-2 bg-gradient-to-b from-[#962318] to-[#69150d] shadow-md md:block"
                    />

                    <div className="flex items-center justify-between gap-2 border-b border-[#8a683c]/30 pb-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8a5a24]/35 bg-[#8a5a24]/10 px-2.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#7a4b19]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b85d19]" />
                        {memoir.statusLabel} · {memoir.details[0].value}
                      </span>

                      <button
                        ref={closeBookBtnRef}
                        type="button"
                        data-testid="dream-payoff-return-shelf-btn"
                        onClick={handleReturnShelfBook}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#f3ead8] shadow-sm transition-colors hover:bg-[#3d2512]"
                      >
                        ← Return to Shelf
                      </button>
                    </div>

                    <div className="my-3.5 space-y-2.5">
                      <p className="font-mono text-[0.64rem] uppercase tracking-[0.26em] text-[#7a4b19]">
                        Published Book by {site.founder.name}
                      </p>
                      <h2
                        id="shelf-open-book-title"
                        className="font-display text-3xl leading-[0.98] text-[#170f07] sm:text-4xl"
                      >
                        {memoir.title}
                      </h2>

                      <div className="space-y-2.5 pt-1 text-sm leading-relaxed text-[#382716] sm:text-[0.92rem]">
                        {memoir.description.map((para, idx) => (
                          <p
                            key={idx}
                            className={idx === 2 ? "font-display text-lg italic text-[#593818]" : ""}
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#8a683c]/30 pt-3.5">
                      <a
                        href={links.amazonWhyHenry}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="dream-payoff-author-amazon-link"
                        className="inline-flex items-center gap-2 rounded-full bg-[#1c1209] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5dfb2] shadow-md transition-colors hover:bg-[#332010]"
                      >
                        Buy on Amazon <ExternalArrow className="h-3.5 w-3.5" />
                      </a>

                      <button
                        type="button"
                        data-testid="dream-payoff-follow-updates-btn"
                        onClick={() => {
                          setBookStage("shelved");
                          openRoomModal("notebook");
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#5c3d1e]/45 bg-[#efe2c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#24170b] transition-colors hover:bg-[#e3d0ad]"
                      >
                        Read Author&apos;s Journal →
                      </button>
                    </div>

                    {/* 3D HINGED FRONT COVER FOR THE DREAM OF THE PAYOFF */}
                    <div
                      aria-hidden="true"
                      style={{
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                        transform:
                          (bookStage === "opening" || bookStage === "open") ? "rotateY(-165deg)" : "rotateY(0deg)",
                        transition: "transform 850ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                      className={`pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-r-[6px] border-2 border-[#6e4926] bg-[#120d09] shadow-[16px_20px_48px_rgba(0,0,0,0.9)] ${
                        "opacity-100"
                      }`}
                    >
                      <Image
                        src="/media/memoir/dream-payoff-cover.svg"
                        alt=""
                        fill
                        sizes="420px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. IN-ROOM OBJECT PRESENTATIONS (ROOM REMAINS VISIBLE BEHIND CONTENT)
         ===================================================================== */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="in-room-presentation-title"
          data-testid={`in-room-modal-${activeModal}`}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-3 sm:p-6 md:p-10"
        >
          {/* Translucent warm study backdrop — keeps the room visible behind the object */}
          <div
            data-testid="in-room-modal-backdrop"
            onClick={closeRoomModal}
            className="fixed inset-0 bg-[#050302]/68 backdrop-blur-[4px] transition-opacity duration-300"
          />

          {/* -----------------------------------------------------------------
              MODAL A: IHBNF WALL LOGO PRESENTATION (PRIMARY HANDS/SOIL/SEEDLING LOGO)
             ----------------------------------------------------------------- */}
          {activeModal === "brand" && (
            <div className="relative z-10 my-auto w-full max-w-[820px] overflow-hidden rounded-[12px] border-[6px] border-[#331e10] bg-gradient-to-b from-[#16100b] via-[#0e0a07] to-[#090604] p-5 text-bone shadow-[0_40px_100px_rgba(0,0,0,0.96),0_0_60px_rgba(201,164,92,0.22),inset_0_0_0_1px_rgba(201,164,92,0.45)] sm:p-8">
              <div className="flex items-center justify-between border-b border-gold/20 pb-3.5">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-gold">
                  IHBNF · The Creative Home of {site.founder.name}
                </span>
                <button
                  ref={closeModalBtnRef}
                  type="button"
                  data-testid="close-in-room-modal-btn"
                  onClick={closeRoomModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/40 bg-[#24160b] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold hover:bg-[#362111]"
                >
                  ← Return to Study
                </button>
              </div>

              <div className="mt-6 grid items-center gap-7 md:grid-cols-12">
                {/* Official Primary Hands / Soil / Seedling Emblem */}
                <div className="flex flex-col items-center md:col-span-5">
                  <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl border border-gold/35 bg-[radial-gradient(circle_at_50%_40%,rgba(201,164,92,0.22),rgba(12,9,6,0.95)_72%)] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                    <Image
                      src="/media/brand/ihbnf-icon.svg"
                      alt="IHBNF Primary Emblem — Hands holding soil and a growing seedling"
                      fill
                      sizes="240px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="relative mt-3 h-12 w-40 opacity-90">
                    <Image
                      src="/media/brand/ihbnf-secondary.svg"
                      alt="IHBNF — Idle Hands Bear No Fruit wordmark"
                      fill
                      sizes="160px"
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Sincere, Welcoming Explanation of IHBNF */}
                <div className="space-y-4 md:col-span-7">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold">
                    What IHBNF Means
                  </p>
                  <h2
                    id="in-room-presentation-title"
                    className="font-display text-3xl leading-[1.02] text-bone sm:text-5xl"
                  >
                    Idle Hands Bear <em className="text-gold">No Fruit.</em>
                  </h2>
                  <p className="text-base leading-relaxed text-bone/90">
                    Welcome in. <strong className="font-medium text-gold">IHBNF</strong> stands for{" "}
                    <em>Idle Hands Bear No Fruit</em>—the creative company and home connecting the books, applications, stories, and independent projects created by{" "}
                    <strong className="font-medium text-bone">{site.founder.name}</strong>.
                  </p>
                  <p className="text-sm leading-relaxed text-mute sm:text-base">
                    The emblem of hands cradling soil and a living seedling reflects a simple conviction: nothing grows on its own. Whether it&apos;s the young-adult fantasy novel <em>The Unwritten Journey — Book One: Why Henry?</em>, the published memoir <em>The Dream of the Payoff</em>, the AI companion app <em>Unfiltr by Javier</em>, or the sports research platform <em>Sports Wager Helper</em>, every project in this study exists because the work was put in to build it.
                  </p>

                  {/* Quick Jump to Inspect Objects in the Study */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleExtractShelfBook("why-henry");
                      }}
                      className="cursor-pointer rounded-full border border-amber/40 bg-amber/15 px-3.5 py-1.5 text-xs font-medium text-amber hover:bg-amber/25"
                    >
                      Open Why Henry?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleExtractShelfBook("dream-payoff");
                      }}
                      className="cursor-pointer rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1.5 text-xs font-medium text-gold hover:bg-gold/25"
                    >
                      Open The Dream of the Payoff
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal("smartphone")}
                      className="cursor-pointer rounded-full border border-violet/40 bg-violet/15 px-3.5 py-1.5 text-xs font-medium text-violet hover:bg-violet/25"
                    >
                      Inspect Unfiltr App
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal("laptop")}
                      className="cursor-pointer rounded-full border border-[#a3e635]/40 bg-[#a3e635]/15 px-3.5 py-1.5 text-xs font-medium text-[#a3e635] hover:bg-[#a3e635]/25"
                    >
                      Inspect Sports Wager Helper
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              MODAL B: SMARTPHONE — UNFILTR BY JAVIER IN-ROOM PRESENTATION
             ----------------------------------------------------------------- */}
          {activeModal === "smartphone" && (
            <div className="relative z-10 my-auto w-full max-w-[880px] overflow-hidden rounded-[22px] border-2 border-violet/45 bg-gradient-to-br from-[#130e24] via-[#0c0918] to-[#07060d] p-5 text-bone shadow-[0_40px_100px_rgba(0,0,0,0.96),0_0_60px_rgba(120,100,255,0.28)] sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-violet">
                  {unfiltr.fullTitle} · {unfiltr.statusLabel}
                </span>
                <button
                  ref={closeModalBtnRef}
                  type="button"
                  data-testid="close-in-room-modal-btn"
                  onClick={closeRoomModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-violet/40 bg-violet/15 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:bg-violet/30"
                >
                  ← Set Phone Down
                </button>
              </div>

              <div className="mt-6 grid items-center gap-7 md:grid-cols-12">
                {/* Physical Smartphone Chassis with Interactive Real Screen Switcher */}
                <div className="flex flex-col items-center md:col-span-5">
                  <div className="relative aspect-[9/19] w-full max-w-[220px] rounded-[2.2rem] border-2 border-white/20 bg-black p-2 shadow-[0_30px_70px_rgba(88,68,214,0.55)]">
                    <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-black">
                      <Image
                        src={unfiltr.media.screenshots![unfiltrScreenIdx].src}
                        alt={unfiltr.media.screenshots![unfiltrScreenIdx].alt}
                        fill
                        sizes="220px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {/* Screen switcher pills */}
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {["Kai Chat", "Zen Journal", "Memory Timeline"].map((label, idx) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setUnfiltrScreenIdx(idx)}
                        className={`cursor-pointer rounded-full px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wider transition-colors ${
                          unfiltrScreenIdx === idx
                            ? "bg-violet font-semibold text-[#130e2c]"
                            : "border border-white/15 bg-white/5 text-mute hover:text-bone"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unfiltr Details, Features & Verified Store Links */}
                <div className="space-y-4 md:col-span-7">
                  <h2
                    id="in-room-presentation-title"
                    className="font-display text-3xl leading-[0.98] text-bone sm:text-5xl"
                  >
                    Conversation that <em className="text-violet">remembers.</em>
                  </h2>
                  <div className="space-y-2 text-sm leading-relaxed text-bone/85 sm:text-base">
                    {unfiltr.description.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  <ul className="grid grid-cols-2 gap-2.5 pt-1">
                    {unfiltr.features!.map((f) => (
                      <li
                        key={f.title}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                      >
                        <p className="text-xs font-semibold text-bone">{f.title}</p>
                        <p className="mt-0.5 text-xs leading-snug text-[#b9b2c9]">{f.text}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <a
                      href={links.unfiltrAppStore}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="unfiltr-modal-appstore-link"
                      className="inline-flex items-center gap-2 rounded-full bg-violet px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#130e2c] transition-colors hover:bg-[#c4baff]"
                    >
                      App Store <ExternalArrow className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={links.unfiltrGooglePlay}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="unfiltr-modal-playstore-link"
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:border-violet"
                    >
                      Google Play <ExternalArrow className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={links.unfiltrSite}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="unfiltr-modal-website-link"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-xs font-medium text-mute transition-colors hover:text-bone"
                    >
                      unfiltrbyjavier.com <ExternalArrow className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              MODAL C: STUDIO LAPTOP — SPORTS WAGER HELPER IN-ROOM PRESENTATION
             ----------------------------------------------------------------- */}
          {activeModal === "laptop" && (
            <div className="relative z-10 my-auto w-full max-w-[880px] overflow-hidden rounded-[20px] border-2 border-[#a3e635]/45 bg-gradient-to-br from-[#0b130c] via-[#070b08] to-[#050705] p-5 text-bone shadow-[0_40px_100px_rgba(0,0,0,0.96),0_0_60px_rgba(132,204,22,0.22)] sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#a3e635]">
                    {swh.fullTitle} · {swh.statusLabel}
                  </span>
                </div>
                <button
                  ref={closeModalBtnRef}
                  type="button"
                  data-testid="close-in-room-modal-btn"
                  onClick={closeRoomModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#a3e635]/40 bg-[#a3e635]/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:bg-[#a3e635]/25"
                >
                  ← Step Back from Laptop
                </button>
              </div>

              <div className="mt-6 grid items-center gap-7 md:grid-cols-12">
                {/* SWH Screen Preview & Official Brand Logo */}
                <div className="space-y-4 md:col-span-5">
                  <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-xl border border-[#a3e635]/30 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                    <Image
                      src="/media/sports-wager-helper/og-image.png"
                      alt="Sports Wager Helper — AI player and team breakdowns before you bet"
                      fill
                      sizes="360px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-black/60 p-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#a3e635]/35 bg-black">
                      <Image
                        src="/media/sports-wager-helper/swh-brand-logo.svg"
                        alt="Sports Wager Helper brand logo"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-bone">S.A.L. · Sports AI Librarian</p>
                      <p className="text-xs text-mute">Research first. Gut feeling second.</p>
                    </div>
                  </div>
                </div>

                {/* SWH Description, Features & Direct Launch Link */}
                <div className="space-y-4 md:col-span-7">
                  <h2
                    id="in-room-presentation-title"
                    className="font-display text-3xl leading-[0.98] text-bone sm:text-5xl"
                  >
                    Know more <em className="text-[#a3e635]">before you bet.</em>
                  </h2>
                  <div className="space-y-2 text-sm leading-relaxed text-bone/85 sm:text-base">
                    {swh.description.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  <ul className="grid grid-cols-2 gap-2.5 pt-1">
                    {swh.features!.map((f) => (
                      <li
                        key={f.title}
                        className="rounded-xl border border-[#a3e635]/15 bg-white/[0.03] p-3"
                      >
                        <p className="text-xs font-semibold text-[#a3e635]">{f.title}</p>
                        <p className="mt-0.5 text-xs leading-snug text-bone/80">{f.text}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={links.sportsWagerHelper}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="swh-modal-launch-link"
                      className="inline-flex items-center gap-2 rounded-full bg-[#a3e635] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-[#bef264]"
                    >
                      Visit sportswagerhelper.com <ExternalArrow className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              MODAL D: FIELD NOTEBOOK — JAVIER'S WRITING & CREATIVE JOURNEY
             ----------------------------------------------------------------- */}
          {activeModal === "notebook" && (
            <div className="relative z-10 my-auto w-full max-w-[880px] overflow-hidden rounded-[10px] border-[6px] border-[#2b180c] bg-gradient-to-br from-[#f5ebd8] via-[#eadbc2] to-[#ddc8a4] p-5 text-[#1f150c] shadow-[0_40px_100px_rgba(0,0,0,0.96)] sm:p-8">
              <div className="flex items-center justify-between border-b border-[#8a683c]/35 pb-3">
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#7a4b19]">
                  Author&apos;s Field Notebook · {site.founder.name}
                </span>
                <button
                  ref={closeModalBtnRef}
                  type="button"
                  data-testid="close-in-room-modal-btn"
                  onClick={closeRoomModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-[#f3ead8] transition-colors hover:bg-[#3d2512]"
                >
                  ← Close Notebook
                </button>
              </div>

              <div className="mt-6 grid gap-7 md:grid-cols-12">
                {/* Left Notebook Page: Founder Portrait & Personal Creative Journey */}
                <div className="space-y-4 md:col-span-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-[#5c3c20] shadow-md">
                      <Image
                        src={site.founder.photo.src}
                        alt={site.founder.photo.alt}
                        fill
                        sizes="80px"
                        className="object-cover object-[50%_38%]"
                      />
                    </div>
                    <div>
                      <h2
                        id="in-room-presentation-title"
                        className="font-display text-3xl leading-none text-[#170f07]"
                      >
                        {site.founder.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-[#7a4b19]">
                        {site.founder.roles.join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm leading-relaxed text-[#382716]">
                    <p>
                      If I&apos;m not working hard, I&apos;m writing books and building apps. That&apos;s really where IHBNF comes from: <em>idle hands bear no fruit.</em>
                    </p>
                    <p>
                      The projects are different because I have a lot to offer and more than one thing I&apos;m interested in creating. The common thread is simple: put in the work and make something worth sharing.
                    </p>
                  </div>

                  <p className="font-display text-2xl italic text-[#4a3219]">— Javier</p>
                </div>

                {/* Right Notebook Page: Writing Slate, More Books in the Works & Philosophy */}
                <div className="space-y-4 border-t border-[#8a683c]/30 pt-4 md:col-span-7 md:border-t-0 md:border-l md:pl-7 md:pt-0">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#7a4b19]">
                      On the Writing Desk
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-[#170f07] sm:text-3xl">
                      If you want more, I&apos;ve got more.
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#382716]">
                      Alongside my published books—<strong>The Unwritten Journey — Book One: Why Henry?</strong> and the autobiographical memoir <strong>The Dream of the Payoff</strong>—there are more books in the works. I&apos;m giving each one the time it deserves before I put it out there.
                    </p>
                  </div>

                  {/* The 6-step IHBNF Working Philosophy */}
                  <div className="rounded-xl border border-[#8a683c]/35 bg-[#efe2c8]/75 p-3.5">
                    <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#7a4b19]">
                      The Working Method
                    </p>
                    <ol className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {philosophySteps.map((step, i) => (
                        <li key={step} className="border-t border-[#8a683c]/35 pt-1.5">
                          <span className="font-mono text-[0.55rem] text-[#8a5a24]">0{i + 1}</span>
                          <p className="font-display text-base leading-tight text-[#1a1109]">{step}.</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleExtractShelfBook("dream-payoff");
                      }}
                      className="cursor-pointer rounded-full bg-[#26170b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#f3ead8] hover:bg-[#3d2512]"
                    >
                      Open The Dream of the Payoff →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleExtractShelfBook("why-henry");
                      }}
                      className="cursor-pointer rounded-full border border-[#5c3d1e]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#26170b] hover:bg-[#e2cfa8]"
                    >
                      Open Why Henry? →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              MODAL E: BRASS DESK CALENDAR — CONFIRMED ANNOUNCEMENTS & MILESTONES
              (Never invents unconfirmed release dates)
             ----------------------------------------------------------------- */}
          {activeModal === "calendar" && (
            <div className="relative z-10 my-auto w-full max-w-[780px] overflow-hidden rounded-[12px] border-2 border-[#c9a45c]/55 bg-gradient-to-b from-[#17110b] via-[#100b07] to-[#090604] p-5 text-bone shadow-[0_40px_100px_rgba(0,0,0,0.96)] sm:p-8">
              <div className="flex items-center justify-between border-b border-gold/25 pb-3.5">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-gold">
                  Studio Desk Calendar · Confirmed Status &amp; Milestones
                </span>
                <button
                  ref={closeModalBtnRef}
                  type="button"
                  data-testid="close-in-room-modal-btn"
                  onClick={closeRoomModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/40 bg-[#24160b] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold"
                >
                  ← Return to Study
                </button>
              </div>

              <div className="mt-5">
                <h2
                  id="in-room-presentation-title"
                  className="font-display text-3xl text-bone sm:text-4xl"
                >
                  Published Works, Live Apps &amp; What&apos;s Next
                </h2>
                <p className="mt-2 text-sm text-mute">
                  Verified project milestones across IHBNF. Future books in the series are shared only when they are ready—no artificial countdowns or unconfirmed release dates.
                </p>

                <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
                  {/* Milestone 1: Why Henry */}
                  <div className="rounded-xl border border-amber/35 bg-amber/[0.06] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber">
                        Published &amp; Available Now
                      </span>
                      <span className="h-2 w-2 rounded-full bg-amber" />
                    </div>
                    <h3 className="mt-2 font-display text-2xl text-bone">
                      The Unwritten Journey — Book One: Why Henry?
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-mute">
                      Young-adult fantasy adventure by Javier Huertas. Available now on Amazon.
                    </p>
                    <a
                      href={links.amazonWhyHenry}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber hover:underline"
                    >
                      Buy on Amazon <ExternalArrow className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Milestone 2: The Dream of the Payoff */}
                  <div className="rounded-xl border border-gold/35 bg-gold/[0.06] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                        Published &amp; Available Now
                      </span>
                      <span className="h-2 w-2 rounded-full bg-gold" />
                    </div>
                    <h3 className="mt-2 font-display text-2xl text-bone">
                      The Dream of the Payoff
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-mute">
                      Javier&apos;s autobiographical memoir—a life built through work, sacrifice, family, and persistence.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleExtractShelfBook("dream-payoff");
                      }}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                    >
                      Pull Book from Shelf →
                    </button>
                  </div>

                  {/* Milestone 3: Unfiltr */}
                  <div className="rounded-xl border border-violet/35 bg-violet/[0.06] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet">
                        Live · iOS &amp; Android
                      </span>
                      <span className="h-2 w-2 rounded-full bg-violet" />
                    </div>
                    <h3 className="mt-2 font-display text-2xl text-bone">
                      Unfiltr by Javier
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-mute">
                      AI companion app with persistent memory, voice, immersive chat worlds, journaling, and meditation.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveModal("smartphone")}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-violet hover:underline"
                    >
                      Inspect Phone in Study →
                    </button>
                  </div>

                  {/* Milestone 4: Sports Wager Helper */}
                  <div className="rounded-xl border border-[#a3e635]/35 bg-[#a3e635]/[0.06] p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#a3e635]">
                        Live · Web + Mobile Companion
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#a3e635]" />
                    </div>
                    <h3 className="mt-2 font-display text-2xl text-bone">
                      Sports Wager Helper
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-mute">
                      Player &amp; team research, matchup trends, live scores, and S.A.L. (Sports AI Librarian) breakdowns.
                    </p>
                    <a
                      href={links.sportsWagerHelper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#a3e635] hover:underline"
                    >
                      Visit sportswagerhelper.com <ExternalArrow className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              MODAL F: WAX-SEALED LETTER — VERIFIED CONTACT & SOCIAL LINKS
             ----------------------------------------------------------------- */}
          {activeModal === "contact" && (
            <div className="relative z-10 my-auto w-full max-w-[820px] overflow-hidden rounded-[12px] border-2 border-[#c9a45c]/55 bg-gradient-to-b from-[#17110b] via-[#100b07] to-[#090604] p-5 text-bone shadow-[0_40px_100px_rgba(0,0,0,0.96)] sm:p-8">
              <div className="flex items-center justify-between border-b border-gold/25 pb-3.5">
                <span className="font-mono text-xs uppercase tracking-[0.24em] text-gold">
                  Correspondence &amp; Verified Channels · IHBNF
                </span>
                <button
                  ref={closeModalBtnRef}
                  type="button"
                  data-testid="close-in-room-modal-btn"
                  onClick={closeRoomModal}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/40 bg-[#24160b] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-bone transition-colors hover:border-gold"
                >
                  ← Return to Study
                </button>
              </div>

              <div className="mt-6 grid gap-7 md:grid-cols-12">
                <div className="space-y-4 md:col-span-5">
                  <h2
                    id="in-room-presentation-title"
                    className="font-display text-3xl leading-[0.98] text-bone sm:text-4xl"
                  >
                    Want to see what I build next?
                  </h2>
                  <p className="text-sm leading-relaxed text-mute">
                    I&apos;d tell you exactly what comes next, but half the time I don&apos;t know yet either. Follow along or reach out directly.
                  </p>
                  <EmailReveal />
                  <div className="pt-1 text-xs text-mute">
                    <Link href="/privacy" className="underline decoration-bone/30 underline-offset-4 hover:text-bone">
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:col-span-7">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`social-link-${s.key}`}
                        className="group flex items-center gap-3.5 rounded-xl border border-bone/12 bg-white/[0.03] px-4 py-3 transition-colors hover:border-gold/50 hover:bg-white/[0.06]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bone/10 text-bone transition-colors group-hover:bg-gold group-hover:text-ink">
                          <SocialIcon name={s.key} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-bone">{s.label}</span>
                          <span className="block truncate text-xs text-mute">{s.handle}</span>
                        </span>
                        <ExternalArrow className="h-3.5 w-3.5 shrink-0 text-mute group-hover:text-gold" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
