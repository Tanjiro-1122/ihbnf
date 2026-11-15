import Image from "next/image";
import { site } from "@/content/site";

export function About() {
  const photo = site.founder.photo;
  return (
    <section id="about" aria-labelledby="about-title" data-testid="about-section" className="relative border-t border-bone/[0.06] bg-coal py-24 sm:py-32">
      <div className="shell grid gap-14 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-5 lg:pr-4">
          <div data-testid="founder-photo" className="relative mx-auto aspect-[4/5] w-[88%] max-w-[430px] overflow-hidden rounded-[24px] bg-ash ring-1 ring-bone/10 lg:w-full">
            {photo ? (
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover object-[50%_44%]" />
            ) : (
              <div aria-hidden="true" className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgb(201_164_92/0.22),transparent_60%),radial-gradient(ellipse_at_10%_90%,rgb(90_73_201/0.12),transparent_55%)]" />
                <span className="absolute -bottom-[8%] -left-[4%] font-display text-[clamp(12rem,34vw,26rem)] leading-none text-bone/[0.07]">JH</span>
                <span className="absolute right-6 top-6 eyebrow">Javier Huertas</span>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-7 lg:pl-6 xl:pl-10">
          <p data-reveal className="eyebrow flex items-center gap-3">
            <span className="text-gold">06</span>
            <span className="h-px w-8 bg-bone/20" />
            The founder
          </p>
          <h2 id="about-title" data-reveal className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95]">
            {site.founder.name}
          </h2>
          <p data-reveal className="mt-4 text-lg tracking-[0.18em] uppercase text-gold">{site.founder.roles.join(". ")}.</p>
          <div className="mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-bone/85">
            <p data-reveal>
              If I&apos;m not working hard, I&apos;m writing books and building apps. That&apos;s really where IHBNF comes from: idle hands bear no fruit.
            </p>
            <p data-reveal>
              IHBNF is where I put the things I think are worth sharing — The Unwritten Journey, Unfiltr, Sports Wager Helper, the memoir I&apos;m working on, and whatever comes next.
            </p>
            <p data-reveal>
              The projects are different because I have a lot to offer and more than one thing I&apos;m interested in creating. The common thread is simple: put in the work and make something worth sharing.
            </p>
          </div>
          <p data-reveal className="mt-10 font-display text-3xl italic text-bone">— Javier</p>
        </div>
      </div>
    </section>
  );
}
