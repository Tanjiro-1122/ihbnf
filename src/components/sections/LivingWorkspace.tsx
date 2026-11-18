"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { site, links, socials } from "@/content/site";
import { Arrow, ExternalArrow } from "@/components/ui/Icons";

type WorkspaceItemKey = "bookshelf" | "notebook" | "smartphone" | "laptop" | "calendar" | "desk";

type WorkspaceZone = {
  id: WorkspaceItemKey;
  number: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  href: string;
  cta: string;
  externalHref?: string;
  externalCta?: string;
};

const workspaceZones: WorkspaceZone[] = [
  {
    id: "bookshelf",
    number: "01",
    label: "The Bookshelf",
    title: "The Unwritten Journey — Book One: Why Henry?",
    subtitle: "Published Literature & Series Shelf",
    description:
      "Hardcover editions of Book One: Why Henry? rest alongside the six carved stone markers of Briar Glen and early volumes of upcoming stories.",
    accent: "text-amber border-amber/35",
    href: "/projects/why-henry",
    cta: "Inspect Book One",
    externalHref: links.amazonWhyHenry,
    externalCta: "Buy on Amazon",
  },
  {
    id: "notebook",
    number: "02",
    label: "Leatherbound Notebook",
    title: "The Dream of the Payoff & Drafts",
    subtitle: "Open Manuscript · Field Notes & Philosophy",
    description:
      "Handwritten outlines and memoir pages in progress—capturing growing up, family, sacrifice, and the daily discipline behind Idle Hands Bear No Fruit.",
    accent: "text-gold border-gold/35",
    href: "/projects/the-dream-of-the-payoff",
    cta: "Read Memoir Notes",
    externalHref: "/#philosophy",
    externalCta: "The Philosophy",
  },
  {
    id: "smartphone",
    number: "03",
    label: "The Smartphone",
    title: "Unfiltr by Javier",
    subtitle: "Live on iOS & Android · AI Companion",
    description:
      "Resting beside the notebook with an active conversation with Kai in the tropical sunset world—built around persistent memory, voice, and journaling.",
    accent: "text-violet border-violet/35",
    href: "/projects/unfiltr",
    cta: "Explore Unfiltr",
    externalHref: links.unfiltrAppStore,
    externalCta: "App Store",
  },
  {
    id: "laptop",
    number: "04",
    label: "Studio Workstation",
    title: "Sports Wager Helper & S.A.L.",
    subtitle: "Web + Mobile Platform · Live Analytics",
    description:
      "Open on the center of the walnut desk running player form breakdowns, matchup trends, and S.A.L. (Sports AI Librarian) research before the game.",
    accent: "text-[#a3e635] border-[#a3e635]/35",
    href: "/projects/sports-wager-helper",
    cta: "Inspect Platform",
    externalHref: links.sportsWagerHelper,
    externalCta: "Launch Web App",
  },
  {
    id: "calendar",
    number: "05",
    label: "Desk Calendar",
    title: "Release Cadence & Active Milestones",
    subtitle: "Shipping Log · What Comes Next",
    description:
      "Marked with book launches, iOS & Android build milestones, SWH research updates, and the next chapters currently on the workbench.",
    accent: "text-bone border-bone/30",
    href: "/#connect",
    cta: "Follow Next Releases",
    externalHref: "/#work",
    externalCta: "All Projects",
  },
];

const calendarDays = [
  { day: 1, tag: null },
  { day: 2, tag: null },
  { day: 3, tag: "BOOK" },
  { day: 4, tag: null },
  { day: 5, tag: null },
  { day: 6, tag: null },
  { day: 7, tag: "APP" },
  { day: 8, tag: null },
  { day: 9, tag: null },
  { day: 10, tag: "SWH" },
  { day: 11, tag: null },
  { day: 12, tag: null },
  { day: 13, tag: null },
  { day: 14, tag: "MEMOIR" },
  { day: 15, tag: null },
  { day: 16, tag: null },
  { day: 17, tag: "NOW" },
  { day: 18, tag: null },
  { day: 19, tag: null },
  { day: 20, tag: null },
  { day: 21, tag: "NEXT" },
];

export function LivingWorkspace() {
  const [selectedZone, setSelectedZone] = useState<WorkspaceItemKey>("laptop");
  const [lampWarmth, setLampWarmth] = useState<"warm" | "ember">("warm");

  const activeZone = workspaceZones.find((z) => z.id === selectedZone) ?? workspaceZones[0];

  return (
    <section
      id="home"
      data-testid="hero-section"
      aria-label="IHBNF Living Workspace"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#080605] pt-20 pb-14 sm:pt-24 sm:pb-20"
    >
      {/* ── Warm Atmospheric Studio Lighting & Architectural Backdrop ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Deep dark wood paneled studio wall */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_65%_at_50%_18%,rgba(66,41,22,0.52)_0%,rgba(22,15,10,0.88)_55%,#070504_100%)]" />

        {/* Subtle vertical architectural wood slat lines on back wall */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(217,165,102,0.08) 0px, rgba(217,165,102,0.08) 1px, transparent 1px, transparent 72px)",
          }}
        />

        {/* Overhead brass pendant warm tungsten cone */}
        <div
          className={`absolute left-1/2 -top-[18%] h-[95vh] w-[115vw] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500 ${
            lampWarmth === "warm" ? "opacity-95" : "opacity-70"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 50% 12%, rgba(255, 198, 112, 0.34) 0%, rgba(217, 140, 63, 0.18) 38%, rgba(120, 68, 28, 0.06) 64%, transparent 80%)",
          }}
        />

        {/* Left bookshelf amber rim light */}
        <div
          className="absolute -left-[10%] top-[10%] h-[70vh] w-[55vw] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(217, 140, 63, 0.16) 0%, transparent 68%)",
          }}
        />

        {/* Right desk lamp & screen ambient glow */}
        <div
          className="absolute -right-[8%] top-[22%] h-[65vh] w-[50vw] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(169, 156, 255, 0.11) 0%, rgba(201, 164, 92, 0.12) 45%, transparent 72%)",
          }}
        />

        {/* Bottom vignette blending seamlessly into rest of page */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#0b0a09]/80 to-ink" />
      </div>

      <div className="shell relative z-10">
        {/* ── Top Studio Header Bar: Brand Emblem + Living Workspace Controls ── */}
        <div className="flex flex-col justify-between gap-6 border-b border-bone/10 pb-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div
              aria-label="IHBNF"
              data-testid="hero-title"
              className="relative flex h-16 w-28 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-[#120d09]/90 p-2 shadow-[0_12px_35px_rgba(0,0,0,0.65)]"
            >
              <Image
                src="/media/brand/ihbnf-secondary.svg"
                alt="IHBNF — Idle Hands Bear No Fruit"
                width={240}
                height={160}
                priority
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-gold">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#c9a45c]" />
                  The Living Workspace
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-mute">
                  Studio of {site.founder.name}
                </span>
              </div>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.35rem)] leading-[1.02] text-bone">
                Idle Hands Bear <em className="text-gold">No Fruit.</em>
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-mute sm:text-base">
                I write books. I build apps. Apparently I don&apos;t know how to sit still. Step up to the desk—every object on this table is a live project.
              </p>
            </div>
          </div>

          {/* Studio Lighting & Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLampWarmth((w) => (w === "warm" ? "ember" : "warm"))}
              aria-label="Toggle studio lamp warmth"
              className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-[#17110c]/90 px-4 py-2 text-xs uppercase tracking-[0.18em] text-bone/90 shadow-inner transition-colors hover:border-gold/60 hover:text-gold"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  lampWarmth === "warm"
                    ? "bg-[#ffd27d] shadow-[0_0_12px_#ffb84d]"
                    : "bg-amber shadow-[0_0_8px_#d98c3f]"
                }`}
              />
              Lamp: {lampWarmth === "warm" ? "Studio Warm (2700K)" : "After Hours Ember"}
            </button>
            <Link href="/#work" data-testid="hero-explore-work-btn" className="btn btn-primary !min-h-[2.6rem] !px-4 !text-xs uppercase tracking-[0.16em]">
              See What I Built <Arrow />
            </Link>
            <Link href="/#about" data-testid="hero-meet-creator-btn" className="btn btn-ghost !min-h-[2.6rem] !px-4 !text-xs uppercase tracking-[0.16em]">
              Meet the Creator
            </Link>
          </div>
        </div>

        {/* ── Main Interactive Walnut Desk Scene ── */}
        <div className="relative mt-6">
          {/* Overhead Studio Brass Lamp Fixture */}
          <div aria-hidden="true" className="pointer-events-none relative mx-auto mb-2 flex max-w-md flex-col items-center">
            <div className="h-5 w-0.5 bg-gradient-to-b from-gold/20 to-gold/70" />
            <div className="h-3 w-44 rounded-t-full border border-gold/45 bg-gradient-to-r from-[#3d2914] via-[#c9a45c] to-[#3d2914] shadow-[0_6px_30px_rgba(255,196,107,0.45)]" />
            <div
              className={`h-1.5 w-36 rounded-b-full bg-[#ffe6b3] blur-[1px] transition-opacity ${
                lampWarmth === "warm" ? "opacity-95" : "opacity-60"
              }`}
            />
          </div>

          {/* ── Architectural Walnut Desk Surface Container ── */}
          <div
            data-testid="walnut-desk-surface"
            className="relative overflow-hidden rounded-[28px] border border-[#6e4929]/55 shadow-[0_45px_120px_-25px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,214,153,0.22)]"
            style={{
              background:
                "radial-gradient(ellipse 85% 60% at 50% 32%, rgba(92, 54, 28, 0.72) 0%, rgba(46, 26, 14, 0.94) 58%, rgba(24, 13, 7, 0.99) 100%)",
            }}
          >
            {/* Rich Walnut Wood Grain Texture Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(178deg, rgba(18,9,4,0.0) 0px, rgba(18,9,4,0.0) 6px, rgba(12,6,2,0.38) 7px, rgba(124,77,43,0.12) 9px, rgba(18,9,4,0.0) 14px), radial-gradient(ellipse at 30% 50%, rgba(168,104,56,0.16), transparent 70%)",
              }}
            />

            {/* Warm Brass Inlay Trim along Desk Top Edge */}
            <div aria-hidden="true" className="h-1.5 w-full bg-gradient-to-r from-[#2c190d] via-[#c9a45c]/65 to-[#2c190d]" />

            {/* ── Desk Grid: 12-Column Responsive Living Studio ── */}
            <div className="relative z-10 grid gap-6 p-5 sm:p-7 lg:grid-cols-12 lg:gap-7 lg:p-9">
              {/* ============================================================
                  LEFT WING (Cols 1-4): BOOKSHELF + OPEN LEATHER NOTEBOOK
                 ============================================================ */}
              <div className="flex flex-col gap-6 lg:col-span-4">
                {/* ── 1. THE BOOKSHELF (Why Henry? + Stone Markers + More Books) ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedZone("bookshelf")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedZone("bookshelf")}
                  data-testid="workspace-bookshelf"
                  aria-label="Inspect The Bookshelf: Why Henry and IHBNF Books"
                  className={`group relative cursor-pointer rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                    selectedZone === "bookshelf"
                      ? "border-amber/70 bg-[#1a1009]/95 shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_0_1px_rgba(217,140,63,0.3)]"
                      : "border-[#7c5230]/40 bg-[#150c07]/85 hover:border-amber/50"
                  }`}
                >
                  {/* Shelf Top Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-amber/15 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-amber/15 px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider text-amber">
                        01 · BOOKSHELF
                      </span>
                      <span className="text-xs font-medium tracking-wide text-bone/90">
                        Walnut Bookcase
                      </span>
                    </div>
                    <span className="text-[0.68rem] uppercase tracking-[0.2em] text-amber">
                      Available Now
                    </span>
                  </div>

                  {/* Upper Shelf: Why Henry Cover + Upright Spines + 6 Stone Markers */}
                  <div className="mt-4 grid grid-cols-12 items-end gap-3.5">
                    {/* Featured Face-Out Book: Why Henry */}
                    <div className="col-span-5">
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[4px] border border-amber/30 bg-black shadow-[8px_12px_28px_rgba(0,0,0,0.85)]">
                        <Image
                          src="/media/why-henry/cover.webp"
                          alt="The Unwritten Journey — Book One: Why Henry? book cover"
                          fill
                          sizes="160px"
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Companion Spines & Briar Glen Relics */}
                    <div className="col-span-7 flex flex-col justify-between gap-3">
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-amber/90">
                          The Unwritten Journey
                        </p>
                        <h2 className="mt-0.5 font-display text-2xl leading-tight text-bone">
                          Book One: Why Henry?
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-mute">
                          Two friends. Six mysterious stone markers. One forgotten secret.
                        </p>
                      </div>

                      {/* Carved Stone Markers Relic Stand + Book Spines */}
                      <div className="rounded-xl border border-bone/10 bg-[#0e0805]/90 p-2.5">
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-gold/80">
                              Briar Glen Artifacts
                            </span>
                            <span className="text-[0.68rem] text-mute">6 Stone Markers</span>
                          </div>
                          <div aria-hidden="true" className="flex items-end gap-1.5">
                            {[14, 20, 12, 22, 16, 18].map((h, i) => (
                              <span
                                key={i}
                                style={{ height: h }}
                                className="block w-1.5 rounded-t-full bg-gradient-to-t from-amber/35 to-[#f2d59c] shadow-[0_0_6px_rgba(242,213,156,0.45)]"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Row of Book Spines waiting on the shelf */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="rounded border border-gold/30 bg-[#2a190d] px-2 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-gold">
                          Book II · Draft
                        </span>
                        <span className="rounded border border-bone/15 bg-[#1f140d] px-2 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-bone/75">
                          Memoir
                        </span>
                        <Link
                          href="/projects/why-henry"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-amber hover:underline"
                        >
                          Open Book <Arrow className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Walnut Shelf Ledge */}
                  <div
                    aria-hidden="true"
                    className="mt-3.5 h-2.5 w-full rounded-sm border-t border-[#b3824c]/35 bg-gradient-to-b from-[#4a2b16] to-[#241308] shadow-[0_6px_12px_rgba(0,0,0,0.75)]"
                  />
                </div>

                {/* ── 2. THE NOTEBOOK (Open Moleskine / Leather Journal on Desk) ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedZone("notebook")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedZone("notebook")}
                  data-testid="workspace-notebook"
                  aria-label="Inspect The Notebook: The Dream of the Payoff and Creator Notes"
                  className={`group relative cursor-pointer rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                    selectedZone === "notebook"
                      ? "border-gold/75 bg-[#1b120b]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(201,164,92,0.35)]"
                      : "border-[#7c5230]/40 bg-[#160e08]/85 hover:border-gold/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider text-gold">
                        02 · NOTEBOOK
                      </span>
                      <span className="text-xs font-medium text-bone/90">
                        Author&apos;s Field Journal
                      </span>
                    </div>
                    <span className="text-[0.68rem] uppercase tracking-[0.18em] text-gold">
                      In Development
                    </span>
                  </div>

                  {/* Open Two-Page Cream Parchment Spread */}
                  <div className="relative grid grid-cols-2 overflow-hidden rounded-xl border border-[#c9a45c]/35 bg-[#efe5d2] text-[#221911] shadow-[inset_0_0_24px_rgba(110,77,40,0.28),0_14px_30px_rgba(0,0,0,0.7)]">
                    {/* Center Stitched Binding Spine */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gradient-to-r from-black/15 via-black/30 to-black/15"
                    />
                    {/* Red Satin Bookmark Ribbon */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 left-[51%] h-10 w-1.5 bg-[#8c2318] shadow-sm"
                    />

                    {/* Left Page: The Dream of the Payoff Cover & Outline */}
                    <div
                      className="flex flex-col justify-between p-3.5 pr-4"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(138,108,68,0.16) 20px)",
                      }}
                    >
                      <div>
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#7a582e]">
                          Manuscript · Non-Fiction
                        </p>
                        <h3 className="mt-1 font-display text-lg leading-tight text-[#1a120b]">
                          The Dream of the Payoff
                        </h3>
                        <p className="mt-1.5 text-[0.7rem] leading-snug text-[#4a3723]">
                          Growing up, family, fatherhood, sacrifice, and the question: when does all that hard work finally pay off?
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-2 pt-1">
                        <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-[2px] border border-[#8a683c]/40 shadow-sm">
                          <Image
                            src="/media/memoir/dream-payoff-cover.svg"
                            alt="The Dream of the Payoff cover"
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-display text-xs italic text-[#5c4328]">
                          “A true story.”
                        </span>
                      </div>
                    </div>

                    {/* Right Page: Working Method & Brass Fountain Pen */}
                    <div
                      className="flex flex-col justify-between p-3.5 pl-4"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(138,108,68,0.16) 20px)",
                      }}
                    >
                      <div>
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#7a582e]">
                          Standing Rule
                        </p>
                        <ul className="mt-1.5 space-y-1 text-[0.7rem] font-medium text-[#2f2216]">
                          <li>1. Create &amp; Build</li>
                          <li>2. Break it &amp; Fix it</li>
                          <li>3. Learn &amp; Keep moving</li>
                        </ul>
                      </div>
                      <div className="mt-3 border-t border-[#8a683c]/25 pt-2">
                        <p className="font-display text-sm italic text-[#3b2816]">
                          — Javier Huertas
                        </p>
                        <Link
                          href="/projects/the-dream-of-the-payoff"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 inline-flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#7a4b19] hover:underline"
                        >
                          Read Memoir <Arrow className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================
                  CENTER STAGE (Cols 5-8): STUDIO LAPTOP + DESK MAT
                 ============================================================ */}
              <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                {/* ── 3. THE LAPTOP (Studio Workstation at Center of Desk) ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedZone("laptop")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedZone("laptop")}
                  data-testid="workspace-laptop"
                  aria-label="Inspect Studio Laptop: Sports Wager Helper and Active Builds"
                  className={`group relative flex flex-1 flex-col justify-between cursor-pointer rounded-2xl border p-4 text-left transition-colors sm:p-6 ${
                    selectedZone === "laptop"
                      ? "border-[#a3e635]/70 bg-[#140e09]/95 shadow-[0_25px_65px_rgba(0,0,0,0.85),0_0_0_1px_rgba(163,230,53,0.28)]"
                      : "border-[#7c5230]/45 bg-[#140d08]/90 hover:border-[#a3e635]/50"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#a3e635]/15 px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider text-[#a3e635]">
                        04 · LAPTOP WORKSTATION
                      </span>
                      <span className="text-xs font-medium text-bone/90">
                        Sports Wager Helper · S.A.L.
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-[#a3e635]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
                      Web + Mobile Live
                    </span>
                  </div>

                  {/* Physical Laptop Display Bezel */}
                  <div className="relative mx-auto w-full overflow-hidden rounded-t-[18px] border-[3px] border-[#332c27] bg-[#070a08] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
                    {/* Camera Notch */}
                    <div className="mx-auto mb-1.5 flex h-2 w-16 items-center justify-center rounded-full bg-[#181614]">
                      <span className="h-1 w-1 rounded-full bg-emerald-400/70" />
                    </div>

                    {/* Browser / App Screen Inside Laptop */}
                    <div className="overflow-hidden rounded-[10px] border border-white/10 bg-[#070b08]">
                      {/* OS Window Top Bar */}
                      <div className="flex items-center justify-between border-b border-white/10 bg-[#0d130e] px-3 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-[#ef4444]/80" />
                          <span className="h-2 w-2 rounded-full bg-[#f59e0b]/80" />
                          <span className="h-2 w-2 rounded-full bg-[#22c55e]/80" />
                        </div>
                        <span className="font-mono text-[0.65rem] text-bone/70">
                          sportswagerhelper.com — S.A.L. Research Terminal
                        </span>
                        <span className="rounded bg-[#a3e635]/20 px-1.5 py-0.5 font-mono text-[0.58rem] text-[#a3e635]">
                          LIVE
                        </span>
                      </div>

                      {/* Laptop Screen Visual Content: Real SWH OG Artwork + Brand Logo Overlay */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#060906]">
                        <Image
                          src="/media/sports-wager-helper/og-image.png"
                          alt="Sports Wager Helper — AI player and team breakdowns before you bet"
                          fill
                          sizes="(min-width: 1024px) 460px, 90vw"
                          className="object-cover object-center opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050806] via-[#050806]/35 to-transparent" />

                        {/* Bottom Dock inside Laptop Screen */}
                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-[#a3e635]/30 bg-black/85 p-2.5 backdrop-blur-md">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#a3e635]/35 bg-black">
                              <Image
                                src="/media/sports-wager-helper/swh-brand-logo.svg"
                                alt="Sports Wager Helper logo"
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-bone">
                                Research first. Gut feeling second.
                              </p>
                              <p className="text-[0.68rem] text-mute">
                                Player stats · Matchup trends · S.A.L. AI Librarian
                              </p>
                            </div>
                          </div>
                          <a
                            href={links.sportsWagerHelper}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 rounded-full bg-[#a3e635] px-3 py-1.5 text-[0.68rem] font-semibold text-black hover:bg-[#bef264]"
                          >
                            Open App ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Physical Laptop Brushed Aluminum Base & Trackpad */}
                  <div aria-hidden="true" className="mx-auto w-[103%] -translate-x-[1.5%]">
                    <div className="flex h-3.5 items-center justify-center rounded-b-xl border-x border-b border-bone/20 bg-gradient-to-r from-[#2b2623] via-[#4a423d] to-[#2b2623] shadow-[0_14px_28px_rgba(0,0,0,0.85)]">
                      <div className="h-1 w-16 rounded-full bg-black/45" />
                    </div>
                  </div>

                  {/* Desk Mat Caption & Project Links */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-bone/10 pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {["Player & Team Stats", "Matchup Trends", "S.A.L. AI"].map((pill) => (
                        <span
                          key={pill}
                          className="rounded-full border border-[#a3e635]/25 bg-black/35 px-2.5 py-0.5 text-[0.66rem] text-bone/80"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                    <Link
                      href="/projects/sports-wager-helper"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#a3e635] hover:underline"
                    >
                      Project Details <Arrow className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* ── Founder Desk Nameplate & Brass Compass Plaque ── */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-[#1c120a]/95 via-[#25180d]/95 to-[#1c120a]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.75)] sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3.5">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/50 shadow-md">
                      <Image
                        src={site.founder.photo.src}
                        alt={site.founder.photo.alt}
                        fill
                        sizes="48px"
                        className="object-cover object-[50%_40%]"
                      />
                    </div>
                    <div>
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-gold">
                        Desk of the Creator
                      </p>
                      <p className="font-display text-xl text-bone">
                        {site.founder.name} ·{" "}
                        <span className="italic text-gold/90">
                          {site.founder.roles.join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/#about"
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-black/35 px-3.5 py-1.5 text-xs text-bone hover:border-gold hover:text-gold"
                  >
                    Founder Story <Arrow className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* ============================================================
                  RIGHT WING (Cols 9-12): SMARTPHONE + DESK CALENDAR
                 ============================================================ */}
              <div className="flex flex-col gap-6 lg:col-span-3">
                {/* ── 4. THE SMARTPHONE (Unfiltr by Javier on Desk Dock) ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedZone("smartphone")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedZone("smartphone")}
                  data-testid="workspace-smartphone"
                  aria-label="Inspect The Smartphone: Unfiltr by Javier AI Companion App"
                  className={`group relative cursor-pointer rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                    selectedZone === "smartphone"
                      ? "border-violet/75 bg-[#140f1d]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(169,156,255,0.35)]"
                      : "border-[#7c5230]/40 bg-[#150d09]/85 hover:border-violet/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-3">
                    <span className="rounded bg-violet/15 px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider text-violet">
                      03 · SMARTPHONE
                    </span>
                    <span className="text-[0.66rem] uppercase tracking-[0.18em] text-violet">
                      iOS &amp; Android
                    </span>
                  </div>

                  <div className="grid grid-cols-12 items-center gap-3.5">
                    {/* Tactile Phone Chassis on Desk */}
                    <div className="col-span-5">
                      <div className="relative mx-auto aspect-[9/19] w-full max-w-[115px] rounded-[1.35rem] border border-white/20 bg-black p-1.5 shadow-[0_18px_40px_rgba(88,68,214,0.45)]">
                        <div className="relative h-full w-full overflow-hidden rounded-[1.05rem] bg-black">
                          <Image
                            src="/media/unfiltr/kai-tropical-chat.jpg"
                            alt="Unfiltr by Javier real chat screen with Kai"
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone Companion Context */}
                    <div className="col-span-7 flex flex-col justify-between">
                      <p className="text-[0.66rem] uppercase tracking-[0.2em] text-violet">
                        Unfiltr by Javier
                      </p>
                      <h3 className="mt-0.5 font-display text-2xl leading-tight text-bone">
                        Conversation that <em className="text-violet">remembers.</em>
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-mute">
                        AI companions with persistent memory, voice, immersive chat worlds, journaling &amp; meditation.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Link
                          href="/projects/unfiltr"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-full bg-violet px-3 py-1 text-[0.68rem] font-semibold text-[#130e2c] hover:bg-[#c4baff]"
                        >
                          Discover <Arrow className="h-3 w-3" />
                        </Link>
                        <a
                          href={links.unfiltrAppStore}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-full border border-bone/20 px-2.5 py-1 text-[0.66rem] text-bone/85 hover:border-violet"
                        >
                          iOS ↗
                        </a>
                        <a
                          href={links.unfiltrGooglePlay}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-full border border-bone/20 px-2.5 py-1 text-[0.66rem] text-bone/85 hover:border-violet"
                        >
                          Android ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── 5. THE DESK CALENDAR (Brass-Bound Studio Schedule & Shipping Log) ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedZone("calendar")}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedZone("calendar")}
                  data-testid="workspace-calendar"
                  aria-label="Inspect The Desk Calendar: Active Milestones and Release Schedule"
                  className={`group relative cursor-pointer rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                    selectedZone === "calendar"
                      ? "border-gold/75 bg-[#1b120a]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(201,164,92,0.35)]"
                      : "border-[#7c5230]/40 bg-[#150d08]/85 hover:border-gold/50"
                  }`}
                >
                  {/* Brass Ring Binding at Top of Desk Calendar */}
                  <div aria-hidden="true" className="mb-2.5 flex justify-around px-6">
                    {[0, 1, 2, 3, 4].map((ring) => (
                      <span
                        key={ring}
                        className="h-3 w-2 rounded-full border border-gold/60 bg-gradient-to-b from-[#e6c47a] to-[#6e4c1e] shadow-sm"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                    <div>
                      <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-[0.62rem] font-semibold tracking-wider text-gold">
                        05 · DESK CALENDAR
                      </span>
                      <h3 className="mt-1 font-display text-xl text-bone">
                        Studio Dispatch &amp; Cadence
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                        ACTIVE SLATE
                      </span>
                      <span className="text-[0.68rem] text-mute">Always shipping</span>
                    </div>
                  </div>

                  {/* Tactile Calendar Grid */}
                  <div className="mt-3 grid grid-cols-7 gap-1 text-center font-mono text-[0.62rem]">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                      <span key={idx} className="py-0.5 text-mute/70">
                        {d}
                      </span>
                    ))}
                    {calendarDays.map((cell) => {
                      const hasTag = Boolean(cell.tag);
                      return (
                        <div
                          key={cell.day}
                          className={`relative flex flex-col items-center justify-center rounded py-1 ${
                            cell.tag === "NOW"
                              ? "border border-gold bg-gold/25 font-bold text-bone"
                              : hasTag
                              ? "border border-amber/35 bg-amber/10 text-bone"
                              : "bg-black/25 text-mute/75"
                          }`}
                        >
                          <span>{cell.day}</span>
                          {cell.tag && (
                            <span className="text-[0.45rem] tracking-tighter text-gold">
                              {cell.tag}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pinned Studio Milestones */}
                  <ul className="mt-3 space-y-1.5 border-t border-bone/10 pt-2.5 text-xs">
                    <li className="flex items-center justify-between text-bone/90">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                        Why Henry? (Book One)
                      </span>
                      <span className="font-mono text-[0.65rem] text-amber">ON AMAZON</span>
                    </li>
                    <li className="flex items-center justify-between text-bone/90">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet" />
                        Unfiltr by Javier
                      </span>
                      <span className="font-mono text-[0.65rem] text-violet">iOS · ANDROID</span>
                    </li>
                    <li className="flex items-center justify-between text-bone/90">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
                        Sports Wager Helper
                      </span>
                      <span className="font-mono text-[0.65rem] text-[#a3e635]">WEB + MOBILE</span>
                    </li>
                    <li className="flex items-center justify-between text-bone/90">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        The Dream of the Payoff
                      </span>
                      <span className="font-mono text-[0.65rem] text-gold">WRITING</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Interactive Inspector Tray (Docked along front bevel of the Walnut Desk) ── */}
            <div
              data-testid="workspace-inspector-bar"
              className="relative z-10 border-t border-[#8a5d36]/40 bg-[#0e0906]/95 px-5 py-4 backdrop-blur-md sm:px-8"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                {/* Object Selector Pills */}
                <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Desk objects">
                  <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-gold/80">
                    On the Desk:
                  </span>
                  {workspaceZones.map((zone) => {
                    const isSelected = zone.id === selectedZone;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        data-testid={`desk-tab-${zone.id}`}
                        onClick={() => setSelectedZone(zone.id)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          isSelected
                            ? "border-gold bg-gold text-ink font-medium"
                            : "border-bone/15 bg-white/[0.03] text-mute hover:border-bone/35 hover:text-bone"
                        }`}
                      >
                        <span className="mr-1.5 font-mono text-[0.65rem] opacity-75">{zone.number}</span>
                        {zone.label}
                      </button>
                    );
                  })}
                </div>

                {/* Active Object Quick Summary & Direct Action */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                  <div className="max-w-md">
                    <p className="text-xs font-medium text-bone">
                      <span className="text-gold">{activeZone.label}:</span> {activeZone.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-mute">{activeZone.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <Link
                      href={activeZone.href}
                      data-testid="workspace-active-cta"
                      className="inline-flex items-center gap-1.5 rounded-full bg-bone px-4 py-2 text-xs font-medium text-ink hover:bg-[#f4dcaa]"
                    >
                      {activeZone.cta} <Arrow className="h-3.5 w-3.5" />
                    </Link>
                    {activeZone.externalHref && (
                      <a
                        href={activeZone.externalHref}
                        target={activeZone.externalHref.startsWith("http") ? "_blank" : undefined}
                        rel={activeZone.externalHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 rounded-full border border-bone/25 px-3.5 py-2 text-xs text-bone hover:border-gold hover:text-gold"
                      >
                        {activeZone.externalCta}
                        {activeZone.externalHref.startsWith("http") ? (
                          <ExternalArrow className="h-3.5 w-3.5" />
                        ) : (
                          <Arrow className="h-3.5 w-3.5" />
                        )}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Carved Walnut Desk Front Edge Bevel */}
            <div
              aria-hidden="true"
              className="h-3.5 w-full border-t border-[#b8864d]/30 bg-gradient-to-b from-[#3d2210] via-[#261409] to-[#120904]"
            />
          </div>
        </div>

        {/* ── Bottom Index Strip (Preserves original Hero index test IDs & quick jump anchors) ── */}
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-bone/10 pt-5 sm:flex-row sm:items-center">
          <ul className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: "01", label: "Books", href: "/#books" },
              { n: "02", label: "Apps", href: "/#apps" },
              { n: "03", label: "Sports tech", href: "/#sports" },
              { n: "04", label: "In progress", href: "/#memoir" },
            ].map((i) => (
              <li key={i.n}>
                <Link
                  href={i.href}
                  data-testid={`hero-index-${i.n}`}
                  className="group flex items-baseline gap-2 text-sm text-mute transition-colors hover:text-bone"
                >
                  <span className="text-xs text-gold">{i.n}</span>
                  <span>{i.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 text-xs text-mute">
            <span className="hidden sm:inline">
              Connected across {socials.length} channels
            </span>
            <Link
              href="/#connect"
              className="inline-flex items-center gap-1.5 uppercase tracking-[0.22em] text-gold hover:underline"
            >
              Scroll Studio <Arrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
