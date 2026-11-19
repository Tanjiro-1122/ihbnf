"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { bookshelfCatalog, bookshelfLayout } from "./catalog";
import type { InspectorScene, ShelfLight, ShelfView } from "./createInspectorScene";
import styles from "./bookshelfInspector.module.css";

const views: [ShelfView, string][] = [
  ["stack", "Stack"], ["cover", "Top cover"], ["spines", "Spines"], ["pages", "Page edges"], ["side", "Side profile"],
];

export function BookshelfInspector() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<InspectorScene | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [view, setView] = useState<ShelfView>("stack");
  const [light, setLight] = useState<ShelfLight>("warm");
  const [demos, setDemos] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const canvasMount = host.current;
    if (!canvasMount) return;
    void import("./createInspectorScene")
      .then(({ createInspectorScene }) => createInspectorScene(canvasMount, bookshelfCatalog, bookshelfLayout, controller.signal))
      .then((instance) => {
        if (controller.signal.aborted) return;
        scene.current = instance;
        setStatus("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });

    return () => {
      controller.abort();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    const extras = Array.from({ length: demos }, (_, index) => {
      const example = bookshelfCatalog[index % bookshelfCatalog.length];
      return { ...example, id: `demo-${index}` };
    });
    const instance = scene.current;
    void instance?.setBooks([...bookshelfCatalog, ...extras]).catch(() => {
      if (scene.current === instance) setStatus("error");
    });
  }, [demos, status]);

  function chooseView(preset: ShelfView) {
    setView(preset);
    scene.current?.setView(preset);
  }

  function chooseLight(mode: ShelfLight) {
    setLight(mode);
    scene.current?.setLighting(mode);
  }

  return (
    <section className={styles.lab} aria-labelledby="bookshelf-lab-title" data-status={status}>
      <header className={styles.header}>
        <div>
          <h1 id="bookshelf-lab-title">3D Bookshelf Lab</h1>
          <p>Inspect the hardcovers, binding, and paper under two lighting setups.</p>
        </div>
        <Link href="/" className={styles.studyLink}>← Back to the study</Link>
      </header>
      <div className={styles.layout}>
        <div className={styles.preview} data-light={light}>
          <div ref={host} className={styles.canvas} />
          <p className={styles.previewCaption}>Drag to orbit · Scroll or pinch to zoom</p>
          {status !== "ready" && (
            <p className={styles.message} role="status">
              {status === "loading" ? "Preparing the bookshelf…" : "The 3D preview requires WebGL and access to the cover assets."}
            </p>
          )}
        </div>
        <div className={styles.controls}>
          <fieldset disabled={status !== "ready"}>
            <legend>View</legend>
            <div className={styles.buttons}>
              {views.map(([preset, label]) => (
                <button type="button" key={preset} aria-pressed={view === preset} onClick={() => chooseView(preset)}>{label}</button>
              ))}
              <button type="button" onClick={() => chooseView("stack")}>Reset camera</button>
            </div>
            <div className={styles.buttons}>
              <button type="button" onClick={() => scene.current?.rotate(-18)}>Rotate left</button>
              <button type="button" onClick={() => scene.current?.rotate(18)}>Rotate right</button>
              <button type="button" onClick={() => scene.current?.zoom(.84)}>Zoom in</button>
              <button type="button" onClick={() => scene.current?.zoom(1.19)}>Zoom out</button>
            </div>
          </fieldset>
          <fieldset disabled={status !== "ready"}>
            <legend>Lighting</legend>
            <div className={styles.buttons}>
              <button type="button" aria-pressed={light === "warm"} onClick={() => chooseLight("warm")}>Warm study</button>
              <button type="button" aria-pressed={light === "studio"} onClick={() => chooseLight("studio")}>Studio</button>
            </div>
          </fieldset>
          <fieldset disabled={status !== "ready"}>
            <legend>Stack test</legend>
            <div className={styles.buttons}>
              <button type="button" disabled={demos >= 4} onClick={() => setDemos(count => count + 1)}>Add demonstration copy</button>
              <button type="button" disabled={demos === 0} onClick={() => setDemos(0)}>Clear copies</button>
            </div>
            <p role="status">{bookshelfCatalog.length + demos} books{demos > 0 ? ` · ${demos} temporary copies of existing titles` : ""}</p>
          </fieldset>
        </div>
      </div>
      <ul className={styles.catalog} aria-label="Book catalog">
        {[...bookshelfCatalog].reverse().map(item => (
          <li key={item.id}>
            <a href={item.href}>{item.fullTitle}</a>
            <span>{item.author} · {item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
