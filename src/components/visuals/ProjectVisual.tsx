import Image from "next/image";
import type { Project } from "@/content/types";
import { UnfiltrAtmosphere } from "./UnfiltrAtmosphere";

type Props = { project: Project; sizes: string; priority?: boolean };

// Shows the project's artwork, or a themed abstract visual when no artwork is set.
export function ProjectVisual({ project, sizes, priority = false }: Props) {
  const art = project.media.artwork;
  if (art) {
    return (
      <Image
        src={art.src}
        alt={art.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }
  if (project.theme === "unfiltr") return <UnfiltrAtmosphere />;
  return <div className="h-full w-full bg-[radial-gradient(ellipse_at_30%_20%,rgb(201_164_92/0.25),transparent_60%)]" />;
}
