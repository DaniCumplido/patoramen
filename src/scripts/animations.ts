import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import brand from '../data/brand.json';

/**
 * Global GSAP layer. NO scroll hijacking: native scroll is never intercepted, ScrollTrigger only
 * observes it. Everything lives inside gsap.matchMedia so reduced-motion / viewport changes revert
 * cleanly and every trigger is killed on cleanup.
 *
 * Markup hooks:
 *   [data-hero-kb] [data-hero-img] [data-hero-line] [data-hero-fade] [data-hero-kanji]  (hero)
 *   [data-clip] (+ [data-clip-inner])   clip-path image reveal
 *   [data-parallax="0.25"]              multilevel parallax (desktop only)
 *   [data-lines]                        masked line reveal for headings
 *   [data-fade]                         fade-up on enter
 */
gsap.registerPlugin(ScrollTrigger, SplitText);

const { motion } = brand;
const mm = gsap.matchMedia();
const mobileBelow = motion.mobileFallbacks.below;

function init() {
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: `(min-width: ${mobileBelow}px)`,
    },
    (ctx) => {
      const { motion: canMove, reduce, desktop } = ctx.conditions as Record<string, boolean>;

      if (reduce) {
        // brand.motion.reducedMotion: swap animations for 0.2s fades
        gsap.fromTo('[data-hero-fade], [data-hero-line], [data-fade]', { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.02 });
        return;
      }
      if (!canMove) return;

      // ---------- Hero intro ----------
      const kb = motion.hero.imageKenBurns;
      const tl = gsap.timeline({ defaults: { ease: motion.ease.enter } });
      tl.fromTo('[data-hero-kb]', { scale: kb.from }, { scale: kb.to, duration: kb.duration, ease: 'power2.out' }, 0)
        .fromTo(
          '[data-hero-line]',
          { yPercent: 115, opacity: 1 },
          { yPercent: 0, duration: motion.duration.slow, stagger: 0.12, ease: motion.ease.editorial },
          0.25,
        )
        .fromTo(
          '[data-hero-fade]',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: motion.duration.base, stagger: motion.stagger, clearProps: 'transform' },
          0.7,
        );

      // ---------- Hero scroll parallax (desktop only) ----------
      if (desktop) {
        const heroImg = document.querySelector('[data-hero-img]');
        const hero = document.querySelector('[data-hero]');
        if (heroImg && hero) {
          gsap.fromTo(
            heroImg,
            { yPercent: 0, scale: 1.1 },
            { yPercent: motion.hero.parallax.image * 16, scale: 1.1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } },
          );
        }
        const kanji = document.querySelector('[data-hero-kanji]');
        if (kanji && hero) {
          gsap.to(kanji, { yPercent: -motion.hero.parallax.kanji * 40, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
        }
      }

      // ---------- Masked line reveals on headings ----------
      document.querySelectorAll<HTMLElement>('[data-lines]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'split-line',
          onSplit: (self: SplitText) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: motion.duration.slow,
              ease: motion.ease.editorial,
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
        });
      });

      // ---------- Clip-path image reveals ----------
      document.querySelectorAll<HTMLElement>('[data-clip]').forEach((el) => {
        const inner = el.querySelector('[data-clip-inner]');
        const st = { trigger: el, start: 'top 86%', once: true };
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: motion.duration.slow, ease: motion.ease.editorial, scrollTrigger: st });
        if (inner) gsap.fromTo(inner, { scale: 1.15 }, { scale: 1, duration: 2, ease: motion.ease.enter, scrollTrigger: st });
      });

      // ---------- Fade-ups ----------
      gsap.utils.toArray<HTMLElement>('[data-fade]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, duration: motion.duration.base, ease: motion.ease.enter, scrollTrigger: { trigger: el, start: 'top 90%', once: true } },
        );
      });

      // ---------- Multilevel parallax (desktop only, scrubbed to native scroll) ----------
      if (desktop) {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const speed = parseFloat(el.dataset.parallax ?? '0.25');
          const amp = speed * 40;
          const scope = el.closest<HTMLElement>('[data-parallax-scope]') ?? el.parentElement ?? el;
          gsap.fromTo(el, { yPercent: -amp }, { yPercent: amp, ease: 'none', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }
    },
  );
}

if (document.fonts?.ready) document.fonts.ready.then(init);
else init();

window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('pagehide', (e) => {
  if (e.persisted) return;
  mm.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());
});
