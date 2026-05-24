import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="group fixed bottom-20 right-5 z-40 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg ring-1 ring-black/5 transition hover:brightness-95 active:scale-95 md:bottom-20 md:right-6"
    >
      <ArrowUp size={20} className="transition-transform duration-150 group-hover:-translate-y-0.5 group-active:translate-y-0.5" aria-hidden />
    </button>
  );
}
