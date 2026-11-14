import Link from "next/link";
import { getProject } from "@/content/projects";
import { Arrow } from "@/components/ui/Icons";
import { BookCover } from "@/components/visuals/BookCover";

const themes = ["Growing up", "Family", "Relationships", "Fatherhood", "Work", "Sacrifice", "Financial struggle", "Dreams"];

export function MemoirFeature() {
  const memoir = getProject("the-dream-of-the-payoff")!;
  return (
    <section id="memoir" aria-labelledby="memoir-title" data-testid="memoir-section" className="relative py-28 sm:py-40">
      <div className="shell grid items-center gap-14 lg:grid-cols-12">
        <div data-reveal className="mx-auto w-[72%] max-w-[390px] sm:w-[52%] lg:col-span-6 lg:w-full lg:max-w-[430px]">
          <BookCover project={memoir} />
          <p className="mt-7 text-center font-display text-xl italic text-bone/75">A true story.</p>
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
            The Dream of the Payoff
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
