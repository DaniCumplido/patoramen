import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import brand from '../../data/brand.json';
import { reservationSchema, todayMadrid, NOTES_MAX, type ReservationInput } from '@/lib/reservation-schema';
import { cn, fill } from '@/lib/utils';
import { BorderBeam } from '../ui/border-beam';

const { form, endpoint, note } = brand.reservation;
const f = form.fields;

type Status = 'idle' | 'submitting' | 'success' | 'error';

const fieldBase =
  'peer w-full border-0 border-b border-line bg-transparent px-0 py-3 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-0 aria-[invalid=true]:border-accent';

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-[0.7rem] font-medium uppercase tracking-[0.22em] text-secondary">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-primary">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

function FormInner() {
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [summary, setSummary] = useState({ name: '', email: '' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', phone: '', date: '', time: '', partySize: '', notes: '', privacy: false, website: '' },
  });

  const notesLen = watch('notes')?.length ?? 0;

  const onSubmit = async (values: ReservationInput) => {
    setStatus('submitting');
    setServerMessage('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setSummary({ name: values.name, email: values.email });
        setStatus('success');
        reset();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setServerMessage(res.status === 429 ? form.rateLimited : data.message ?? form.error.message);
      setStatus('error');
    } catch (err) {
      setServerMessage('Las reservas en línea no están disponibles en este momento. Por favor, llama al restaurante directamente.');
      setStatus('error');
    }
  };

  const describe = (id: string, hasError: boolean) => (hasError ? `${id}-error` : undefined);
  const busy = status === 'submitting';

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[28rem] flex-col items-start justify-center gap-6">
        <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
        <h3 className="font-serif text-5xl font-light text-ink">{form.success.title}</h3>
        <p className="max-w-md text-lg leading-relaxed text-muted">{fill(form.success.message, summary)}</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn btn-ghost">
          {form.submitLabel}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={busy} className="space-y-8">
      {/* honeypot: hidden from humans and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="res-website">Website</label>
        <input id="res-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="res-name" label={f.name.label} required error={errors.name?.message}>
          <input
            id="res-name"
            type="text"
            autoComplete={f.name.autocomplete}
            placeholder={f.name.placeholder}
            aria-invalid={!!errors.name}
            aria-describedby={describe('res-name', !!errors.name)}
            className={fieldBase}
            {...register('name')}
          />
        </Field>
        <Field id="res-email" label={f.email.label} required error={errors.email?.message}>
          <input
            id="res-email"
            type="email"
            inputMode="email"
            autoComplete={f.email.autocomplete}
            placeholder={f.email.placeholder}
            aria-invalid={!!errors.email}
            aria-describedby={describe('res-email', !!errors.email)}
            className={fieldBase}
            {...register('email')}
          />
        </Field>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="res-phone" label={f.phone.label} error={errors.phone?.message}>
          <input
            id="res-phone"
            type="tel"
            inputMode="tel"
            autoComplete={f.phone.autocomplete}
            placeholder={f.phone.placeholder}
            aria-invalid={!!errors.phone}
            aria-describedby={describe('res-phone', !!errors.phone)}
            className={fieldBase}
            {...register('phone')}
          />
        </Field>
        <Field id="res-party" label={f.partySize.label} required error={errors.partySize?.message}>
          <select
            id="res-party"
            aria-invalid={!!errors.partySize}
            aria-describedby={describe('res-party', !!errors.partySize)}
            className={fieldBase}
            {...register('partySize')}
          >
            <option value="">{f.partySize.placeholder}</option>
            {form.partySizeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="res-date" label={f.date.label} required error={errors.date?.message}>
          <input
            id="res-date"
            type="date"
            min={todayMadrid()}
            aria-invalid={!!errors.date}
            aria-describedby={describe('res-date', !!errors.date)}
            className={cn(fieldBase, '[color-scheme:dark]')}
            {...register('date')}
          />
        </Field>
        <Field id="res-time" label={f.time.label} required error={errors.time?.message}>
          <select
            id="res-time"
            aria-invalid={!!errors.time}
            aria-describedby={describe('res-time', !!errors.time)}
            className={fieldBase}
            {...register('time')}
          >
            <option value="">{f.time.placeholder}</option>
            {form.timeSlots.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
      </div>

      <Field id="res-notes" label={f.notes.label} error={errors.notes?.message}>
        <textarea
          id="res-notes"
          rows={3}
          maxLength={NOTES_MAX + 50}
          placeholder={f.notes.placeholder}
          aria-invalid={!!errors.notes}
          aria-describedby={describe('res-notes', !!errors.notes)}
          className={cn(fieldBase, 'resize-none')}
          {...register('notes')}
        />
        <span aria-hidden="true" className="mt-1 block text-right text-xs text-muted">
          {notesLen}/{NOTES_MAX}
        </span>
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            id="res-privacy"
            type="checkbox"
            aria-invalid={!!errors.privacy}
            aria-describedby={describe('res-privacy', !!errors.privacy)}
            className="check mt-1 h-4 w-4 shrink-0 appearance-none rounded-[2px] border border-secondary bg-transparent checked:border-primary checked:bg-primary aria-[invalid=true]:border-accent"
            {...register('privacy')}
          />
          <span>{f.privacy.label}</span>
        </label>
        {errors.privacy && (
          <p id="res-privacy-error" role="alert" className="mt-2 text-sm text-accent">
            {errors.privacy.message}
          </p>
        )}
      </div>

      <div aria-live="polite" className="min-h-0">
        {status === 'error' && (
          <div role="alert" className="flex items-start gap-3 rounded-sm border border-accent/60 bg-accent/10 p-4 text-sm text-ink">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <p className="font-semibold">{form.error.title}</p>
              <p className="mt-1 text-muted">{serverMessage || form.error.message}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" disabled={busy} className="btn btn-primary disabled:cursor-wait disabled:opacity-70">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          <span>{busy ? form.submittingLabel : form.submitLabel}</span>
        </button>
        <p className="text-sm text-muted">{note}</p>
      </div>
    </form>
  );
}

function FormFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-sm border border-line bg-surface/80 p-6 backdrop-blur-sm md:p-12">
      <BorderBeam size={220} duration={9} borderWidth={1.5} />
      {children}
    </div>
  );
}

export default function ReservationForm() {
  return (
    <FormFrame>
      <FormInner />
    </FormFrame>
  );
}
