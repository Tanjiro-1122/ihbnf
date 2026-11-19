import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { arrangeBooks, hardcoverDesign, type CatalogBook, type ShelfLayout } from "./catalog";
import { loadCover, makeBook, makeRelief } from "./hardcover";

const poses = {
  stack: [.43, .44, 1],
  cover: [1.25, 2.4, .06],
  spines: [.025, .12, 1],
  pages: [1.14, .37, -.43],
  side: [-1, .17, .22],
} as const;

export type ShelfView = keyof typeof poses;
export type ShelfLight = "warm" | "studio";

function disposeMeshes(root: THREE.Object3D, shared: ReadonlySet<THREE.Texture>) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    geometries.add(node.geometry);
    for (const material of [node.material].flat() as THREE.MeshStandardMaterial[]) {
      materials.add(material);
      for (const map of [material.map, material.bumpMap]) {
        if (map && !shared.has(map)) textures.add(map);
      }
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((map) => map.dispose());
}

function coverKey(book: CatalogBook) {
  return JSON.stringify([book.cover, book.dimensions.width / book.dimensions.height, book.spine.tone]);
}

export async function createInspectorScene(host: HTMLElement, catalog: readonly CatalogBook[], layout: ShelfLayout, signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Preview cancelled", "AbortError");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.dataset.testid = "bookshelf-inspector-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const stack = new THREE.Group();
  scene.add(stack);
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 140);
  camera.position.set(4, 3, 9);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minPolarAngle = .08;
  controls.maxPolarAngle = Math.PI * .5 - .028;
  controls.minDistance = 2.6;
  controls.maxDistance = 80;
  controls.rotateSpeed = .65;
  controls.zoomSpeed = .85;
  controls.target.set(0, .36, 0);
  controls.update();

  const hemisphere = new THREE.HemisphereLight("#ffe4d1", "#683c28", 1.4);
  const key = new THREE.DirectionalLight("#ffd1a0", 3);
  const fill = new THREE.DirectionalLight("#d0dbfa", .76);
  const rim = new THREE.DirectionalLight("#ffbb75", 1.09);
  key.position.set(-1.8, 7, 3.5);
  fill.position.set(4.5, 2.4, 5);
  rim.position.set(2, 3.4, -3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.normalBias = .015;
  key.shadow.bias = -.00015;
  key.shadow.radius = 6;
  key.shadow.intensity = .68;
  const bounce = new THREE.DirectionalLight("#ead2b4", .8);
  bounce.position.set(3.1, 2.8, -3.8);
  scene.add(hemisphere, key, fill, rim, bounce);

  const shared = new Set<THREE.Texture>();
  const covers = new Map<string, THREE.Texture>();
  const models = new Map<string, { signature: string; group: THREE.Group }>();
  const pendingCovers = new Map<string, Promise<void>>();
  let revision = 0;
  let disposed = false;
  let ready = false;
  let observer: ResizeObserver | undefined;
  let platform: THREE.Mesh | null = null;
  let platformMap: THREE.Texture | undefined;
  let platformSize = "";
  let frameWidth = 3.2;
  let frameHeight = .9;
  let frameDepth = 2.1;
  let view: ShelfView = "stack";

  function render() {
    if (!disposed && ready && host.clientWidth && host.clientHeight) renderer.render(scene, camera);
  }

  function resize() {
    const { clientWidth, clientHeight } = host;
    if (!clientWidth || !clientHeight || disposed) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    setView(view);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    controls.dispose();
    disposeMeshes(scene, shared);
    shared.forEach((map) => map.dispose());
    key.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    signal.removeEventListener("abort", dispose);
  }
  signal.addEventListener("abort", dispose, { once: true });

  function setView(preset: ShelfView) {
    view = preset;
    const direction = new THREE.Vector3(...poses[preset]).normalize();
    const vFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const horizontal = Math.atan(Math.tan(vFov) * camera.aspect);
    const angledWidth = frameWidth + frameDepth * Math.abs(direction.x) * .48;
    const apparentHeight = frameHeight + frameDepth * direction.y;
    const distance = Math.max(
      angledWidth * .61 / Math.tan(horizontal),
      apparentHeight * .62 / Math.tan(vFov),
    ) + .6;
    controls.target.set(0, frameHeight * .44, 0);
    camera.position.copy(controls.target).addScaledVector(direction, distance);
    controls.update();
    render();
  }

  function setLighting(mode: ShelfLight) {
    const warm = mode === "warm";
    hemisphere.color.set(warm ? "#ffdec3" : "#eeeaff");
    hemisphere.groundColor.set(warm ? "#76513b" : "#68778a");
    hemisphere.intensity = warm ? 1.36 : 1.6;
    key.color.set(warm ? "#ffd4a0" : "#fff7ec");
    key.intensity = warm ? 2.52 : 2.44;
    fill.color.set(warm ? "#f8d0b4" : "#d5e5ff");
    fill.intensity = warm ? 1.2 : 1.12;
    rim.color.set(warm ? "#ffc586" : "#ffffff");
    rim.intensity = warm ? .8 : .66;
    bounce.color.set(warm ? "#e4c3a3" : "#dce6ff");
    bounce.intensity = warm ? .83 : .88;
    renderer.toneMappingExposure = warm ? 1.11 : 1.13;
    render();
  }

  function ensureCover(entry: CatalogBook) {
    const key = coverKey(entry);
    if (covers.has(key)) return;
    const pending = pendingCovers.get(key);
    if (pending) return pending;
    const design = hardcoverDesign(entry);
    const load = loadCover(entry.cover, { ratio: (design.depth ?? 1) / design.width, tone: design.tone })
      .then((cover) => {
        if (disposed) cover.dispose();
        else {
          covers.set(key, cover);
          shared.add(cover);
        }
      })
      .finally(() => pendingCovers.delete(key));
    pendingCovers.set(key, load);
    return load;
  }

  async function setBooks(entries: readonly CatalogBook[]) {
    const request = ++revision;
    await Promise.all(entries.map(ensureCover));
    if (disposed || request !== revision) return;
    const required = new Set(entries.map(entry => entry.id));
    for (const [id, model] of models) {
      if (required.has(id)) continue;
      stack.remove(model.group);
      disposeMeshes(model.group, shared);
      models.delete(id);
    }

    const arranged = arrangeBooks(entries, layout);
    for (const column of arranged) {
      let y = 0;
      column.entries.forEach((entry, level) => {
        const design = hardcoverDesign(entry);
        const cover = covers.get(coverKey(entry));
        if (!cover) return;
        const signature = JSON.stringify([coverKey(entry), design]);
        let model = models.get(entry.id);
        if (model?.signature !== signature) {
          if (model) {
            stack.remove(model.group);
            disposeMeshes(model.group, shared);
          }
          const group = makeBook(design, cover, relief);
          group.name = entry.fullTitle;
          group.traverse((node) => {
            if (node instanceof THREE.Mesh) {
              node.castShadow = true;
              // Thin covers and bindings are adjacent. Let the books cast onto the shelf
              // and use the material's edge shading on the fitted book surfaces.
              node.receiveShadow = false;
            }
          });
          model = { signature, group };
          models.set(entry.id, model);
          stack.add(group);
        }
        model.group.position.set(column.center / 75 + (level % 2 ? .08 : -.035), y, level % 2 ? -.055 : .025);
        model.group.rotation.y = level % 2 ? -.048 : .035;
        y += design.thickness;
      });
    }

    frameWidth = Math.max(3.1, (arranged.at(-1)?.center ?? 0) * 2 / 75 + (arranged.at(-1)?.width ?? 0) / 75);
    frameHeight = Math.max(.5, ...arranged.map(column => column.height / 75));
    frameDepth = Math.max(2, ...entries.map(entry => entry.dimensions.width / 75));
    const width = Math.max(5.2, frameWidth + 1.7);
    const depth = Math.max(3.5, frameDepth + 1.35);
    const size = `${width}/${depth}`;
    if (platformSize !== size) {
      if (platform) {
        scene.remove(platform);
        disposeMeshes(platform, shared);
      }
      const wood = new THREE.MeshStandardMaterial({ color: "#916645", map: platformMap, roughness: .71 });
      const underside = new THREE.MeshStandardMaterial({ color: "#2f1910", roughness: .86 });
      platform = new THREE.Mesh(
        new RoundedBoxGeometry(width, .18, depth, 3, .032),
        [underside, underside, wood, underside, wood, underside],
      );
      platform.position.y = -.09;
      platform.receiveShadow = true;
      scene.add(platform);
      platformSize = size;
    }
    const boundary = Math.max(5, frameWidth / 2 + 2);
    Object.assign(key.shadow.camera, { left: -boundary, right: boundary, top: boundary, bottom: -boundary, near: .5, far: 26 });
    key.shadow.camera.updateProjectionMatrix();
    renderer.domElement.dataset.bookCount = String(stack.children.length);
    renderer.domElement.dataset.stackCount = String(arranged.length);
    setView(view);
  }

  function rotate(degrees: number) {
    camera.position.sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(degrees)).add(controls.target);
    controls.update();
    render();
  }

  function zoom(scale: number) {
    const offset = camera.position.clone().sub(controls.target);
    const distance = THREE.MathUtils.clamp(offset.length() * scale, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(offset.setLength(distance));
    controls.update();
    render();
  }

  const relief = makeRelief();
  try {
    shared.add(relief);
    const wood = await new THREE.TextureLoader().loadAsync("/media/study/books/walnut-shelf-grain.webp");
    if (disposed || signal.aborted) {
      wood.dispose();
      throw new DOMException("Preview cancelled", "AbortError");
    }
    // Sample the unlit central grain so the shelf has no baked-in stripes from
    // the photographed fixtures. The scene lights supply the highlights.
    const image = wood.image as HTMLImageElement;
    const grain = document.createElement("canvas");
    grain.width = 384;
    grain.height = 700;
    const paint = grain.getContext("2d");
    if (!paint) {
      wood.dispose();
      throw new Error("Canvas 2D unavailable");
    }
    paint.drawImage(image, image.width * .31, 0, image.width * .36, image.height, 0, 0, grain.width, grain.height);
    wood.dispose();
    platformMap = new THREE.CanvasTexture(grain);
    platformMap.colorSpace = THREE.SRGBColorSpace;
    platformMap.anisotropy = 8;
    platformMap.center.set(.5, .5);
    platformMap.rotation = Math.PI / 2;
    platformMap.wrapS = platformMap.wrapT = THREE.MirroredRepeatWrapping;
    platformMap.repeat.set(1.8, 1);
    shared.add(platformMap);
    ready = true;
    controls.addEventListener("change", render);
    observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    setLighting("warm");
    await setBooks(catalog);
    return { setBooks, setView, setLighting, rotate, zoom, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}

export type InspectorScene = Awaited<ReturnType<typeof createInspectorScene>>;
