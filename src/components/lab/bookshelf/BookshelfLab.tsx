"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LivingWorkspace } from "@/components/sections/LivingWorkspace";
import styles from "./bookshelfLab.module.css";

export function BookshelfLab() {
  const study = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [shelf, setShelf] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setShelf(study.current?.querySelector<HTMLElement>('[data-testid="walnut-desk-surface"]') ?? null);
  }, []);

  useEffect(() => {
    const host = canvasHost.current;
    if (!shelf || !host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import("./createBookshelfScene")
      .then(({ createBookshelfScene }) => {
        if (cancelled) return;
        return createBookshelfScene(host, () => {
          if (!cancelled) setStatus("ready");
        }, (cleanup) => { dispose = cleanup; });
      })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [shelf]);

  return (
    <section aria-label="Static hardcover stack preview" data-bookshelf-status={status} className={styles.lab}>
      <div ref={study} className={styles.study} inert>
        <LivingWorkspace />
        {shelf && createPortal(<div ref={canvasHost} className={styles.models} aria-hidden="true" />, shelf)}
      </div>
      <p className="sr-only" role="status">
        {status === "ready"
          ? "The Unwritten Journey — Book One: Why Henry? is stacked above The Dream of the Payoff."
          : status === "loading" ? "Preparing the static bookshelf preview." : "The 3D preview could not load."}
      </p>
      {status === "error" && <p className={styles.error}>The 3D preview needs WebGL.</p>}
    </section>
  );
}
