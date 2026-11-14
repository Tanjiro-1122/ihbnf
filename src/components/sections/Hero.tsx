import Link from "next/link";
import { Arrow } from "@/components/ui/Icons";
import { HeroBackdrop } from "@/components/visuals/HeroBackdrop";

const index = [
  { n: "01", label: "Books", href: "/#books" },
  { n: "02", label: "Apps", href: "/#apps" },
  { n: "03", label: "Sports tech", href: "/#sports" },
  { n: "04", label: "In progress", href: "/#memoir" },
];

export function Hero() {
  return (
    <section id="home" data-testid="hero-section" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <HeroBackdrop />
      <div className="shell relative z-10 flex flex-1 flex-col justify-center pb-16 pt-28 sm:pt-32">
        <p className="eyebrow load-in" style={{ "--d": "100ms" } as React.CSSProperties}>
          Books · Apps · Sports Tech · Whatever I Build Next
        </p>
        <h1
          aria-label="IHBNF"
          data-testid="hero-title"
          className="hero-mark -ml-[0.04em] mt-6 text-[clamp(5.25rem,27vw,21rem)] font-[350] leading-[0.82] tracking-[-0.055em]"
        >
          IHBNF
        </h1>
        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p
              data-testid="hero-motto"
              className="load-in font-display text-[clamp(2rem,4.6vw,3.9rem)] italic leading-[1.02] text-bone"
              style={{ "--d": "450ms" } as React.CSSProperties}
            >
              Idle Hands Bear No Fruit.
            </p>
            <p className="load-in mt-5 max-w-lg text-lg leading-relaxed text-mute" style={{ "--d": "600ms" } as React.CSSProperties}>
              I write books. I build apps. Apparently I don&apos;t know how to sit still.
            </p>
          </div>
          <div className="load-in flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end" style={{ "--d": "750ms" } as React.CSSProperties}>
            <Link href="/#work" data-testid="hero-explore-work-btn" className="btn btn-primary">
              See What I Built <Arrow />
            </Link>
            <Link href="/#about" data-testid="hero-meet-creator-btn" className="btn btn-ghost">
              Meet the Creator
            </Link>
          </div>
        </div>
      </div>
      <div className="shell relative z-10 pb-8">
        <div className="load-in flex items-end justify-between border-t border-bone/10 pt-5" style={{ "--d": "950ms" } as React.CSSProperties}>
          <ul className="flex gap-6 sm:gap-10">
            {index.map((i) => (
              <li key={i.n}>
                <Link href={i.href} data-testid={`hero-index-${i.n}`} className="group flex items-baseline gap-2 text-sm text-mute transition-colors hover:text-bone">
                  <span className="text-xs text-gold">{i.n}</span>
                  <span>{i.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-mute">
            <span className="hidden sm:inline">Scroll</span>
            <span className="relative block h-10 w-px overflow-hidden bg-bone/10">
              <span className="anim-scroll-line absolute inset-0 bg-gold" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
