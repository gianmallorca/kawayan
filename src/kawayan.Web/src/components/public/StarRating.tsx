import { Star } from 'lucide-react';

export function StarRating({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={i < value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
          aria-hidden
        />
      ))}
    </div>
  );
}
