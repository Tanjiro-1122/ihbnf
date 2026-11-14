import { Mark } from "@/components/layout/Logo";
import { Parallax } from "@/components/ui/Parallax";

const steps = ["Create", "Build", "Break it", "Fix it", "Learn", "Keep moving"];

export function Philosophy() {
  return (
    <section id="philosophy" aria-labelledby="philosophy-title" data-testid="philosophy-section" className="relative isolate overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="anim-drift-a absolute right-[-10%] top-[10%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgb(201_164_92/0.14),transparent_65%)]" />
        <Parallax speed={-0.1} className="absolute -left-[10%] bottom-[-10%] text-gold/[0.06]">
          <Mark className="h-[80vw] w-[80vw] max-h-[700px] max-w-[700px]" />
        </Parallax>
      </div>
      <div className="shell">
        <p data-reveal className="eyebrow flex items-center gap-3">
          <span className="text-gold">07</span>
          <span className="h-px w-8 bg-bone/20" />
          The philosophy
        </p>
        <h2 id="philosophy-title" data-reveal className="mt-8 max-w-[14ch] font-display text-[clamp(3.2rem,9vw,8rem)] leading-[0.9] tracking-[-0.02em]">
          Idle hands bear <em className="text-gold">no fruit.</em>
        </h2>
        <p data-reveal className="mt-8 max-w-xl text-xl leading-relaxed text-mute">
          Basically: stop talking about it and make the thing. Then expect something to break, fix it, learn from it, and keep moving.
        </p>
        <ol className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {steps.map((s, i) => (
            <li key={s} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties} className="border-t border-bone/15 pt-5">
              <span className="text-xs tracking-[0.2em] text-gold">0{i + 1}</span>
              <p className="mt-3 font-display text-3xl text-bone sm:text-[2.1rem]">{s}.</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
