import { useEffect, useState } from 'react';

/**
 * SSR-safe prefers-reduced-motion. framer-motion's own hook reads matchMedia during the first
 * client render, which differs from the server HTML and causes hydration errors (#418/#423).
 * This one starts at `false` (same as the server) and syncs after mount.
 */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}
