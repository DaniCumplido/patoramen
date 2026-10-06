import { ArrowUpRight, UtensilsCrossed } from 'lucide-react';
import brand from '../../data/brand.json';
import Magnet from '../ui/magnet';

const { hero } = brand;

export default function HeroCtas() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Magnet padding={60} magnetStrength={4}>
        <a href={hero.primaryCtaHref} className="btn btn-primary">
          <span>{hero.primaryCta}</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </Magnet>
      <Magnet padding={60} magnetStrength={4}>
        <a href={hero.secondaryCtaHref} className="btn btn-ghost">
          <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
          <span>{hero.secondaryCta}</span>
        </a>
      </Magnet>
    </div>
  );
}
