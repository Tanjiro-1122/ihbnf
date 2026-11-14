// Abstract Unfiltr visual. Swap for real promotional media via project.media.artwork.
export function UnfiltrAtmosphere() {
  return (
    <div aria-hidden="true" className="relative h-full w-full overflow-hidden bg-[#0d0a1f]">
      <div className="anim-drift-a absolute -left-1/4 -top-1/4 h-[90%] w-[90%] rounded-full bg-[radial-gradient(circle,rgb(124_104_255/0.55),transparent_65%)]" />
      <div className="anim-drift-b absolute -bottom-1/4 -right-1/4 h-[80%] w-[80%] rounded-full bg-[radial-gradient(circle,rgb(80_130_220/0.4),transparent_65%)]" />
      <div className="absolute left-1/2 top-[38%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 sm:h-56 sm:w-56">
        <div className="anim-spin-slow h-full w-full rounded-full bg-[conic-gradient(from_40deg,#b9adff,#6e5cf0,#2b1f7a,#8fb3ff,#b9adff)] opacity-80 blur-[2px]" />
        <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.55),rgb(40_30_110/0.2)_45%,#0d0a1f_80%)]" />
      </div>
      <div className="glass anim-bob absolute left-[10%] top-[16%] rounded-2xl rounded-bl-md px-4 py-3 text-xs text-white/80">
        Picking up where we left off.
      </div>
      <div className="glass anim-bob absolute right-[9%] top-[52%] rounded-2xl rounded-br-md bg-[#2a2160]/60 px-4 py-3 text-xs text-white/90 [animation-delay:-3s]">
        I remember.
      </div>
    </div>
  );
}
