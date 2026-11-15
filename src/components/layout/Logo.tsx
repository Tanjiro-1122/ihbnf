import Image from "next/image";
import Link from "next/link";

export function Mark({ className = "h-10 w-16" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative block shrink-0 ${className}`}>
      <Image
        src="/media/brand/ihbnf-secondary.svg"
        alt=""
        fill
        sizes="96px"
        className="object-contain"
      />
    </span>
  );
}

export function Logo({ withMotto = false, testId = "header-logo" }: { withMotto?: boolean; testId?: string }) {
  return (
    <Link href="/" aria-label="IHBNF, home" data-testid={testId} className="group inline-flex items-center gap-3 rounded-md">
      <Mark className="h-10 w-[4.75rem] transition-transform duration-500 group-hover:scale-105" />
      <span className="text-[0.95rem] font-semibold tracking-[0.3em] text-bone">IHBNF</span>
      {withMotto && (
        <span className="hidden border-l border-bone/15 pl-3 font-display text-[0.95rem] italic text-mute xl:inline">
          Idle Hands Bear No Fruit
        </span>
      )}
    </Link>
  );
}
