import { Star } from 'lucide-react';
import brand from '../../data/brand.json';
import SpotlightCard from '../ui/spotlight-card';
import { cn } from '@/lib/utils';

const { reviews, rating } = brand.socialProof;

function Stars({ value, max }: { value: number; max: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn('h-4 w-4', i < Math.round(value) ? 'fill-primary text-primary' : 'text-line')}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="flex flex-col justify-between rounded-sm border border-line bg-deep p-8 lg:col-span-4" data-placeholder={rating._placeholder ? 'true' : undefined}>
        <div>
          <p className="font-serif text-8xl font-light leading-none text-primary md:text-9xl">
            {rating.value.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
          </p>
          <div className="mt-4">
            <Stars value={rating.value} max={rating.max} />
          </div>
        </div>
        <p className="mt-10 text-sm leading-relaxed text-muted">
          {rating.count} · {rating.label}
          <br />
          <span className="text-xs">
            {rating.source}
            {rating._placeholder && <span aria-hidden="true"> †</span>}
          </span>
        </p>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
        {reviews.map((r, i) => (
          <li key={r.author} className={i % 2 === 1 ? 'sm:mt-10' : ''} data-placeholder={r._placeholder ? 'true' : undefined}>
            <SpotlightCard className="flex h-full flex-col gap-5 p-7">
              <Stars value={r.rating} max={rating.max} />
              <blockquote className="font-serif text-xl font-light leading-snug text-ink md:text-2xl">&ldquo;{r.text}&rdquo;</blockquote>
              <footer className="mt-auto text-xs uppercase tracking-[0.16em] text-muted">
                <span className="text-ink">{r.author}</span> · {r.date}
                <br />
                {r.source}
                {r._placeholder && <span aria-hidden="true"> †</span>}
              </footer>
            </SpotlightCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
