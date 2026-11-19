"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { hiddenAuthorNote, type VaultItem, vaultContents } from "@/content/vault";
import styles from "./vault.module.css";

export function VaultGallery() {
  const [selected, setSelected] = useState<VaultItem | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const welcomeDialog = useRef<HTMLDialogElement>(null);
  const firstBook = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  // One welcome note per room visit; book details never repeat this letter.
  useEffect(() => {
    if (!welcomeOpen) return;
    const d = welcomeDialog.current;
    if (d && !d.open) d.showModal();
    return () => { if (d?.open) d.close(); };
  }, [welcomeOpen]);

  function dismissWelcome() {
    setWelcomeOpen(false);
    window.requestAnimationFrame(() => firstBook.current?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    if (!selected) return;
    const d = dialog.current;
    d?.showModal();
    return () => d?.close();
  }, [selected]);

  function select(item: VaultItem, button: HTMLButtonElement) {
    lastTrigger.current = button;
    setSelected(item);
  }

  function close() {
    setSelected(null);
    window.requestAnimationFrame(() => lastTrigger.current?.focus({ preventScroll: true }));
  }

  return (
    <>
      {welcomeOpen && (
        <dialog
          ref={welcomeDialog}
          className={styles.vaultWelcome}
          aria-labelledby="vault-welcome-heading"
          onCancel={(event) => { event.preventDefault(); dismissWelcome(); }}
        >
          <div className={styles.vaultWelcomeTrim} aria-hidden="true">✦</div>
          <span className={styles.galleryLetterHead}>A private note from Javier</span>
          <h2 id="vault-welcome-heading">{hiddenAuthorNote.heading}</h2>
          {hiddenAuthorNote.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <span className={styles.vaultWelcomeSignature}>{hiddenAuthorNote.signature}</span>
          <button type="button" autoFocus className={styles.vaultWelcomeEnter} onClick={dismissWelcome}>
            Explore the hidden books <span aria-hidden="true">→</span>
          </button>
        </dialog>
      )}
      <div className={styles.galleryIntroduction}>
        <span className={styles.discoveryEyebrow}>IHBNF · The private archive</span>
        <h2>The stories behind the hidden door.</h2>
        <p>You followed the clues. You found the room. Now choose a book to discover what is waiting behind its cover.</p>
      </div>
      <div className={styles.galleryCollection}>
        {vaultContents.map((section) => (
          <section className={styles.galleryShelf} aria-labelledby={section.id + "-title"} id={section.id} key={section.id}>
            <div className={styles.galleryShelfHeader}>
              <h3 id={section.id + "-title"}>{section.title}</h3>
              <p>{section.description}</p>
            </div>
            <ul className={styles.galleryExhibits}>
              {section.items.map((item) => (
                <li key={item.title}>
                  <button
                    type="button"
                    className={styles.galleryArtifact}
                    ref={section.items[0] === item && section === vaultContents[0] ? firstBook : undefined}
                    aria-label={"Examine " + item.title + " and read its synopsis"}
                    onClick={(event) => select(item, event.currentTarget)}
                  >
                    <span className={styles.galleryArtifactLight} aria-hidden="true" />
                    <span className={styles.galleryArt}>
                      <Image src={item.image.src} width={item.image.width} height={item.image.height}
                        alt={item.image.alt} className={styles.galleryCover}
                        sizes="(max-width: 640px) 42vw, (max-width: 1100px) 24vw, 200px" />
                    </span>
                    <span className={styles.galleryPlaque}>
                      <strong>{item.title}</strong>
                      <small>{item.status}</small>
                      <span className={styles.galleryReadCue}>Examine the book <span aria-hidden="true">↗</span></span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {selected && (
        <dialog
          ref={dialog}
          className={styles.galleryDialog}
          aria-labelledby="vault-book-title"
          onCancel={(event) => { event.preventDefault(); close(); }}
          onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        >
          <div className={styles.galleryDialogTop}>
            <span>From the private archive</span>
            <button type="button" autoFocus onClick={close} aria-label="Close story and return to the archive">
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className={styles.galleryDialogBody}>
            <div className={styles.gallerySelectedCover}>
              <Image src={selected.image.src} width={selected.image.width} height={selected.image.height}
                alt={selected.image.alt} className={styles.galleryDialogCover}
                sizes="(max-width: 640px) 50vw, 265px" />
            </div>
            <div className={styles.galleryStory}>
              <p className={styles.galleryStatus}>{selected.status}</p>
              <h2 id="vault-book-title">{selected.title}</h2>
              <h3>The story</h3>
              <p>{selected.synopsis}</p>

            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
