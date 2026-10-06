// Source: Magic UI "magic-card" (registry:ui) via magicuidesign-mcp.
// Adapted: `motion/react` -> `framer-motion`, removed `next-themes`, colours via props/CSS vars
// (--c-* variables are injected from brand.json by Layout.astro), "gradient" mode only.
import React, { useCallback, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  fill?: string;
}

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientColor = 'rgba(224,169,59,0.14)',
  gradientOpacity = 1,
  gradientFrom = 'var(--c-primary)',
  gradientTo = 'var(--c-lacquer)',
  fill = 'var(--c-surface)',
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    reset();
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) reset();
    };
    const onVis = () => document.visibilityState !== 'visible' && reset();
    window.addEventListener('pointerout', onOut);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pointerout', onOut);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reset]);

  const border = useMotionTemplate`linear-gradient(${fill} 0 0) padding-box, radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, var(--c-line) 100%) border-box`;
  const glow = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`;

  return (
    <motion.div
      className={cn('group relative isolate overflow-hidden rounded-[inherit] border border-transparent', className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ background: border }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit]" style={{ background: fill }} />
      <motion.div
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow, opacity: gradientOpacity }}
      />
      <div className="relative z-40">{children}</div>
    </motion.div>
  );
}
