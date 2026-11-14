import Image from "next/image";
import type { Project } from "@/content/types";

// Uses the real cover when project.media.cover is set; otherwise a typographic stand-in.
export function BookCover({ project, className = "" }: { project: Project; className?: string }) {
  const { cover, artwork } = project.media;
  return (
    <div className={`group/book [perspective:1600px] ${className}`} data-testid={`book-cover-${project.slug}`}>
      <div className="relative aspect-[2/3] w-full transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] [transform:rotateY(-16deg)_rotateX(4deg)] [transform-style:preserve-3d] group-hover/book:[transform:rotateY(-6deg)_rotateX(2deg)]">
        <div className="absolute inset-y-[1.2%] right-[-10px] w-[12px] rounded-r-sm bg-gradient-to-r from-[#d9cdb6] to-[#a99d86] [transform:rotateY(90deg)] [transform-origin:left]" />
        <div className="absolute inset-0 overflow-hidden rounded-[3px] shadow-[30px_40px_80px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
          {cover ? (
            <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 380px, 70vw" className="object-cover" />
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
          <div className="absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}
