import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { publicAssetUrl } from '@/lib/utils';
import type { ServiceItem } from '@/types';

type Props = {
  services: ServiceItem[];
};

const arrowClass =
  'shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none';

function formatPrice(price?: number | null) {
  return price == null
    ? 'Contact us for pricing'
    : `Starts at ₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ServicesCarousel({ services }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ignoreScrollSyncRef = useRef(false);
  const scrollSyncUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const md = window.matchMedia('(min-width: 768px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const update = () => setPerView(lg.matches ? 3 : md.matches ? 2 : 1);
    update();
    md.addEventListener('change', update);
    lg.addEventListener('change', update);
    return () => {
      md.removeEventListener('change', update);
      lg.removeEventListener('change', update);
    };
  }, []);

  const maxIndex = Math.max(0, services.length - perView);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const scrollToIndex = useCallback(
    (next: number) => {
      const el = trackRef.current;
      if (!el || services.length === 0) return;
      const clamped = Math.max(0, Math.min(next, maxIndex));
      const slide = el.querySelector<HTMLElement>(`[data-slide="${clamped}"]`);
      if (scrollSyncUnlockTimerRef.current) {
        clearTimeout(scrollSyncUnlockTimerRef.current);
        scrollSyncUnlockTimerRef.current = null;
      }
      ignoreScrollSyncRef.current = true;
      setIndex(clamped);
      slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      const unlock = () => {
        if (scrollSyncUnlockTimerRef.current !== null) {
          clearTimeout(scrollSyncUnlockTimerRef.current);
          scrollSyncUnlockTimerRef.current = null;
        }
        ignoreScrollSyncRef.current = false;
      };
      el.addEventListener('scrollend', unlock, { once: true });
      scrollSyncUnlockTimerRef.current = setTimeout(unlock, 450);
    },
    [maxIndex, services.length],
  );

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0) scrollToIndex(maxIndex);
      else if (next > maxIndex) scrollToIndex(0);
      else scrollToIndex(next);
    },
    [index, maxIndex, scrollToIndex],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const syncIndexFromScrollLeft = () => {
      const slides = el.querySelectorAll<HTMLElement>('[data-slide]');
      if (!slides.length) return;
      const left = el.scrollLeft;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - left);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setIndex(Math.min(closest, maxIndex));
    };

    const onScroll = () => {
      if (ignoreScrollSyncRef.current) return;
      syncIndexFromScrollLeft();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollSyncUnlockTimerRef.current) clearTimeout(scrollSyncUnlockTimerRef.current);
    };
  }, [maxIndex, services.length, perView]);

  if (services.length === 0) return null;

  const showControls = services.length > perView;

  return (
    <div aria-roledescription="carousel" aria-label="Services">
      <div className="flex items-center gap-3 md:gap-4">
        {showControls ? (
          <button type="button" onClick={() => go(-1)} className={arrowClass} aria-label="Previous services">
            <ChevronLeft size={20} aria-hidden />
          </button>
        ) : null}

        <div
          ref={trackRef}
          className="flex-1 min-w-0 flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(-1);
            if (e.key === 'ArrowRight') go(1);
          }}
        >
          {services.map((s, i) => (
            <article
              key={s.id}
              data-slide={i}
              className="snap-start shrink-0 w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col"
              aria-roledescription="slide"
            >
              {s.imageUrl ? (
                <img
                  src={publicAssetUrl(s.imageUrl)}
                  alt=""
                  className="h-52 w-full object-cover"
                  decoding="async"
                />
              ) : (
                <div className="h-52 w-full bg-gray-100" />
              )}
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">{s.title}</h2>
                {s.description ? (
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-4 flex-1">{s.description}</p>
                ) : (
                  <div className="flex-1" />
                )}
                <p className={s.price != null ? 'text-sm font-semibold text-brand mb-4' : 'text-xs italic text-gray-400 mb-4'}>
                  {formatPrice(s.price)}
                </p>
                <Link
                  to="/contact"
                  className="btn-primary inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium active:opacity-90 mt-auto"
                >
                  Inquire Now
                </Link>
              </div>
            </article>
          ))}
        </div>

        {showControls ? (
          <button type="button" onClick={() => go(1)} className={arrowClass} aria-label="Next services">
            <ChevronRight size={20} aria-hidden />
          </button>
        ) : null}
      </div>

      {showControls ? (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-brand' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
