// Source: React Bits "ShinyText" (@react-bits/ShinyText-TS-TW), fetched from reactbits.dev registry.
// Adapted: `motion/react` -> `framer-motion`; paused under prefers-reduced-motion.
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  delay?: number;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 3,
  className = '',
  color = 'var(--c-secondary)',
  shineColor = 'var(--c-text)',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
}) => {
  const reduce = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const directionRef = useRef(direction === 'left' ? 1 : -1);

  const animationDuration = speed * 1000;
  const delayDuration = delay * 1000;

  useAnimationFrame((time) => {
    if (disabled || isPaused || reduce) {
      lastTimeRef.current = null;
      return;
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    const dir = directionRef.current;
    if (yoyo) {
      const cycleDuration = animationDuration + delayDuration;
      const cycleTime = elapsedRef.current % (cycleDuration * 2);
      if (cycleTime < animationDuration) {
        const p = (cycleTime / animationDuration) * 100;
        progress.set(dir === 1 ? p : 100 - p);
      } else if (cycleTime < cycleDuration) {
        progress.set(dir === 1 ? 100 : 0);
      } else if (cycleTime < cycleDuration + animationDuration) {
        const p = 100 - ((cycleTime - cycleDuration) / animationDuration) * 100;
        progress.set(dir === 1 ? p : 100 - p);
      } else {
        progress.set(dir === 1 ? 0 : 100);
      }
    } else {
      const cycleDuration = animationDuration + delayDuration;
      const cycleTime = elapsedRef.current % cycleDuration;
      if (cycleTime < animationDuration) {
        const p = (cycleTime / animationDuration) * 100;
        progress.set(dir === 1 ? p : 100 - p);
      } else {
        progress.set(dir === 1 ? 100 : 0);
      }
    }
  });

  useEffect(() => {
    directionRef.current = direction === 'left' ? 1 : -1;
    elapsedRef.current = 0;
    progress.set(0);
  }, [direction, progress]);

  const backgroundPosition = useTransform(progress, (p) => `${150 - p * 2}% center`);
  const onEnter = useCallback(() => pauseOnHover && setIsPaused(true), [pauseOnHover]);
  const onLeave = useCallback(() => pauseOnHover && setIsPaused(false), [pauseOnHover]);

  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{ ...gradientStyle, backgroundPosition }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
