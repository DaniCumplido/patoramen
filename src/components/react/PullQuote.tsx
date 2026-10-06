import brand from '../../data/brand.json';
import SplitText from '../ui/split-text';

const { pullQuote } = brand.story;

export default function PullQuote() {
  return (
    <figure className="relative border-l border-primary/60 pl-6 md:pl-10">
      <span aria-hidden="true" className="absolute -left-px -top-4 font-serif text-7xl leading-none text-primary">
        &ldquo;
      </span>
      <blockquote>
        <SplitText
          tag="p"
          text={pullQuote.text}
          splitType="words"
          delay={70}
          duration={1.1}
          from={{ opacity: 0, y: 36, rotate: 2 }}
          to={{ opacity: 1, y: 0, rotate: 0 }}
          className="font-serif text-3xl font-light italic leading-tight text-ink md:text-5xl"
        />
      </blockquote>
      <figcaption className="mt-5 text-[0.72rem] uppercase tracking-[0.26em] text-secondary">{pullQuote.attribution}</figcaption>
    </figure>
  );
}
