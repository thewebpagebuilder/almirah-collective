export function Marquee({
  items,
}: {
  items: { outlet: string; quote: string }[];
}) {
  const loop = [...items, ...items];
  return (
    <section className="overflow-hidden border-y border-obsidian/10 bg-beige/60 py-8">
      <div className="flex w-max animate-marquee gap-16 hover:[animation-play-state:paused]">
        {loop.map((item, i) => (
          <div key={`${item.outlet}-${i}`} className="flex max-w-md items-center gap-4">
            <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-champagne-dark">
              {item.outlet}
            </span>
            <p className="font-serif text-lg italic text-obsidian/80 md:text-xl">
              “{item.quote}”
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
