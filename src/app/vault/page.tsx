import type { Metadata } from "next";
import Link from "next/link";
import { VaultGallery } from "./VaultGallery";
import { VaultGate } from "./VaultGate";
import styles from "./vault.module.css";

export const metadata: Metadata = {
  title: "The Vault",
  description: "A secret collection behind the study.",
  robots: { index: false, follow: false },
};

export default function VaultPage() {
  return (
    <VaultGate>
      <main className={styles.room}>
        <div aria-hidden="true" className={styles.thresholdCurtain} />
        <header className={styles.entry}>
          <div className={styles.hero}>
            <Link href="/" className={styles.return}>
              <span aria-hidden="true">←</span> Return to the study
            </Link>
            <div className={styles.title}>
              <span className={styles.discoveryEyebrow}>The mystery led you here.</span>
              <h1 id="vault-title" tabIndex={-1}>The Vault</h1>
              <p>Behind the wall, the stories are still alive.</p>
              <a className={styles.discoverGallery} href="#gallery">Explore the hidden collection <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </header>
        <div id="gallery" className={styles.secretRoom}>
          <VaultGallery />
        </div>
      </main>
    </VaultGate>
  );
}
