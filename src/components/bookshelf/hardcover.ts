import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export type HardcoverDesign = {
  title: string;
  author: string;
  series?: string;
  tone: string;
  edge: string;
  foil: string;
  width: number;
  depth?: number;
  thickness: number;
  boardThickness?: number;
};

const defaultBoardThickness = .049;

function random(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function surface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  return { canvas, ctx };
}

function texture(canvas: HTMLCanvasElement) {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}

function grain(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number, strength: number) {
  const rand = random(seed);
  const image = ctx.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const weave = Math.sin(x * 2.31) * Math.sin(y * 2.1) * .24;
      const amount = (rand() - .5 + weave) * strength;
      for (let channel = 0; channel < 3; channel++) image.data[index + channel] += amount;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function makeBinding(book: HardcoverDesign, spine: boolean) {
  const width = spine ? 1400 : 512;
  const height = spine ? 186 : 512;
  const { canvas, ctx } = surface(width, height);
  const ground = ctx.createLinearGradient(0, 0, 0, height);
  ground.addColorStop(0, book.edge);
  ground.addColorStop(.26, book.tone);
  ground.addColorStop(.77, book.tone);
  ground.addColorStop(1, book.edge);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, width, height);
  grain(ctx, width, height, spine ? 21 : 13, 22);

  if (spine) {
    for (const end of [1, -1]) {
      const x = end === 1 ? 103 : width - 103;
      ctx.save();
      ctx.translate(x, height / 2);
      ctx.scale(end, 1);
      ctx.strokeStyle = book.foil + "bb";
      ctx.fillStyle = book.foil;
      ctx.lineWidth = 2;
      for (const offset of [0, 9, 17]) {
        ctx.beginPath();
        ctx.moveTo(offset, -72);
        ctx.quadraticCurveTo(offset - 4, 0, offset, 72);
        ctx.stroke();
      }
      ctx.translate(55, 0);
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.quadraticCurveTo(5, -5, 19, 0);
      ctx.quadraticCurveTo(5, 5, 0, 22);
      ctx.quadraticCurveTo(-5, 5, -19, 0);
      ctx.quadraticCurveTo(-5, -5, 0, -22);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = book.foil;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#170c08";
    ctx.shadowOffsetY = 1;
    ctx.font = "92px Georgia";
    ctx.fillText(book.title, width / 2, book.series ? 102 : 98, width - 385);
    ctx.font = "22px Georgia";
    if (book.series) ctx.fillText(book.series, width / 2, 42, width - 330);
    ctx.font = "18px Georgia";
    ctx.fillText(book.author, width / 2, book.series ? 154 : 151, width - 300);
  }
  return texture(canvas);
}

function makePaper(seed: number) {
  const width = 800;
  const height = 256;
  const { canvas, ctx } = surface(width, height);
  const rand = random(seed);
  ctx.fillStyle = "#dcc098";
  ctx.fillRect(0, 0, width, height);
  for (let y = 2; y < height - 2; y += 1 + rand() * 2.3) {
    ctx.strokeStyle = rand() > .23 ? `rgba(73,48,25,${.09 + rand() * .19})` : "#f3e7cb";
    ctx.lineWidth = .45 + rand() * .65;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(width * .3, y + rand() * 1.2, width * .7, y - rand() * 1.2, width, y);
    ctx.stroke();
  }
  const age = ctx.createLinearGradient(0, 0, width, 0);
  age.addColorStop(0, "#8e654145");
  age.addColorStop(.12, "#8e654100");
  age.addColorStop(.87, "#8e654100");
  age.addColorStop(1, "#68452960");
  ctx.fillStyle = age;
  ctx.fillRect(0, 0, width, height);
  grain(ctx, width, height, seed, 12);
  return texture(canvas);
}

export function makeRelief() {
  const { canvas, ctx } = surface(192, 192);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 192, 192);
  grain(ctx, 192, 192, 62, 75);
  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3, 2);
  map.anisotropy = 8;
  return map;
}

export async function loadCover(url: string, fit?: { ratio: number; tone: string }) {
  let map: THREE.Texture = await new THREE.TextureLoader().loadAsync(url);
  const image = map.image as HTMLImageElement;
  if (fit && Math.abs(image.width / image.height - fit.ratio) > .002) {
    const height = 960;
    const width = Math.round(height * fit.ratio);
    const { canvas, ctx } = surface(width, height);
    const scale = Math.min(width / image.width, height / image.height);
    const artWidth = image.width * scale;
    const artHeight = image.height * scale;
    ctx.fillStyle = fit.tone;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, (width - artWidth) / 2, (height - artHeight) / 2, artWidth, artHeight);
    map.dispose();
    map = texture(canvas);
  }
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  // The left edge of the intact portrait artwork meets the front-facing spine.
  map.center.set(.5, .5);
  map.rotation = Math.PI / 2;
  return map;
}

export function makeBook(book: HardcoverDesign, cover: THREE.Texture, relief: THREE.Texture) {
  const group = new THREE.Group();
  const { width, thickness } = book;
  const depth = book.depth ?? width * 2 / 3;
  const boardThickness = book.boardThickness ?? defaultBoardThickness;
  function material(map: THREE.Texture, roughness: number, bumpScale: number) {
    return new THREE.MeshStandardMaterial({ map, roughness, bumpMap: relief, bumpScale });
  }
  const cloth = material(makeBinding(book, false), .88, .008);
  const art = material(cover, .68, .004);
  if (!book.series) art.color.set("#dfcebd");
  const spine = material(makeBinding(book, true), .76, .006);
  const edges = material(makePaper(book.series ? 32 : 17), .98, .003);
  const endpaper = new THREE.MeshStandardMaterial({ color: "#d7c8aa", roughness: .98 });
  // RoundedBox uses the +X, -X, +Y, -Y, +Z, -Z material order.
  const frontMaterials = [cloth, cloth, art, cloth, cloth, cloth];
  const pageMaterials = [edges, edges, endpaper, endpaper, edges, edges];
  const coverFront = new THREE.Mesh(new RoundedBoxGeometry(width, boardThickness, depth, 3, .018), frontMaterials);
  const coverBack = new THREE.Mesh(new RoundedBoxGeometry(width, boardThickness, depth, 3, .018), cloth);
  const block = new THREE.Mesh(new RoundedBoxGeometry(width - .104, thickness - 2 * boardThickness + .004, depth - .091, 3, .017), pageMaterials);
  const binding = new THREE.Mesh(new RoundedBoxGeometry(width - .021, thickness - .012, .115, 5, .038), [cloth, cloth, cloth, cloth, spine, cloth]);
  coverFront.position.y = thickness - boardThickness / 2;
  coverBack.position.y = boardThickness / 2;
  block.position.set(0, thickness / 2, .008);
  binding.position.set(0, thickness / 2, depth / 2 - .042);
  group.add(coverBack, block, binding, coverFront);
  return group;
}
