import { z } from 'zod';
import brand from '../data/brand.json';

/**
 * Shared client/server validation. Limits are derived from brand.json
 * (time slots, party-size options, opening hours, Spanish messages).
 */
const form = brand.reservation.form;
const v = form.validation;

export const TIME_SLOTS: string[] = form.timeSlots.flatMap((g) => g.slots);
export const MAX_PARTY = Math.max(...form.partySizeOptions.map((o) => Number(o.value)));
export const NOTES_MAX = 500; // matches validation.notesMax copy
export const NAME_MAX = 80;

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Weekday indexes (0=Sunday) flagged as "Cerrado" in brand.business.openingHours. */
export const CLOSED_WEEKDAYS: number[] = brand.business.openingHours.display
  .filter((h) => /cerrado/i.test(h.hours))
  .map((h) => WEEKDAYS.findIndex((d) => normalize(h.days).startsWith(d)))
  .filter((i) => i >= 0);

export function todayMadrid(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
}

function weekdayOf(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export const reservationSchema = z.object({
  name: z.string().trim().min(1, v.nameRequired).min(2, v.nameMin).max(NAME_MAX),
  email: z.string().trim().min(1, v.emailRequired).email(v.emailInvalid).max(160),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const digits = val.replace(/\D/g, '');
      return /^\+?[\d\s().-]+$/.test(val) && digits.length >= 9 && digits.length <= 15;
    }, v.phoneInvalid),
  date: z
    .string()
    .min(1, v.dateRequired)
    .superRefine((val, ctx) => {
      if (!val) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        ctx.addIssue({ code: 'custom', message: v.dateRequired });
        return;
      }
      if (val < todayMadrid()) {
        ctx.addIssue({ code: 'custom', message: v.datePast });
        return;
      }
      if (CLOSED_WEEKDAYS.includes(weekdayOf(val))) {
        ctx.addIssue({ code: 'custom', message: v.dateClosed });
      }
    }),
  time: z
    .string()
    .min(1, v.timeRequired)
    .refine((val) => !val || TIME_SLOTS.includes(val), v.timeRequired),
  partySize: z
    .string()
    .min(1, v.partySizeRequired)
    .superRefine((val, ctx) => {
      if (!val) return;
      const n = Number(val);
      if (!Number.isInteger(n) || n < 1) ctx.addIssue({ code: 'custom', message: v.partySizeRequired });
      else if (n > MAX_PARTY) ctx.addIssue({ code: 'custom', message: v.partySizeMax });
    }),
  notes: z.string().trim().max(NOTES_MAX, v.notesMax).optional(),
  privacy: z.boolean().refine((val) => val === true, v.privacyRequired),
  /** Honeypot: humans never see/fill it. */
  website: z.string().optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
