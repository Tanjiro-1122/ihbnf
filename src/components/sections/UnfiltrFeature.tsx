import Link from "next/link";
import { getProject } from "@/content/projects";
import { links } from "@/content/site";
import { Arrow, ExternalArrow } from "@/components/ui/Icons";
import { PhoneMockup } from "@/components/visuals/PhoneMockup";

export function UnfiltrFeature() {
  const app = getProject("unfiltr")!;
  return (
    <section id="apps" aria-labelledby="unfiltr-title" data-testid="unfiltr-section" className="relative isolate overflow-hidden py-28 sm:py-40">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#0b0914]">
        <div className="anim-drift-a absolute -left-[20%] top-[5%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgb(110_92_240/0.32),transparent_65%)]" />
        <div className="anim-drift-b absolute -right-[15%] bottom-[-10%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgb(90_140_220/0.2),transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="shell grid items-center gap-16 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <PhoneMockup />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-7">
          <p data-reveal className="eyebrow flex flex-wrap items-center gap-3 text-violet">
            <span className="text-gold">03</span>
            <span className="h-px w-8 bg-violet/40" />
            Unfiltr by Javier · iOS &amp; Android
          </p>
          <h2 id="unfiltr-title" data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="mt-6 font-display text-[clamp(2.8rem,6.6vw,5.8rem)] leading-[0.96]">
            Conversation that <em className="text-violet">remembers.</em>
          </h2>
          <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties} className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
            Unfiltr is an AI companion app built around persistent memory, so a conversation picks up where it left off.
            Around that sit voice, immersive chat worlds, journaling, meditation, and experiences shaped around you.
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {app.features!.map((f, i) => (
              <li key={f.title} data-reveal style={{ "--d": `${i * 60}ms` } as React.CSSProperties} data-testid={`unfiltr-feature-${i}`} className="glass rounded-2xl p-5">
                <p className="font-medium text-bone">{f.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#b9b2c9]">{f.text}</p>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/projects/unfiltr" data-testid="unfiltr-explore-btn" className="btn btn-violet">
              Explore Unfiltr <Arrow />
            </Link>
            <a href={links.unfiltrSite} target="_blank" rel="noopener noreferrer" data-testid="unfiltr-visit-website-btn" className="btn btn-ghost">
              Visit Website <ExternalArrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
