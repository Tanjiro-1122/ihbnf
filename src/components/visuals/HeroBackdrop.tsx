const particles = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: 55 + ((i * 53) % 45),
  size: 1 + (i % 3),
  t: 16 + ((i * 7) % 14),
  d: -((i * 5) % 20),
  dx: ((i % 5) - 2) * 14,
  o: 0.25 + (i % 4) * 0.12,
}));

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="anim-drift-a absolute -right-[20%] -top-[30%] h-[110vh] w-[110vh] rounded-full bg-[radial-gradient(circle,rgb(201_164_92/0.2),transparent_62%)]" />
      <div className="anim-drift-b absolute -bottom-[35%] -left-[25%] h-[100vh] w-[100vh] rounded-full bg-[radial-gradient(circle,rgb(90_73_201/0.18),transparent_62%)]" />
      <div className="absolute left-1/2 top-[-60%] h-[160vh] w-[160vh] -translate-x-1/2 opacity-[0.35]">
        <div className="anim-spin-slow h-full w-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgb(237_230_218/0.06)_20deg,transparent_45deg,transparent_180deg,rgb(125_156_196/0.06)_205deg,transparent_230deg)]" />
      </div>
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle absolute rounded-full bg-[#f2d59c]"
          style={
            {
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              "--t": `${p.t}s`,
              "--d": `${p.d}s`,
              "--dx": `${p.dx}px`,
              "--o": p.o,
            } as React.CSSProperties
          }
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink" />
    </div>
  );
}
