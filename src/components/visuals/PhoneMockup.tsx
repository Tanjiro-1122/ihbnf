import { Parallax } from "@/components/ui/Parallax";

const chips = [
  { label: "Memory", pos: "-left-2 top-[18%] sm:-left-10" },
  { label: "Voice", pos: "-right-2 top-[44%] sm:-right-8" },
  { label: "Journal", pos: "-left-3 top-[40%] sm:-left-12" },
];

// Illustrative interface. Replace with real screenshots via project.media.screenshots.
export function PhoneMockup() {
  return (
    <div data-reveal className="relative mx-auto w-[78%] max-w-[330px]" aria-hidden="true">
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgb(140_120_255/0.35),transparent_65%)]" />
      <div className="relative aspect-[9/19] rounded-[2.6rem] border border-white/15 bg-[#07060f] p-2.5 shadow-[0_50px_120px_-30px_rgb(60_40_180/0.6)]">
        <div className="relative h-full overflow-hidden rounded-[2.1rem] bg-[linear-gradient(170deg,#1d1640,#0d0a1f_55%,#121a38)]">
          <div className="absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute -right-10 top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgb(169_156_255/0.45),transparent_65%)]" />
          <div className="relative flex h-full flex-col px-4 pb-5 pt-14">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-[conic-gradient(from_90deg,#b9adff,#6e5cf0,#8fb3ff,#b9adff)]" />
              <div>
                <p className="text-sm font-medium text-white/90">Unfiltr</p>
                <p className="text-[11px] text-white/50">remembers your last chat</p>
              </div>
            </div>
            <div className="mt-auto space-y-3 text-[13px] leading-snug">
              <p className="text-center text-[11px] uppercase tracking-[0.2em] text-white/35">Tuesday</p>
              <p className="glass max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-white/85">Rough week. Thursday is the big one.</p>
              <p className="pb-2 text-center text-[11px] uppercase tracking-[0.2em] text-white/35">Today</p>
              <p className="glass max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-white/85">
                Last time you said the week felt heavy. How did Thursday go?
              </p>
              <p className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-[#a99cff] px-3.5 py-2.5 text-[#130e2c]">
                Better than I expected, actually.
              </p>
              <p className="glass max-w-[60%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-white/85">Tell me everything.</p>
              <div className="glass mt-4 flex items-center justify-between rounded-full px-4 py-3 text-white/40">
                <span>Message</span>
                <span className="flex gap-0.5">
                  {[8, 14, 10, 16, 9].map((h, i) => (
                    <span key={i} className="w-0.5 rounded-full bg-violet/80" style={{ height: h }} />
                  ))}
                </span>
              </div>
            </div>
          </div>
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
