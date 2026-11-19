import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { vaultContents } from "@/content/vault";
import { VaultGate } from "./VaultGate";
import styles from "./vault.module.css";

export const metadata: Metadata = {
  title: "The Vault",
  description: "The archive behind the study.",
  robots: { index: false, follow: false },
};

export default function VaultPage() {
  return (
    <VaultGate>
      <div className={styles.room}>
        <header className={styles.entry}>
          <div className={styles.hero}>
            <div className={styles.title}>
              <h1 id="vault-title" tabIndex={-1}>The Vault</h1>
              <p>An archive behind the study walls.</p>
            </div>
            <Link href="/" className={styles.return}><span aria-hidden="true">←</span> Return to the study</Link>
          </div>
        </header>
        <div className={styles.collection}>
          {vaultContents.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className={styles.shelf}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <ul className={styles.exhibits}>
                {section.items.map((item) => (
                  <li key={item.title} className={styles.exhibit}>
                    {item.image && (
                      <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height}
                        sizes="(max-width: 600px) 80px, 110px" className={styles.cover} />
                    )}
                    <div>
                      <p className={styles.status}>{item.status}</p>
                      <h3>{item.title}</h3>
                      {item.description && <p className={styles.description}>{item.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </VaultGate>
  );
}
