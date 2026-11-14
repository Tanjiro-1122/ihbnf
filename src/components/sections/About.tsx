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
            <span className="text-gold">05</span>
            <span className="h-px w-8 bg-bone/20" />
            The founder
          </p>
          <h2 id="about-title" data-reveal className="mt-6 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95]">
            {site.founder.name}
          </h2>
          <p data-reveal className="mt-4 text-lg tracking-[0.18em] uppercase text-gold">{site.founder.roles.join(". ")}.</p>
          <div className="mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-bone/85">
            <p data-reveal>
              I write books and I build apps. Most of my life has been spent working hard for things that didn&apos;t come
              easy, and somewhere along the way I stopped waiting for the right moment to start.
            </p>
            <p data-reveal>
              IHBNF is where all of it lives: The Unwritten Journey, Unfiltr, the memoir I&apos;m working on, and whatever I
              start next.
            </p>
            <p data-reveal>
              There&apos;s no secret formula behind it. Make something. See what breaks. Fix it, learn from it, and keep
              going. That&apos;s the whole method.
            </p>
          </div>
          <p data-reveal className="mt-10 font-display text-3xl italic text-bone">— Javier</p>
        </div>
      </div>
    </section>
  );
}
