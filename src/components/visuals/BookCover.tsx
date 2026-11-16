import Image from "next/image";
import type { Project } from "@/content/types";

// Uses the real cover when project.media.cover is set; otherwise a typographic stand-in.
export function BookCover({ project, className = "" }: { project: Project; className?: string }) {
  const { cover, artwork } = project.media;
  return (
    <div className={className} data-testid={`book-cover-${project.slug}`}>
      <div className="relative aspect-[2/3] w-full">
        <div className="absolute inset-0 overflow-hidden rounded-[3px] shadow-[20px_28px_60px_-25px_rgb(0_0_0/0.7)]">
          {cover ? (
            <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 380px, 70vw" className="object-contain" />
          ) : (
            <>
              {artwork && <Image src={artwork.src} alt="" fill sizes="(min-width: 1024px) 380px, 70vw" className="scale-[1.6] object-cover object-[45%_60%]" />}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c0d0b]/90 via-[#0c0d0b]/25 to-[#0c0d0b]/95" />
              <div className="absolute inset-0 flex flex-col items-center justify-between px-[8%] py-[10%] text-center">
                <p className="text-[clamp(0.55rem,1.4vw,0.72rem)] tracking-[0.42em] text-[#e9c98a]">THE UNWRITTEN JOURNEY</p>
                <div>
                  <p className="text-[clamp(0.55rem,1.3vw,0.7rem)] uppercase tracking-[0.3em] text-bone/70">Book One</p>
                  <p className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-none text-bone">Why Henry?</p>
                </div>
                <p className="text-[clamp(0.55rem,1.4vw,0.75rem)] tracking-[0.36em] text-bone/85">JAVIER HUERTAS</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
