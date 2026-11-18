"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./studyBooks.module.css";
import type { ShelfBookId } from "./StudyHardcover";

export function StaticShelfBooks({ selected, lampOn }: { selected: ShelfBookId | null; lampOn: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const updateScene = useRef<((book: ShelfBookId | null, lit: boolean) => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let active = true;
    let dispose: (() => void) | undefined;
    void import("../lab/bookshelf/createBookshelfScene").then(({ createBookshelfScene }) => {
      if (!active) return;
      return createBookshelfScene(
        container,
        () => { if (active) setReady(true); },
        (cleanup) => { dispose = cleanup; },
        (update) => { updateScene.current = update; },
      );
    }).catch(() => {
      // Keep the semantic shelf buttons and CSS books usable without WebGL.
      if (active) setReady(false);
    });
    return () => {
      active = false;
      updateScene.current = null;
      dispose?.();
    };
  }, []);

  useEffect(() => {
    if (ready) updateScene.current?.(selected, lampOn);
  }, [lampOn, ready, selected]);

  return <div ref={host} className={styles.staticModel} data-live={ready} aria-hidden="true" data-testid="study-static-book-render" />;
}
