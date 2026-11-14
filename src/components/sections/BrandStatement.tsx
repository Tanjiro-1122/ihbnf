const pillars = [
  { title: "Books", text: "Fantasy, memoir, and more stories already waiting their turn." },
  { title: "Apps", text: "Unfiltr, Sports Wager Helper, and the tools that started as “what if?”" },
  { title: "The method", text: "Build it. Break something. Learn why. Fix it. Keep going." },
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
            IHBNF is where I put the things I actually finish.{" "}
            <span className="text-mute">Books, apps, sports tech, and whatever idea talks me into more work next.</span>{" "}
            Different projects, same rule: <em className="text-gold">nothing happens until you do the work.</em>
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
