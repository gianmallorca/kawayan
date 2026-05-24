import { publicAssetUrl } from '@/lib/utils';
import { initialsFromName } from '@/lib/sectionDefaults';
import { StarRating } from '@/components/public/StarRating';
import type { Testimonial } from '@/lib/pageContent';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = initialsFromName(testimonial.name);
  const rating = testimonial.rating != null && testimonial.rating > 0 ? testimonial.rating : null;

  return (
    <blockquote className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        {testimonial.profileImageUrl ? (
          <img
            src={publicAssetUrl(testimonial.profileImageUrl)}
            alt=""
            className="h-12 w-12 rounded-full object-cover shrink-0"
            decoding="async"
          />
        ) : (
          <span className="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {initials || '?'}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{testimonial.name}</p>
          <p className="text-sm text-slate-500 truncate">{testimonial.role}</p>
        </div>
      </div>
      {rating != null ? (
        <div className="mb-3">
          <StarRating rating={rating} />
        </div>
      ) : null}
      <p className="italic text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{testimonial.quote}&rdquo;</p>
    </blockquote>
  );
}
