import Image from "next/image";
import { Parallax } from "@/components/ui/Parallax";

const chips = [
  { label: "Memory", pos: "-left-2 top-[18%] sm:-left-10" },
  { label: "Voice", pos: "-right-2 top-[44%] sm:-right-8" },
  { label: "Journal", pos: "-left-3 top-[40%] sm:-left-12" },
];

export function PhoneMockup() {
  return (
    <div data-reveal className="relative mx-auto w-[78%] max-w-[330px]">
      <div aria-hidden="true" className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgb(140_120_255/0.35),transparent_65%)]" />
      <div className="relative aspect-[9/19] rounded-[2.6rem] border border-white/15 bg-black p-2.5 shadow-[0_50px_120px_-30px_rgb(60_40_180/0.6)]">
        <div className="relative h-full overflow-hidden rounded-[2.1rem] bg-black">
          <Image
            src="/media/unfiltr/kai-tropical-chat.jpg"
            alt="Real Unfiltr chat screen with Kai in a tropical sunset world"
            fill
            sizes="330px"
            className="object-cover"
            priority
          />
        </div>
      </div>
      {chips.map((c, i) => (
        <Parallax key={c.label} speed={0.06 + i * 0.03} className={`absolute ${c.pos}`}>
          <span className="glass block rounded-full px-4 py-2 text-xs tracking-wide text-white/85">{c.label}</span>
        </Parallax>
      ))}
    </div>
  );
}
