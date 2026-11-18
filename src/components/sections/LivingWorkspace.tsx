"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getProject } from "@/content/projects";
import { links, site, socials } from "@/content/site";
import { ExternalArrow, SocialIcon } from "@/components/ui/Icons";
import { EmailReveal } from "@/components/ui/EmailReveal";
import { StudyVault } from "@/components/vault/StudyVault";
import { advanceProgress, COMPASS_READY, readProgress } from "@/components/vault/progress";
import { useVaultAudio } from "@/components/vault/useVaultAudio";
import { BookFlight, Hardcover, shelfBooks, type ShelfBookId } from "@/components/books/StudyHardcover";
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

type BookStage = "shelved" | "opening" | "open";

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
      <defs>
        <filter id="study-object-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="soft" />
          <feMerge><feMergeNode in="soft" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
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
        <>
          <path d={activePath} fill="rgba(255,205,126,0.10)" style={{ mixBlendMode: "screen" }} />
          <path
            d={activePath}
            fill="none"
            stroke="rgba(255,218,153,0.9)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#study-object-gold-glow)"
          />
        </>
      )}
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
  const [vaultFrameVisible, setVaultFrameVisible] = useState(false);
  const vaultAudio = useVaultAudio(muted);

  const toggleLamp = (trusted: boolean) => {
    setLampOn((on) => !on);
    if (!trusted) return;
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
  const [unfiltrScreenIdx, setUnfiltrScreenIdx] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const whyHenryBookRef = useRef<HTMLButtonElement>(null);
  const dreamPayoffBookRef = useRef<HTMLButtonElement>(null);
  const closeBookBtnRef = useRef<HTMLButtonElement>(null);
  const closeModalBtnRef = useRef<HTMLButtonElement>(null);
  const bookDialogRef = useRef<HTMLDialogElement>(null);
  const bookReaderRef = useRef<HTMLDivElement>(null);
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

  const handleOpenDigitalBook = useCallback((bookId: ShelfBookId) => {
    if (bookStage !== "shelved") return;
    const button = bookId === "why-henry" ? whyHenryBookRef.current : dreamPayoffBookRef.current;
    const bounds = button?.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setActiveModal(null);
    setActiveShelfBook(bookId);
    setBookOrigin(bounds ? new DOMRect(bounds.left + bounds.width * .09, bounds.top, bounds.width * .82, bounds.height) : null);
    setBookStage(bounds && !reduced ? "opening" : "open");
  }, [bookStage]);

  const handleReturnShelfBook = useCallback(() => {
    if (bookStage === "shelved") return;
    bookDialogRef.current?.close();
    setBookStage("shelved");
    const target = activeShelfBook === "why-henry" ? whyHenryBookRef : dreamPayoffBookRef;
    target.current?.focus({ preventScroll: true });
  }, [bookStage, activeShelfBook]);

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

          {(["why-henry", "dream-payoff"] as const).map((bookId) => {
            const book = shelfBooks[bookId];
            const out = isBookOut && activeShelfBook === bookId;
            return (
              <div key={bookId} className={bookStyles.slot} style={book.slot}>
                <button
                  ref={bookId === "why-henry" ? whyHenryBookRef : dreamPayoffBookRef}
                  type="button"
                  data-testid={`${bookId}-shelf-book`}
                  data-book={bookId}
                  data-out={out}
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
                  <Hardcover book={bookId} />
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
          {bookStage === "opening" && bookOrigin && (
            <BookFlight book={activeShelfBook} origin={bookOrigin} reader={bookReaderRef} onOpened={() => setBookStage("open")} />
          )}
          <div className={bookStyles.readerLayout}>
            <div ref={bookReaderRef} data-testid="shelf-digital-reader" className={bookStyles.reader}
              data-opening={bookStage === "opening"} inert={bookStage === "opening"}>
              <div className={`${bookStyles.spread} grid grid-cols-1 gap-0 sm:grid-cols-2`}>
              {activeShelfBook === "why-henry" ? (
                <>
                  {/* ── WHY HENRY: LEFT OPEN PAGE (COVER PLATE & BRIAR GLEN ILLUSTRATION GALLERY) ── */}
                  <div
                    data-testid="why-henry-left-page"
                    className={`relative flex flex-col justify-between overflow-hidden rounded-t-[6px] border border-[#b89b72]/45 bg-gradient-to-br from-[#f3ead8] via-[#eadbc0] to-[#dcc69e] p-5 text-[#22170d] shadow-[inset_-18px_0_32px_rgba(68,42,18,0.22)] transition-all duration-500 sm:p-7 md:rounded-l-[6px] md:rounded-tr-none ${
                      bookStage === "open" || bookStage === "opening"
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
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[4px] border border-[#6e4c24]/45 bg-[#0d0a08] shadow-[6px_10px_22px_rgba(0,0,0,0.55)]">
                          <Image
                            src="/media/why-henry/cover-user.jpg"
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
                    className="relative order-first flex min-w-0 flex-col justify-between overflow-visible rounded-b-[6px] border border-[#b89b72]/45 bg-gradient-to-bl from-[#f7efe0] via-[#efe1c8] to-[#e2cfa8] p-5 text-[#1f150c] shadow-[inset_18px_0_32px_rgba(68,42,18,0.18)] sm:order-none sm:p-7 md:rounded-r-[6px] md:rounded-bl-none"
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
                        DIGITAL READER · {whyHenry.details[1].value}
                      </span>

                      <button
                        ref={closeBookBtnRef}
                        type="button"
                        data-testid="why-henry-return-shelf-btn"
                        onClick={handleReturnShelfBook}
                        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#f3ead8] shadow-sm transition-colors hover:bg-[#3d2512]"
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
                        {whyHenry.description.slice(0, 2).map((para, idx) => (
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

                  </div>
                </>
              ) : (
                <>
                  {/* ── THE DREAM OF THE PAYOFF: LEFT OPEN PAGE (OFFICIAL PUBLISHED COVER & ARTWORK) ── */}
                  <div
                    data-testid="dream-payoff-left-page"
                    className={`relative flex flex-col justify-between overflow-hidden rounded-t-[6px] border border-[#b89b72]/45 bg-gradient-to-br from-[#f3ead8] via-[#eadbc0] to-[#dcc69e] p-5 text-[#22170d] shadow-[inset_-18px_0_32px_rgba(68,42,18,0.22)] transition-all duration-500 sm:p-7 md:rounded-l-[6px] md:rounded-tr-none ${
                      bookStage === "open" || bookStage === "opening"
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
                    className="relative order-first flex min-w-0 flex-col justify-between overflow-visible rounded-b-[6px] border border-[#b89b72]/45 bg-gradient-to-bl from-[#f7efe0] via-[#efe1c8] to-[#e2cfa8] p-5 text-[#1f150c] shadow-[inset_18px_0_32px_rgba(68,42,18,0.18)] sm:order-none sm:p-7 md:rounded-r-[6px] md:rounded-bl-none"
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
                        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#f3ead8] shadow-sm transition-colors hover:bg-[#3d2512]"
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

                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </dialog>
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
                        handleOpenDigitalBook("why-henry");
                      }}
                      className="cursor-pointer rounded-full border border-amber/40 bg-amber/15 px-3.5 py-1.5 text-xs font-medium text-amber hover:bg-amber/25"
                    >
                      Open Why Henry?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleOpenDigitalBook("dream-payoff");
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
                  className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#5c3d1e]/40 bg-[#26170b] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-[#f3ead8] transition-colors hover:bg-[#3d2512]"
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
                        handleOpenDigitalBook("dream-payoff");
                      }}
                      className="cursor-pointer rounded-full bg-[#26170b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#f3ead8] hover:bg-[#3d2512]"
                    >
                      Open The Dream of the Payoff →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        handleOpenDigitalBook("why-henry");
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
                        handleOpenDigitalBook("dream-payoff");
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
