import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import type { Project } from "@/content/types";
import { BookCover } from "@/components/visuals/BookCover";
import { PhoneMockup } from "@/components/visuals/PhoneMockup";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { Arrow, ExternalArrow } from "@/components/ui/Icons";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  const description = `${p.summary} ${p.tagline}`;
  return {
    title: p.fullTitle,
    description,
    keywords: p.keywords,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: `${p.fullTitle} · IHBNF`, description, url: `/projects/${p.slug}` },
    twitter: { title: `${p.fullTitle} · IHBNF`, description },
  };
}

function structuredData(p: Project) {
  const url = `${site.url}/projects/${p.slug}`;
  const author = { "@type": "Person", name: site.founder.name };
  const publisher = { "@type": "Organization", name: site.name, url: site.url };

  if (p.theme === "henry") {
    return {
      "@context": "https://schema.org",
      "@type": "Book",
      name: p.fullTitle,
      url,
      author,
      publisher,
      genre: "Young adult fantasy",
      description: p.tagline,
    };
  }

  if (p.category === "app") {
    const isSports = p.theme === "sports";
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: p.fullTitle,
      url,
      operatingSystem: isSports ? "Web, iOS, Android" : "iOS, Android",
      applicationCategory: isSports ? "SportsApplication" : "EntertainmentApplication",
      author,
      publisher,
      sameAs: p.links.filter((link) => link.external).map((link) => link.href),
      description: p.tagline,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.fullTitle,
    url,
    author,
    publisher,
    description: p.tagline,
    creativeWorkStatus: p.statusLabel,
  };
}

const accent: Record<Project["theme"], string> = {
  henry: "text-amber",
  unfiltr: "text-violet",
  memoir: "text-gold",
  sports: "text-[#a3e635]",
};
const btn: Record<Project["theme"], string> = {
  henry: "btn-gold",
  unfiltr: "btn-violet",
  memoir: "btn-primary",
  sports: "bg-[#a3e635] text-black hover:bg-[#bef264]",
};

const whyHenryPreview = [
  {
    src: "/media/why-henry/illustrations/01.webp",
    title: "The Forgotten Map",
    caption: "An old map of Briar Glen, annotated in a worried hand.",
  },
  {
    src: "/media/why-henry/illustrations/02.webp",
    title: "The Ancient Hollow Tree",
    caption: "The oldest tree in the glen — a hiding place, a landmark, and a clue.",
  },
  {
    src: "/media/why-henry/illustrations/03.webp",
    title: "The Underground Cavern",
    caption: "Below the roots, Dominick and Henry find a chamber hidden beneath the forest.",
  },
  {
    src: "/media/why-henry/illustrations/04.webp",
    title: "The First Stone Marker",
    caption: "The first piece of a mystery that keeps getting larger.",
  },
];

function ProjectHeroVisual({ p }: { p: Project }) {
  if (p.theme === "henry") {
    return (
      <>
        <Image
          src="/media/why-henry/illustrations/02.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/52 to-transparent" />
        <div className="absolute right-[6%] top-1/2 hidden w-[20%] max-w-[290px] -translate-y-1/2 rotate-[3deg] lg:block">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
            <Image src="/media/why-henry/cover.webp" alt="" fill sizes="290px" className="object-cover" />
          </div>
        </div>
      </>
    );
  }

  if (p.theme === "unfiltr") {
    return (
      <>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_30%,rgb(112_94_255/0.38),transparent_30%),linear-gradient(135deg,#181035_0%,#0a0813_55%,#06060a_100%)]" />
        <div className="absolute right-[7%] top-1/2 hidden w-[22%] max-w-[270px] -translate-y-1/2 rotate-[2deg] lg:block">
          <div className="relative aspect-[9/19] overflow-hidden rounded-[2.2rem] border border-white/12 bg-black p-[6px] shadow-[0_40px_100px_-30px_rgb(105_88_255/0.85)]">
            <div className="relative h-full overflow-hidden rounded-[1.9rem]">
              <Image src="/media/unfiltr/kai-tropical-chat.jpg" alt="" fill sizes="270px" className="object-cover" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (p.theme === "sports") {
    return (
      <>
        <Image
          src="/media/sports-wager-helper/og-image.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/30" />
        <div className="absolute right-[8%] top-1/2 hidden h-40 w-40 -translate-y-1/2 overflow-hidden rounded-[36px] border border-[#a3e635]/25 bg-black/75 p-4 shadow-[0_35px_90px_-25px_rgb(132_204_22/0.6)] lg:block">
          <Image src="/media/sports-wager-helper/swh-icon.svg" alt="" fill sizes="160px" className="object-contain p-3" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_36%,rgb(240_177_71/0.34),transparent_28%),linear-gradient(135deg,#2b180a_0%,#15110d_55%,#080807_100%)]" />
      <div className="absolute right-[8%] top-1/2 hidden w-[20%] max-w-[250px] -translate-y-1/2 rotate-[3deg] lg:block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
          <Image src="/media/memoir/dream-payoff-cover.svg" alt="" fill sizes="250px" className="object-cover" />
        </div>
      </div>
    </>
  );
}

const whyHenryCharacters = [
  {
    src: "/media/why-henry/characters/dominick.png",
    name: "Dominick Xavier St. Clair",
    role: "An ordinary boy facing extraordinary questions",
    text: "Fourteen-year-old Dominick never expected an adventure. With his closest friend beside him, curiosity draws him into a mystery that will test his courage.",
  },
  {
    src: "/media/why-henry/characters/henry.png",
    name: "Henry Mercer",
    role: "The friend at his side",
    text: "Loyal, curious, and impossible to leave out of an adventure, Henry is more than a sidekick. His friendship with Dominick is at the heart of the story.",
  },
];

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const others = projects.filter((o) => o.slug !== p.slug);

  return (
    <article data-testid={`project-page-${p.slug}`}>
      <JsonLd data={structuredData(p)} />
      <header className="relative isolate flex min-h-[78svh] items-end overflow-hidden pb-14 pt-32 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <ProjectHeroVisual p={p} />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-ink/90 to-transparent" />
        <div className="shell">
          <Link href="/#work" data-testid="project-back-link" className="load-in group inline-flex items-center gap-2 text-sm text-mute hover:text-bone">
            <Arrow className="h-4 w-4 rotate-180" /> All projects
          </Link>
          <p className={`load-in eyebrow mt-8 ${accent[p.theme]}`} style={{ "--d": "100ms" } as React.CSSProperties}>
            {p.category === "book" ? "Book" : "App"} · {p.statusLabel}
          </p>
          <h1 data-testid="project-title" className="load-in mt-4 max-w-4xl font-display text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.95]" style={{ "--d": "200ms" } as React.CSSProperties}>
            {p.title}
            {p.subtitle && <span className="block italic text-bone/85">{p.subtitle}</span>}
          </h1>
          <p className="load-in mt-6 max-w-2xl text-xl text-bone/85" style={{ "--d": "300ms" } as React.CSSProperties}>{p.tagline}</p>
        </div>
      </header>

      <section className="shell grid gap-14 py-20 sm:py-28 lg:grid-cols-12" aria-label="About this project">
        <div className="space-y-6 text-lg leading-relaxed text-bone/85 lg:col-span-7">
          {p.description.map((d, i) => (
            <p key={i} data-reveal className={i === 0 ? "font-display text-3xl leading-snug text-bone" : ""}>{d}</p>
          ))}
          {p.features && (
            <ul className="grid gap-3 pt-6 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f.title} data-reveal className="rounded-2xl border border-bone/10 bg-coal p-5">
                  <p className="font-medium text-bone">{f.title}</p>
                  <p className="mt-1 text-base text-mute">{f.text}</p>
                </li>
              ))}
            </ul>
          )}
          <div data-reveal className="flex flex-col gap-3 pt-6 sm:flex-row">
            {p.links.map((l) =>
              l.external ? (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" data-testid="project-primary-cta" className={`btn ${l.primary ? btn[p.theme] : "btn-ghost"}`}>
                  {l.label} <ExternalArrow />
                </a>
              ) : (
                <Link key={l.href} href={l.href} data-testid="project-primary-cta" className={`btn ${l.primary ? btn[p.theme] : "btn-ghost"}`}>
                  {l.label} <Arrow />
                </Link>
              ),
            )}
          </div>
        </div>
        <aside className="space-y-10 lg:col-span-5">
          {p.category === "book" && <div data-reveal className="mx-auto w-[70%] max-w-[340px]"><BookCover project={p} /></div>}
          {p.theme === "unfiltr" && <PhoneMockup />}
          {p.theme === "sports" && (
            <div data-reveal className="mx-auto max-w-[420px] overflow-hidden rounded-[24px] border border-[#a3e635]/15 bg-black/70 p-4">
              <div className="relative aspect-[1200/630] overflow-hidden rounded-[16px]">
                <Image
                  src="/media/sports-wager-helper/og-image.png"
                  alt="Sports Wager Helper"
                  fill
                  sizes="420px"
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <dl data-reveal className="divide-y divide-bone/10 rounded-2xl border border-bone/10 bg-coal/60" data-testid="project-details">
            {p.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-6 px-6 py-4">
                <dt className="text-mute">{d.label}</dt>
                <dd className="text-right text-bone">{d.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {p.theme === "henry" && (
        <section className="shell pb-24 sm:pb-32" aria-labelledby="henry-preview-title">
          <div className="max-w-2xl">
            <p className="eyebrow text-amber">From the book</p>
            <h2 id="henry-preview-title" className="mt-4 font-display text-[clamp(2.5rem,5vw,4.6rem)] leading-[0.98]">
              A glimpse inside Briar Glen.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-mute">
              Four early, non-spoiler illustrations from Book One. The later reveal images stay where they belong: in the story.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {whyHenryPreview.map((item, i) => (
              <figure
                key={item.src}
                data-reveal
                style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
                className="overflow-hidden rounded-[22px] border border-bone/10 bg-coal"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] hover:scale-[1.02]"
                  />
                </div>
                <figcaption className="p-5 sm:p-6">
                  <p className="font-display text-2xl text-bone">{item.title}</p>
                  <p className="mt-2 leading-relaxed text-mute">{item.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {p.theme === "henry" && (
        <section className="shell pb-24 sm:pb-32" aria-labelledby="henry-characters-title">
          <div className="max-w-2xl">
            <p className="eyebrow text-amber">The friendship at the center</p>
            <h2 id="henry-characters-title" className="mt-4 font-display text-[clamp(2.5rem,5vw,4.6rem)] leading-[0.98]">
              Meet Dominick and Henry.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {whyHenryCharacters.map((character, i) => (
              <article
                key={character.name}
                data-reveal
                style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
                className="grid overflow-hidden rounded-[22px] border border-bone/10 bg-coal sm:grid-cols-[minmax(170px,0.75fr)_1.25fr]"
              >
                <div className="relative min-h-[280px] bg-ash">
                  <Image
                    src={character.src}
                    alt={character.name}
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 38vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <p className="font-display text-3xl text-bone">{character.name}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.14em] text-amber">{character.role}</p>
                  <p className="mt-5 leading-relaxed text-mute">{character.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {p.theme === "unfiltr" && p.media.screenshots && (
        <section className="shell pb-24 sm:pb-32" aria-labelledby="unfiltr-screens-title">
          <div className="max-w-2xl">
            <p className="eyebrow text-violet">Real screens</p>
            <h2 id="unfiltr-screens-title" className="mt-4 font-display text-[clamp(2.5rem,5vw,4.6rem)] leading-[0.98]">
              See Unfiltr as it actually looks.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-mute">
              Chat with Kai, write in the Zen Temple journal, and revisit what your companion remembers.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {p.media.screenshots.map((shot, i) => (
              <figure
                key={shot.src}
                data-reveal
                style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
                className="mx-auto w-full max-w-[320px]"
              >
                <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_30px_80px_-30px_rgb(100_80_220/0.65)]">
                  <Image src={shot.src} alt={shot.alt} fill sizes="320px" className="object-cover" />
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="shell pb-28" aria-labelledby="more-title">
        <h2 id="more-title" className="eyebrow">More from IHBNF</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {others.map((o) => (
            <ProjectCard key={o.slug} project={o} className="lg:h-[560px]" />
          ))}
        </div>
      </section>
    </article>
  );
}
