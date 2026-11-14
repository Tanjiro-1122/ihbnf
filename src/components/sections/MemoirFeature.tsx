import Image from "next/image";
import Link from "next/link";
import { getProject } from "@/content/projects";
import { Parallax } from "@/components/ui/Parallax";
import { Arrow } from "@/components/ui/Icons";

const themes = ["Growing up", "Family", "Relationships", "Fatherhood", "Work", "Sacrifice", "Financial struggle", "Dreams"];

export function MemoirFeature() {
  const memoir = getProject("the-dream-of-the-payoff-of-working-hard")!;
  const art = memoir.media.artwork!;
  return (
    <section id="memoir" aria-labelledby="memoir-title" data-testid="memoir-section" className="relative py-28 sm:py-40">
      <div className="shell grid items-center gap-14 lg:grid-cols-12">
        <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[24px] ring-1 ring-bone/10 sm:aspect-[16/11] lg:col-span-6 lg:aspect-[4/5]">
          <Parallax speed={0.08} className="absolute -inset-y-[10%] inset-x-0">
            <Image src={art.src} alt={art.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 font-display text-xl italic text-bone/90">A true story.</p>
        </div>
        <div className="lg:col-span-6 lg:pl-8">
          <p data-reveal className="eyebrow flex flex-wrap items-center gap-3">
            <span className="text-gold">04</span>
            <span className="h-px w-8 bg-bone/20" />
            Memoir
            <span data-testid="memoir-status" className="rounded-full border border-gold/40 px-3 py-1 tracking-[0.18em] text-gold">
              {memoir.statusLabel}
            </span>
          </p>
          <h2 id="memoir-title" data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="mt-6 font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[1]">
            The Dream of the Payoff of Working Hard
          </h2>
          <p data-reveal className="mt-6 text-xl leading-relaxed text-bone/90">
            The true story of an ordinary man whose life has been anything but ordinary.
          </p>
          <ul data-reveal className="mt-8 flex flex-wrap gap-2" aria-label="What the memoir covers">
            {themes.map((t) => (
              <li key={t} className="rounded-full border border-bone/12 px-3.5 py-1.5 text-sm text-mute">{t}</li>
            ))}
          </ul>
          <p data-reveal className="mt-8 max-w-lg text-lg leading-relaxed text-mute">
            And the question underneath all of it: <em className="font-display text-xl text-gold">when does all that hard work finally pay off?</em>
          </p>
          <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={`/projects/${memoir.slug}`} data-testid="memoir-learn-more-btn" className="btn btn-primary">
              Learn More <Arrow />
            </Link>
            <Link href="/#connect" data-testid="memoir-follow-btn" className="btn btn-ghost">
              Follow for updates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
