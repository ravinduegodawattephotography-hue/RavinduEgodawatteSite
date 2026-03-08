import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/use-mobile';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  label: string;
  description: string;
  image: string;
  index: string;
}

// ─── Fallback images (used when a category has no cover_image in the CMS) ─────

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=1400&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85&auto=format&fit=crop',
];

// ─── Sticky Nav (appears after scrolling past hero) ─────────────────────────

interface StickyNavProps { visible: boolean }

function StickyNav({ visible }: StickyNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[100]"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
          backgroundColor: 'rgba(245,245,241,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div
          className="w-11/12 max-w-[1400px] mx-auto flex items-center justify-between"
          style={{ height: '60px' }}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero-accordion')}
            className="flex items-center focus:outline-none"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            aria-label="Back to top"
          >
            <img
              src="/logo-dark.png"
              alt="Ravindu Egodawatte Photography"
              style={{ height: '2rem', width: 'auto', objectFit: 'contain' }}
            />
          </button>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase())}
                className="transition-opacity duration-300 opacity-40 hover:opacity-80 focus:outline-none"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.58rem',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#1a1a1a',
                }}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Desktop: Book Now */}
          <button
            onClick={() => scrollTo('contact')}
            className="hidden md:block"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.58rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#1a1a1a',
              background: 'none',
              border: '1px solid rgba(0,0,0,0.25)',
              borderRadius: '999px',
              padding: '0.45rem 1.1rem',
              cursor: 'pointer',
              transition: 'background 0.25s ease, color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a';
              (e.currentTarget as HTMLButtonElement).style.color = '#F5F5F1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a';
            }}
          >
            Book Now
          </button>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden flex items-center justify-center focus:outline-none"
            style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: '#1a1a1a' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden"
            style={{
              backgroundColor: 'rgba(245,245,241,0.98)',
              borderTop: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div className="w-11/12 mx-auto py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  onClick={() => scrollTo(link.toLowerCase())}
                  className="text-left w-full py-3 focus:outline-none"
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.65rem',
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.55)',
                  }}
                >
                  {link}
                </button>
              ))}
              <button
                onClick={() => scrollTo('contact')}
                className="mt-3 w-full py-3 rounded-full text-center"
                style={{
                  background: '#1a1a1a',
                  color: '#F5F5F1',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.6rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const NAV_LINKS = ['About', 'Portfolio', 'Testimonials', 'Contact'] as const;

function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header className="w-full">
      {/* Top bar: logo centred, hamburger pinned right on mobile */}
      <div className="relative flex items-center justify-center pt-10 pb-2 px-5">
        <img
          src="/logo-dark.png"
          alt="Ravindu Egodawatte Photography"
          style={{ height: 'clamp(3rem, 5vw, 4.5rem)', width: 'auto', objectFit: 'contain' }}
        />

        {/* Mobile hamburger — absolute right */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="absolute right-5 md:hidden flex items-center justify-center focus:outline-none"
          style={{ background: 'none', border: 'none', padding: '0.25rem', cursor: 'pointer', color: '#1a1a1a' }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Divider + desktop nav */}
      <div className="flex flex-col items-center pb-9">
        <div className="mt-2 h-px w-14 bg-stone-300" />

        <nav className="mt-5 hidden md:flex items-center gap-6 lg:gap-9" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="transition-opacity duration-300 opacity-35 hover:opacity-65"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.58rem',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#1a1a1a',
                textDecoration: 'none',
              }}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            backgroundColor: 'rgba(245,245,241,0.98)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="w-11/12 mx-auto py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link.toLowerCase())}
                className="text-left w-full py-3 focus:outline-none"
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.55)',
                }}
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              className="mt-3 w-full py-3 rounded-full text-center"
              style={{
                background: '#1a1a1a',
                color: '#F5F5F1',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <section className="w-full h-screen flex flex-col bg-[#F5F5F1] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SiteHeader />
      <div className="flex-1 min-h-0 w-11/12 max-w-[1400px] mx-auto flex gap-3 pb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-[3px] bg-stone-200 animate-pulse"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </section>
  );
}

// ─── HeroAccordion ────────────────────────────────────────────────────────────

export default function HeroAccordion() {
  const isMobile = useIsMobile();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pastHero, setPastHero] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // ── Sticky nav scroll detection ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      const threshold = el ? el.offsetHeight * 0.72 : window.innerHeight * 0.72;
      setPastHero(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Font injection + scrollbar-hide style ────────────────────────────────────
  useEffect(() => {
    const FONT_ID = 'ha-custom-fonts';
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement('link');
      link.id = FONT_ID;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Great+Vibes&display=swap';
      document.head.appendChild(link);
    }

    const STYLE_ID = 'ha-scrollbar-hide';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = '.ha-carousel::-webkit-scrollbar{display:none}';
      document.head.appendChild(style);
    }
  }, []);

  // ── Supabase fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, description, cover_image, hero_image')
          .order('name')
          .limit(6);

        if (error) throw error;
        if (cancelled) return;

        const mapped: Slide[] = (data ?? []).map((row, i) => ({
          id:          String(row.id),
          label:       (row.name as string) || 'Untitled',
          description: (row.description as string) || '',
          image:
            (row.hero_image as string) ||
            (row.cover_image as string) ||
            FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
          index: String(i + 1).padStart(2, '0'),
        }));

        setSlides(mapped);
      } catch (err) {
        console.error('[HeroAccordion] Failed to fetch categories:', err);
        if (!cancelled) setSlides([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Mobile IntersectionObserver: snap scroll visual tracking ─────────────────
  useEffect(() => {
    if (!isMobile || !containerRef.current || !slides.length) return;
    const container = containerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // snap tracking — no-op after text section removal
          }
        });
      },
      { root: container, threshold: 0.55 }
    );

    const stripEls = container.querySelectorAll<HTMLElement>('.ha-strip');
    stripEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile, slides]);

  // ── Entrance animation handled by Framer Motion (scaleY reveal per strip) ──────

  // ── Derived values ──────────────────────────────────────────────────────────
  const isHovering = hoveredIndex !== null;

  const handleEnter = (i: number) => {
    setHoveredIndex(i);
  };

  // ── Render guards ───────────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;

  if (!slides.length) {
    return (
      <section className="w-full h-screen flex flex-col bg-[#F5F5F1] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.28)',
            }}
          >
            No categories found
          </p>
        </div>
      </section>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <section id="hero-accordion" ref={sectionRef} className="w-full h-screen flex flex-col bg-[#F5F5F1] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ════ STICKY NAV ════════════════════════════════════════════════════════ */}
      <StickyNav visible={pastHero} />

      {/* ════ HEADER ════════════════════════════════════════════════════════════ */}
      <SiteHeader />

      {/* ════ GALLERY — Horizontal Hover Accordion ══════════════════════════════ */}
      <div className="flex-1 min-h-0 pt-4 md:pt-10">
      <div
        ref={containerRef}
        className={
          isMobile
            ? 'ha-carousel flex overflow-x-auto snap-x snap-mandatory gap-4 px-4'
            : 'w-11/12 max-w-[1400px] mx-auto flex gap-3 items-stretch h-full'
        }
        style={isMobile
          ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties
          : {}
        }
        onMouseLeave={isMobile ? undefined : () => setHoveredIndex(null)}
      >
        {slides.map((cat, i) => {
          const isActive      = hoveredIndex === i;
          const isDeactivated = isHovering && !isActive;

          // Persistent stagger: even bars (0,2,4…) shift DOWN, odd (1,3,5…) shift UP.
          // Wave is permanent — does NOT reset on hover or expansion.
          const finalY = isMobile ? 0 : i % 2 === 0 ? 40 : -40;

          return (
            <motion.div
              key={cat.id}
              data-slide-index={i}
              className="ha-strip relative overflow-hidden"
              initial={{ opacity: 0, scaleY: 0, y: 60 }}
              animate={{ opacity: 1, scaleY: 1, y: finalY }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15 + i * 0.1,
              }}
              style={
                isMobile
                  ? {
                      flexShrink: 0,
                      width: '85vw',
                      height: '60vh',
                      borderRadius: '10px',
                      scrollSnapAlign: 'center',
                      cursor: 'pointer',
                      transformOrigin: '50% 100%',
                    }
                  : {
                      flex: isActive ? '4 1 0%' : '1 1 0%',
                      borderRadius: '3px',
                      transition: 'flex 0.7s cubic-bezier(0.25,1,0.5,1)',
                      cursor: 'crosshair',
                      transformOrigin: '50% 100%',
                    }
              }
              onMouseEnter={!isMobile ? () => handleEnter(i) : undefined}
              onClick={undefined}
            >
              {/* ── Background image ────────────────────────────────────── */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${cat.image})`,
                  filter: isMobile
                    ? 'grayscale(0%)'
                    : isDeactivated || !isHovering
                    ? 'grayscale(100%)'
                    : 'grayscale(0%)',
                  opacity: isMobile ? 1 : isDeactivated ? 0.42 : isActive ? 1 : 0.58,
                  transform: 'scale(1.06)',
                  transition:
                    'filter 0.7s cubic-bezier(0.25,1,0.5,1),' +
                    'opacity 0.7s cubic-bezier(0.25,1,0.5,1)',
                }}
              />

              {/* Light global tint */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />

              {/* Bottom gradient for on-strip text legibility */}
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                  height: '72%',
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.04) 68%, transparent 100%)',
                }}
              />

              {/* Thin right-edge separator between strips */}
              {i < slides.length - 1 && (
                <div className="absolute top-0 right-0 w-px h-full bg-white/[0.04] pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

