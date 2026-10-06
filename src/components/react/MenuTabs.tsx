import { useId, useRef, useState } from 'react';
import brand from '../../data/brand.json';
import { BlurFade } from '../ui/blur-fade';
import { cn } from '@/lib/utils';

const { categories } = brand.menu;

export default function MenuTabs() {
  const uid = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cat = categories[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % categories.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + categories.length) % categories.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = categories.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={brand.menu.eyebrow}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              ref={(el) => (tabs.current[i] = el)}
              role="tab"
              type="button"
              id={`${uid}-tab-${c.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${c.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'group relative shrink-0 rounded-full border px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500',
                selected
                  ? 'border-primary bg-primary text-on-primary shadow-[0_0_30px_-8px_rgba(224,169,59,0.7)]'
                  : 'border-line text-ink/85 hover:border-primary/60 hover:text-primary',
              )}
            >
              {c.name}
              <span lang="zh-Hans" className={cn('ml-3 font-cjk text-sm font-normal tracking-normal', selected ? 'text-on-primary' : 'text-secondary')}>
                {c.aside}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${uid}-panel-${cat.id}`}
        aria-labelledby={`${uid}-tab-${cat.id}`}
        tabIndex={0}
        className="relative mt-10 min-h-[22rem] rounded-sm border border-line bg-surface/70 p-6 md:p-12"
      >
        <span
          aria-hidden="true"
          lang="zh-Hans"
          className="kanji-v pointer-events-none absolute right-4 top-4 hidden text-[9rem] opacity-[0.07] md:block"
        >
          {cat.aside}
        </span>
        <ul key={cat.id} className="relative grid gap-x-16 gap-y-9 md:grid-cols-2">
          {cat.items.map((item, i) => (
            <li key={item.name}>
              <BlurFade delay={i * brand.motion.stagger} direction="up" offset={14} duration={0.6}>
                <div className="flex items-baseline gap-3">
                  <h3 className="font-serif text-2xl font-medium text-ink md:text-[1.7rem]">{item.name}</h3>
                  <span aria-hidden="true" className="mb-1 h-px flex-1 border-b border-dotted border-secondary/50" />
                  <span className="font-serif text-xl text-primary md:text-2xl">{item.price}</span>
                </div>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{item.description}</p>
                {(item.note || item.tags.length > 0) && (
                  <p className="mt-3 flex flex-wrap gap-2">
                    {item.note && (
                      <span className="rounded-full border border-primary/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-primary">
                        {item.note}
                      </span>
                    )}
                    {item.tags.map((t) => (
                      <span key={t} className="rounded-full border border-line px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                        {t}
                      </span>
                    ))}
                  </p>
                )}
              </BlurFade>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
