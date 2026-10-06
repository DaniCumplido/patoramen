import { readFileSync } from 'node:fs';

const brand = JSON.parse(readFileSync(new URL('./src/data/brand.json', import.meta.url), 'utf-8'));
const c = brand.colors;
const f = brand.fonts;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: c.background,
        deep: c.extra.backgroundDeep,
        surface: c.surface,
        ink: c.text,
        muted: c.extra.textMuted,
        line: c.extra.border,
        primary: c.primary,
        secondary: c.secondary,
        accent: c.accent,
        lacquer: c.extra.lacquerRed,
        'on-lacquer': c.extra.onLacquerRed,
        'on-primary': c.extra.onPrimary,
        wood: c.extra.woodWarm,
      },
      fontFamily: {
        serif: [`"${f.heading}"`, 'Georgia', 'serif'],
        sans: [`"${f.body}"`, 'system-ui', 'sans-serif'],
        cjk: [`"${f.accentCjk}"`, `"${f.accentCjkAlt}"`, 'serif'],
        cjkjp: [`"${f.accentCjkAlt}"`, `"${f.accentCjk}"`, 'serif'],
      },
      fontSize: {
        hero: [f.scale.heroTitle, { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        h2: [f.scale.h2, { lineHeight: '1', letterSpacing: '-0.02em' }],
        kanji: [f.scale.kanjiDecor, { lineHeight: '1' }],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'shiny-text': {
          '0%, 90%, 100%': { 'background-position': 'calc(-100% - var(--shiny-width)) 0' },
          '30%, 60%': { 'background-position': 'calc(100% + var(--shiny-width)) 0' },
        },
        'scroll-line': {
          '0%': { transform: 'scaleY(0)', 'transform-origin': 'top' },
          '50%': { transform: 'scaleY(1)', 'transform-origin': 'top' },
          '51%': { transform: 'scaleY(1)', 'transform-origin': 'bottom' },
          '100%': { transform: 'scaleY(0)', 'transform-origin': 'bottom' },
        },
      },
      animation: {
        marquee: 'marquee var(--duration) linear infinite',
        'shiny-text': 'shiny-text 8s infinite',
        'scroll-line': 'scroll-line 2.2s cubic-bezier(.6,.1,.2,1) infinite',
      },
    },
  },
  plugins: [],
};
