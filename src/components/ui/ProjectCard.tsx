import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content/types";
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

function HenryVisual() {
  return (
    <>
      <Image
        src="/media/why-henry/illustrations/02.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="object-cover object-center opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/58 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/20" />
      <div className="absolute right-[6%] top-1/2 hidden w-[31%] max-w-[250px] -translate-y-1/2 rotate-[4deg] sm:block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] shadow-[0_35px_80px_-25px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
          <Image
            src="/media/why-henry/cover.webp"
            alt="The Unwritten Journey — Book One: Why Henry? cover"
            fill
            sizes="250px"
            className="object-cover"
          />
        </div>
      </div>
    </>
  );
}

function UnfiltrVisual() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgb(103_80_255/0.34),transparent_34%),linear-gradient(145deg,#17102f_0%,#0b0914_54%,#07070c_100%)]" />
      <div className="absolute right-[7%] top-1/2 w-[45%] max-w-[245px] -translate-y-1/2 rotate-[2deg]">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] border border-white/12 bg-black p-[6px] shadow-[0_40px_90px_-30px_rgb(104_88_255/0.8)]">
          <div className="relative h-full overflow-hidden rounded-[1.7rem]">
            <Image
              src="/media/unfiltr/kai-tropical-chat.jpg"
              alt="Real Unfiltr chat screen with Kai"
              fill
              sizes="245px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/52 to-transparent" />
    </>
  );
}

function MemoirVisual() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_45%,rgb(238_177_71/0.28),transparent_32%),linear-gradient(135deg,#2b180a_0%,#12100e_52%,#080807_100%)]" />
      <div className="absolute right-[8%] top-1/2 hidden w-[24%] max-w-[190px] -translate-y-1/2 rotate-[3deg] sm:block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[4px] shadow-[0_35px_80px_-25px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
          <Image
            src="/media/memoir/dream-payoff-cover.svg"
            alt="The Dream of the Payoff cover"
            fill
            sizes="190px"
            className="object-cover"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/58 to-transparent" />
    </>
  );
}

function CardVisual({ theme }: { theme: Project["theme"] }) {
  if (theme === "henry") return <HenryVisual />;
  if (theme === "unfiltr") return <UnfiltrVisual />;
  return <MemoirVisual />;
}

export function ProjectCard({ project, className = "", delay = 0 }: Props) {
  const { card, theme, slug } = project;
  return (
    <div data-reveal style={{ "--d": `${delay}ms` } as React.CSSProperties} className={className}>
      <Link
        href={`/projects/${slug}`}
        data-testid={`project-card-${slug}`}
        className={`group relative isolate block h-full min-h-[520px] overflow-hidden rounded-[24px] bg-coal ring-1 ring-bone/[0.08] transition-[box-shadow,transform] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1 sm:min-h-[560px] lg:min-h-0 ${glow[theme]}`}
      >
        <div className="absolute inset-0 -z-10 transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.025]">
          <CardVisual theme={theme} />
        </div>

        <div className={`flex h-full flex-col justify-end p-6 sm:p-10 ${theme === "unfiltr" ? "pr-[45%] sm:pr-[48%]" : "sm:pr-[34%]"}`}>
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
