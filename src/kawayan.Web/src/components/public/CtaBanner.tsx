import { Link } from 'react-router-dom';
import type { CtaContent } from '@/lib/pageContent';

export function CtaBanner({ cta }: { cta: CtaContent }) {
  if (!cta.headline) return null;
  return (
    <section className="bg-dark-cta text-white py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{cta.headline}</h2>
        {cta.subtext && <p className="text-slate-300 mb-8 max-w-xl mx-auto">{cta.subtext}</p>}
        <Link
          to={cta.buttonLink ?? '/contact'}
          className="btn-primary inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-lg font-medium active:opacity-90"
        >
          {cta.buttonText ?? 'Contact Us'}
        </Link>
      </div>
    </section>
  );
}
