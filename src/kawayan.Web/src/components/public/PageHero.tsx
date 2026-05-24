import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isImageLoaded, markImageLoaded } from '@/lib/imagePreload';
import type { HeroContent } from '@/lib/pageContent';

type Props = {
  imageUrl?: string;
  headline?: string;
  subtext?: string;
  hero?: HeroContent;
  tall?: boolean;
};

export function PageHero({ imageUrl, headline, subtext, hero, tall }: Props) {
  const text = subtext ?? hero?.subtext;
  const title = headline ?? hero?.headline;
  const [imageReady, setImageReady] = useState(() => !imageUrl || isImageLoaded(imageUrl));

  useEffect(() => {
    if (!imageUrl) {
      setImageReady(true);
      return;
    }
    if (isImageLoaded(imageUrl)) {
      setImageReady(true);
      return;
    }
    let cancelled = false;
    setImageReady(false);
    const img = new Image();
    const done = () => {
      markImageLoaded(imageUrl);
      if (!cancelled) setImageReady(true);
    };
    img.onload = done;
    img.onerror = done;
    img.src = imageUrl;
    if (img.complete) done();
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <section
      className={`relative flex items-center text-white overflow-hidden ${tall ? 'min-h-[60vh] md:min-h-[480px]' : 'min-h-[50vh] md:min-h-[360px]'}`}
      style={{ backgroundColor: '#1C2B22' }}
    >
      {imageUrl && (
        <div
          aria-hidden
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${imageReady ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${imageUrl})`,
          }}
        />
      )}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
        {title && <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>}
        {text && <p className="text-base md:text-lg text-slate-100 max-w-2xl whitespace-pre-line">{text}</p>}
        {(hero?.ctaPrimary || hero?.ctaSecondary) && (
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {hero.ctaPrimary && (
              <Link
                to={hero.ctaPrimaryLink ?? '/services'}
                className="btn-primary inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium min-h-[44px]"
              >
                {hero.ctaPrimary}
              </Link>
            )}
            {hero.ctaSecondary && (
              <Link
                to={hero.ctaSecondaryLink ?? '/contact'}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-lg text-sm font-medium border-2 border-white text-white hover:bg-white/10 active:bg-white/20"
              >
                {hero.ctaSecondary}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
