import brand from '../../data/brand.json';
import { NumberTicker } from '../ui/number-ticker';

const { stats } = brand.story;

export default function Stats() {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col justify-between gap-6 bg-surface p-6 md:p-7">
          <dt className="order-2 text-xs leading-snug text-muted">{s.label}</dt>
          <dd className="order-1 flex items-baseline gap-1 font-serif text-6xl font-light text-primary md:text-7xl">
            <NumberTicker value={Number(s.value)} className="text-primary" />
            {s.unit && <span className="text-2xl italic text-secondary">{s.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
