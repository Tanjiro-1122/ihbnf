import Link from "next/link";

// The IHBNF mark: a seed with a single shoot rising out of it.
export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="14.75" stroke="currentColor" strokeOpacity=".38" strokeWidth="1" />
      <path d="M16 22.6V15.2c0-3.7 2.3-6.5 6.1-7.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22.1 7.6c.7 3-1 5.2-4.3 5.5-.4-3 1.3-5 4.3-5.5Z" fill="currentColor" />
      <ellipse cx="16" cy="24.2" rx="2.7" ry="1.65" fill="currentColor" />
    </svg>
  );
}

export function Logo({ withMotto = false, testId = "header-logo" }: { withMotto?: boolean; testId?: string }) {
  return (
    <Link href="/" aria-label="IHBNF, home" data-testid={testId} className="group inline-flex items-center gap-3 rounded-md">
      <Mark className="h-7 w-7 text-gold transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-12" />
      <span className="text-[0.95rem] font-semibold tracking-[0.3em] text-bone">IHBNF</span>
      {withMotto && (
        <span className="hidden border-l border-bone/15 pl-3 font-display text-[0.95rem] italic text-mute xl:inline">
          Idle Hands Bear No Fruit
        </span>
      )}
    </Link>
  );
}
