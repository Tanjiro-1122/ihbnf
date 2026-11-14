const pillars = [
  { title: "Books", text: "Young-adult fantasy, and a memoir in progress." },
  { title: "Apps", text: "Unfiltr by Javier, on iOS and Android." },
  { title: "What's next", text: "More stories and more tools, built the same way." },
];

export function BrandStatement() {
  return (
    <section aria-labelledby="statement-title" data-testid="brand-statement-section" className="relative py-28 sm:py-40">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <p data-reveal className="eyebrow lg:col-span-3">
          <span className="text-gold">00</span> — The umbrella
        </p>
        <div className="lg:col-span-9">
          <h2 id="statement-title" data-reveal className="font-display text-[clamp(2rem,4.4vw,4rem)] leading-[1.08] text-bone">
            IHBNF is the name on everything Javier Huertas makes.{" "}
            <span className="text-mute">Books, apps, and whatever comes next.</span> Different projects, one rule behind
            all of them: <em className="text-gold">nothing happens until you do the work.</em>
          </h2>
          <dl className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-bone/[0.08] bg-bone/[0.08] sm:grid-cols-3">
            {pillars.map((p, i) => (
              <div key={p.title} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties} className="bg-ink p-6 sm:p-8">
                <dt className="eyebrow text-bone">{p.title}</dt>
                <dd className="mt-3 leading-relaxed text-mute">{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
