import * as THREE from "three";
import type { ShelfBookId } from "@/components/books/StudyHardcover";
import { bookshelfCatalog, bookshelfLayout, arrangeBooks, hardcoverDesign } from "@/components/bookshelf/catalog";
import { loadCover, makeBook, makeRelief } from "@/components/bookshelf/hardcover";

// The production shelf uses exactly the same physical book geometry and catalog
// as /lab/3d-bookshelf. The transparent canvas sits over the original photo:
// no additional wooden pedestal or duplicate shelf is rendered by Three.js.
function softShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  const gradient = ctx.createRadialGradient(256, 160, 16, 256, 160, 235);
  gradient.addColorStop(0, "rgba(8, 3, 1, .85)");
  gradient.addColorStop(.45, "rgba(12, 5, 2, .63)");
  gradient.addColorStop(.8, "rgba(13, 7, 4, .19)");
  gradient.addColorStop(1, "rgba(13, 7, 4, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 320);
  return new THREE.CanvasTexture(canvas);
}

function addContactShadow(group: THREE.Group, texture: THREE.Texture, width: number, depth: number, y: number, opacity: number) {
  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  );
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = y;
  group.add(surface);
  return surface;
}

export async function createBookshelfScene(
  host: HTMLElement,
  ready: () => void,
  registerCleanup: (fn: () => void) => void,
  registerUpdate?: (update: (selected: ShelfBookId | null, lit: boolean) => void) => void,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.10;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 50);

  // Unlike the 3D lab's product-shot camera, the study's painted bookshelf is
  // seen nearly head-on with only a modest view of the top boards.
  camera.position.set(1.10, 2.00, 10);
  camera.lookAt(0, .30, 0);
  camera.updateMatrixWorld();

  const sharedTextures = new Set<THREE.Texture>();
  const ownedTextures = new Set<THREE.Texture>();
  const books = new Map<string, { object: THREE.Group; baseY: number; centerX: number; offsetZ: number; yaw: number }>();
  const stacks = new THREE.Group();
  scene.add(stacks);
  let disposed = false;
  let observer: ResizeObserver | undefined;

  const relief = makeRelief();
  sharedTextures.add(relief);
  const shadow = softShadowTexture();
  sharedTextures.add(shadow);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      geometries.add(node.geometry);
      for (const material of [node.material].flat() as THREE.MeshStandardMaterial[]) {
        materials.add(material);
        for (const texture of [material.map, material.bumpMap]) {
          if (texture && !sharedTextures.has(texture)) ownedTextures.add(texture);
        }
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    ownedTextures.forEach(texture => texture.dispose());
    sharedTextures.forEach(texture => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
  registerCleanup(dispose);

  try {
    const covers = await Promise.all(bookshelfCatalog.map(async (entry) => {
      const design = hardcoverDesign(entry);
      const cover = await loadCover(entry.cover, { ratio: (design.depth ?? design.width * 2 / 3) / design.width, tone: design.tone });
      if (disposed) cover.dispose();
      else sharedTextures.add(cover);
      return cover;
    }));
    if (disposed) return;

    const arranged = arrangeBooks(bookshelfCatalog, bookshelfLayout);
    const dimensionScale = 1 / 75;
    const firstStack = arranged[0]?.center ?? 0;

    arranged.forEach((column) => {
      const columnGroup = new THREE.Group();
      // Center the first, currently active stack over the original shelf. A
      // future second stack grows to the right instead of squashing the books.
      columnGroup.position.x = (column.center - firstStack) * dimensionScale;
      stacks.add(columnGroup);
      let y = 0;
      column.entries.forEach((entry, index) => {
        const design = hardcoverDesign(entry);
        const cover = covers[bookshelfCatalog.indexOf(entry)];
        const object = makeBook(design, cover, relief);
        const z = index % 2 === 0 ? .01 : -.035;
        const yaw = index % 2 === 0 ? .022 : -.025;
        object.position.set(index % 2 === 0 ? -.025 : .035, y, z);
        object.rotation.y = yaw;
        columnGroup.add(object);
        books.set(entry.id, { object, baseY: y, centerX: object.position.x, offsetZ: z, yaw });
        // The contact shadow is applied at each book's underside, not to the
        // wall or to the whole canvas rectangle.
        addContactShadow(columnGroup, shadow, design.width * 1.20, (design.depth ?? 2) * 1.22, Math.max(.002, y - .005), index === 0 ? .89 : .48)
          .position.set(object.position.x, Math.max(.002, y - .005), z);
        y += design.thickness;
      });
    });

    scene.add(new THREE.HemisphereLight("#ffd6ac", "#3a261e", 1.03));
    const key = new THREE.DirectionalLight("#ffcc90", 1.72);
    key.position.set(-2.5, 4, 3.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#adc2e6", .35);
    fill.position.set(3, 2, 5);
    scene.add(fill);

    renderer.domElement.dataset.testid = "bookshelf-lab-canvas";
    host.appendChild(renderer.domElement);

    function render() {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h || disposed) return;
      // The book stack should occupy only the shelf's existing niche, not
      // dominate the painted study or float in front of the upper shelf.
      const halfWidth = 2.62;
      const halfHeight = halfWidth * h / w;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();

      // Anchor the lower board to the photographed shelf ledge (normalized
      // canvas y ≈ 88%, i.e. NDC -0.76) at every responsive size.
      const lower = books.get("dream-payoff")?.object;
      if (lower) {
        const footprint = hardcoverDesign(bookshelfCatalog[0]);
        const zDepth = footprint.depth ?? 2;
        let low = Infinity;
        for (const x of [-footprint.width / 2, footprint.width / 2]) {
          for (const z of [-zDepth / 2, zDepth / 2]) {
            const point = lower.localToWorld(new THREE.Vector3(x, 0, z));
            low = Math.min(low, point.project(camera).y);
          }
        }
        const delta = (low + .76) * halfHeight;
        camera.top += delta;
        camera.bottom += delta;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    }

    registerUpdate?.((selected, lit) => {
      for (const [id, model] of books) {
        model.object.visible = selected !== id;
      }
      // Removing the lower book must leave the upper book sitting on the shelf.
      const top = books.get("why-henry");
      if (top) top.object.position.y = books.get("dream-payoff")?.object.visible === false ? 0 : top.baseY;
      renderer.toneMappingExposure = lit ? 1.10 : .89;
      render();
    });

    observer = new ResizeObserver(render);
    observer.observe(host);
    render();
    ready();
  } catch (error) {
    dispose();
    throw error;
  }
}
