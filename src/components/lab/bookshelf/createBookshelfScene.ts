import * as THREE from "three";
import type { ShelfBookId } from "@/components/books/StudyHardcover";
import { loadCover, makeBook, makeRelief } from "@/components/bookshelf/hardcover";

const books = [
  {
    title: "The Dream of the Payoff",
    author: "JAVIER HUERTAS",
    cover: "/media/memoir/dream-payoff-cover.svg",
    tone: "#441a17",
    edge: "#753c2a",
    foil: "#ffd792",
    width: 3.13,
    thickness: .43,
    x: -.065,
    z: .009,
    yaw: .034,
  },
  {
    title: "Why Henry?",
    series: "THE UNWRITTEN JOURNEY  ·  BOOK ONE",
    author: "JAVIER HUERTAS",
    cover: "/media/why-henry/cover-user.jpg",
    tone: "#101c2a",
    edge: "#344956",
    foil: "#ffda96",
    width: 2.99,
    thickness: .395,
    x: .065,
    z: -.025,
    yaw: .056,
  },
];

function shadowMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  for (let inset = 0; inset < 39; inset++) {
    ctx.fillStyle = "rgba(17, 9, 4, .045)";
    ctx.beginPath();
    ctx.roundRect(4 + inset * 2, 4 + inset * 1.2, 312 - inset * 4, 248 - inset * 2.4, 46 - inset * .85);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function addShadow(scene: THREE.Scene, map: THREE.Texture, width: number, depth: number, opacity: number, x: number, y: number, z: number) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshBasicMaterial({ map, opacity, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(x, y, z);
  scene.add(plane);
  return plane;
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
  renderer.toneMappingExposure = 1.28;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 50);
  camera.position.set(registerUpdate ? 3.25 : 1.55, 3.28, 10);
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
    lower.rotation.y = books[0].yaw;
    lower.position.set(books[0].x, 0, books[0].z);
    upper.rotation.y = books[1].yaw;
    upper.position.set(books[1].x, books[0].thickness, books[1].z);
    scene.add(lower, upper);

    const shadow = shadowMap();
    addShadow(scene, shadow, 3.97, 2.81, .9, -.09, -.004, .03);
    const between = addShadow(scene, shadow, 3.38, 2.27, .52, .048, books[0].thickness + .0005, .005);

    scene.add(new THREE.HemisphereLight("#ffd2a0", "#522d20", 1.04));
    const key = new THREE.DirectionalLight("#ffd6a8", 2.34);
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
      const halfWidth = registerUpdate ? 2.29 : 2.21;
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

    registerUpdate?.((selected, lit) => {
      lower.visible = selected !== "dream-payoff";
      upper.visible = selected !== "why-henry";
      upper.position.y = lower.visible ? books[0].thickness : 0;
      between.visible = lower.visible && upper.visible;
      renderer.toneMappingExposure = lit ? 1.28 : 1.14;
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
