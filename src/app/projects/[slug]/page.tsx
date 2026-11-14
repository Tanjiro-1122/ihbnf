import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import type { Project } from "@/content/types";
import { ProjectVisual } from "@/components/visuals/ProjectVisual";
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
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: p.fullTitle,
      url,
      operatingSystem: "iOS, Android",
      applicationCategory: "EntertainmentApplication",
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

const accent: Record<Project["theme"], string> = { henry: "text-amber", unfiltr: "text-violet", memoir: "text-gold" };
const btn: Record<Project["theme"], string> = { henry: "btn-gold", unfiltr: "btn-violet", memoir: "btn-primary" };

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

export default async function ProjectPage({ params }: Params) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const others = projects.filter((o) => o.slug !== p.slug);

  return (
    <article data-testid={`project-page-${p.slug}`}>
      <JsonLd data={structuredData(p)} />
      <header className="relative isolate flex min-h-[78svh] items-end overflow-hidden pb-14 pt-32 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <ProjectVisual project={p} sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
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
          {p.theme === "henry" && <div data-reveal className="mx-auto w-[70%] max-w-[340px]"><BookCover project={p} /></div>}
          {p.theme === "unfiltr" && <PhoneMockup />}
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
