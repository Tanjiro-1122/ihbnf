// Six markers that glow in sequence. A quiet nod to the book.
export function StoneMarkers({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-end gap-3 ${className}`}>
      {[22, 30, 18, 34, 24, 28].map((h, i) => (
        <span
          key={i}
          className="anim-stone block w-2 rounded-t-full bg-gradient-to-t from-amber/30 to-[#f2d59c]"
          style={{ height: h, "--d": `${i * 700}ms` } as React.CSSProperties}
        />
      ))}
      <span className="mb-1 ml-2 h-px w-16 bg-gradient-to-r from-amber/50 to-transparent" />
    </div>
  );
}
