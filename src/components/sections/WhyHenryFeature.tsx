import Image from "next/image";
import Link from "next/link";
import { getProject } from "@/content/projects";
import { links } from "@/content/site";
import { Arrow, ExternalArrow } from "@/components/ui/Icons";
import { BookCover } from "@/components/visuals/BookCover";
import { StoneMarkers } from "@/components/visuals/StoneMarkers";

export function WhyHenryFeature() {
  const book = getProject("why-henry")!;
  return (
    <section id="books" aria-labelledby="henry-title" data-testid="why-henry-section" className="relative isolate overflow-hidden bg-[#090a08] py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/media/why-henry/illustrations/03.webp"
          alt=""
          fill
          priority={false}
          quality={94}
          sizes="100vw"
          className="object-cover object-[60%_50%]"
        />
        <div className="absolute inset-y-0 left-0 w-[72%] bg-gradient-to-r from-ink via-ink/84 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/78 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_68%_48%,rgba(225,171,85,0.10),transparent_62%)]" />
      </div>

      <div className="shell grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p data-reveal className="eyebrow flex flex-wrap items-center gap-3 text-amber">
            <span className="text-gold">02</span>
            <span className="h-px w-8 bg-amber/40" />
            The Unwritten Journey · Book One
          </p>
          <h2 id="henry-title" data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="mt-6 font-display text-[clamp(2.7rem,6.4vw,5.6rem)] leading-[0.96]">
            Some questions are better left unanswered.
          </h2>
          <p data-reveal style={{ "--d": "180ms" } as React.CSSProperties} className="mt-4 font-display text-[clamp(1.9rem,4vw,3.2rem)] italic text-[#e9c98a]">
            But where&apos;s the fun in that?
          </p>
          <StoneMarkers className="mt-10" />
          <p data-reveal className="mt-6 text-xl font-medium leading-snug text-bone sm:text-2xl">{book.tagline}</p>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-mute">{book.description[1]}</p>
          <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
            <span data-testid="why-henry-status" className="inline-flex items-center gap-2 rounded-full border border-amber/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-amber">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" /> {book.statusLabel}
            </span>
            <span className="text-sm text-mute">Young-adult fantasy · by Javier Huertas</span>
          </div>
          <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={links.amazonWhyHenry} target="_blank" rel="noopener noreferrer" data-testid="why-henry-buy-amazon-btn" className="btn btn-gold">
              Buy on Amazon <ExternalArrow />
            </a>
            <Link href="/projects/why-henry" data-testid="why-henry-explore-btn" className="btn btn-ghost">
              Explore Why Henry <Arrow />
            </Link>
          </div>
        </div>
        <div data-reveal style={{ "--d": "200ms" } as React.CSSProperties} className="mx-auto w-[68%] max-w-[380px] sm:w-[48%] lg:col-span-5 lg:w-full">
          <BookCover project={book} />
        </div>
      </div>
    </section>
  );
}
