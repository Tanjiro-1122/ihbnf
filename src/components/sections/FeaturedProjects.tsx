import { projects } from "@/content/projects";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const layout: Record<string, string> = {
  henry: "lg:col-span-7 lg:h-[720px]",
  unfiltr: "lg:col-span-5 lg:h-[720px]",
  sports: "lg:col-span-6 lg:h-[560px]",
  memoir: "lg:col-span-6 lg:h-[560px]",
};

export function FeaturedProjects() {
  return (
    <section id="work" aria-labelledby="work-title" data-testid="projects-section" className="relative pb-28 sm:pb-40">
      <div className="shell">
        <SectionHeading
          id="work-title"
          index="01"
          label="The work"
          title={<>Things I somehow turned into real things.</>}
          intro="Books, apps, sports tech, and the occasional idea that probably sounded simpler before I started building it."
        />
        <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-12">
          {projects.map((p, i) => (
            <ProjectCard key={p.slug} project={p} className={layout[p.theme]} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
