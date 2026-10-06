// Source: Magic UI "animated-shiny-text" (registry:ui) via magicuidesign-mcp.
// Adapted to Tailwind v3 + brand colours (gold shimmer on muted base).
import { type ComponentPropsWithoutRef, type CSSProperties, type FC } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<'span'> {
  shimmerWidth?: number;
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({ children, className, shimmerWidth = 100, ...props }) => (
  <span
    style={{ '--shiny-width': `${shimmerWidth}px` } as CSSProperties}
    className={cn(
      'animate-shiny-text text-muted/80 motion-reduce:animate-none',
      'bg-clip-text [background-position:0_0] [background-repeat:no-repeat] [background-size:var(--shiny-width)_100%]',
      'bg-gradient-to-r from-transparent via-primary via-50% to-transparent',
      className,
    )}
    {...props}
  >
    {children}
  </span>
);
