"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProject } from "@/content/projects";
import { links, site } from "@/content/site";
import { Arrow, ExternalArrow } from "@/components/ui/Icons";

type HoveredItem =
  | null
  | "why-henry"
  | "laptop"
  | "smartphone"
  | "notebook"
  | "calendar"
  | "lamp"
  | "brand"
  | "portrait";

/**
 * Five-stage state machine for the physical Why Henry? book interaction:
 * - "shelved": Sitting naturally on the walnut bookshelf
 * - "extracting": Sliding out of the shelf slot, moving forward with depth & rotating toward the viewer
 * - "open": Front cover swings open (-160deg) & pages fan open to reveal the parchment spread
 * - "closing-cover": Front cover & pages fold shut back into a closed 3D hardcover
 * - "returning": Book slides back into its walnut shelf slot
 */
type BookStage = "shelved" | "extracting" | "open" | "closing-cover" | "returning";

const shelfLeftSpines = [
  { title: "NOTES ON CRAFT", h: "h-[76%]", w: "w-[22px]", bg: "from-[#2d1d12] via-[#3e291a] to-[#1e120b]", band: "bg-[#c9a45c]/65" },
  { title: "BRIAR GLEN LORE", h: "h-[84%]", w: "w-[26px]", bg: "from-[#1c2b22] via-[#263b2f] to-[#101a14]", band: "bg-[#d98c3f]/70" },
  { title: "CHRONICLES I", h: "h-[79%]", w: "w-[20px]", bg: "from-[#3b1c16] via-[#542820] to-[#24100c]", band: "bg-[#e6c47a]/65" },
  { title: "OLD MAPS", h: "h-[72%]", w: "w-[18px]", bg: "from-[#2a2333] via-[#393047] to-[#18141f]", band: "bg-[#c9a45c]/50" },
];

const shelfRightSpines = [
  { title: "BOOK TWO · DRAFT", h: "h-[82%]", w: "w-[25px]", bg: "from-[#332211] via-[#4a3219] to-[#1f1409]", band: "bg-[#c9a45c]/75" },
  { title: "THE PAYOFF", h: "h-[78%]", w: "w-[28px]", bg: "from-[#442018] via-[#5e2d22] to-[#28120d]", band: "bg-[#f2d59c]/70" },
  { title: "FIELD ARCHIVE", h: "h-[74%]", w: "w-[20px]", bg: "from-[#1d2630] via-[#293645] to-[#11171d]", band: "bg-[#c9a45c]/55" },
];

const upperShelfLeftSpines = [
  { h: "h-[78%]", w: "w-[20px]", bg: "from-[#2c1d14] to-[#170f0a]" },
  { h: "h-[85%]", w: "w-[24px]", bg: "from-[#3a2018] to-[#1c0f0b]" },
  { h: "h-[74%]", w: "w-[18px]", bg: "from-[#1f2922] to-[#101612]" },
  { h: "h-[82%]", w: "w-[26px]", bg: "from-[#362819] to-[#1b140c]" },
  { h: "h-[70%]", w: "w-[19px]", bg: "from-[#28212e] to-[#141018]" },
  { h: "h-[80%]", w: "w-[22px]", bg: "from-[#422918] to-[#21140b]" },
];

export function LivingWorkspace() {
  const whyHenry = getProject("why-henry")!;
  const [hovered, setHovered] = useState<HoveredItem>(null);
  const [lampOn, setLampOn] = useState(true);
  const [bookStage, setBookStage] = useState<BookStage>("shelved");
  const [extractStarted, setExtractStarted] = useState(false);
  const [flightDelta, setFlightDelta] = useState({ dx: 220, dy: -90, scale: 0.34 });

  const shelfBookRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const stageTimersRef = useRef<number[]>([]);

  const clearStageTimers = useCallback(() => {
    stageTimersRef.current.forEach((id) => window.clearTimeout(id));
    stageTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearStageTimers();
  }, [clearStageTimers]);

  // Measure the shelf book's exact viewport coordinates so the 3D extraction originates from and returns to its true shelf slot
  const computeShelfDelta = useCallback(() => {
    if (typeof window === "undefined" || !shelfBookRef.current) return;
    const rect = shelfBookRef.current.getBoundingClientRect();
    const bookCenterX = rect.left + rect.width / 2;
    const bookCenterY = rect.top + rect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    setFlightDelta({
      dx: Math.round(bookCenterX - viewportCenterX),
      dy: Math.round(bookCenterY - viewportCenterY),
      scale: Math.max(0.24, Math.min(0.48, +(rect.height / 480).toFixed(2))),
    });
  }, []);

  // Trigger physical extraction & cover opening sequence
  const handleExtractWhyHenry = useCallback(() => {
    if (bookStage !== "shelved") return;
    clearStageTimers();
    computeShelfDelta();
    setExtractStarted(false);
    setBookStage("extracting");

    // Next frame: trigger smooth CSS 3D interpolation from the shelf slot coordinates out toward the viewer
    const rafId = window.setTimeout(() => {
      setExtractStarted(true);
    }, 25);

    // After sliding out from the shelf and rotating toward the viewer, swing the cover & fan pages open
    const openTimer = window.setTimeout(() => {
      setBookStage("open");
      window.setTimeout(() => {
        closeButtonRef.current?.focus({ preventScroll: true });
      }, 120);
    }, 620);

    stageTimersRef.current.push(rafId, openTimer);
  }, [bookStage, clearStageTimers, computeShelfDelta]);

  // Trigger reverse animation: fold cover shut -> slide back into walnut shelf slot
  const handleReturnWhyHenry = useCallback(() => {
    if (bookStage !== "open" && bookStage !== "extracting") return;
    clearStageTimers();
    computeShelfDelta();
    setBookStage("closing-cover");

    const returnTimer = window.setTimeout(() => {
      setExtractStarted(false);
      setBookStage("returning");
    }, 520);

    const shelvedTimer = window.setTimeout(() => {
      setBookStage("shelved");
      window.setTimeout(() => {
        shelfBookRef.current?.focus({ preventScroll: true });
      }, 60);
    }, 1080);

    stageTimersRef.current.push(returnTimer, shelvedTimer);
  }, [bookStage, clearStageTimers, computeShelfDelta]);

  // Allow Escape key to close the book and return it to the shelf
  useEffect(() => {
    if (bookStage === "shelved") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleReturnWhyHenry();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bookStage, handleReturnWhyHenry]);

  const isBookOut = bookStage !== "shelved";

  return (
    <section
      id="home"
      data-testid="hero-section"
      aria-label="Javier Huertas's Study — Interactive Point-and-Click Environment"
      className="relative isolate flex h-[100svh] min-h-[600px] w-full flex-col justify-end overflow-hidden bg-[#060403] select-none"
    >
      {/* =====================================================================
          1. ROOM ARCHITECTURE: BACK WALL, WAINSCOTING, WINDOW & AMBIENT LIGHT
         ===================================================================== */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        {/* Deep nocturnal study wallpaper & warm wood paneling gradient */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: lampOn
              ? "radial-gradient(ellipse 75% 60% at 32% 48%, rgba(168, 98, 42, 0.28) 0%, rgba(72, 39, 18, 0.40) 42%, rgba(16, 10, 7, 0.96) 80%, #050302 100%)"
              : "radial-gradient(ellipse 65% 50% at 50% 45%, rgba(62, 36, 18, 0.18) 0%, rgba(12, 8, 6, 0.96) 75%, #030202 100%)",
          }}
        />

        {/* Classical study vertical wall paneling / wainscoting grooves */}
        <div
          className="absolute inset-x-0 top-0 h-[66%] opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 2px, rgba(214,158,92,0.04) 3px, transparent 4px, transparent 96px)",
          }}
        />

        {/* Horizontal chair-rail molding across the back wall behind the desk */}
        <div className="absolute inset-x-0 top-[54%] h-3 border-y border-[#4a2e18]/50 bg-gradient-to-b from-[#2b1a0e] via-[#150c06] to-[#0c0704] shadow-[0_8px_20px_rgba(0,0,0,0.85)]" />

        {/* Lower wainscoting recessed panels */}
        <div className="absolute inset-x-0 top-[55%] h-[22%] bg-[#0b0705]" />

        {/* Left Study Casement Window (Night sky + warm interior reflection) */}
        <div className="absolute -left-6 top-[8%] hidden h-[44%] w-[15%] rounded-r-lg border-y-4 border-r-4 border-[#2b190d] bg-gradient-to-b from-[#0b1320] via-[#111c2d] to-[#18222f] opacity-75 shadow-[inset_0_0_40px_rgba(0,0,0,0.9),12px_20px_50px_rgba(0,0,0,0.85)] xl:block">
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-[#24150b] shadow-md" />
          <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-[#24150b] shadow-md" />
          <div className="absolute right-4 top-6 h-12 w-12 rounded-full bg-[#dce8ff]/10 blur-xl" />
          {lampOn && (
            <div className="absolute bottom-6 right-4 h-24 w-20 rounded-full bg-[#ffae52]/15 blur-2xl" />
          )}
        </div>

        {/* Volumetric warm light cone cast from the desk lamp across the desk & bookshelf */}
        <div
          className={`absolute left-[8%] top-[12%] h-[78%] w-[62%] rounded-full blur-3xl transition-opacity duration-700 ${
            lampOn ? "opacity-95" : "opacity-20"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 32% 48%, rgba(255, 196, 108, 0.34) 0%, rgba(224, 136, 56, 0.18) 38%, rgba(138, 72, 24, 0.06) 65%, transparent 82%)",
          }}
        />

        {/* Secondary warm overhead library-light glow on the bookshelf */}
        <div
          className={`absolute right-[10%] top-[4%] h-[58%] w-[44%] rounded-full blur-3xl transition-opacity duration-700 ${
            lampOn ? "opacity-90" : "opacity-35"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 55% 28%, rgba(255, 204, 128, 0.25) 0%, rgba(196, 122, 52, 0.12) 48%, transparent 78%)",
          }}
        />
      </div>

      {/* =====================================================================
          2. SCENE STAGE: ONE COHESIVE CAMERA VIEW OF THE STUDY
         ===================================================================== */}
      <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end overflow-x-auto overflow-y-hidden px-1 pt-4 pb-0 sm:px-6 sm:pt-8">
        {/* Perspective Room Container — scrollable horizontally on ultra-narrow screens so touch targets remain large and natural */}
        <div className="relative mx-auto my-auto aspect-[16/10] w-full min-w-[680px] max-w-[1440px] max-h-[92svh] lg:aspect-[16/9]">
          {/* -----------------------------------------------------------------
              A. FRAMED IHBNF WALL ARTWORK & MOTTO PLAQUE (LEFT-CENTER WALL)
             ----------------------------------------------------------------- */}
          <Link
            href="/#work"
            data-testid="hero-title"
            onMouseEnter={() => setHovered("brand")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered("brand")}
            onBlur={() => setHovered(null)}
            aria-label="IHBNF — Idle Hands Bear No Fruit: Explore Work"
            className="group absolute left-[6%] top-[3%] z-10 w-[36%] max-w-[430px] cursor-pointer outline-none transition-transform duration-500 hover:scale-[1.015] focus-visible:scale-[1.015] sm:left-[8%] lg:left-[10%] lg:w-[33%]"
          >
            {/* Brass Picture Light mounted above the frame */}
            <div aria-hidden="true" className="mx-auto mb-1.5 flex w-36 flex-col items-center">
              <div className="h-2 w-24 rounded-full border border-[#d8b46a]/60 bg-gradient-to-r from-[#4a3219] via-[#e2be78] to-[#4a3219] shadow-[0_6px_24px_rgba(255,198,110,0.6)]" />
              <div className="h-1.5 w-1.5 bg-[#8a6432]" />
            </div>

            {/* Ornate Dark Walnut & Brushed Brass Gallery Frame on the Wall */}
            <div
              className={`relative overflow-hidden rounded-[6px] border-[6px] border-[#2e1b0f] bg-[#0b0806] p-2.5 transition-shadow duration-500 sm:border-[8px] sm:p-3.5 ${
                hovered === "brand"
                  ? "shadow-[0_28px_60px_rgba(0,0,0,0.92),0_0_28px_rgba(201,164,92,0.38),inset_0_0_0_1px_rgba(255,216,138,0.75)]"
                  : "shadow-[0_28px_60px_rgba(0,0,0,0.92),0_4px_12px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(201,164,92,0.45)]"
              }`}
            >
              <div className="relative overflow-hidden rounded-[2px] border border-[#c9a45c]/30 bg-gradient-to-b from-[#16100b] via-[#0d0907] to-[#080604] px-4 py-3 shadow-[inset_0_4px_18px_rgba(0,0,0,0.9)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_15%,rgba(255,208,132,0.18),transparent_72%)]"
                />
                <Image
                  src="/media/brand/ihbnf-secondary.svg"
                  alt="IHBNF — Idle Hands Bear No Fruit"
                  width={1200}
                  height={800}
                  priority
                  className="relative z-10 mx-auto h-auto w-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Engraved Brass Gallery Plate on Frame Bottom */}
              <div className="mt-1.5 flex items-center justify-between px-1 text-[0.58rem] uppercase tracking-[0.22em] text-[#d6b26a]/85 sm:text-[0.64rem]">
                <span>{site.founder.name}</span>
                <span className="font-display italic normal-case tracking-normal text-bone/80">
                  “I write books. I build apps.”
                </span>
              </div>
            </div>
          </Link>

          {/* -----------------------------------------------------------------
              B. HANDCRAFTED WALNUT BOOKSHELF (STANDING BEHIND RIGHT SIDE OF DESK)
             ----------------------------------------------------------------- */}
          <div
            data-testid="workspace-bookshelf"
            className="absolute right-[3%] top-[1%] z-10 flex h-[64%] w-[49%] max-w-[650px] flex-col justify-between rounded-t-[8px] border-x-[10px] border-t-[12px] border-[#2d1a0e] bg-[#120a05] shadow-[-24px_30px_70px_rgba(0,0,0,0.95),inset_0_0_40px_rgba(0,0,0,0.9)] sm:right-[4%] sm:w-[46%] sm:border-x-[14px] sm:border-t-[16px]"
          >
            {/* Top Crown Molding of the Walnut Bookcase */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-[18px] -top-[20px] h-5 rounded-t-[4px] border-t border-[#9c6b3b]/45 bg-gradient-to-b from-[#4a2c17] via-[#331d0e] to-[#1d1008] shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
            />

            {/* Back Panel Vertical Walnut Planks inside the Bookcase */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, #160c06 0px, #160c06 38px, #090502 39px, #24140a 40px)",
              }}
            />

            {/* Warm Brass Library Light mounted to top cornice */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-[radial-gradient(ellipse_65%_90%_at_52%_0%,rgba(255,202,120,0.32),transparent_75%)]"
            />

            {/* ── UPPER SHELF: Reference Volumes, Six Glowing Stone Markers & Author Frame ── */}
            <div className="relative z-10 flex h-[38%] w-full items-end justify-between px-3 pt-3 sm:px-5">
              {/* Row of weathered leather reference volumes on upper left */}
              <div aria-hidden="true" className="flex h-full items-end gap-[3px]">
                {upperShelfLeftSpines.map((b, i) => (
                  <div
                    key={i}
                    className={`${b.h} ${b.w} rounded-t-[2px] border-t border-white/10 bg-gradient-to-r ${b.bg} shadow-[2px_0_6px_rgba(0,0,0,0.8)]`}
                  >
                    <div className="mt-2 h-0.5 w-full bg-[#c9a45c]/40" />
                    <div className="mt-auto mb-2 h-0.5 w-full bg-[#c9a45c]/30" />
                  </div>
                ))}
              </div>

              {/* Briar Glen Six Carved Stone Markers resting on a dark velvet plinth */}
              <div
                aria-hidden="true"
                className="mx-auto flex flex-col items-center pb-0.5"
                title="Six Mysterious Stone Markers of Briar Glen"
              >
                <div className="flex items-end gap-1.5 px-2">
                  {[16, 24, 14, 26, 18, 22].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: h }}
                      className="block w-2 rounded-t-full bg-gradient-to-t from-[#5c3818] via-[#d98c3f] to-[#ffe4a8] shadow-[0_0_10px_rgba(242,213,156,0.55)]"
                    />
                  ))}
                </div>
                <div className="h-1.5 w-28 rounded-t-sm border-t border-[#c9a45c]/35 bg-[#2a190d] shadow-md" />
              </div>

              {/* Small Framed Author Portrait standing on upper right shelf */}
              <Link
                href="/#about"
                data-testid="hero-meet-creator-btn"
                onMouseEnter={() => setHovered("portrait")}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered("portrait")}
                onBlur={() => setHovered(null)}
                aria-label={`Meet the Creator: ${site.founder.name}`}
                className="group relative mb-0.5 aspect-[4/5] h-[82%] overflow-hidden rounded-[3px] border-[3px] border-[#5c3c20] bg-[#1a110a] shadow-[-6px_6px_16px_rgba(0,0,0,0.85)] transition-all duration-300 hover:scale-105 hover:border-[#ffd584] focus-visible:scale-105"
              >
                <Image
                  src={site.founder.photo.src}
                  alt={site.founder.photo.alt}
                  fill
                  sizes="90px"
                  className="object-cover object-[50%_38%]"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-[#c9a45c]/35 group-hover:ring-[#ffd584]/80" />
              </Link>
            </div>

            {/* Solid Walnut Middle Shelf Plank */}
            <div
              aria-hidden="true"
              className="relative z-20 h-3.5 w-full border-t border-[#a67342]/45 bg-gradient-to-b from-[#4f2e17] via-[#341d0e] to-[#1a0d05] shadow-[0_10px_22px_rgba(0,0,0,0.92)] sm:h-4"
            />

            {/* ── MAIN EYE-LEVEL SHELF: THE ACTUAL "WHY HENRY?" BOOK IN NATURAL POSITION ── */}
            <div className="relative z-10 flex h-[58%] w-full items-end justify-between px-3 pt-2 sm:px-6">
              {/* Under-shelf shadow cast downward */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/80 to-transparent"
              />

              {/* Left Neighboring Hardcover Spines */}
              <div aria-hidden="true" className="flex h-full items-end gap-[4px] pb-[1px]">
                {shelfLeftSpines.map((spine, idx) => (
                  <div
                    key={idx}
                    className={`relative flex ${spine.h} ${spine.w} flex-col justify-between rounded-t-[2px] border-l border-t border-white/10 bg-gradient-to-r ${spine.bg} py-2 shadow-[4px_0_10px_rgba(0,0,0,0.85)]`}
                  >
                    <div className={`h-[2px] w-full ${spine.band}`} />
                    <span className="writing-vertical-rl mx-auto rotate-180 text-[0.42rem] tracking-[0.2em] text-[#e6d5b8]/65">
                      {spine.title}
                    </span>
                    <div className={`h-[2px] w-full ${spine.band}`} />
                  </div>
                ))}
              </div>

              {/* ★ HERO OBJECT: THE ACTUAL "WHY HENRY?" HARDCOVER BOOK ON THE SHELF ★
                  Clicking physically extracts the book from this slot, brings it forward, and opens it */}
              <div className="relative z-30 mx-auto flex h-full items-end pb-[2px]">
                {/* Empty darkened recess slot visible on the shelf while the book is pulled out */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-1 bottom-[2px] h-[90%] rounded-[3px] border border-amber/15 bg-black/80 shadow-[inset_0_0_24px_rgba(0,0,0,0.98)] transition-opacity duration-500 ${
                    isBookOut ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Ambient warm spotlight specifically illuminating Why Henry */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(255,194,102,0.38)_0%,transparent_70%)] transition-opacity duration-500 ${
                    hovered === "why-henry" ? "opacity-100" : "opacity-65"
                  }`}
                />

                <button
                  ref={shelfBookRef}
                  type="button"
                  data-testid="why-henry-shelf-book"
                  onClick={handleExtractWhyHenry}
                  onMouseEnter={() => setHovered("why-henry")}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered("why-henry")}
                  onBlur={() => setHovered(null)}
                  aria-haspopup="dialog"
                  aria-expanded={isBookOut}
                  aria-label="The Unwritten Journey — Book One: Why Henry? — Pull book from the shelf and open it"
                  className={`group relative flex h-[92%] aspect-[1125/2000] cursor-pointer items-end p-0 text-left outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isBookOut
                      ? "pointer-events-none scale-90 opacity-0"
                      : "hover:-translate-y-2.5 hover:scale-[1.05] focus-visible:-translate-y-2.5 focus-visible:scale-[1.05]"
                  }`}
                >
                  {/* Generous invisible hit-area expansion for effortless touch interaction */}
                  <span aria-hidden="true" className="absolute -inset-3" />

                  {/* Cast shadow behind book onto shelf back wall */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-1 -left-3 -right-4 top-2 rounded-[4px] bg-black/85 blur-md transition-all duration-500 group-hover:-bottom-3 group-hover:bg-black/95 group-hover:blur-lg"
                  />

                  {/* Left 3D Hardcover Spine Edge */}
                  <div
                    aria-hidden="true"
                    className="h-full w-[9px] shrink-0 rounded-l-[2px] border-y border-l border-[#a67846]/50 bg-gradient-to-r from-[#241409] via-[#4d2d16] to-[#1a0e06] shadow-inner"
                  />

                  {/* Official "Why Henry?" Book Cover Face */}
                  <div className="relative h-full w-full overflow-hidden rounded-r-[3px] bg-[#0d0a08] shadow-[10px_14px_28px_rgba(0,0,0,0.92)] ring-1 ring-[#e8c47c]/40 transition-all duration-300 group-hover:shadow-[0_18px_38px_rgba(217,140,63,0.45)] group-hover:ring-2 group-hover:ring-[#ffd584] group-focus-visible:ring-2 group-focus-visible:ring-[#ffd584]">
                    <Image
                      src="/media/why-henry/cover.webp"
                      alt="Cover of The Unwritten Journey — Book One: Why Henry? by Javier Huertas"
                      fill
                      priority
                      sizes="(min-width: 1024px) 180px, 130px"
                      className="object-contain"
                    />
                    {/* Subtle natural sheen across hardcover laminate */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </div>

                  {/* Right Gilded Page Block Edge (3D depth) */}
                  <div
                    aria-hidden="true"
                    className="h-[97%] w-[5px] shrink-0 self-center rounded-r-[1px] bg-gradient-to-r from-[#d8c7a8] via-[#b8a27e] to-[#8c7654] shadow-[2px_0_4px_rgba(0,0,0,0.8)]"
                  />

                  {/* Small Brass Bookstand Lip holding the book at bottom */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-[3px] left-1/2 h-[4px] w-[70%] -translate-x-1/2 rounded-t-sm bg-gradient-to-r from-[#7a5828] via-[#e2be74] to-[#7a5828] shadow-sm"
                  />

                  {/* Subtle warm brass glint indicator for touch/pointer discoverability */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber/90 text-[0.55rem] text-ink shadow-[0_0_12px_#ffcf85] transition-transform duration-300 group-hover:scale-125"
                  >
                    ✦
                  </span>
                </button>
              </div>

              {/* Right Neighboring Hardcover Spines (including leaning volume) */}
              <div aria-hidden="true" className="flex h-full items-end gap-[4px] pb-[1px]">
                {shelfRightSpines.map((spine, idx) => (
                  <div
                    key={idx}
                    className={`relative flex ${spine.h} ${spine.w} flex-col justify-between rounded-t-[2px] border-l border-t border-white/10 bg-gradient-to-r ${spine.bg} py-2 shadow-[-3px_0_10px_rgba(0,0,0,0.85)] ${
                      idx === shelfRightSpines.length - 1 ? "origin-bottom-left -rotate-[5deg] mr-1" : ""
                    }`}
                  >
                    <div className={`h-[2px] w-full ${spine.band}`} />
                    <span className="writing-vertical-rl mx-auto rotate-180 text-[0.42rem] tracking-[0.18em] text-[#e6d5b8]/65">
                      {spine.title}
                    </span>
                    <div className={`h-[2px] w-full ${spine.band}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Solid Walnut Main Shelf Plank (with brass catalog plate) */}
            <div
              aria-hidden="true"
              className="relative z-20 flex h-4 w-full items-center justify-center border-t border-[#b8834c]/55 bg-gradient-to-b from-[#59341a] via-[#381f0e] to-[#1c0e05] shadow-[0_14px_28px_rgba(0,0,0,0.95)] sm:h-5"
            >
              <div className="h-2 w-14 rounded-[1px] border border-[#e5c178]/50 bg-gradient-to-r from-[#6e4e23] via-[#d8b467] to-[#6e4e23] shadow-sm" />
            </div>
          </div>

          {/* -----------------------------------------------------------------
              C. THE PHYSICAL WALNUT DESK & FOREGROUND OBJECTS
             ----------------------------------------------------------------- */}
          <div
            data-testid="walnut-desk-surface"
            className="absolute inset-x-0 bottom-0 z-20 h-[47%] w-full"
          >
            {/* ── 1. Perspective Trapezoid Walnut Tabletop Surface ── */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[1%] top-[12%] bottom-[16%] rounded-t-[18px] border-t border-[#a87442]/50 shadow-[0_-20px_60px_rgba(0,0,0,0.85),0_30px_80px_rgba(0,0,0,0.95)]"
              style={{
                background:
                  "radial-gradient(ellipse 75% 70% at 38% 35%, #5c361c 0%, #3a2010 48%, #211108 82%, #130904 100%)",
                transform: "perspective(1100px) rotateX(22deg)",
                transformOrigin: "bottom center",
              }}
            >
              {/* Natural Horizontal Walnut Burl & Wood Grain Streaks */}
              <div
                className="absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(180deg, rgba(16,8,3,0) 0px, rgba(16,8,3,0) 9px, rgba(10,4,1,0.45) 11px, rgba(176,112,62,0.12) 13px, rgba(16,8,3,0) 19px)",
                }}
              />

              {/* Warm Specular Surface Reflection from the Lamp & Laptop Screen */}
              {lampOn && (
                <div className="absolute left-[6%] top-[8%] h-[75%] w-[42%] rounded-full bg-[radial-gradient(ellipse,rgba(255,194,102,0.28)_0%,transparent_70%)] blur-xl" />
              )}
              <div className="absolute left-[36%] top-[12%] h-[65%] w-[32%] rounded-full bg-[radial-gradient(ellipse,rgba(163,230,53,0.09)_0%,transparent_70%)] blur-xl" />

              {/* Center Leather Desk Blotter Mat resting on the Walnut Surface */}
              <div className="absolute inset-x-[16%] top-[16%] bottom-[10%] rounded-[10px] border border-[#c9a45c]/25 bg-gradient-to-b from-[#17110d] to-[#0f0a07] shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="absolute inset-1.5 rounded-[7px] border border-[#c9a45c]/20" />
              </div>
            </div>

            {/* ── 2. Front Carved Walnut Desk Apron, Bevel Edge & Drawer Pulls ── */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-[17%] flex-col"
            >
              <div className="h-3.5 w-full rounded-t-[4px] border-t border-[#c89358]/55 bg-gradient-to-b from-[#5e371c] via-[#3b2110] to-[#1c0e06] shadow-[0_4px_12px_rgba(0,0,0,0.9)]" />
              <div className="h-[2px] w-full bg-gradient-to-r from-[#2e1a0c] via-[#c9a45c]/65 to-[#2e1a0c]" />

              <div className="grid flex-1 grid-cols-12 gap-3 border-t border-black/80 bg-gradient-to-b from-[#1f1007] via-[#140a04] to-[#090402] px-6 py-1.5 shadow-[inset_0_8px_20px_rgba(0,0,0,0.9)] sm:px-14">
                <div className="col-span-3 flex items-center justify-center rounded-[2px] border border-[#4a2c17]/40 bg-[#120904]/80">
                  <div className="h-1.5 w-10 rounded-full border border-[#c9a45c]/50 bg-gradient-to-b from-[#e0be78] to-[#6e4c1e] shadow-md" />
                </div>
                <div className="col-span-6 flex items-center justify-center rounded-[2px] border border-[#4a2c17]/45 bg-[#120904]/90">
                  <div className="h-1.5 w-16 rounded-full border border-[#c9a45c]/55 bg-gradient-to-b from-[#e0be78] to-[#6e4c1e] shadow-md" />
                </div>
                <div className="col-span-3 flex items-center justify-center rounded-[2px] border border-[#4a2c17]/40 bg-[#120904]/80">
                  <div className="h-1.5 w-10 rounded-full border border-[#c9a45c]/50 bg-gradient-to-b from-[#e0be78] to-[#6e4c1e] shadow-md" />
                </div>
              </div>
            </div>

            {/* =================================================================
                3. NATURAL INTERACTIVE OBJECTS SITTING ON THE WALNUT DESK
               ================================================================= */}

            {/* ── OBJECT 1: BANKER'S BRASS & AMBER GLASS DESK LAMP (FAR LEFT) ── */}
            <button
              type="button"
              data-testid="workspace-lamp"
              onClick={() => setLampOn((v) => !v)}
              onMouseEnter={() => setHovered("lamp")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("lamp")}
              onBlur={() => setHovered(null)}
              aria-pressed={lampOn}
              aria-label="Banker's brass studio lamp — toggle warm reading light"
              className="group absolute bottom-[48%] left-[3%] z-30 flex h-[68%] w-[14%] max-w-[165px] cursor-pointer flex-col items-center justify-end outline-none sm:left-[5%]"
            >
              <div
                className={`relative z-20 h-[28%] w-full rounded-t-[36px] rounded-b-[8px] border transition-all duration-500 ${
                  lampOn
                    ? "border-[#ffd584] bg-gradient-to-b from-[#ffdf9e] via-[#e08b34] to-[#9e4f14] shadow-[0_18px_55px_rgba(255,186,92,0.85),inset_0_-6px_16px_rgba(255,240,200,0.8)]"
                    : "border-[#e6be74]/40 bg-gradient-to-b from-[#4a321c] via-[#2e1e10] to-[#1a1008] shadow-[0_10px_25px_rgba(0,0,0,0.9)]"
                } group-hover:ring-2 group-hover:ring-[#ffd584]/70 group-focus-visible:ring-2 group-focus-visible:ring-[#ffd584]`}
              >
                <div className="mx-auto -mt-2 h-2 w-8 rounded-t-full bg-gradient-to-r from-[#5c401c] via-[#e2be74] to-[#5c401c]" />
              </div>

              {lampOn && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[26%] h-[60%] w-[150%] rounded-full bg-[radial-gradient(ellipse_at_top,rgba(255,214,138,0.65)_0%,rgba(224,140,56,0.22)_50%,transparent_80%)] blur-md"
                />
              )}

              <div className="relative flex h-[54%] w-full justify-center">
                <div className="h-full w-2.5 rounded-full border-x border-[#f0d28c]/40 bg-gradient-to-r from-[#593e1c] via-[#d8b264] to-[#473014] shadow-lg" />
                <div className="absolute right-[32%] top-1 flex flex-col items-center transition-transform duration-300 group-hover:translate-y-1">
                  <div className="h-7 w-[1.5px] bg-[#d8b264]" />
                  <div className="h-2.5 w-1.5 rounded-full bg-[#e8c87c] shadow-sm" />
                </div>
              </div>

              <div className="relative z-10 h-[12%] w-[74%] rounded-t-[10px] border-t border-[#f2d59c]/60 bg-gradient-to-r from-[#3d2912] via-[#cfa858] to-[#33210d] shadow-[0_10px_24px_rgba(0,0,0,0.95)]" />
              <div className="h-[5%] w-[88%] rounded-full bg-black/85 blur-[2px]" />
            </button>

            {/* ── OBJECT 2: OPEN LEATHER MANUSCRIPT NOTEBOOK & FOUNTAIN PEN (LEFT-FRONT ON DESK) ── */}
            <Link
              href="/projects/the-dream-of-the-payoff"
              data-testid="workspace-notebook"
              onMouseEnter={() => setHovered("notebook")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("notebook")}
              onBlur={() => setHovered(null)}
              aria-label="Open Leather Manuscript Journal: The Dream of the Payoff"
              className="group absolute bottom-[22%] left-[14%] z-30 h-[34%] w-[24%] max-w-[300px] cursor-pointer outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.03] focus-visible:-translate-y-1.5 focus-visible:scale-[1.03] sm:left-[16%]"
              style={{
                transform: "perspective(900px) rotateX(24deg) rotateZ(-6deg)",
              }}
            >
              <span aria-hidden="true" className="absolute -inset-2" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1.5 translate-y-2 rounded-[8px] bg-black/85 blur-md transition-all group-hover:translate-y-3 group-hover:blur-lg"
              />

              <div className="relative grid h-full w-full grid-cols-2 overflow-hidden rounded-[6px] border-[3px] border-[#29170b] bg-[#efe3cc] p-1 shadow-[0_14px_30px_rgba(0,0,0,0.9)] ring-1 ring-[#c9a45c]/30 transition-all duration-300 group-hover:shadow-[0_18px_38px_rgba(201,164,92,0.35)] group-hover:ring-2 group-hover:ring-[#ffd584] group-focus-visible:ring-2 group-focus-visible:ring-[#ffd584]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-2.5 -translate-x-1/2 bg-gradient-to-r from-black/15 via-black/35 to-black/15"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 left-[49%] z-20 h-6 w-1.5 rotate-6 bg-[#8f2419] shadow-sm"
                />

                {/* Left Parchment Page */}
                <div
                  className="flex flex-col justify-between p-1.5 pr-2 text-[#24190e] sm:p-2.5"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(138,108,68,0.18) 12px)",
                  }}
                >
                  <div>
                    <span className="block font-mono text-[0.42rem] uppercase tracking-[0.18em] text-[#7a582e] sm:text-[0.5rem]">
                      Memoir Draft
                    </span>
                    <p className="mt-0.5 font-display text-[0.65rem] leading-none font-semibold text-[#1a1109] sm:text-sm">
                      The Dream of the Payoff
                    </p>
                  </div>
                  <div className="relative h-[52%] w-[58%] self-center overflow-hidden rounded-[2px] border border-[#8a683c]/40 shadow-sm">
                    <Image
                      src="/media/memoir/dream-payoff-cover.svg"
                      alt="The Dream of the Payoff"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Right Parchment Page */}
                <div
                  className="relative flex flex-col justify-between p-1.5 pl-2 text-[#2c1f12] sm:p-2.5"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(138,108,68,0.18) 12px)",
                  }}
                >
                  <div>
                    <span className="block font-mono text-[0.42rem] uppercase tracking-[0.16em] text-[#7a582e] sm:text-[0.48rem]">
                      Notes · Ch. I
                    </span>
                    <p className="mt-1 font-display text-[0.55rem] italic leading-tight text-[#3b2916] sm:text-[0.7rem]">
                      “When does all that hard work finally pay off?”
                    </p>
                  </div>
                  <p className="text-right font-display text-[0.55rem] italic text-[#5c4022] sm:text-xs">
                    — Javier
                  </p>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-2 -right-2 h-1.5 w-[85%] -rotate-[22deg] rounded-full bg-gradient-to-r from-[#d8b467] via-[#1c1612] to-[#c9a45c] shadow-[0_3px_6px_rgba(0,0,0,0.65)]"
                  />
                </div>
              </div>
            </Link>

            {/* ── OBJECT 3: STUDIO LAPTOP WORKSTATION (CENTER OF THE WALNUT DESK) ── */}
            <Link
              href="/projects/sports-wager-helper"
              data-testid="workspace-laptop"
              onMouseEnter={() => setHovered("laptop")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("laptop")}
              onBlur={() => setHovered(null)}
              aria-label="Studio Laptop: Sports Wager Helper"
              className="group absolute bottom-[27%] left-1/2 z-30 flex w-[31%] max-w-[390px] -translate-x-[46%] cursor-pointer flex-col items-center outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.025] focus-visible:-translate-y-1.5 focus-visible:scale-[1.025]"
            >
              <span aria-hidden="true" className="absolute -inset-2" />
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[12px] border-[3px] border-[#38312c] bg-[#070a08] p-1.5 shadow-[0_24px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(132,204,22,0.12)] transition-all duration-300 group-hover:border-[#a3e635] group-hover:shadow-[0_24px_55px_rgba(132,204,22,0.32)] group-focus-visible:border-[#a3e635]">
                <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#1a1816]" />

                <div className="relative h-[calc(100%-6px)] w-full overflow-hidden rounded-[6px] bg-[#060906]">
                  <Image
                    src="/media/sports-wager-helper/og-image.png"
                    alt="Sports Wager Helper running on studio laptop"
                    fill
                    sizes="(min-width: 1024px) 380px, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-between rounded-md border border-[#a3e635]/35 bg-black/80 px-2 py-1 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="relative h-4 w-4 shrink-0 overflow-hidden rounded bg-black">
                        <Image
                          src="/media/sports-wager-helper/swh-brand-logo.svg"
                          alt=""
                          fill
                          sizes="20px"
                          className="object-cover"
                        />
                      </div>
                      <span className="font-mono text-[0.5rem] font-semibold tracking-wider text-bone sm:text-[0.6rem]">
                        SPORTS WAGER HELPER
                      </span>
                    </div>
                    <span className="rounded bg-[#a3e635] px-1.5 py-0.5 font-mono text-[0.45rem] font-bold text-black">
                      S.A.L. LIVE
                    </span>
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="relative h-4 w-[108%] rounded-b-[10px] border-x border-b border-white/20 bg-gradient-to-b from-[#4a433e] via-[#2e2925] to-[#171412] shadow-[0_18px_32px_rgba(0,0,0,0.95)]"
              >
                <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-black/50" />
              </div>
            </Link>

            {/* ── OBJECT 4: SMARTPHONE RUNNING UNFILTR BY JAVIER (RIGHT OF LAPTOP) ── */}
            <Link
              href="/projects/unfiltr"
              data-testid="workspace-smartphone"
              onMouseEnter={() => setHovered("smartphone")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("smartphone")}
              onBlur={() => setHovered(null)}
              aria-label="Smartphone on desk: Unfiltr by Javier AI Companion App"
              className="group absolute bottom-[23%] right-[24%] z-30 aspect-[9/19] w-[8.5%] min-w-[56px] max-w-[105px] cursor-pointer outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:scale-105 focus-visible:-translate-y-2 focus-visible:scale-105 sm:right-[25%]"
              style={{
                transform: "perspective(800px) rotateX(18deg) rotateY(-12deg) rotateZ(7deg)",
              }}
            >
              <span aria-hidden="true" className="absolute -inset-3" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 translate-y-2 rounded-[18px] bg-black/90 blur-md"
              />

              <div className="relative h-full w-full overflow-hidden rounded-[14px] border-[2px] border-[#6e6478] bg-black p-[3px] shadow-[0_16px_35px_rgba(98,76,224,0.45)] transition-all duration-300 group-hover:border-violet group-hover:shadow-[0_18px_42px_rgba(169,156,255,0.55)] group-focus-visible:border-violet">
                <div className="relative h-full w-full overflow-hidden rounded-[11px] bg-black">
                  <Image
                    src="/media/unfiltr/kai-tropical-chat.jpg"
                    alt="Unfiltr by Javier live screen on smartphone"
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </div>
              </div>
            </Link>

            {/* ── OBJECT 5: BRASS FLIP DESK CALENDAR (RIGHT WING OF DESK) ── */}
            <Link
              href="/#connect"
              data-testid="workspace-calendar"
              onMouseEnter={() => setHovered("calendar")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered("calendar")}
              onBlur={() => setHovered(null)}
              aria-label="Brass Desk Calendar: Confirmed Updates and Connect"
              className="group absolute bottom-[26%] right-[6%] z-30 flex h-[28%] w-[14%] max-w-[175px] cursor-pointer flex-col justify-between outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:scale-[1.03] focus-visible:-translate-y-1.5 focus-visible:scale-[1.03] sm:right-[8%]"
              style={{
                transform: "perspective(850px) rotateX(14deg) rotateY(-14deg) rotateZ(-3deg)",
              }}
            >
              <span aria-hidden="true" className="absolute -inset-2" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1 translate-y-2 rounded-lg bg-black/85 blur-md"
              />

              <div aria-hidden="true" className="relative z-20 mx-auto -mb-1.5 flex w-[76%] justify-around">
                {[0, 1, 2, 3].map((r) => (
                  <span
                    key={r}
                    className="h-3 w-1.5 rounded-full border border-[#f5d996]/60 bg-gradient-to-b from-[#e8c67a] to-[#5e4018] shadow-sm"
                  />
                ))}
              </div>

              <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[6px] border-2 border-[#7a582e] bg-gradient-to-b from-[#f3ead8] to-[#dfd0b4] p-2 text-[#1e150c] shadow-[0_16px_32px_rgba(0,0,0,0.9)] transition-all duration-300 group-hover:border-[#ffd584] group-hover:shadow-[0_18px_40px_rgba(201,164,92,0.4)] group-focus-visible:border-[#ffd584]">
                <div className="flex items-center justify-between border-b border-[#8a683c]/30 pb-1">
                  <span className="font-mono text-[0.45rem] font-bold uppercase tracking-[0.2em] text-[#7a4b19] sm:text-[0.55rem]">
                    NOV · STUDIO
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b83227]" />
                </div>

                <div className="my-auto flex items-baseline justify-between gap-2 pt-0.5">
                  <span className="font-display text-xl leading-none font-bold text-[#1a1109] sm:text-3xl">
                    17
                  </span>
                  <div className="text-right">
                    <span className="block font-mono text-[0.42rem] uppercase tracking-wider text-[#6e4e28] sm:text-[0.5rem]">
                      ACTIVE SLATE
                    </span>
                    <span className="block font-display text-[0.58rem] italic text-[#2b1d0f] sm:text-xs">
                      Why Henry? · Live
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 border-t border-[#8a683c]/25 pt-1 text-center font-mono text-[0.38rem] text-[#5c4328] sm:text-[0.45rem]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span
                      key={i}
                      className={i === 2 ? "rounded-xs bg-[#8f2419] font-bold text-white" : ""}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-2 w-full rounded-b-sm bg-gradient-to-r from-[#2e1a0c] via-[#5c361c] to-[#2e1a0c] shadow-md" />
            </Link>

            {/* ── SUBTLE IN-SCENE BRASS NAMEPLATE ON FRONT BULLNOSE OF DESK (HOVER FEEDBACK ONLY) ── */}
            <div
              aria-live="polite"
              className="pointer-events-none absolute inset-x-0 bottom-[2.5%] z-40 flex justify-center px-4"
            >
              <div
                className={`inline-flex items-center gap-2.5 rounded-full border border-[#c9a45c]/35 bg-[#120b06]/90 px-4 py-1 text-xs text-bone/90 shadow-[0_8px_24px_rgba(0,0,0,0.85)] backdrop-blur-md transition-opacity duration-300 ${
                  hovered ? "opacity-100" : "opacity-80"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#c9a45c]" />
                {hovered === "why-henry" && (
                  <span>
                    <strong className="font-medium text-amber">The Unwritten Journey — Book One: Why Henry?</strong> · Pull book from shelf
                  </span>
                )}
                {hovered === "laptop" && (
                  <span>
                    <strong className="font-medium text-[#a3e635]">Sports Wager Helper</strong> · S.A.L. Research Workstation
                  </span>
                )}
                {hovered === "smartphone" && (
                  <span>
                    <strong className="font-medium text-violet">Unfiltr by Javier</strong> · iOS &amp; Android AI Companion
                  </span>
                )}
                {hovered === "notebook" && (
                  <span>
                    <strong className="font-medium text-gold">The Dream of the Payoff</strong> · Open Manuscript Journal
                  </span>
                )}
                {hovered === "calendar" && (
                  <span>
                    <strong className="font-medium text-bone">Studio Desk Calendar</strong> · Confirmed Releases &amp; Connect
                  </span>
                )}
                {hovered === "lamp" && (
                  <span>
                    <strong className="font-medium text-gold">Banker&apos;s Studio Lamp</strong> · Click pull-chain to switch lighting
                  </span>
                )}
                {hovered === "brand" && (
                  <span>
                    <strong className="font-medium text-gold">IHBNF</strong> · Idle Hands Bear No Fruit
                  </span>
                )}
                {hovered === "portrait" && (
                  <span>
                    <strong className="font-medium text-gold">{site.founder.name}</strong> · Author, Creator, Builder
                  </span>
                )}
                {!hovered && (
                  <span className="text-mute">
                    Select any object in the study to inspect it — start with <strong className="font-normal text-amber">Why Henry?</strong> on the bookshelf
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden semantic anchors so existing Playwright/smoke tests & screen readers can still access quick index links if needed */}
      <nav aria-label="Study quick index" className="sr-only">
        <Link href="/#work" data-testid="hero-explore-work-btn">See What I Built</Link>
        <Link href="/#books" data-testid="hero-index-01">01 Books</Link>
        <Link href="/#apps" data-testid="hero-index-02">02 Apps</Link>
        <Link href="/#sports" data-testid="hero-index-03">03 Sports tech</Link>
        <Link href="/#memoir" data-testid="hero-index-04">04 In progress</Link>
      </nav>

      {/* =====================================================================
          3. PHYSICAL 3D "WHY HENRY?" BOOK EXTRACTION, OPENING & RETURN STAGE
         ===================================================================== */}
      {isBookOut && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="why-henry-open-book-title"
          data-testid="why-henry-open-book-stage"
          data-book-stage={bookStage}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-3 sm:p-6 md:p-10"
        >
          {/* Warm vignette depth-of-field backdrop over the study room (clicking outside returns book to shelf) */}
          <div
            data-testid="why-henry-stage-backdrop"
            onClick={handleReturnWhyHenry}
            className={`absolute inset-0 bg-[#050302]/80 backdrop-blur-[5px] transition-opacity duration-500 ${
              bookStage === "extracting" || bookStage === "open" ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* 3D Perspective Book Rig that physically travels from the shelf coordinates to the viewer */}
          <div
            data-testid="why-henry-3d-rig"
            style={{
              perspective: "2000px",
              transform:
                bookStage === "returning" || (bookStage === "extracting" && !extractStarted)
                  ? `translate3d(${flightDelta.dx}px, ${flightDelta.dy}px, -260px) scale(${flightDelta.scale}) rotateY(-24deg) rotateZ(2deg)`
                  : bookStage === "extracting"
                    ? "translate3d(0px, 0px, 0px) scale(0.92) rotateX(6deg) rotateY(-10deg)"
                    : "translate3d(0px, 0px, 0px) scale(1) rotateX(2deg) rotateY(0deg)",
              transition:
                "transform 560ms cubic-bezier(0.22, 1, 0.36, 1), opacity 480ms ease",
              opacity: bookStage === "returning" ? 0.15 : 1,
            }}
            className="relative z-10 flex max-h-[90svh] w-full max-w-[920px] items-center justify-center"
          >
            {/* Deep realistic cast shadow beneath the extracted book */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-8 -bottom-8 h-16 rounded-full bg-black/90 blur-2xl transition-all duration-500 ${
                bookStage === "open" ? "scale-x-100 opacity-95" : "scale-x-50 opacity-70"
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
                  bookStage === "open" ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* ── LEFT OPEN PAGE (INSIDE FRONT COVER / ILLUSTRATED ENDPAPER & FRONTISPIECE) ── */}
              <div
                data-testid="why-henry-left-page"
                className={`relative flex flex-col justify-between overflow-hidden rounded-t-[6px] border border-[#b89b72]/45 bg-gradient-to-br from-[#f3ead8] via-[#eadbc0] to-[#dcc69e] p-5 text-[#22170d] shadow-[inset_-18px_0_32px_rgba(68,42,18,0.22)] transition-all duration-500 sm:p-7 md:rounded-l-[6px] md:rounded-tr-none ${
                  bookStage === "open"
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                {/* Top Ex-Libris Header */}
                <div className="flex items-center justify-between border-b border-[#8a683c]/30 pb-3">
                  <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#7a4b19]">
                    {whyHenry.details[0].value}
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#6e4e28]">
                    By {site.founder.name}
                  </span>
                </div>

                {/* Frontispiece Plate: Official Cover + Briar Glen Cavern Artwork */}
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

                  <div className="col-span-7 flex flex-col gap-3">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[4px] border border-[#8a683c]/40 shadow-md">
                      <Image
                        src="/media/why-henry/illustrations/03.webp"
                        alt="Below the roots in Briar Glen — illustration from Book One: Why Henry?"
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    </div>
                    <p className="font-display text-base italic leading-snug text-[#3d2814] sm:text-lg">
                      “{whyHenry.tagline}”
                    </p>
                  </div>
                </div>

                {/* Six Stone Markers Footnote Plate */}
                <div className="flex items-center justify-between border-t border-[#8a683c]/30 pt-3 text-xs text-[#5c4022]">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em]">
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

              {/* ── RIGHT OPEN PAGE (TITLE PAGE, APPROVED SYNOPSIS & VERIFIED LINKS) ── */}
              <div
                data-testid="why-henry-right-page"
                className="relative flex flex-col justify-between overflow-hidden rounded-b-[6px] border border-[#b89b72]/45 bg-gradient-to-bl from-[#f7efe0] via-[#efe1c8] to-[#e2cfa8] p-5 text-[#1f150c] shadow-[inset_18px_0_32px_rgba(68,42,18,0.18)] sm:p-7 md:rounded-r-[6px] md:rounded-bl-none"
              >
                {/* Center Spine Gutter Shadow & Red Satin Bookmark Ribbon */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 hidden w-5 bg-gradient-to-r from-[#2e1b0c]/30 via-[#2e1b0c]/10 to-transparent md:block"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-3 hidden h-16 w-2 bg-gradient-to-b from-[#962318] to-[#69150d] shadow-md md:block"
                />

                {/* Top Chapter / Status Bar + Return to Shelf Control */}
                <div className="flex items-center justify-between gap-2 border-b border-[#8a683c]/30 pb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8a5a24]/35 bg-[#8a5a24]/10 px-2.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#7a4b19]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b85d19]" />
                    {whyHenry.statusLabel} · {whyHenry.details[1].value}
                  </span>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    data-testid="why-henry-return-shelf-btn"
                    onClick={handleReturnWhyHenry}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#f3ead8] shadow-sm transition-colors hover:bg-[#3d2512] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a4b19]"
                  >
                    ← Return to Shelf
                  </button>
                </div>

                {/* Book Title & Approved Synopsis from src/content/projects.ts */}
                <div className="my-4 space-y-3">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-[#7a4b19]">
                    {whyHenry.title}
                  </p>
                  <h2
                    id="why-henry-open-book-title"
                    className="font-display text-3xl leading-[0.98] text-[#170f07] sm:text-4xl"
                  >
                    {whyHenry.subtitle}
                  </h2>

                  <div className="space-y-2.5 pt-1 text-sm leading-relaxed text-[#382716] sm:text-[0.94rem]">
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

                {/* Verified Action Links: Amazon Listing & Full Book Page */}
                <div className="border-t border-[#8a683c]/30 pt-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={links.amazonWhyHenry}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="why-henry-modal-amazon-link"
                      className="inline-flex items-center gap-2 rounded-full bg-[#1c1209] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5dfb2] shadow-md transition-colors hover:bg-[#332010]"
                    >
                      Buy on Amazon <ExternalArrow className="h-3.5 w-3.5" />
                    </a>

                    <Link
                      href="/projects/why-henry"
                      data-testid="why-henry-modal-page-link"
                      className="inline-flex items-center gap-2 rounded-full border border-[#5c3d1e]/45 bg-[#efe2c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#24170b] transition-colors hover:bg-[#e3d0ad]"
                    >
                      Explore Full Book Page <Arrow className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* ── 3D HINGED FRONT COVER & FANNING PAGE LEAF OVERLAY ──
                    Swings open (-155deg around the left spine hinge) when transitioning from "extracting" to "open",
                    and swings shut (0deg) during "closing-cover" before sliding back into the shelf */}
                <div
                  aria-hidden="true"
                  data-testid="why-henry-3d-front-cover"
                  style={{
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                    transform:
                      bookStage === "open"
                        ? "rotateY(-165deg)"
                        : "rotateY(0deg)",
                    transition: "transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  className={`pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-r-[6px] border-2 border-[#6e4926] bg-[#0d0a08] shadow-[16px_20px_48px_rgba(0,0,0,0.9)] ${
                    bookStage === "open" ? "opacity-0 transition-[transform,opacity] duration-500" : "opacity-100"
                  }`}
                >
                  <Image
                    src="/media/why-henry/cover.webp"
                    alt=""
                    fill
                    sizes="420px"
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-white/[0.08] to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
