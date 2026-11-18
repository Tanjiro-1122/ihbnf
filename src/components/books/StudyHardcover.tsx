"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
import styles from "./studyBooks.module.css";

export const shelfBooks = {
  "why-henry": {
    title: "Why Henry?",
    cover: "/media/why-henry/cover-user.jpg",
    slot: { left: "60.6%", width: "18%", height: "12%" },
  },
  "dream-payoff": {
    title: "The Dream of the Payoff",
    cover: "/media/memoir/dream-payoff-cover.svg",
    slot: { left: "60%", width: "19.1%", height: "5.2%" },
  },
} as const;

export type ShelfBookId = keyof typeof shelfBooks;

export function StackedBinding({ book, topVisible }: { book: ShelfBookId; topVisible: boolean }) {
  return (
    <span className={styles.stackedBinding} data-book={book} aria-hidden="true">
      {topVisible && <span className={styles.stackBoard} />}
      <span className={styles.stackSpine} data-stack-spine>
        <span>{shelfBooks[book].title}</span>
      </span>
      <span className={styles.stackEndcap} />
    </span>
  );
}

function Hardcover({ book }: { book: ShelfBookId }) {
  return (
    <span className={styles.hardcover} data-book={book} aria-hidden="true">
      <span className={styles.backBoard} />
      <span className={styles.spine}><span>{shelfBooks[book].title}</span></span>
      <span className={styles.pageBlock}>
        <span className={styles.pageTop} />
        <span className={styles.pageSide} />
        <span className={styles.pageBottom} />
      </span>
      <span className={styles.turningLeaf} />
      <span className={styles.coverHinge}>
        <span className={styles.coverFront}>
          <Image src={shelfBooks[book].cover} alt="" fill sizes="(max-width: 640px) 45vw, 420px" />
        </span>
        <span className={styles.endpaper} />
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
    const shelfScale = origin.width / height;
    const startX = origin.left + origin.width / 2 - width * shelfScale / 2 - x;
    const startY = origin.top + origin.height / 2 - height * shelfScale / 2 - y;
    const css = element.style;
    css.setProperty("--book-width", `${width}px`);
    css.setProperty("--book-height", `${height}px`);
    css.setProperty("--book-left", `${x}px`);
    css.setProperty("--book-top", `${y}px`);
    css.setProperty("--shelf-x", `${startX}px`);
    css.setProperty("--shelf-y", `${startY}px`);
    css.setProperty("--shelf-scale", String(shelfScale));
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
        <div className={styles.bookOrientation}><Hardcover book={book} /></div>
      </div>
    </div>
  );
}
