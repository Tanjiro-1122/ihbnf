"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getProject } from "@/content/projects";
import { links } from "@/content/site";

/**
 * Seven-Phase Magical Book Animation State Machine:
 * - "idle": Resting naturally in its shelf niche on the walnut bookcase
 * - "hover": Phase 1 (Discovery) — Silhouette-matched blue magical aura traces the hardcover edges
 * - "awakening": Phase 2 (The Awakening) — Subtle physical tremble, blue rune particles around spine, shimmer audio
 * - "extracting": Phase 3 (Extraction) — Slides forward off the shelf leaving the empty walnut recess behind
 * - "levitating": Phase 4 (Levitation) — Floats gracefully to center screen with natural inertia & rotation
 * - "opening": Phase 5 (Opening) — Turns to viewer, hardcover swings open around curved spine, flexible pages bend & turn
 * - "open": Phase 6 (Inside the Book) — Suspended in midair; physical pages reveal title, synopsis, illustrations, and Amazon action
 * - "returning": Phase 7 (Returning) — Pages turn back, cover shuts with a thump, book rotates and floats back into its shelf slot
 */
export type MagicalBookPhase =
  | "idle"
  | "hover"
  | "awakening"
  | "extracting"
  | "levitating"
  | "opening"
  | "open"
  | "returning";

const illustrations = [
  {
    src: "/media/why-henry/illustrations/03.webp",
    title: "Plate I · The Underground Cavern",
    caption: "Below the roots, Dominick and Henry find a chamber hidden beneath the forest.",
  },
  {
    src: "/media/why-henry/illustrations/01.webp",
    title: "Plate II · The Forgotten Map",
    caption: "An old map of Briar Glen, annotated in a worried hand.",
  },
  {
    src: "/media/why-henry/illustrations/02.webp",
    title: "Plate III · The Ancient Hollow Tree",
    caption: "The oldest tree in the glen — a hiding place, a landmark, and a clue.",
  },
  {
    src: "/media/why-henry/illustrations/04.webp",
    title: "Plate IV · The First Stone Marker",
    caption: "The first piece of a mystery that keeps getting larger.",
  },
];

const rainDrops = Array.from({ length: 18 }, (_, i) => ({
  left: `${8 + ((i * 19) % 84)}%`,
  top: `${(i * 23) % 65}%`,
  height: `${18 + (i % 4) * 9}px`,
  duration: `${2.8 + (i % 5) * 0.55}s`,
  delay: `-${(i * 0.43).toFixed(2)}s`,
}));

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Renders the Left Physical Book Page (Frontispiece Illustration Plate, Stone Markers & Caption) onto a high-res 2D canvas for WebGL texture mapping
function renderLeftPageCanvas(
  canvas: HTMLCanvasElement,
  illImg: HTMLImageElement | null,
  plateTitle: string,
  plateCaption: string,
  plateIndex: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Warm parchment paper base gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#f5ecd9");
  grad.addColorStop(0.55, "#eadbc0");
  grad.addColorStop(1, "#dac39c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle right-edge spine gutter shadow
  const spineShadow = ctx.createLinearGradient(W - 95, 0, W, 0);
  spineShadow.addColorStop(0, "rgba(45, 26, 10, 0)");
  spineShadow.addColorStop(0.7, "rgba(45, 26, 10, 0.14)");
  spineShadow.addColorStop(1, "rgba(30, 16, 5, 0.38)");
  ctx.fillStyle = spineShadow;
  ctx.fillRect(W - 95, 0, 95, H);

  // Fine parchment border frame
  ctx.strokeStyle = "rgba(122, 82, 38, 0.38)";
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.strokeStyle = "rgba(122, 82, 38, 0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(66, 66, W - 132, H - 132);

  // Running Header
  ctx.fillStyle = "#6e461d";
  ctx.font = "600 24px ui-monospace, monospace";
  ctx.letterSpacing = "4px";
  ctx.fillText("THE UNWRITTEN JOURNEY · BOOK ONE", 96, 118);

  ctx.fillStyle = "rgba(122, 82, 38, 0.3)";
  ctx.fillRect(96, 138, W - 192, 2);

  // Frontispiece Illustration Frame
  const imgX = 96;
  const imgY = 178;
  const imgW = W - 192;
  const imgH = 560;

  ctx.fillStyle = "#181009";
  ctx.fillRect(imgX - 6, imgY - 6, imgW + 12, imgH + 12);

  if (illImg && illImg.complete && illImg.naturalWidth > 0) {
    ctx.drawImage(illImg, imgX, imgY, imgW, imgH);
  } else {
    const ph = ctx.createRadialGradient(
      imgX + imgW / 2,
      imgY + imgH / 2,
      30,
      imgX + imgW / 2,
      imgY + imgH / 2,
      320,
    );
    ph.addColorStop(0, "#3a2512");
    ph.addColorStop(1, "#120b05");
    ctx.fillStyle = ph;
    ctx.fillRect(imgX, imgY, imgW, imgH);
  }

  ctx.strokeStyle = "#8a6236";
  ctx.lineWidth = 3;
  ctx.strokeRect(imgX - 6, imgY - 6, imgW + 12, imgH + 12);

  // Plate Title & Caption
  ctx.fillStyle = "#24160a";
  ctx.font = "italic 40px Georgia, serif";
  ctx.fillText(plateTitle, 96, 805);

  ctx.fillStyle = "#4a331b";
  ctx.font = "28px Georgia, serif";
  const words = plateCaption.split(" ");
  let line = "";
  let y = 858;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > W - 192) {
      ctx.fillText(line, 96, y);
      line = w;
      y += 40;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 96, y);

  // Plate selector pills drawn directly onto the physical page
  const pillY = 965;
  for (let i = 0; i < 4; i++) {
    const px = 96 + i * 205;
    const active = i === plateIndex;
    ctx.fillStyle = active ? "#26170b" : "rgba(138, 104, 60, 0.18)";
    ctx.beginPath();
    ctx.roundRect(px, pillY, 188, 52, 26);
    ctx.fill();
    ctx.strokeStyle = active ? "#c9a45c" : "rgba(122, 82, 38, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = active ? "#f5ecd9" : "#4a331b";
    ctx.font = "600 22px ui-monospace, monospace";
    ctx.fillText(`PLATE 0${i + 1}`, px + 36, pillY + 33);
  }

  // Divider & Quote
  ctx.fillStyle = "rgba(122, 82, 38, 0.28)";
  ctx.fillRect(96, 1065, W - 192, 2);

  ctx.fillStyle = "#3d2813";
  ctx.font = "italic 34px Georgia, serif";
  ctx.fillText("“Two friends. Six mysterious stone markers.", 96, 1135);
  ctx.fillText("One forgotten secret.”", 96, 1182);

  // Six Carved Stone Markers Emblem at bottom of Left Page
  const heights = [36, 54, 32, 60, 42, 48];
  for (let i = 0; i < heights.length; i++) {
    const mh = heights[i];
    const mx = 96 + i * 34;
    const my = 1310 - mh;
    const mg = ctx.createLinearGradient(mx, my, mx, 1310);
    mg.addColorStop(0, "#d98c3f");
    mg.addColorStop(1, "#5c3818");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.roundRect(mx, my, 18, mh, [9, 9, 2, 2]);
    ctx.fill();
  }

  ctx.fillStyle = "#6e461d";
  ctx.font = "22px ui-monospace, monospace";
  ctx.fillText("BRIAR GLEN ARCHIVE · PAGE I", 330, 1304);
}

// Renders the Right Physical Book Page (Official Title, Synopsis, Author Attribution & Amazon Action) onto a high-res 2D canvas
function renderRightPageCanvas(canvas: HTMLCanvasElement, hoverTarget: string | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Warm parchment paper gradient
  const grad = ctx.createLinearGradient(W, 0, 0, H);
  grad.addColorStop(0, "#f7efe0");
  grad.addColorStop(0.55, "#ede0c7");
  grad.addColorStop(1, "#dec8a0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Left-edge spine gutter shadow
  const spineShadow = ctx.createLinearGradient(0, 0, 95, 0);
  spineShadow.addColorStop(0, "rgba(30, 16, 5, 0.42)");
  spineShadow.addColorStop(0.35, "rgba(45, 26, 10, 0.15)");
  spineShadow.addColorStop(1, "rgba(45, 26, 10, 0)");
  ctx.fillStyle = spineShadow;
  ctx.fillRect(0, 0, 95, H);

  // Red satin bookmark ribbon hanging down the left gutter
  ctx.fillStyle = "#8c2016";
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(68, 0);
  ctx.lineTo(68, 260);
  ctx.lineTo(55, 240);
  ctx.lineTo(42, 260);
  ctx.closePath();
  ctx.fill();

  // Fine parchment border frame
  ctx.strokeStyle = "rgba(122, 82, 38, 0.38)";
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, W - 112, H - 112);
  ctx.strokeStyle = "rgba(122, 82, 38, 0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(66, 66, W - 132, H - 132);

  // Top Status Badge & Return to Shelf Button Drawn on the Page
  ctx.fillStyle = "rgba(138, 90, 36, 0.14)";
  ctx.beginPath();
  ctx.roundRect(96, 84, 420, 48, 24);
  ctx.fill();
  ctx.fillStyle = "#7a4b19";
  ctx.font = "600 21px ui-monospace, monospace";
  ctx.fillText("● AVAILABLE NOW · YA FANTASY", 120, 115);

  // Return to Shelf button on top-right of right page
  const closeHover = hoverTarget === "close";
  ctx.fillStyle = closeHover ? "#3d2512" : "#241509";
  ctx.beginPath();
  ctx.roundRect(W - 360, 82, 264, 52, 26);
  ctx.fill();
  ctx.strokeStyle = "#c9a45c";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#f5ecd9";
  ctx.font = "600 21px ui-monospace, monospace";
  ctx.fillText("← RETURN TO SHELF", W - 334, 115);

  ctx.fillStyle = "rgba(122, 82, 38, 0.3)";
  ctx.fillRect(96, 154, W - 192, 2);

  // Book Title & Subtitle
  ctx.fillStyle = "#7a4b19";
  ctx.font = "600 25px ui-monospace, monospace";
  ctx.fillText("THE UNWRITTEN JOURNEY", 96, 218);

  ctx.fillStyle = "#170f07";
  ctx.font = "bold 68px Georgia, serif";
  ctx.fillText("Book One: Why Henry?", 96, 298);

  ctx.fillStyle = "#5c3d1e";
  ctx.font = "italic 30px Georgia, serif";
  ctx.fillText("By Javier Huertas", 96, 348);

  // Ornamental gold rule
  ctx.fillStyle = "rgba(166, 118, 56, 0.45)";
  ctx.fillRect(96, 382, 180, 3);

  // Approved Synopsis Paragraphs wrapped cleanly onto the physical page
  const paragraphs = [
    {
      text: "Every great adventure begins with a question.",
      font: "italic 36px Georgia, serif",
      color: "#4d2f14",
      lineHeight: 48,
    },
    {
      text: "For Dominick and Henry, it starts with a discovery that seems ordinary. It turns into a mystery involving six mysterious stone markers, forgotten secrets, friendship, danger, and something much larger than either boy understands.",
      font: "30px Georgia, serif",
      color: "#2b1d10",
      lineHeight: 46,
    },
    {
      text: "The Unwritten Journey — Book One: Why Henry? is a young-adult fantasy adventure by Javier Huertas, available now on Amazon.",
      font: "30px Georgia, serif",
      color: "#2b1d10",
      lineHeight: 46,
    },
  ];

  let curY = 445;
  const maxW = W - 192;
  for (const p of paragraphs) {
    ctx.font = p.font;
    ctx.fillStyle = p.color;
    const words = p.text.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW) {
        ctx.fillText(line, 96, curY);
        line = w;
        curY += p.lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, 96, curY);
      curY += p.lineHeight + 28;
    }
  }

  // Bottom Purchase Section on the Page
  ctx.fillStyle = "rgba(122, 82, 38, 0.3)";
  ctx.fillRect(96, 1085, W - 192, 2);

  // Buy on Amazon Button on the Page
  const amzHover = hoverTarget === "amazon";
  const btnGrad = ctx.createLinearGradient(96, 1130, 96, 1218);
  btnGrad.addColorStop(0, amzHover ? "#e0be78" : "#c9a45c");
  btnGrad.addColorStop(1, amzHover ? "#b88e42" : "#9e7832");
  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.roundRect(96, 1130, 430, 84, 42);
  ctx.fill();
  ctx.strokeStyle = "#241509";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#171008";
  ctx.font = "bold 26px ui-monospace, monospace";
  ctx.fillText("BUY ON AMAZON ↗", 168, 1181);

  ctx.fillStyle = "#6e461d";
  ctx.font = "22px ui-monospace, monospace";
  ctx.fillText("PAGE II · IHBNF EDITION", W - 395, 1304);
}

// Renders a turning middle parchment leaf with subtle literary lines and ornamental header
function renderTurningLeafCanvas(canvas: HTMLCanvasElement, pageNum: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#f4ebd7");
  grad.addColorStop(1, "#dfcba4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(122, 82, 38, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.fillStyle = "#7a4b19";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillText(`The Unwritten Journey · Chapter ${pageNum}`, 64, 88);

  ctx.fillStyle = "rgba(90, 60, 28, 0.22)";
  for (let y = 135; y < H - 90; y += 28) {
    const lineW = (W - 140) * (0.75 + ((y * 17) % 25) / 100);
    ctx.fillRect(64, y, lineW, 4);
  }
}

export function MagicalBookLab() {
  const whyHenry = getProject("why-henry")!;

  const [phase, setPhase] = useState<MagicalBookPhase>("idle");
  const [muted, setMuted] = useState(false);
  const [plateIdx, setPlateIdx] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const shelfHotspotRef = useRef<HTMLButtonElement>(null);
  const returnBtnRef = useRef<HTMLButtonElement>(null);

  // Synchronized local WAV audio bank (only triggered on user click)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    const files: Record<string, string> = {
      shimmer: "/media/audio/magic-shimmer.wav",
      whoosh: "/media/audio/float-whoosh.wav",
      creak: "/media/audio/binding-creak.wav",
      rustle: "/media/audio/page-rustle.wav",
      thump: "/media/audio/book-close-thump.wav",
      settle: "/media/audio/shelf-settle.wav",
    };
    Object.entries(files).forEach(([k, src]) => {
      const a = new Audio(src);
      a.preload = "auto";
      audioRefs.current[k] = a;
    });

    return () => mq.removeEventListener("change", handler);
  }, []);

  const playSound = useCallback((key: string, volume = 0.65) => {
    if (mutedRef.current) return;
    const a = audioRefs.current[key];
    if (!a) return;
    try {
      a.currentTime = 0;
      a.volume = volume;
      a.play().catch(() => {});
    } catch {
      // Ignore autoplay blocks
    }
  }, []);

  // Animation controller refs shared with the Three.js render loop
  const animStateRef = useRef<{
    mode: "idle" | "hover" | "Forward" | "open" | "Reverse";
    startTime: number;
    hoverIntensity: number;
    plateIdx: number;
    soundsPlayed: Set<string>;
  }>({
    mode: "idle",
    startTime: 0,
    hoverIntensity: 0,
    plateIdx: 0,
    soundsPlayed: new Set(),
  });

  // Redraw Left/Right page texture helper ref
  const updateLeftPageTexRef = useRef<((idx: number) => void) | null>(null);

  // Trigger the full Forward Magical Sequence (Phases 2 -> 3 -> 4 -> 5 -> 6)
  const triggerMagicalExtraction = useCallback(() => {
    const st = animStateRef.current;
    if (st.mode === "Forward" || st.mode === "open" || st.mode === "Reverse") return;
    st.mode = "Forward";
    st.startTime = performance.now();
    st.soundsPlayed.clear();

    // Phase 2 sound: Magical shimmer as the book awakens
    playSound("shimmer", 0.7);
    st.soundsPlayed.add("shimmer");
    setPhase("awakening");

    // On narrow mobile screens where the 16:9 study is horizontally panned to the right shelf,
    // smoothly glide the scroll container toward the center of the room as the book levitates
    const wrapper = scrollWrapperRef.current;
    if (wrapper && wrapper.scrollWidth > wrapper.clientWidth) {
      window.setTimeout(() => {
        wrapper.scrollTo({
          left: Math.round((wrapper.scrollWidth - wrapper.clientWidth) / 2),
          behavior: "smooth",
        });
      }, 480);
    }
  }, [playSound]);

  // Trigger the full Reverse Sequence (Phase 7: Returning to Shelf)
  const triggerMagicalReturn = useCallback(() => {
    const st = animStateRef.current;
    if (st.mode !== "open" && st.mode !== "Forward") return;
    st.mode = "Reverse";
    st.startTime = performance.now();
    st.soundsPlayed.clear();

    playSound("rustle", 0.65);
    st.soundsPlayed.add("rev-rustle");
    setPhase("returning");
  }, [playSound]);

  // Escape key closes the open floating book and returns it to the shelf
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const st = animStateRef.current;
        if (st.mode === "open" || st.mode === "Forward") {
          e.preventDefault();
          triggerMagicalReturn();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerMagicalReturn]);

  // Switch illustration plate on the physical Left Page
  const handleSelectPlate = useCallback((idx: number) => {
    setPlateIdx(idx);
    animStateRef.current.plateIdx = idx;
    playSound("rustle", 0.45);
    updateLeftPageTexRef.current?.(idx);
  }, [playSound]);

  // =========================================================================
  // THREE.JS REAL 3D HARDCOVER BOOK & BENDING PAGES SCENE
  // =========================================================================
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    // Perspective camera matching the study's perspective
    const camera = new THREE.PerspectiveCamera(
      34,
      mount.clientWidth / Math.max(1, mount.clientHeight),
      0.1,
      100,
    );
    camera.position.set(0, 0, 11.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // ── Studio Lighting matching the reference room ──
    const ambientLight = new THREE.AmbientLight(0xffdfc2, 1.35);
    scene.add(ambientLight);

    // Warm overhead bookshelf & desk tungsten spotlight
    const warmKeyLight = new THREE.DirectionalLight(0xffcb80, 2.35);
    warmKeyLight.position.set(2.5, 4.8, 6.5);
    warmKeyLight.castShadow = true;
    sliceShadowCamera(warmKeyLight);
    scene.add(warmKeyLight);

    // Cool blue nighttime window & magical rune rim light from the left
    const coolRimLight = new THREE.DirectionalLight(0x58a6ff, 1.15);
    coolRimLight.position.set(-5.5, 1.8, 4.2);
    scene.add(coolRimLight);

    // Dynamic magical blue point light attached near the book spine
    const magicLight = new THREE.PointLight(0x38bdf8, 0, 6.5);
    scene.add(magicLight);

    function sliceShadowCamera(light: THREE.DirectionalLight) {
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 20;
    }

    // ── Book Dimensions (Matches 1125x2000 cover ratio) ──
    const coverW = 2.02;
    const coverH = 3.16;
    const boardThick = 0.055;
    const pageBlockThick = 0.30;
    const pageW = coverW - 0.08;
    const pageH = coverH - 0.10;

    // Root 3D group for the entire physical book
    const bookRoot = new THREE.Group();
    scene.add(bookRoot);

    // Compute exact 3D world coordinates corresponding to the shelf slot (`left: 59.0%, top: 20.6%, width: 9.7%, height: 20.6%`)
    function getShelfPose() {
      const vH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const vW = vH * camera.aspect;
      // Center of the Why Henry book on the shelf in normalized [0..1] screen coords:
      // cx = 0.590 + 0.097/2 = 0.6385, cy = 0.206 + 0.206/2 = 0.309
      const normX = 0.6385 - 0.5;
      const normY = 0.5 - 0.309;
      const shelfScale = (0.206 * vH) / coverH;
      // Because the front cover hinges at x = 0 and extends to +coverW, offset by -coverW/2 * shelfScale
      const x = normX * vW - (coverW * 0.5) * shelfScale;
      const y = normY * vH;
      return {
        x,
        y,
        z: 0,
        scale: shelfScale,
        rotX: 0.03,
        rotY: -0.14,
        rotZ: -0.008,
      };
    }

    function getOpenCenterPose() {
      const vH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const vW = vH * camera.aspect;
      // When open, total spread width is 2 * coverW (~4.04 units)
      const maxSpreadScaleW = (vW * 0.78) / (coverW * 2.15);
      const maxSpreadScaleH = (vH * 0.74) / coverH;
      const openScale = Math.min(1.12, maxSpreadScaleW, maxSpreadScaleH);
      return {
        x: 0,
        y: 0.06,
        z: 1.6,
        scale: openScale,
      };
    }

    // ── Textures & Materials ──
    const texLoader = new THREE.TextureLoader();
    const frontCoverTex = texLoader.load("/media/why-henry/cover.webp");
    frontCoverTex.colorSpace = THREE.SRGBColorSpace;
    frontCoverTex.anisotropy = 8;

    // High-res dynamic 2D canvases for the physical Left and Right open book pages
    const leftCanvas = document.createElement("canvas");
    leftCanvas.width = 1024;
    leftCanvas.height = 1400;
    const leftPageTex = new THREE.CanvasTexture(leftCanvas);
    leftPageTex.colorSpace = THREE.SRGBColorSpace;
    leftPageTex.anisotropy = 8;

    const rightCanvas = document.createElement("canvas");
    rightCanvas.width = 1024;
    rightCanvas.height = 1400;
    const rightPageTex = new THREE.CanvasTexture(rightCanvas);
    rightPageTex.colorSpace = THREE.SRGBColorSpace;
    rightPageTex.anisotropy = 8;

    // Preload the 4 Briar Glen illustration images for the left page
    const loadedIlls: (HTMLImageElement | null)[] = [null, null, null, null];
    illustrations.forEach((item, idx) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loadedIlls[idx] = img;
        if (animStateRef.current.plateIdx === idx) {
          renderLeftPageCanvas(
            leftCanvas,
            img,
            illustrations[idx].title,
            illustrations[idx].caption,
            idx,
          );
          leftPageTex.needsUpdate = true;
        }
      };
      img.src = item.src;
    });

    const redrawLeftPage = (idx: number) => {
      renderLeftPageCanvas(
        leftCanvas,
        loadedIlls[idx],
        illustrations[idx].title,
        illustrations[idx].caption,
        idx,
      );
      leftPageTex.needsUpdate = true;
    };
    updateLeftPageTexRef.current = redrawLeftPage;

    redrawLeftPage(0);
    renderRightPageCanvas(rightCanvas, null);
    rightPageTex.needsUpdate = true;

    // Neutral dark leather material for spine and back hardcover board
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x1e130b,
      roughness: 0.62,
      metalness: 0.12,
    });

    // Gilded paper page-block edge material with subtle horizontal striation
    const pageEdgeCanvas = document.createElement("canvas");
    pageEdgeCanvas.width = 128;
    pageEdgeCanvas.height = 512;
    const peCtx = pageEdgeCanvas.getContext("2d")!;
    for (let y = 0; y < 512; y++) {
      const v = 195 + Math.sin(y * 1.4) * 18 + ((y % 4 === 0) ? -14 : 0);
      peCtx.fillStyle = `rgb(${v + 16}, ${v}, ${v - 28})`;
      peCtx.fillRect(0, y, 128, 1);
    }
    const pageEdgeTex = new THREE.CanvasTexture(pageEdgeCanvas);
    const pageBlockEdgeMat = new THREE.MeshStandardMaterial({
      map: pageEdgeTex,
      roughness: 0.78,
      metalness: 0.08,
    });

    const frontCoverFaceMat = new THREE.MeshStandardMaterial({
      map: frontCoverTex,
      roughness: 0.36,
      metalness: 0.08,
    });

    const leftInsidePageMat = new THREE.MeshStandardMaterial({
      map: leftPageTex,
      roughness: 0.82,
      metalness: 0.02,
    });

    const rightInsidePageMat = new THREE.MeshStandardMaterial({
      map: rightPageTex,
      roughness: 0.82,
      metalness: 0.02,
    });

    // ── 1. Back Hardcover Board & Page Stack Block (Stationary right side of open spread) ──
    const backCoverGroup = new THREE.Group();
    bookRoot.add(backCoverGroup);

    // Back hardcover board
    const backBoardGeo = new THREE.BoxGeometry(coverW, coverH, boardThick);
    backBoardGeo.translate(coverW / 2, 0, -pageBlockThick / 2 - boardThick / 2);
    const backBoardMesh = new THREE.Mesh(backBoardGeo, leatherMat);
    backBoardMesh.castShadow = true;
    backBoardMesh.receiveShadow = true;
    backCoverGroup.add(backBoardMesh);

    // Visible stack of paper pages (with gilded page edges on right, top, bottom, and right-page content on top face)
    const pageBlockGeo = new THREE.BoxGeometry(pageW, pageH, pageBlockThick);
    pageBlockGeo.translate(pageW / 2 + 0.02, 0, 0);
    const pageBlockMats = [
      pageBlockEdgeMat, // Right fore-edge of page stack
      leatherMat,       // Left binding edge
      pageBlockEdgeMat, // Top edge of page stack
      pageBlockEdgeMat, // Bottom edge of page stack
      rightInsidePageMat, // Top visible page (Page II: Title, Synopsis & Amazon button)
      leatherMat,
    ];
    const pageBlockMesh = new THREE.Mesh(pageBlockGeo, pageBlockMats);
    pageBlockMesh.castShadow = true;
    pageBlockMesh.receiveShadow = true;
    backCoverGroup.add(pageBlockMesh);

    // ── 2. Dimensional Curved Hardcover Spine ──
    const spineRadius = (pageBlockThick + boardThick * 2) / 2;
    const spineGeo = new THREE.CylinderGeometry(
      spineRadius,
      spineRadius,
      coverH,
      20,
      1,
      false,
      Math.PI,
      Math.PI,
    );
    const spineMesh = new THREE.Mesh(spineGeo, leatherMat);
    spineMesh.position.set(0, 0, 0);
    spineMesh.castShadow = true;
    bookRoot.add(spineMesh);

    // Gold raised spine bands
    const bandGeo = new THREE.CylinderGeometry(
      spineRadius * 1.04,
      spineRadius * 1.04,
      0.035,
      16,
      1,
      false,
      Math.PI,
      Math.PI,
    );
    const goldBandMat = new THREE.MeshStandardMaterial({
      color: 0xd4af63,
      roughness: 0.3,
      metalness: 0.75,
    });
    [-1.25, -0.75, 0.75, 1.25].forEach((by) => {
      const band = new THREE.Mesh(bandGeo, goldBandMat);
      band.position.set(0, by, 0);
      bookRoot.add(band);
    });

    // ── 3. Hinged Front Hardcover Board (Pivots around x = 0, z = +pageBlockThick/2) ──
    const frontCoverPivot = new THREE.Group();
    frontCoverPivot.position.set(0, 0, pageBlockThick / 2);
    bookRoot.add(frontCoverPivot);

    const frontBoardGeo = new THREE.BoxGeometry(coverW, coverH, boardThick);
    frontBoardGeo.translate(coverW / 2, 0, boardThick / 2);
    const frontBoardMats = [
      leatherMat,         // Right edge
      leatherMat,         // Left spine hinge edge
      leatherMat,         // Top edge
      leatherMat,         // Bottom edge
      frontCoverFaceMat,  // Front Cover Official Why Henry Artwork
      leftInsidePageMat,  // Inside Front Cover / Left Page (Plate I..IV + Caption)
    ];
    const frontBoardMesh = new THREE.Mesh(frontBoardGeo, frontBoardMats);
    frontBoardMesh.castShadow = true;
    frontBoardMesh.receiveShadow = true;
    frontCoverPivot.add(frontBoardMesh);

    // ── 4. Flexible Bending Paper Pages (3 individual multi-segment meshes that arch & flutter as they turn) ──
    const numTurningLeaves = 3;
    const segsX = 24;
    const segsY = 12;

    type TurningLeaf = {
      mesh: THREE.Mesh;
      basePos: Float32Array;
      geo: THREE.PlaneGeometry;
    };
    const turningLeaves: TurningLeaf[] = [];

    for (let i = 0; i < numTurningLeaves; i++) {
      const leafCanvas = document.createElement("canvas");
      leafCanvas.width = 512;
      leafCanvas.height = 700;
      renderTurningLeafCanvas(leafCanvas, ["I", "II", "III"][i]);
      const leafTex = new THREE.CanvasTexture(leafCanvas);
      leafTex.colorSpace = THREE.SRGBColorSpace;

      const leafGeo = new THREE.PlaneGeometry(pageW, pageH, segsX, segsY);
      // Shift vertices so left spine edge is at x = 0
      leafGeo.translate(pageW / 2, 0, 0);

      const leafMat = new THREE.MeshStandardMaterial({
        map: leafTex,
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.02,
      });

      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(0.01, 0, pageBlockThick / 2 - 0.01 - i * 0.006);
      leafMesh.castShadow = true;
      leafMesh.receiveShadow = true;
      bookRoot.add(leafMesh);

      const posAttr = leafGeo.attributes.position;
      const basePos = new Float32Array(posAttr.array.length);
      basePos.set(posAttr.array);

      turningLeaves.push({ mesh: leafMesh, basePos, geo: leafGeo });
    }

    // Deform a turning page leaf at progress `p` in [0..1] (0 = flat on right stack, 1 = turned onto left cover)
    function updateLeafGeometry(leaf: TurningLeaf, p: number, leafIndex: number) {
      const pos = leaf.geo.attributes.position;
      const arr = pos.array as Float32Array;
      const base = leaf.basePos;

      // Angle sweeps from 0 rad (resting on right page block) to Math.PI - 0.03 rad (resting on left open cover)
      const angle = easeInOutCubic(p) * (Math.PI - 0.035);
      // Natural paper arch / curl peaks mid-turn (sin(p * PI))
      const curlIntensity = Math.sin(p * Math.PI) * (0.48 + leafIndex * 0.08);
      const cornerLift = Math.sin(p * Math.PI) * 0.14;

      for (let k = 0; k < arr.length; k += 3) {
        const bx = base[k];     // [0 .. pageW]
        const by = base[k + 1]; // [-pageH/2 .. +pageH/2]
        const u = bx / pageW;   // normalized distance from spine [0..1]
        const v = (by + pageH / 2) / pageH;

        // Lag angle slightly toward the outer edge so the page bends like real paper instead of a stiff board
        const localAngle = Math.max(0, angle - Math.sin(u * Math.PI * 0.65) * curlIntensity);
        const rx = bx * Math.cos(localAngle);
        const rz = bx * Math.sin(localAngle) + Math.sin(u * Math.PI) * curlIntensity * 0.28;
        const ry = by + Math.sin(u * Math.PI) * (1 - v) * cornerLift;

        arr[k] = rx;
        arr[k + 1] = ry;
        arr[k + 2] = rz;
      }
      pos.needsUpdate = true;
      leaf.geo.computeVertexNormals();
    }

    // ── 5. Silhouette-Matched Magical Blue Aura & Spine Particles (No rectangular box!) ──
    const auraCanvas = document.createElement("canvas");
    auraCanvas.width = 256;
    auraCanvas.height = 384;
    const aCtx = auraCanvas.getContext("2d")!;
    // Draw a soft rounded-book silhouette glow with feathered edges
    aCtx.clearRect(0, 0, 256, 384);
    aCtx.shadowColor = "rgba(56, 189, 248, 0.95)";
    aCtx.shadowBlur = 28;
    aCtx.fillStyle = "rgba(56, 189, 248, 0.48)";
    aCtx.beginPath();
    aCtx.roundRect(38, 34, 180, 316, 10);
    aCtx.fill();
    aCtx.shadowBlur = 16;
    aCtx.strokeStyle = "rgba(186, 230, 253, 0.9)";
    aCtx.lineWidth = 4;
    aCtx.strokeRect(40, 36, 176, 312);

    const auraTex = new THREE.CanvasTexture(auraCanvas);
    const auraGeo = new THREE.PlaneGeometry(coverW * 1.38, coverH * 1.28);
    auraGeo.translate(coverW / 2, 0, -pageBlockThick / 2 - 0.08);
    const auraMat = new THREE.MeshBasicMaterial({
      map: auraTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    bookRoot.add(auraMesh);

    // Magical Blue Spine Particles (Phase 2 Awakening & Phase 4 Levitation)
    const particleCount = 54;
    const pPositions = new Float32Array(particleCount * 3);
    const pPhases = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 0.45;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * coverH;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
      pPhases[i] = Math.random() * Math.PI * 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));

    // Soft circular spark texture
    const sparkCanvas = document.createElement("canvas");
    sparkCanvas.width = 32;
    sparkCanvas.height = 32;
    const sCtx = sparkCanvas.getContext("2d")!;
    const sGrad = sCtx.createRadialGradient(16, 16, 1, 16, 16, 15);
    sGrad.addColorStop(0, "rgba(224, 242, 254, 1)");
    sGrad.addColorStop(0.4, "rgba(56, 189, 248, 0.85)");
    sGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 32, 32);
    const sparkTex = new THREE.CanvasTexture(sparkCanvas);

    const particleMat = new THREE.PointsMaterial({
      map: sparkTex,
      size: 0.14,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    bookRoot.add(particleSystem);

    // ── 6. Dynamic Soft Shadow Plane Behind/Beneath Floating Book ──
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shCtx = shadowCanvas.getContext("2d")!;
    const shGrad = shCtx.createRadialGradient(128, 128, 16, 128, 128, 120);
    shGrad.addColorStop(0, "rgba(0, 0, 0, 0.82)");
    shGrad.addColorStop(0.55, "rgba(0, 0, 0, 0.38)");
    shGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    shCtx.fillStyle = shGrad;
    shCtx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 4.2),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    scene.add(shadowPlane);

    // ── Animation Loop ──
    let rafId = 0;
    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      const st = animStateRef.current;
      const shelf = getShelfPose();
      const center = getOpenCenterPose();

      // Smoothly interpolate hover glow intensity
      const targetHover = st.mode === "hover" ? 1 : st.mode === "Forward" ? 1.25 : 0;
      st.hoverIntensity += (targetHover - st.hoverIntensity) * 0.12;

      let posX = shelf.x;
      let posY = shelf.y;
      let posZ = shelf.z;
      let scale = shelf.scale;
      let rotX = shelf.rotX;
      let rotY = shelf.rotY;
      let rotZ = shelf.rotZ;
      let coverOpenRatio = 0;
      let leafRatios = [0, 0, 0];
      let particleAlpha = 0;
      let shadowAlpha = 0;

      if (st.mode === "idle" || st.mode === "hover") {
        // Phase 1: Discovery — Soft blue silhouette glow traces the book on the shelf
        const breathe = Math.sin(now * 0.0035) * 0.08;
        auraMat.opacity = Math.max(0, st.hoverIntensity * (0.78 + breathe));
        magicLight.intensity = st.hoverIntensity * 1.4;
        particleAlpha = st.hoverIntensity * 0.35;
      } else if (st.mode === "Forward") {
        const elapsed = reducedMotion ? 3200 : now - st.startTime;

        // Phase 2: The Awakening (0 .. 450ms) — Subtle tremble + spine particles
        const pAwake = smoothstep(0, 450, elapsed);
        // Phase 3: Extraction (450 .. 1150ms) — Slides forward off the shelf
        const pExtract = smoothstep(450, 1150, elapsed);
        // Phase 4: Levitation (950 .. 2250ms) — Floats gracefully to center screen with natural arc & rotation
        const pLevit = smoothstep(950, 2250, elapsed);
        // Phase 5: Opening (2050 .. 3150ms) — Front cover swings open & flexible pages bend and turn
        const pOpen = smoothstep(2050, 3100, elapsed);

        // Trigger synchronized sound effects at exact phase milestones
        if (elapsed >= 450 && !st.soundsPlayed.has("whoosh")) {
          st.soundsPlayed.add("whoosh");
          playSound("whoosh", 0.65);
          setPhase("extracting");
        }
        if (elapsed >= 1050 && !st.soundsPlayed.has("levit-phase")) {
          st.soundsPlayed.add("levit-phase");
          setPhase("levitating");
        }
        if (elapsed >= 2050 && !st.soundsPlayed.has("creak")) {
          st.soundsPlayed.add("creak");
          playSound("creak", 0.65);
          setPhase("opening");
        }
        if (elapsed >= 2250 && !st.soundsPlayed.has("rustle")) {
          st.soundsPlayed.add("rustle");
          playSound("rustle", 0.7);
        }

        // Tremble during Awakening
        const trembleAmt = pAwake * (1 - pExtract) * 0.018;
        const trembleX = Math.sin(now * 0.055) * trembleAmt;
        const trembleZ = Math.cos(now * 0.048) * trembleAmt * 0.6;

        // Extraction forward pull + Levitation arc to center
        const pullForwardZ = pExtract * (1 - pLevit) * 0.85;
        const arcLiftY = Math.sin(pLevit * Math.PI) * 0.32;

        posX = THREE.MathUtils.lerp(shelf.x, center.x, pLevit) + trembleX;
        posY = THREE.MathUtils.lerp(shelf.y, center.y, pLevit) + arcLiftY;
        posZ = THREE.MathUtils.lerp(shelf.z, center.z, pLevit) + pullForwardZ;
        scale = THREE.MathUtils.lerp(shelf.scale, center.scale, pLevit);

        // Believable inertia tilt while floating through the room
        const floatTiltX = Math.sin(pLevit * Math.PI) * 0.16;
        const floatTiltY = Math.sin(pLevit * Math.PI) * 0.28;
        const floatTiltZ = Math.sin(pLevit * Math.PI) * -0.06;

        rotX = THREE.MathUtils.lerp(shelf.rotX, 0.04, pLevit) + floatTiltX;
        rotY = THREE.MathUtils.lerp(shelf.rotY, 0.0, pLevit) + floatTiltY;
        rotZ = THREE.MathUtils.lerp(shelf.rotZ, 0.0, pLevit) + floatTiltZ + trembleZ;

        coverOpenRatio = pOpen;
        leafRatios = [
          smoothstep(2180, 2820, elapsed),
          smoothstep(2320, 2960, elapsed),
          smoothstep(2460, 3100, elapsed),
        ];

        auraMat.opacity = (1 - pOpen * 0.55) * 0.85;
        magicLight.intensity = (1 - pOpen * 0.4) * 2.2;
        particleAlpha = Math.sin(Math.min(1, elapsed / 2800) * Math.PI) * 0.9;
        shadowAlpha = pLevit * 0.82;

        if (elapsed >= 3150) {
          st.mode = "open";
          setPhase("open");
          window.setTimeout(() => {
            returnBtnRef.current?.focus({ preventScroll: true });
          }, 50);
        }
      } else if (st.mode === "open") {
        // Phase 6: Inside the Book — Suspended in midair with gentle levitation bob
        const hoverBobY = reducedMotion ? 0 : Math.sin(now * 0.0022) * 0.045;
        const hoverSwayX = reducedMotion ? 0 : Math.cos(now * 0.0016) * 0.012;
        const hoverSwayY = reducedMotion ? 0 : Math.sin(now * 0.0018) * 0.015;

        posX = center.x;
        posY = center.y + hoverBobY;
        posZ = center.z;
        scale = center.scale;
        rotX = 0.04 + hoverSwayX;
        rotY = hoverSwayY;
        rotZ = 0;
        coverOpenRatio = 1;
        leafRatios = [1, 1, 1];
        auraMat.opacity = 0.35 + Math.sin(now * 0.003) * 0.06;
        magicLight.intensity = 1.1;
        particleAlpha = 0.32;
        shadowAlpha = 0.82;
      } else if (st.mode === "Reverse") {
        // Phase 7: Returning — Pages turn back, hardcover shuts, book rotates & floats back into shelf
        const elapsed = reducedMotion ? 2200 : now - st.startTime;

        const pCloseCover = 1 - smoothstep(0, 820, elapsed);
        const l0 = 1 - smoothstep(0, 620, elapsed);
        const l1 = 1 - smoothstep(100, 720, elapsed);
        const l2 = 1 - smoothstep(200, 820, elapsed);

        const pReturnFlight = smoothstep(700, 1950, elapsed);

        if (elapsed >= 740 && !st.soundsPlayed.has("thump")) {
          st.soundsPlayed.add("thump");
          playSound("thump", 0.65);
          playSound("whoosh", 0.55);
        }
        if (elapsed >= 1820 && !st.soundsPlayed.has("settle")) {
          st.soundsPlayed.add("settle");
          playSound("settle", 0.65);
        }

        const arcLiftY = Math.sin(pReturnFlight * Math.PI) * 0.22;
        posX = THREE.MathUtils.lerp(center.x, shelf.x, pReturnFlight);
        posY = THREE.MathUtils.lerp(center.y, shelf.y, pReturnFlight) + arcLiftY;
        posZ = THREE.MathUtils.lerp(center.z, shelf.z, pReturnFlight);
        scale = THREE.MathUtils.lerp(center.scale, shelf.scale, pReturnFlight);

        rotX = THREE.MathUtils.lerp(0.04, shelf.rotX, pReturnFlight);
        rotY = THREE.MathUtils.lerp(0, shelf.rotY, pReturnFlight);
        rotZ = THREE.MathUtils.lerp(0, shelf.rotZ, pReturnFlight);

        coverOpenRatio = pCloseCover;
        leafRatios = [l2, l1, l0];
        auraMat.opacity = (1 - pReturnFlight) * 0.65;
        magicLight.intensity = (1 - pReturnFlight) * 1.4;
        particleAlpha = (1 - pReturnFlight) * 0.55;
        shadowAlpha = (1 - pReturnFlight) * 0.82;

        if (elapsed >= 2000) {
          st.mode = "idle";
          setPhase("idle");
        }
      }

      // Apply transforms to the 3D book root
      bookRoot.position.set(posX, posY, posZ);
      bookRoot.scale.setScalar(scale);
      bookRoot.rotation.set(rotX, rotY, rotZ);

      // Swing the hinged front hardcover board open around the spine (0 -> -176 deg)
      frontCoverPivot.rotation.y = -easeInOutCubic(coverOpenRatio) * (Math.PI - 0.06);

      // Slight binding give on the back board as the book opens
      backCoverGroup.rotation.y = easeInOutCubic(coverOpenRatio) * 0.03;

      // Update the 3 flexible bending paper pages
      for (let i = 0; i < numTurningLeaves; i++) {
        const r = leafRatios[i];
        const leaf = turningLeaves[i];
        // Once all 3 pages have turned onto the left cover, hide the intermediate turning leaves so the crisp high-res Left Page frontispiece is 100% unobstructed
        leaf.mesh.visible = coverOpenRatio > 0.02 && r < 0.995;
        if (leaf.mesh.visible) {
          updateLeafGeometry(leaf, r, i);
        }
      }

      // Update spine particle drift
      particleMat.opacity = particleAlpha;
      if (particleAlpha > 0.01) {
        const posAttr = particleGeo.attributes.position;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += 0.008;
          if (arr[i * 3 + 1] > coverH / 2) arr[i * 3 + 1] = -coverH / 2;
          arr[i * 3] = Math.sin(now * 0.003 + pPhases[i]) * 0.25;
        }
        posAttr.needsUpdate = true;
      }

      magicLight.position.set(posX, posY, posZ + 1.2);
      shadowPlane.position.set(posX, posY - 0.25, posZ - 0.8);
      shadowPlane.scale.setScalar(scale * 1.15);
      (shadowPlane.material as THREE.MeshBasicMaterial).opacity = shadowAlpha;

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [playSound, reducedMotion]);

  const isBookOpen = phase === "open";
  const isBookActive =
    phase === "awakening" ||
    phase === "extracting" ||
    phase === "levitating" ||
    phase === "opening" ||
    phase === "open" ||
    phase === "returning";

  return (
    <section
      data-testid="magical-book-lab"
      data-book-phase={phase}
      aria-label="IHBNF Magical Floating Book Demonstration — Book One: Why Henry?"
      className="relative isolate flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#040302] select-none"
    >
      {/* Ambient radial studio edge backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_85%_75%_at_50%_50%,rgba(54,30,14,0.42)_0%,rgba(12,7,4,0.96)_65%,#040201_100%)]"
      />

      {/* =====================================================================
          16:9 STUDY ENVIRONMENT + SYNCHRONIZED THREE.JS 3D HARDCOVER CANVAS
         ===================================================================== */}
      <div
        ref={scrollWrapperRef}
        className="relative flex h-full w-full items-center justify-start overflow-x-auto overflow-y-hidden lg:justify-center"
      >
        <div
          ref={stageContainerRef}
          data-testid="lab-study-stage"
          className="relative mx-auto aspect-[16/9] h-full min-h-[500px] w-auto min-w-[888px] max-w-none shrink-0 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.95)] lg:h-auto lg:max-h-[100svh] lg:w-full lg:max-w-[177.78svh]"
        >
          {/* ── 1. CLEAN BACKGROUND ROOM PLATE (Empty Walnut Recess behind Why Henry) ── */}
          <Image
            src="/media/study/study-approved-v2-why-henry-empty.webp"
            alt="Javier Huertas's cinematic study with rain window, green banker's lamp, walnut desk, and bookshelf"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="pointer-events-none object-cover"
          />

          {/* ── 2. RESTRAINED AMBIENT ROOM MOTION (Rain, Lamp Glow, Coffee Steam, Rune Pulse) ── */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {/* Rain streaks on left window */}
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

            {/* Subtle warm tungsten breathing glow from the green glass banker's lamp */}
            <div className="anim-lamp absolute left-[9%] top-[33%] h-[42%] w-[28%] rounded-full bg-[radial-gradient(ellipse_at_48%_32%,rgba(255,212,128,0.24)_0%,rgba(196,138,52,0.09)_48%,transparent_75%)] blur-xl" />

            {/* Gentle steam wisps rising from the coffee cup */}
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

            {/* Subtle cyan magical pulse on the carved Briar Glen rune stone */}
            <div className="anim-rune absolute left-[54.2%] top-[32.5%] h-[9.5%] w-[4.2%] rounded-full bg-[#38bdf8]/40" />
          </div>

          {/* ── 3. SOFT DEPTH-OF-FIELD VIGNETTE WHEN BOOK IS LEVITATING IN FRONT OF ROOM ── */}
          <div
            aria-hidden="true"
            onClick={isBookOpen ? triggerMagicalReturn : undefined}
            className={`absolute inset-0 z-15 bg-[#040302]/45 backdrop-blur-[2px] transition-opacity duration-700 ${
              isBookActive && phase !== "awakening"
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          />

          {/* ── 4. THREE.JS REAL 3D HARDCOVER BOOK & BENDING PAGES CANVAS ── */}
          <div
            ref={canvasMountRef}
            data-testid="three-book-canvas-container"
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          />

          {/* ── 5. INVISIBLE SILHOUETTE-ALIGNED SHELF TRIGGER FOR "WHY HENRY?"
                 (No rectangular hover box! Hovering triggers the 3D silhouette blue glow) ── */}
          {!isBookActive && (
            <button
              ref={shelfHotspotRef}
              type="button"
              data-testid="why-henry-shelf-trigger"
              onClick={triggerMagicalExtraction}
              onMouseEnter={() => {
                if (animStateRef.current.mode === "idle") {
                  animStateRef.current.mode = "hover";
                  setPhase("hover");
                }
              }}
              onMouseLeave={() => {
                if (animStateRef.current.mode === "hover") {
                  animStateRef.current.mode = "idle";
                  setPhase("idle");
                }
              }}
              onFocus={() => {
                if (animStateRef.current.mode === "idle") {
                  animStateRef.current.mode = "hover";
                  setPhase("hover");
                }
              }}
              onBlur={() => {
                if (animStateRef.current.mode === "hover") {
                  animStateRef.current.mode = "idle";
                  setPhase("idle");
                }
              }}
              aria-label="The Unwritten Journey — Book One: Why Henry? — Awaken and levitate book from the shelf"
              style={{
                left: "58.2%",
                top: "19.8%",
                width: "11.2%",
                height: "22.2%",
              }}
              className="absolute z-30 cursor-pointer bg-transparent p-0 outline-none focus-visible:outline-none"
            >
              <span className="sr-only">
                Pull The Unwritten Journey — Book One: Why Henry? from the bookshelf
              </span>
            </button>
          )}

          {/* ── 6. ACCESSIBLE SEMANTIC OVERLAY ALIGNED DIRECTLY OVER THE OPEN 3D BOOK PAGES
                 Provides keyboard focus, screen-reader accessibility, plate switching,
                 working Amazon purchase link, and Return-to-Shelf action directly on the open pages ── */}
          {isBookOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="open-3d-book-heading"
              data-testid="open-3d-book-page-controls"
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              <div className="relative aspect-[1.28/1] h-[68%] max-h-[560px] w-auto max-w-[88vw] grid grid-cols-2">
                {/* Left Physical Page Interactive Hotspots (Plate 01..04 selectors) */}
                <div className="relative flex flex-col justify-end p-[6%]">
                  <div className="sr-only">
                    <p>{illustrations[plateIdx].title}</p>
                    <p>{illustrations[plateIdx].caption}</p>
                  </div>
                  <div
                    role="group"
                    aria-label="Briar Glen Illustration Plates"
                    className="pointer-events-auto mb-[16%] flex flex-wrap gap-1.5"
                  >
                    {illustrations.map((ill, idx) => (
                      <button
                        key={ill.src}
                        type="button"
                        data-testid={`book-plate-btn-${idx + 1}`}
                        onClick={() => handleSelectPlate(idx)}
                        aria-pressed={plateIdx === idx}
                        className="h-7 w-[22%] cursor-pointer rounded-full bg-transparent text-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#c9a45c]"
                        title={ill.title}
                      >
                        Plate 0{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Physical Page Interactive Hotspots (Return to Shelf + Buy on Amazon) */}
                <div className="relative flex flex-col justify-between p-[6%]">
                  {/* Top-Right Return to Shelf Hotspot aligned to the drawn button on Page II */}
                  <div className="flex justify-end">
                    <button
                      ref={returnBtnRef}
                      type="button"
                      data-testid="why-henry-return-shelf-btn"
                      onClick={triggerMagicalReturn}
                      className="pointer-events-auto h-9 w-[44%] cursor-pointer rounded-full bg-transparent text-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#c9a45c]"
                      title="Return book to shelf"
                    >
                      Return to Shelf
                    </button>
                  </div>

                  {/* Screen-reader accessible text matching the physical right page */}
                  <div className="sr-only">
                    <h2 id="open-3d-book-heading">
                      {whyHenry.fullTitle}
                    </h2>
                    {whyHenry.description.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {/* Bottom-Left Buy on Amazon Link aligned to the gold button drawn on Page II */}
                  <div className="mb-[5%] flex items-center">
                    <a
                      href={links.amazonWhyHenry}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="why-henry-modal-amazon-link"
                      className="pointer-events-auto flex h-12 w-[58%] cursor-pointer items-center justify-center rounded-full bg-transparent text-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#241509]"
                      title="Buy The Unwritten Journey — Book One: Why Henry? on Amazon"
                    >
                      Buy on Amazon
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 7. TOP-RIGHT AUDIO MUTE / UNMUTE & LAB STATUS HUD ── */}
          <div className="absolute right-4 top-4 z-40 flex items-center gap-2.5">
            <span
              data-testid="lab-phase-badge"
              className="rounded-full border border-[#38bdf8]/35 bg-[#07111e]/85 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#bae6fd] shadow-lg backdrop-blur-md"
            >
              Phase: {phase.toUpperCase()}
            </span>

            <button
              type="button"
              data-testid="audio-mute-toggle"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              aria-label={muted ? "Unmute magical book sound effects" : "Mute magical book sound effects"}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/40 bg-[#120b06]/90 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone shadow-lg backdrop-blur-md transition-colors hover:border-gold"
            >
              <span>{muted ? "🔇 Audio Muted" : "🔊 Audio Ready"}</span>
            </button>

            <Link
              href="/"
              className="rounded-full border border-bone/20 bg-[#120b06]/85 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mute backdrop-blur-md transition-colors hover:text-bone"
            >
              ← Main Study
            </Link>
          </div>

          {/* ── 8. BOTTOM CAPTION BAR ── */}
          <div
            aria-live="polite"
            className="pointer-events-none absolute inset-x-0 bottom-[2.2%] z-30 flex justify-center px-4"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#38bdf8]/35 bg-[#080d14]/90 px-4 py-1.5 text-xs text-bone/95 shadow-[0_10px_28px_rgba(0,0,0,0.9)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
              {phase === "idle" && (
                <span>
                  Hover over <strong className="font-medium text-[#7dd3fc]">Why Henry?</strong> on the bookshelf to awaken the magical aura, then click to levitate and open the 3D hardcover
                </span>
              )}
              {phase === "hover" && (
                <span>
                  <strong className="font-medium text-[#7dd3fc]">Phase 1 · Discovery:</strong> Soft blue magical aura tracing the hardcover silhouette — click to awaken &amp; levitate
                </span>
              )}
              {phase === "awakening" && (
                <span>
                  <strong className="font-medium text-[#7dd3fc]">Phase 2 · The Awakening:</strong> The spine trembles with blue rune sparks as the enchantment takes hold…
                </span>
              )}
              {phase === "extracting" && (
                <span>
                  <strong className="font-medium text-[#7dd3fc]">Phase 3 · Extraction:</strong> Sliding forward off the walnut shelf…
                </span>
              )}
              {phase === "levitating" && (
                <span>
                  <strong className="font-medium text-[#7dd3fc]">Phase 4 · Levitation:</strong> Floating gracefully through the study toward you…
                </span>
              )}
              {phase === "opening" && (
                <span>
                  <strong className="font-medium text-[#7dd3fc]">Phase 5 · Opening:</strong> Hardcover swings open around the curved spine as pages bend and turn…
                </span>
              )}
              {phase === "open" && (
                <span>
                  <strong className="font-medium text-gold">{whyHenry.fullTitle}</strong> · Click <strong className="text-gold">Plate 01–04</strong>, <strong className="text-gold">Buy on Amazon</strong>, or <strong className="text-gold">← Return to Shelf</strong> (or press Escape)
                </span>
              )}
              {phase === "returning" && (
                <span>
                  <strong className="font-medium text-[#7dd3fc]">Phase 7 · Returning:</strong> Pages fold back, hardcover shuts, and the book floats home to its shelf…
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
