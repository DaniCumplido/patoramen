// Source: Magic UI "blur-fade" (registry:ui) via magicuidesign-mcp.
// Adapted: `motion/react` -> `framer-motion`; reduced motion => plain fade.
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { motion, useInView, type MotionProps, type Variants } from 'framer-motion';
import { useRef } from 'react';


interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = 'down',
  inView = false,
  inViewMargin = '-50px',
  blur = '6px',
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as never });
  const isInView = !inView || inViewResult;
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const sign = direction === 'right' || direction === 'down' ? -offset : offset;
  const variants: Variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { [axis]: sign, opacity: 0, filter: `blur(${blur})` },
        visible: { [axis]: 0, opacity: 1, filter: 'blur(0px)' },
      };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay: 0.04 + delay, duration: reduce ? 0.2 : duration, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
