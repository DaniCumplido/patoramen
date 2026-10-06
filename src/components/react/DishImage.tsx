import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import brand from '../../data/brand.json';
import { cn } from '@/lib/utils';

const DistortionCanvas = lazy(() => import('./DistortionCanvas'));

interface Props {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

/**
 * Plain <img> (SSR, mobile, reduced-motion, no-hover devices) that upgrades to a WebGL liquid
 * distortion canvas on hover. The canvas is mounted lazily on first hover and unmounted shortly
 * after leave, so at most one WebGL context lives per hovered image.
 */
export default function DishImage({ src, alt, className, imgClassName, eager = false }: Props) {
  const [capable, setCapable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const wrap = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const mq = window.matchMedia(
      `(min-width: ${brand.motion.mobileFallbacks.below}px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`,
    );
    const update = () => setCapable(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      clearTimeout(leaveTimer.current);
    };
  }, []);

  const enter = () => {
    if (!capable) return;
    clearTimeout(leaveTimer.current);
    setMounted(true);
    setHovered(true);
  };
  const leave = () => {
    setHovered(false);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      setMounted(false);
      setReady(false);
    }, 900);
  };
  const move = (e: React.PointerEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    mouse.current.x = (e.clientX - r.left) / r.width;
    mouse.current.y = 1 - (e.clientY - r.top) / r.height;
  };

  return (
    <div
      ref={wrap}
      className={cn('relative h-full w-full overflow-hidden', className)}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onPointerMove={move}
    >
      <img
        src={src}
        alt={alt}
        width={2400}
        height={1600}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        crossOrigin="anonymous"
        className={cn(
          'h-full w-full object-cover transition-transform duration-[1200ms] ease-out',
          !capable && 'hover:scale-[1.04]',
          imgClassName,
        )}
      />
      {mounted && (
        <div
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0 transition-opacity duration-500', ready && hovered ? 'opacity-100' : 'opacity-0')}
        >
          <Suspense fallback={null}>
            <DistortionCanvas src={src} hovered={hovered} mouse={mouse} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
