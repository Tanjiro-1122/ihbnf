"use client";

import { useState } from "react";
import { site } from "@/content/site";

// The address is only assembled after a real click, which keeps it out of the HTML that bots scrape.
export function EmailReveal() {
  const [address, setAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reveal = () => {
    const a = `${site.email.user}@${site.email.domain}`;
    setAddress(a);
  };

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      return;
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-bone/10 bg-coal/60 p-6" data-testid="email-card">
      <p className="eyebrow">Business &amp; press</p>
      <p className="mt-2 text-mute">For collaborations, media, or anything else.</p>
      {address ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href={`mailto:${address}`} data-testid="email-address-link" className="text-lg text-bone underline decoration-gold/50 underline-offset-4 hover:decoration-gold">
            {address}
          </a>
          <button type="button" onClick={copy} data-testid="email-copy-btn" className="rounded-full border border-bone/20 px-3 py-1.5 text-sm text-mute transition-colors hover:text-bone">
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Email address copied" : ""}</span>
        </div>
      ) : (
        <button type="button" onClick={reveal} data-testid="email-reveal-btn" className="btn btn-primary mt-5">
          Show email address
        </button>
      )}
    </div>
  );
}
