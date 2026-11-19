"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { installDevReset, readProgress, useVaultProgress, VAULT_UNLOCKED } from "@/components/vault/progress";
import styles from "./vault.module.css";

export function VaultGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const progress = useVaultProgress();

  useEffect(() => installDevReset(), []);
  useEffect(() => {
    if (readProgress() !== VAULT_UNLOCKED) router.replace("/");
    if (progress === VAULT_UNLOCKED) document.getElementById("vault-title")?.focus({ preventScroll: true });
  }, [progress, router]);

  if (progress !== VAULT_UNLOCKED) {
    return <div className={styles.threshold}><Link href="/">Return to the study</Link></div>;
  }

  return children;
}
