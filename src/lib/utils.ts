import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Replace `{token}` placeholders in strings coming from brand.json. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));
}

/** 1 -> 一, 2 -> 二 ... (CJK ordinal numerals, no hardcoded glyphs). */
export function cjkNumeral(n: number) {
  return new Intl.NumberFormat('zh-u-nu-hanidec', { useGrouping: false }).format(n);
}
