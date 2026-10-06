// Source: React Bits "SplitText" (@react-bits/SplitText-TS-TW), fetched from reactbits.dev registry.
// Adapted: no @gsap/react dependency (gsap.context + cleanup), SSR-safe, reduced-motion = static text,
// ScrollTrigger kill on cleanup.
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  start?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'blockquote';
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 40,
  duration = 1.1,
  ease = 'power3.out',
  splitType = 'words',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  start = 'top 85%',
  tag = 'p',
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

    let split: GSAPSplitText | undefined;
    let tween: gsap.core.Tween | undefined;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      split = new GSAPSplitText(el, { type: splitType, smartWrap: true });
      const targets = splitType === 'chars' ? split.chars : splitType === 'lines' ? split.lines : split.words;
      tween = gsap.fromTo(targets, { ...from }, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: { trigger: el, start, once: true },
      });
    };
    document.fonts.ready.then(run);

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, splitType, delay, duration, ease, start]);

  const Tag = tag as React.ElementType;
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
};

export default SplitText;
