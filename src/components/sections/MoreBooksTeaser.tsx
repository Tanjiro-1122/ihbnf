import Link from "next/link";
import { Arrow } from "@/components/ui/Icons";

export function MoreBooksTeaser() {
  return (
    <section aria-labelledby="more-books-title" className="relative overflow-hidden border-y border-bone/[0.06] py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgb(201_164_92/0.10),transparent_36%)]" />
      <div className="shell relative grid items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p data-reveal className="eyebrow flex items-center gap-3">
            <span className="text-gold">Still reading?</span>
            <span className="h-px w-8 bg-bone/20" />
            Good.
          </p>
          <h2
            id="more-books-title"
            data-reveal
            className="mt-6 max-w-[12ch] font-display text-[clamp(3rem,7vw,6.6rem)] leading-[0.94] tracking-[-0.02em]"
          >
            If you want more, I&apos;ve got more.
          </h2>
          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-bone/82">
            <p data-reveal>
              There are more books in the works. I&apos;m not putting all of them on the front page yet because, believe it or not,
              I do occasionally know when to keep something to myself.
            </p>
            <p data-reveal>
              If you&apos;re here for the stories, stay close. More are coming — and trust me, they&apos;re not filler, side quests, or
              pushover books. I plan on making you work for the ending.
            </p>
          </div>
        </div>
        <div data-reveal className="lg:col-span-4 lg:justify-self-end">
          <Link href="/#connect" className="btn btn-ghost">
            Stay close <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
