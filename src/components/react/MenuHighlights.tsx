import { useReducedMotion } from '@/lib/use-reduced-motion';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

import brand from '../../data/brand.json';
import { MagicCard } from '../ui/magic-card';

const { highlights } = brand.menu;

function Tilt({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="h-full rounded-sm"
    >
      {children}
    </motion.div>
  );
}

export default function MenuHighlights() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {highlights.map((h, i) => (
        <li key={h.title} className={i % 2 === 1 ? 'lg:mt-12' : ''}>
          <Tilt>
            <MagicCard className="h-full rounded-sm">
              <article className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={h.image}
                    alt={h.alt}
                    width={2400}
                    height={3000}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-serif text-3xl font-light leading-none text-ink">{h.title}</h3>
                    <p className="mt-2 text-sm leading-snug text-ink/85">{h.description}</p>
                  </div>
                </div>
              </article>
            </MagicCard>
          </Tilt>
        </li>
      ))}
    </ul>
  );
}
