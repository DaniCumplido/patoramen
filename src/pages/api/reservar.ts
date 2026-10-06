import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import brand from '../../data/brand.json';
import { reservationSchema } from '../../lib/reservation-schema';
import { fill } from '../../lib/utils';

// Only this route is rendered on demand; every page stays static (output: 'hybrid').
export const prerender = false;

const { form, email: emailCfg } = brand.reservation;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Header-safe single line (no CR/LF) for the subject. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

// naive in-memory limiter: 5 requests / 10 min per IP (per server instance)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_HITS;
}

const env = (key: string): string | undefined =>
  (import.meta.env[key] as string | undefined) || (typeof process !== 'undefined' ? process.env[key] : undefined) || undefined;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: form.error.message }, 400);
  }

  // honeypot: pretend success, send nothing
  if (typeof payload === 'object' && payload && typeof (payload as { website?: unknown }).website === 'string' && (payload as { website: string }).website.trim() !== '') {
    return json({ ok: true });
  }

  let ip = 'unknown';
  try {
    ip = clientAddress || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  } catch {
    /* clientAddress unavailable */
  }
  if (limited(ip)) return json({ ok: false, message: form.rateLimited }, 429);

  const parsed = reservationSchema.safeParse(payload);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join('.')] ??= issue.message;
    return json({ ok: false, message: form.error.message, fields }, 400);
  }
  const d = parsed.data;

  const apiKey = env('RESEND_API_KEY');
  if (!apiKey) {
    return json({ ok: false, code: 'not_configured', message: form.error.message }, 503);
  }

  const to = env('RESERVATION_TO_EMAIL') || emailCfg.to;
  const from = env('RESERVATION_FROM_EMAIL') || emailCfg.from;
  const subject = oneLine(
    fill(emailCfg.subjectTemplate, { name: d.name, partySize: d.partySize, date: d.date, time: d.time }),
  );

  const rows: [string, string][] = [
    [form.fields.name.label, d.name],
    [form.fields.email.label, d.email],
    [form.fields.phone.label, d.phone || '-'],
    [form.fields.date.label, d.date],
    [form.fields.time.label, d.time],
    [form.fields.partySize.label, d.partySize],
    [form.fields.notes.label, d.notes || '-'],
  ];
  const html = `<div style="font-family:Arial,sans-serif;color:#15100D"><h2>${escapeHtml(brand.brandName)}</h2><table cellpadding="8" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="border-bottom:1px solid #ddd"><strong>${escapeHtml(k)}</strong></td><td style="border-bottom:1px solid #ddd">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('')}</table></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to: [to], replyTo: d.email, subject, html, text });
    if (error) {
      console.error('[reservar] Resend error', error);
      return json({ ok: false, message: form.error.message }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error('[reservar] send failed', err);
    return json({ ok: false, message: form.error.message }, 500);
  }
};
