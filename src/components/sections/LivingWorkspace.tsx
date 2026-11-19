"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";
import { ExternalArrow } from "@/components/ui/Icons";
import { StudyObjectExperience, type StudySceneKind } from "./StudyObjectExperience";
import { StudyVault } from "@/components/vault/StudyVault";
import { advanceProgress, COMPASS_READY, readProgress } from "@/components/vault/progress";
import { useVaultAudio } from "@/components/vault/useVaultAudio";
import { BookFlight, StackedBinding, shelfBooks, type ShelfBookId } from "@/components/books/StudyHardcover";
import { StaticShelfBooks } from "@/components/books/StaticShelfBooks";
import bookStyles from "@/components/books/studyBooks.module.css";
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

type BookStage = "shelved" | "opening" | "open" | "returning";

/**
 * Active in-room object overlay (for non-shelf-book objects: Wall Logo, Smartphone, Laptop, Notebook, Calendar, Contact).
 * The room remains visible behind every presentation.
 */
type ActiveRoomModal = StudySceneKind | null;

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

/**
 * Highlights the object that is ALREADY painted into the approved study plate.
 * No duplicate composited phone/laptop/frame images: they were the source of
 * visible misregistration and exposed background artwork behind the overlays.
 * The same viewBox drives the exact clickable SVG contours and gold surface glow.
 */
const studyHotspotPoints: Partial<Record<Exclude<HoveredItem, null | "why-henry" | "dream-payoff">, string>> = {
  brand: "435,0 450,4 600,32 740,56 743,62 741,360 742,368 620,363 510,351 436,333 434,200",
  laptop: "719,406 720,652 729,674 735,680 758,686 778,707 788,708 794,713 928,710 936,716 1008,715 1017,707 1179,706 1197,703 1195,698 1159,673 1130,647 1121,409 1114,401 727,400",
  smartphone: "1211,449 1204,457 1201,468 1179,651 1180,665 1183,672 1191,678 1228,678 1276,685 1305,679 1310,676 1302,627 1298,620 1296,548 1307,462 1296,449",
  notebook: "854,777 837,759 830,747 812,748 791,735 737,680 718,668 644,664 637,659 625,658 615,662 557,661 534,670 512,660 478,659 440,666 382,682 317,690 297,704 282,704 275,707 274,730 257,743 258,751 269,756 271,767 278,774 283,804 297,810 372,806 414,799 478,795 482,797 486,806 547,813 558,810 557,798 562,794 574,795 580,801 591,801 606,793 677,793 730,786 776,789 839,784",
  calendar: "1375,495 1380,482 1397,478 1410,480 1420,480 1432,483 1450,482 1470,484 1490,485 1502,493 1503,517 1520,523 1530,530 1545,600 1557,650 1568,653 1568,667 1543,677 1487,685 1457,680 1377,663 1320,655 1319,642 1333,633 1330,627 1345,560 1360,510 1370,500",
  contact: "1271,729 1274,733 1326,744 1348,752 1353,765 1374,773 1380,771 1422,782 1436,776 1460,776 1485,782 1499,781 1511,784 1529,767 1564,742 1568,731 1564,726 1449,705 1431,698 1418,699 1368,689 1347,700 1311,706",
};

const studyHotspotActions = [
  { id: "brand", label: "Framed IHBNF emblem", modal: "brand" },
  { id: "laptop", label: "Sports Wager Helper laptop", modal: "laptop" },
  { id: "smartphone", label: "Unfiltr smartphone", modal: "smartphone" },
  { id: "notebook", label: "Writing journal", modal: "notebook" },
  { id: "calendar", label: "Desk calendar", modal: "calendar" },
  { id: "contact", label: "Sealed letter and contact links", modal: "contact" },
] as const;

function StudyObjectHighlight({
  active,
  onHover,
  onSelect,
  frameVisible,
}: {
  active: HoveredItem;
  frameVisible: boolean;
  onHover: (item: HoveredItem) => void;
  onSelect: (modal: Exclude<ActiveRoomModal, null>) => void;
}) {
  const activePoints = active && active !== "why-henry" && active !== "dream-payoff" && !(frameVisible && active === "brand")
    ? studyHotspotPoints[active]
    : undefined;
  const activePath = activePoints ? `M${activePoints.replaceAll(" ", "L")}Z` : undefined;
  return (
    <svg
      viewBox="0 0 1672 941"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-[19] h-full w-full overflow-visible"
    >
      {studyHotspotActions.map((target) => {
        if (target.id === "brand" && frameVisible) return null;
        const points = studyHotspotPoints[target.id];
        if (!points) return null;
        const path = `M${points.replaceAll(" ", "L")}Z`;
        return (
          <path
            key={target.id}
            d={path}
            fill="transparent"
            pointerEvents="all"
            className="outline-none focus:outline-none"
            role="button"
            tabIndex={0}
            aria-label={target.label}
            aria-haspopup="dialog"
            onPointerEnter={() => onHover(target.id)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(target.id)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(target.modal)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(target.modal);
              }
            }}
          />
        );
      })}
      {activePath && (
        <path
          d={activePath}
          fill="rgba(255,206,133,0.08)"
          stroke="rgba(255,218,153,0.88)"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
          style={{ filter: "drop-shadow(0 0 3px rgba(255,194,91,0.5))" }}
        />
      )}
    </svg>
  );
}

export function LivingWorkspace({ previewBooks = false }: { previewBooks?: boolean } = {}) {
  const whyHenry = getProject("why-henry")!;
  const memoir = getProject("the-dream-of-the-payoff")!;

  const [hovered, setHovered] = useState<HoveredItem>(null);
  const [lampOn, setLampOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [vaultFrameVisible, setVaultFrameVisible] = useState(false);
  const vaultAudio = useVaultAudio(muted);

  const toggleLamp = (trusted: boolean) => {
    setLampOn((on) => !on);
    if (!trusted) return;
    vaultAudio.play("chain");
    const progress = readProgress();
    if (progress < COMPASS_READY && advanceProgress(progress) && progress + 1 === COMPASS_READY) {
      vaultAudio.play("latch");
    }
  };

  // Digital reader state for both books on the shelf
  const [activeShelfBook, setActiveShelfBook] = useState<ShelfBookId>("why-henry");
  const [bookStage, setBookStage] = useState<BookStage>("shelved");
  const [henryArtIdx, setHenryArtIdx] = useState(0);
  const [bookOrigin, setBookOrigin] = useState<DOMRect | null>(null);

  // In-Room Object Presentation State (Brand Wall Frame, Phone, Laptop, Notebook, Calendar, Contact)
  const [activeModal, setActiveModal] = useState<ActiveRoomModal>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const whyHenryBookRef = useRef<HTMLButtonElement>(null);
  const dreamPayoffBookRef = useRef<HTMLButtonElement>(null);
  const closeBookBtnRef = useRef<HTMLButtonElement>(null);
  const bookDialogRef = useRef<HTMLDialogElement>(null);
  const bookReaderRef = useRef<HTMLDivElement>(null);
  const bookTimersRef = useRef<number[]>([]);
  const isBookOut = bookStage !== "shelved";

  useLayoutEffect(() => {
    if (!isBookOut) return;
    const dialog = bookDialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, [isBookOut]);

  useLayoutEffect(() => {
    if (bookStage === "open") closeBookBtnRef.current?.focus({ preventScroll: true });
  }, [bookStage]);

  // Center the horizontal scroll on narrow mobile screens on initial mount so the desk & shelf are balanced
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth) {
      el.scrollLeft = Math.round((el.scrollWidth - el.clientWidth) * 0.42);
    }
  }, []);

  // Subtle genuine paper Foley replaces the artificial magical book sound.
  // Keep it under 35% so the books sound physical but never distract.
  useEffect(() => () => {
    bookTimersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);
  const clearBookTimers = useCallback(() => {
    bookTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    bookTimersRef.current = [];
  }, []);

  const playBookPaper = useCallback(() => {
    if (muted) return;
    const paper = new Audio("/media/audio/book-page-real-cc0.wav");
    paper.volume = .32;
    void paper.play().catch(() => {});
  }, [muted]);

  const handleOpenDigitalBook = useCallback((bookId: ShelfBookId) => {
    if (bookStage !== "shelved") return;
    const button = bookId === "why-henry" ? whyHenryBookRef.current : dreamPayoffBookRef.current;
    const bounds = button?.querySelector("[data-stack-spine]")?.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearBookTimers();
    setActiveModal(null);
    setActiveShelfBook(bookId);
    setBookOrigin(bounds ?? null);
    setBookStage(bounds && !reduced ? "opening" : "open");
    // The page-turn sound belongs to the physical opening, not the moment
    // the visitor first clicks the book on its shelf.
    if (reduced || !bounds) playBookPaper();
  }, [bookStage, clearBookTimers, playBookPaper]);

  const finishReturnShelfBook = useCallback(() => {
    clearBookTimers();
    bookDialogRef.current?.close();
    setBookStage("shelved");
    setBookOrigin(null);
    const target = activeShelfBook === "why-henry" ? whyHenryBookRef : dreamPayoffBookRef;
    target.current?.focus({ preventScroll: true });
  }, [activeShelfBook, clearBookTimers]);

  const handleReturnShelfBook = useCallback(() => {
    if (bookStage === "shelved" || bookStage === "returning") return;
    clearBookTimers();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !bookOrigin) {
      finishReturnShelfBook();
      return;
    }
    setBookStage("returning");
    // Fallback prevents an interrupted animation from trapping visitors.
    bookTimersRef.current.push(window.setTimeout(finishReturnShelfBook, 1510));
  }, [bookStage, bookOrigin, clearBookTimers, finishReturnShelfBook]);

  // Open an in-room object overlay
  const openRoomModal = useCallback((modal: Exclude<ActiveRoomModal, null>) => {
    setActiveModal(modal);
  }, []);

  const closeRoomModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  useEffect(() => {
    if (!activeModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRoomModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeModal, closeRoomModal]);

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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:hidden">
        <Image
          src="/media/study/study-clean-plate.webp"
          alt=""
          fill
          sizes="100vw"
          className="scale-125 object-cover opacity-35 blur-2xl"
        />
        <div className="absolute inset-0 bg-[#070504]/55" />
      </div>

      {/* =====================================================================
          1. RESPONSIVE 16:9 HIGH-RESOLUTION STUDY STAGE
             Fits the complete room on narrow screens and preserves the native
             16:9 composition without stretching or distorting.
         ===================================================================== */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex h-full w-full items-center justify-start overflow-x-auto overflow-y-hidden lg:justify-center"
      >
        <div
          data-testid="walnut-desk-surface"
          className="relative mx-auto aspect-[16/9] h-auto min-h-0 w-full min-w-0 max-w-full shrink-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.95)] lg:h-auto lg:max-h-[100svh] lg:w-full lg:max-w-[177.78svh]"
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
            className="pointer-events-none z-0 object-cover"
          />
          <Image
            src="/media/study/study-clean-plate.webp"
            alt="Javier Huertas's study — walnut desk, green banker's lamp, rain-streaked night window, and bookshelf"
            fill
            priority
            quality={95}
            sizes="100vw"
            className={`pointer-events-none z-0 object-cover transition-opacity duration-300 ${
              lampOn ? "opacity-100" : "opacity-0"
            }`}
          />
          <StudyObjectHighlight active={hovered} onHover={setHovered} onSelect={openRoomModal} frameVisible={vaultFrameVisible} />

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
            aria-hidden="true"
            tabIndex={-1}
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
            className="group pointer-events-none absolute z-20 cursor-pointer p-0 text-left outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
          </button>

          <div className={bookStyles.shelfBack} data-lit={lampOn} aria-hidden="true" />
          {!previewBooks && <StaticShelfBooks selected={isBookOut ? activeShelfBook : null} lampOn={lampOn} />}
          {(["why-henry", "dream-payoff"] as const).map((bookId) => {
            const book = shelfBooks[bookId];
            const out = isBookOut && activeShelfBook === bookId;
            return (
              <div key={bookId} className={bookStyles.slot} data-book={bookId} style={book.slot}>
                <button
                  ref={bookId === "why-henry" ? whyHenryBookRef : dreamPayoffBookRef}
                  type="button"
                  data-testid={`${bookId}-shelf-book`}
                  data-book={bookId}
                  data-out={out}
                  data-shift={isBookOut && activeShelfBook === "dream-payoff" && bookId === "why-henry"}
                  className={bookStyles.shelfBook}
                  aria-haspopup="dialog"
                  aria-expanded={out}
                  aria-label={`Open ${book.title}`}
                  onClick={() => handleOpenDigitalBook(bookId)}
                  onMouseEnter={() => setHovered(bookId)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(bookId)}
                  onBlur={() => setHovered(null)}
                >
                  <StackedBinding book={bookId} topVisible={bookId === "why-henry" || (isBookOut && activeShelfBook === "why-henry")} />
                </button>
              </div>
            );
          })}

          {/* -----------------------------------------------------------------
              OBJECT 4: STUDIO LAPTOP SHOWING OFFICIAL SPORTS WAGER HELPER
              Composited directly into the physical laptop bezel on the desk
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-laptop"
            aria-hidden="true"
            tabIndex={-1}
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
            className="group pointer-events-none absolute z-20 cursor-pointer p-0 text-left outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 3: SMARTPHONE IN WOODEN DOCK SHOWING REAL UNFILTR SCREEN
              Composited directly onto the angled phone glass on the desk
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-smartphone"
            aria-hidden="true"
            tabIndex={-1}
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
            className="group pointer-events-none absolute z-20 cursor-pointer p-0 text-left outline-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 5: OPEN LEATHER WRITING JOURNAL ON THE DESK
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-notebook"
            aria-hidden="true"
            tabIndex={-1}
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
            className="group pointer-events-none absolute z-20 cursor-pointer rounded-[12px] p-0 text-left outline-none transition-all duration-300"
          >
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
            aria-hidden="true"
            tabIndex={-1}
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
            className="group pointer-events-none absolute z-20 cursor-pointer rounded-[10px] p-0 text-left outline-none transition-transform duration-300"
          >
          </button>

          {/* -----------------------------------------------------------------
              OBJECT 8: WAX-SEALED LETTER ON THE DESK (CONTACT & SOCIALS)
             ----------------------------------------------------------------- */}
          <button
            type="button"
            data-testid="workspace-contact"
            aria-hidden="true"
            tabIndex={-1}
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
            className="group pointer-events-none absolute z-20 cursor-pointer rounded-[10px] p-0 text-left outline-none transition-transform duration-300"
          >
          </button>

          {/* -----------------------------------------------------------------
              GREEN GLASS BANKER'S LAMP & PHYSICAL BRASS PULL-CHAIN ON THE DESK
             ----------------------------------------------------------------- */}
          <BankersLampControl
            lampOn={lampOn}
            onToggleLamp={toggleLamp}
            onPullStart={() => {
              if (readProgress() === COMPASS_READY - 1) vaultAudio.prepare();
            }}
            muted={muted}
            onHoverChange={(isHov) => setHovered(isHov ? "lamp" : null)}
          />

          <StudyVault lampOn={lampOn} play={vaultAudio.play} obstructed={isBookOut || activeModal !== null}
            onFrameVisibilityChange={setVaultFrameVisible} />

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
                  <strong className="font-medium text-amber">The Unwritten Journey — Book One: Why Henry?</strong> · Open digital book
                </span>
              )}
              {hovered === "dream-payoff" && (
                <span>
                  <strong className="font-medium text-gold">The Dream of the Payoff</strong> · Open digital book
                </span>
              )}
              {hovered === "laptop" && (
                <span>
                  <strong className="font-medium text-gold">Sports Wager Helper</strong> · Inspect S.A.L. Workstation
                </span>
              )}
              {hovered === "smartphone" && (
                <span>
                  <strong className="font-medium text-gold">Unfiltr by Javier</strong> · Inspect iOS &amp; Android AI Companion
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
                  <strong className="font-normal text-gold">laptop</strong>,{" "}
                  <strong className="font-normal text-gold">phone</strong>,{" "}
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
          3. DIGITAL BOOK READER
             (Supports BOTH "Why Henry?" AND "The Dream of the Payoff")
         ===================================================================== */}
      {isBookOut && (
        <dialog
          ref={bookDialogRef}
          aria-label={`Open book — ${shelfBooks[activeShelfBook].title}`}
          data-testid={`${activeShelfBook}-open-book-stage`}
          data-book-stage={bookStage}
          className={bookStyles.dialog}
          onCancel={(event) => {
            event.preventDefault();
            handleReturnShelfBook();
          }}
        >
          <div data-testid="why-henry-stage-backdrop" className={bookStyles.backdrop}
            data-opening={bookStage === "opening"} aria-hidden="true" onClick={handleReturnShelfBook} />
          {(bookStage === "opening" || bookStage === "returning") && bookOrigin && (
            <BookFlight
              book={activeShelfBook}
              origin={bookOrigin}
              reader={bookReaderRef}
              returning={bookStage === "returning"}
              onOpened={() => { setBookStage("open"); playBookPaper(); }}
              onReturned={finishReturnShelfBook}
            />
          )}
          <div className={bookStyles.readerLayout}>
            <div data-testid="shelf-digital-reader" className={bookStyles.reader}
              data-opening={bookStage === "opening"} data-returning={bookStage === "returning"} inert={bookStage !== "open"}>
              <nav className={bookStyles.readerTools} aria-label="Book controls">
                <button ref={closeBookBtnRef} type="button" data-testid={`${activeShelfBook}-return-shelf-btn`}
                  onClick={handleReturnShelfBook}>← Return to Shelf</button>
                {activeShelfBook === "dream-payoff" && (
                  <button type="button" data-testid="dream-payoff-follow-updates-btn" onClick={() => {
                    setBookStage("shelved");
                    openRoomModal("notebook");
                  }}>Author&apos;s Journal</button>
                )}
                <a href={(activeShelfBook === "why-henry" ? whyHenry : memoir).links[0].href}
                  data-testid={activeShelfBook === "why-henry" ? "why-henry-modal-amazon-link" : "dream-payoff-author-amazon-link"}
                  target="_blank" rel="noopener noreferrer">
                  Buy on Amazon <ExternalArrow className="h-3.5 w-3.5" />
                </a>
              </nav>
              <div ref={bookReaderRef} className={bookStyles.spread}>
                <div className={`${bookStyles.paper} ${bookStyles.platePage}`}
                  data-testid={`${activeShelfBook}-left-page`}>
                  <figure>
                    <div className={bookStyles.illustration}>
                      <Image
                        src={activeShelfBook === "why-henry" ? whyHenryIllustrations[henryArtIdx].src : "/media/memoir/artwork.webp"}
                        alt={activeShelfBook === "why-henry" ? whyHenryIllustrations[henryArtIdx].title : "Artwork for The Dream of the Payoff"}
                        fill sizes="(max-width: 639px) 82vw, 390px"
                      />
                    </div>
                    <figcaption className={bookStyles.caption}>
                      <strong>{activeShelfBook === "why-henry" ? whyHenryIllustrations[henryArtIdx].title : memoir.title}</strong>
                      <span>{activeShelfBook === "why-henry" ? whyHenryIllustrations[henryArtIdx].caption : memoir.tagline}</span>
                    </figcaption>
                  </figure>
                  {activeShelfBook === "why-henry" && (
                    <div className={bookStyles.plateIndex} role="group" aria-label="Illustration plates">
                      {whyHenryIllustrations.map((plate, index) => (
                        <button key={plate.src} type="button" aria-label={`Plate 0${index + 1}`}
                          aria-pressed={henryArtIdx === index} onClick={() => { playBookPaper(); setHenryArtIdx(index); }}>
                          {["I", "II", "III", "IV"][index]}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className={bookStyles.folio} aria-hidden="true">1</span>
                </div>
                <section className={`${bookStyles.paper} ${bookStyles.textPage}`}
                  data-testid={`${activeShelfBook}-right-page`} aria-labelledby="shelf-open-book-title">
                  <header className={bookStyles.printTitle}>
                    <p>{activeShelfBook === "why-henry" ? whyHenry.title : "A Memoir"}</p>
                    <h2 id="shelf-open-book-title">{shelfBooks[activeShelfBook].title}</h2>
                    <p>Javier Huertas</p>
                  </header>
                  <div className={bookStyles.printBody}>
                    <h3>About the book</h3>
                    {(activeShelfBook === "why-henry" ? whyHenry.description.slice(0, 2) : memoir.description).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <span className={bookStyles.folio} aria-hidden="true">2</span>
                </section>
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* Each object becomes a real-looking scene with only one click. */}
      {activeModal && (
        <StudyObjectExperience
          key={activeModal}
          kind={activeModal}
          onClose={closeRoomModal}
          onOpenBook={handleOpenDigitalBook}
          muted={muted}
        />
      )}
    </section>
  );
}
