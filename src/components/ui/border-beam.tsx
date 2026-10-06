// Source: Magic UI "border-beam" (registry:ui) via magicuidesign-mcp.
// Adapted: `motion/react` -> `framer-motion`, Tailwind v3 syntax, reduced-motion aware.

import { useReducedMotion } from '@/lib/use-reduced-motion';
import { motion, type MotionStyle, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = 'var(--c-primary)',
  colorTo = 'var(--c-lacquer)',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [-webkit-mask-composite:xor]"
      style={{ borderWidth, borderStyle: 'solid' }}
    >
      <motion.div
        className={cn('absolute aspect-square bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent', className)}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` } as never}
        animate={
          {
            offsetDistance: reverse
              ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
              : [`${initialOffset}%`, `${100 + initialOffset}%`],
          } as never
        }
        transition={{ repeat: Infinity, ease: 'linear', duration, delay: -delay, ...transition }}
      />
    </div>
  );
};
