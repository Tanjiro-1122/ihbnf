import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const books = [
  {
    title: "The Dream of the Payoff",
    author: "JAVIER HUERTAS",
    cover: "/media/memoir/dream-payoff-cover.svg",
    tone: "#563621",
    edge: "#795538",
    foil: "#dfbe82",
    width: 3.13,
    thickness: .37,
    x: -.065,
    z: .009,
    yaw: .034,
  },
  {
    title: "Why Henry?",
    series: "THE UNWRITTEN JOURNEY  ·  BOOK ONE",
    author: "JAVIER HUERTAS",
    cover: "/media/why-henry/cover-user.jpg",
    tone: "#212d39",
    edge: "#425265",
    foil: "#e6cf9d",
    width: 2.99,
    thickness: .33,
    x: .065,
    z: -.025,
    yaw: .056,
  },
];

const boardThickness = .049;

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

function makeBinding(book: (typeof books)[number], spine: boolean) {
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
    ctx.strokeStyle = book.foil + "60";
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 18, width - 110, height - 36);
    for (const x of [122, width - 124]) {
      ctx.fillStyle = book.foil + "77";
      ctx.fillRect(x, 27, 2, height - 54);
      ctx.fillRect(x + 7, 27, 1, height - 54);
    }
    ctx.fillStyle = book.foil;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#170c08";
    ctx.shadowOffsetY = 1;
    ctx.font = "72px Georgia";
    ctx.fillText(book.title, width / 2, book.series ? 99 : 83, width - 320);
    ctx.font = "22px Georgia";
    if (book.series) ctx.fillText(book.series, width / 2, 48, width - 300);
    ctx.font = "18px Georgia";
    ctx.fillText(book.author, width / 2, book.series ? 141 : 132, width - 300);
  }
  return texture(canvas);
}

function makePaper(seed: number) {
  const width = 800;
  const height = 256;
  const { canvas, ctx } = surface(width, height);
  const rand = random(seed);
  ctx.fillStyle = "#d8c8a6";
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

function makeRelief() {
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

async function loadCover(url: string) {
  const map = await new THREE.TextureLoader().loadAsync(url);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  // The left edge of the intact portrait artwork meets the front-facing spine.
  map.center.set(.5, .5);
  map.rotation = Math.PI / 2;
  return map;
}

function makeBook(book: (typeof books)[number], cover: THREE.Texture, relief: THREE.Texture) {
  const group = new THREE.Group();
  const { width, thickness } = book;
  const depth = width * 2 / 3;
  function material(map: THREE.Texture, roughness: number, bumpScale: number) {
    return new THREE.MeshStandardMaterial({ map, roughness, bumpMap: relief, bumpScale });
  }
  const cloth = material(makeBinding(book, false), .88, .008);
  const art = material(cover, .68, .004);
  const spine = material(makeBinding(book, true), .85, .006);
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
  group.rotation.y = book.yaw;
  group.position.set(book.x, 0, book.z);
  return group;
}

function shadowMap() {
  const { canvas, ctx } = surface(320, 256);
  for (let inset = 0; inset < 39; inset++) {
    ctx.fillStyle = "rgba(17, 9, 4, .045)";
    ctx.beginPath();
    ctx.roundRect(4 + inset * 2, 4 + inset * 1.2, 312 - inset * 4, 248 - inset * 2.4, 46 - inset * .85);
    ctx.fill();
  }
  return texture(canvas);
}

function addShadow(scene: THREE.Scene, map: THREE.Texture, width: number, depth: number, opacity: number, x: number, y: number, z: number) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map, opacity, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(x, y, z);
  scene.add(plane);
}

export async function createBookshelfScene(host: HTMLElement, ready: () => void, registerCleanup: (fn: () => void) => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.28;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 50);
  camera.position.set(1.55, 3.45, 10);
  camera.lookAt(.04, .32, 0);
  camera.updateMatrixWorld();

  const textures = new Set<THREE.Texture>();
  let disposed = false;
  let observer: ResizeObserver | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    const materials = new Set<THREE.Material>();
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.geometry.dispose();
      for (const item of [node.material].flat() as THREE.MeshStandardMaterial[]) {
        materials.add(item);
        if (item.map) textures.add(item.map);
        if (item.bumpMap) textures.add(item.bumpMap);
      }
    });
    materials.forEach((item) => item.dispose());
    textures.forEach((map) => map.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
  registerCleanup(dispose);

  try {
    const covers = await Promise.all(books.map(async (book) => {
      const cover = await loadCover(book.cover);
      if (disposed) cover.dispose();
      else textures.add(cover);
      return cover;
    }));
    if (disposed) return;
    const relief = makeRelief();
    const lower = makeBook(books[0], covers[0], relief);
    const upper = makeBook(books[1], covers[1], relief);
    upper.position.y = books[0].thickness;
    scene.add(lower, upper);

    const shadow = shadowMap();
    addShadow(scene, shadow, 3.97, 2.81, .9, -.09, -.004, .03);
    addShadow(scene, shadow, 3.38, 2.27, .52, .048, books[0].thickness + .0005, .005);

    scene.add(new THREE.HemisphereLight("#ffd5a4", "#59392b", 1.22));
    const key = new THREE.DirectionalLight("#ffe0ba", 2.2);
    key.position.set(2.6, 4, 1.25);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#d3ddfb", .57);
    fill.position.set(-3, 1.7, 4);
    scene.add(fill);

    renderer.domElement.dataset.testid = "bookshelf-lab-canvas";
    host.appendChild(renderer.domElement);
    function render() {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      const halfWidth = 2.21;
      const halfHeight = halfWidth * h / w;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();

      // Register the lowest visible board corner against the existing shelf ledge.
      let low = Infinity;
      for (const x of [-books[0].width / 2, books[0].width / 2]) {
        for (const z of [-books[0].width / 3, books[0].width / 3]) {
          low = Math.min(low, lower.localToWorld(new THREE.Vector3(x, 0, z)).project(camera).y);
        }
      }
      const offset = (low + .766) * halfHeight;
      camera.top += offset;
      camera.bottom += offset;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    }

    observer = new ResizeObserver(render);
    observer.observe(host);
    render();
    ready();
  } catch (error) {
    dispose();
    throw error;
  }
}
