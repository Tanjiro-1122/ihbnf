import Image from "next/image";
import Link from "next/link";
import { ExternalArrow, Arrow } from "@/components/ui/Icons";

const highlights = [
  "Player & team research",
  "Matchup trends",
  "S.A.L. AI research",
  "Live scores & news",
  "Mobile companion",
  "Tracking tools",
];

export function SportsWagerFeature() {
  return (
    <section id="sports" aria-labelledby="sports-title" className="relative isolate overflow-hidden border-y border-white/[0.06] bg-[#070b08] py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/media/sports-wager-helper/og-image.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-24"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b08] via-[#070b08]/88 to-[#070b08]/58" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgb(132_204_22/0.13),transparent_32%)]" />
      </div>

      <div className="shell grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p data-reveal className="eyebrow flex flex-wrap items-center gap-3 text-[#a3e635]">
            <span className="text-gold">04</span>
            <span className="h-px w-8 bg-[#a3e635]/40" />
            Sports Tech · Web + Mobile
          </p>
          <h2 id="sports-title" data-reveal className="mt-6 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95]">
            Research first. Gut feeling second.
          </h2>
          <p data-reveal className="mt-6 max-w-2xl text-xl leading-relaxed text-bone/90">
            Sports Wager Helper brings player stats, team form, matchup trends, live information, and AI-assisted research into one place.
          </p>
          <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-mute">
            Because “I just have a feeling about this one” is technically a strategy. It&apos;s just not a very good research method.
          </p>
          <ul data-reveal className="mt-8 flex flex-wrap gap-2" aria-label="Sports Wager Helper features">
            {highlights.map((item) => (
              <li key={item} className="rounded-full border border-[#a3e635]/20 bg-black/20 px-3.5 py-1.5 text-sm text-bone/78">
                {item}
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="https://sportswagerhelper.com" target="_blank" rel="noopener noreferrer" className="btn bg-[#a3e635] text-black hover:bg-[#bef264]">
              Visit Sports Wager Helper <ExternalArrow />
            </a>
            <Link href="/projects/sports-wager-helper" className="btn btn-ghost">
              Explore the project <Arrow />
            </Link>
          </div>
        </div>

        <div data-reveal className="lg:col-span-5">
          <div className="relative mx-auto max-w-[520px] overflow-hidden rounded-[28px] border border-[#a3e635]/15 bg-black/70 p-4 shadow-[0_40px_100px_-35px_rgb(132_204_22/0.38)]">
            <div className="relative aspect-[1200/630] overflow-hidden rounded-[20px]">
              <Image
                src="/media/sports-wager-helper/og-image.png"
                alt="Sports Wager Helper — AI player and team research before you bet"
                fill
                sizes="520px"
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex items-center gap-4 px-2 pb-1">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#a3e635]/25 bg-black">
                <Image src="/media/sports-wager-helper/swh-icon.svg" alt="Sports Wager Helper logo" fill sizes="56px" className="object-contain p-1.5" />
              </div>
              <div>
                <p className="font-medium text-bone">S.A.L.</p>
                <p className="text-sm text-mute">Sports AI Librarian</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
