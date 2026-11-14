import Link from "next/link";
import type { Project } from "@/content/types";
import { ProjectVisual } from "@/components/visuals/ProjectVisual";
import { Arrow } from "./Icons";

const glow: Record<Project["theme"], string> = {
  henry: "hover:shadow-[0_40px_120px_-40px_rgb(217_140_63/0.45)]",
  unfiltr: "hover:shadow-[0_40px_120px_-40px_rgb(120_100_255/0.5)]",
  memoir: "hover:shadow-[0_40px_120px_-40px_rgb(201_164_92/0.35)]",
};

const accent: Record<Project["theme"], string> = {
  henry: "text-amber",
  unfiltr: "text-violet",
  memoir: "text-gold",
};

type Props = { project: Project; className?: string; delay?: number };

export function ProjectCard({ project, className = "", delay = 0 }: Props) {
  const { card, theme, slug } = project;
  return (
    <div data-reveal style={{ "--d": `${delay}ms` } as React.CSSProperties} className={className}>
      <Link
        href={`/projects/${slug}`}
        data-testid={`project-card-${slug}`}
        className={`group relative isolate block h-full min-h-[520px] overflow-hidden rounded-[24px] bg-coal ring-1 ring-bone/[0.08] transition-[box-shadow,transform] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1 sm:min-h-[560px] lg:min-h-0 ${glow[theme]}`}
      >
        <div className="absolute inset-0 -z-10 transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]">
          <ProjectVisual project={project} sizes="(min-width: 1024px) 60vw, 100vw" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
        <div className="flex h-full flex-col justify-end p-6 sm:p-10">
          <p className={`eyebrow ${accent[theme]}`}>{card.kicker}</p>
          <h3 className="mt-4 max-w-xl text-[clamp(1.6rem,3vw,2.4rem)] font-medium uppercase leading-[1.05] tracking-[0.04em]">
            {card.title}
          </h3>
          {card.subtitle && <p className="mt-2 font-display text-2xl italic text-bone/90 sm:text-3xl">{card.subtitle}</p>}
          <p className="mt-4 max-w-md leading-relaxed text-mute">{card.description}</p>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-bone">
            {card.cta} <Arrow />
            <span className="ml-1 h-px w-0 bg-current transition-[width] duration-500 group-hover:w-10" />
          </span>
        </div>
      </Link>
    </div>
  );
}
