type Props = {
  index: string;
  label: string;
  title: React.ReactNode;
  intro?: string;
  id?: string;
};

export function SectionHeading({ index, label, title, intro, id }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <p data-reveal className="eyebrow flex items-center gap-3">
          <span className="text-gold">{index}</span>
          <span className="h-px w-8 bg-bone/20" />
          {label}
        </p>
        <h2 id={id} data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="mt-5 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.01em]">
          {title}
        </h2>
      </div>
      {intro && (
        <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties} className="max-w-md text-lg leading-relaxed text-mute lg:col-span-5 lg:justify-self-end">
          {intro}
        </p>
      )}
    </div>
  );
}
