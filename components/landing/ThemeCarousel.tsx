'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeMockup } from '@/components/themes/ThemeMockup';
import { fetchLandingShowcase, landingDemoFor, ShowcasePreset } from '@/lib/theme-showcase';
import { THEMES } from '@/themes/registry';

const AUTO_ADVANCE_MS = 5000;

type Slide = {
  themeKey: string;
  demo: ReturnType<typeof landingDemoFor>;
};

function defaultSlides(): Slide[] {
  const featured = ['brutalist', 'aurora', 'conversion', 'creator', 'cyber'];
  return featured
    .filter(k => THEMES[k])
    .map(themeKey => ({ themeKey, demo: landingDemoFor(null) }));
}

export function ThemeCarousel() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides());
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    (async () => {
      const presets: ShowcasePreset[] = await fetchLandingShowcase();
      const valid = presets.filter(p => THEMES[p.theme_key]);
      if (valid.length > 0) {
        setSlides(valid.map(p => ({ themeKey: p.theme_key, demo: landingDemoFor(p) })));
      }
    })();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefersReduced(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const el = containerRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visibleRef.current = e.isIntersecting;
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReduced || paused || slides.length <= 1) return;
    const id = setInterval(() => {
      if (!visibleRef.current) return;
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [prefersReduced, paused, slides.length]);

  function go(dir: -1 | 1) {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  }

  const current = slides[index];

  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[340px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Temas da BioFlowzy"
    >
      <div className="relative flex items-center justify-center min-h-[558px]">
        {slides.map((s, i) => {
          const offset = i - index;
          const isActive = i === index;
          const translate = offset * 20;
          const scale = isActive ? 1 : 0.88;
          const opacity = Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.5;
          const z = isActive ? 20 : 10 - Math.abs(offset);
          return (
            <div
              key={s.themeKey + i}
              aria-hidden={!isActive}
              className="absolute transition-all duration-700 ease-out"
              style={{
                transform: `translateX(${translate}%) scale(${scale})`,
                opacity,
                zIndex: z,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <ThemeMockup
                themeKey={s.themeKey}
                overrides={s.demo.profile as any}
                links={s.demo.links}
                socials={s.demo.socials}
                videos={s.demo.videos}
                banners={s.demo.banners}
                themeSettings={s.demo.themeSettings}
                width={260}
                height={540}
              />
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Tema anterior"
            className="absolute top-1/2 -translate-y-1/2 -left-2 md:-left-6 z-30 w-10 h-10 brutal-border bg-white brutal-shadow flex items-center justify-center hover:bg-bioyellow transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Próximo tema"
            className="absolute top-1/2 -translate-y-1/2 -right-2 md:-right-6 z-30 w-10 h-10 brutal-border bg-white brutal-shadow flex items-center justify-center hover:bg-bioyellow transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Selecionar tema">
            {slides.map((s, i) => {
              const active = i === index;
              const meta = THEMES[s.themeKey]?.meta;
              return (
                <button
                  key={s.themeKey + i}
                  role="tab"
                  aria-selected={active}
                  aria-label={meta?.name || s.themeKey}
                  onClick={() => setIndex(i)}
                  className={`h-2 transition-all brutal-border ${active ? 'w-8 bg-black' : 'w-2 bg-white hover:bg-black/30'}`}
                />
              );
            })}
          </div>
          {current && THEMES[current.themeKey] && (
            <p className="mt-2 text-center text-xs font-bold uppercase tracking-widest text-black/60">
              {THEMES[current.themeKey].meta.name}
            </p>
          )}
        </>
      )}
    </div>
  );
}
