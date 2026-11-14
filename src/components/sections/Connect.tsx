import { socials } from "@/content/site";
import { SocialIcon, ExternalArrow } from "@/components/ui/Icons";
import { EmailReveal } from "@/components/ui/EmailReveal";

export function Connect() {
  return (
    <section id="connect" aria-labelledby="connect-title" data-testid="connect-section" className="relative border-t border-bone/[0.06] py-24 sm:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal className="eyebrow flex items-center gap-3">
            <span className="text-gold">07</span>
            <span className="h-px w-8 bg-bone/20" />
            Connect
          </p>
          <h2 id="connect-title" data-reveal className="mt-6 font-display text-[clamp(2.8rem,6vw,5rem)] leading-[0.96]">
            Follow the work.
          </h2>
          <p data-reveal className="mt-6 max-w-md text-lg leading-relaxed text-mute">
            Book news, app updates, and what&apos;s being built right now. Pick wherever you already spend your time.
          </p>
          <div data-reveal className="mt-10">
            <EmailReveal />
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:col-span-7">
          {socials.map((s, i) => (
            <li key={s.key} data-reveal style={{ "--d": `${i * 50}ms` } as React.CSSProperties}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`social-link-${s.key}`}
                aria-label={`${s.label}: ${s.handle} (opens in a new tab)`}
                className="group flex min-h-[5rem] items-center gap-4 rounded-2xl border border-bone/10 bg-coal/60 px-5 py-4 transition-[border-color,background-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:border-gold/40 hover:bg-ash"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bone/[0.06] text-bone transition-colors duration-500 group-hover:bg-gold group-hover:text-ink">
                  <SocialIcon name={s.key} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-bone">{s.label}</span>
                  <span className="block truncate text-sm text-mute">{s.handle}</span>
                </span>
                <ExternalArrow className="h-4 w-4 shrink-0 text-mute transition-colors group-hover:text-gold" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
