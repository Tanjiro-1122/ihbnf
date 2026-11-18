"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import styles from "./studyBooks.module.css";

export const shelfBooks = {
  "why-henry": {
    title: "Why Henry?",
    cover: "/media/why-henry/cover-user.jpg",
    slot: { left: "59%", top: "21.4%", width: "9.3%", height: "20.2%" },
  },
  "dream-payoff": {
    title: "The Dream of the Payoff",
    cover: "/media/memoir/dream-payoff-cover.svg",
    slot: { left: "71.1%", top: "20.5%", width: "9.4%", height: "20.9%" },
  },
} as const;

export type ShelfBookId = keyof typeof shelfBooks;

export function Hardcover({ book, flight = false }: { book: ShelfBookId; flight?: boolean }) {
  return (
    <span className={styles.hardcover} data-book={book} aria-hidden="true">
      <span className={styles.backBoard} />
      <span className={styles.spine} />
      <span className={styles.pageBlock}>
        <span className={styles.pageTop} />
        <span className={styles.pageSide} />
        <span className={styles.pageBottom} />
      </span>
      {flight && <span className={styles.turningLeaf} />}
      <span className={styles.coverHinge}>
        <span className={styles.coverFront}>
          <Image src={shelfBooks[book].cover} alt="" fill priority={!flight}
            sizes={flight ? "(max-width: 640px) 45vw, 420px" : "(max-width: 640px) 12vw, 165px"} />
        </span>
        {flight && <span className={styles.endpaper} />}
      </span>
    </span>
  );
}

export function BookFlight({ book, origin, reader, onOpened }: {
  book: ShelfBookId;
  origin: DOMRect;
  reader: RefObject<HTMLDivElement | null>;
  onOpened: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const width = Math.min(365, window.innerWidth * .43, window.innerHeight * .46);
    const height = width * 1.5;
    const x = (window.innerWidth - width) / 2;
    const y = (window.innerHeight - height) / 2;
    const startX = origin.left - x;
    const startY = origin.top - y;
    const css = element.style;
    css.setProperty("--book-width", `${width}px`);
    css.setProperty("--book-height", `${height}px`);
    css.setProperty("--book-left", `${x}px`);
    css.setProperty("--book-top", `${y}px`);
    css.setProperty("--shelf-x", `${startX}px`);
    css.setProperty("--shelf-y", `${startY}px`);
    css.setProperty("--shelf-scale-x", String(origin.width / width));
    css.setProperty("--shelf-scale-y", String(origin.height / height));
    css.setProperty("--spread-shift", `${width / 2}px`);

    // The modal lays out its accessible reader after opening the native dialog.
    // Match the animated spread to that box for a seamless desktop handoff.
    const measure = requestAnimationFrame(() => {
      if (window.innerWidth < 640) return;
      const spread = reader.current?.getBoundingClientRect();
      if (!spread?.width || !spread.height) return;
      css.setProperty("--reader-x", `${spread.left + spread.width / 2 - x}px`);
      css.setProperty("--reader-y", `${spread.top - y}px`);
      css.setProperty("--reader-scale-x", String(spread.width / (width * 2)));
      css.setProperty("--reader-scale-y", String(spread.height / height));
    });
    return () => cancelAnimationFrame(measure);
  }, [origin, reader]);

  return (
    <div ref={stage} className={styles.flightStage} aria-hidden="true" data-testid="shelf-book-flight">
      <div className={styles.flightBook}
        onAnimationEnd={(event) => { if (event.target === event.currentTarget) onOpened(); }}
        style={{ "--lift": `${Math.max(5, origin.height * .095)}px` } as CSSProperties}>
        <div className={styles.bookOrientation}><Hardcover book={book} flight /></div>
      </div>
    </div>
  );
}
