import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface ManualTestimonial {
  id: string;
  clientName: string;
  clientImage: string;
  reviewText: string;
  rating: number;
}

// ── Star rating display ───────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? 'text-amber-400' : 'text-neutral-700'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Single testimonial card ───────────────────────────────────────────────────
function TestimonialCard({
  testimonial,
  index,
  isInView,
}: {
  testimonial: ManualTestimonial;
  index: number;
  isInView: boolean;
}) {
  const initials = testimonial.clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-7 gap-5"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Quote mark */}
      <svg className="w-7 h-7 text-amber-500/40 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32">
        <path d="M10 8C5.582 8 2 11.582 2 16v8h8v-8H6c0-2.206 1.794-4 4-4V8zm14 0c-4.418 0-8 3.582-8 8v8h8v-8h-4c0-2.206 1.794-4 4-4V8z" />
      </svg>

      {/* Review text */}
      <p className="text-neutral-300 text-sm leading-relaxed flex-1">
        {testimonial.reviewText}
      </p>

      <Stars count={testimonial.rating} />

      {/* Author row */}
      <div className="flex items-center gap-3 pt-1 border-t border-neutral-800">
        {testimonial.clientImage ? (
          <img
            src={testimonial.clientImage}
            alt={testimonial.clientName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-xs font-semibold">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">{testimonial.clientName}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [testimonials, setTestimonials] = useState<ManualTestimonial[]>([]);

  // ── Fetch manual testimonials from Supabase ────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('testimonials')
      .select('id, client_name, client_image, review_text, rating')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setTestimonials(
          data.map((row) => ({
            id:          String(row.id),
            clientName:  (row.client_name as string) || 'Anonymous',
            clientImage: (row.client_image as string) || '',
            reviewText:  (row.review_text as string) || '',
            rating:      typeof row.rating === 'number' ? row.rating : 5,
          })),
        );
      });
    return () => { cancelled = true; };
  }, []);

  // ── Load Elfsight + shadow-root badge suppression ─────────────────────────
  useEffect(() => {
    const SCRIPT_SRC = 'https://elfsightcdn.com/platform.js';
    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    const hideInShadowRoots = () => {
      document.querySelectorAll('*').forEach(el => {
        try {
          if (el.shadowRoot) {
            const existing = el.shadowRoot.querySelector('#elfsight-badge-hide');
            if (!existing) {
              const s = document.createElement('style');
              s.id = 'elfsight-badge-hide';
              s.textContent = '.eapps-widget-toolbar { display: none !important; }';
              el.shadowRoot.appendChild(s);
            }
          }
        } catch (_) { /* closed shadow root */ }
      });
    };

    const observer = new MutationObserver(hideInShadowRoots);
    observer.observe(document.body, { childList: true, subtree: true });
    const t1 = setTimeout(hideInShadowRoots, 1000);
    const t2 = setTimeout(hideInShadowRoots, 3000);
    return () => { observer.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-black overflow-hidden"
    >
      {/* Subtle background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8">

        {/* ── Section header ─────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="text-amber-500 text-sm tracking-[0.3em] uppercase">
            Testimonials
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-display text-white">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
            Hear from the couples and families who trusted us with their precious moments
          </p>
        </motion.div>

        {/* ── Manual testimonials grid (top) ─────────────────────────────── */}
        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} isInView={isInView} />
            ))}
          </div>
        )}

        {/* ── Divider before Google Reviews ─────────────────────────────── */}
        {testimonials.length > 0 && (
          <motion.div
            className="flex items-center gap-4 mb-14"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex-1 h-px bg-neutral-800" />
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 48 48" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-neutral-600 text-xs tracking-[0.3em] uppercase">Google Reviews</span>
            </div>
            <div className="flex-1 h-px bg-neutral-800" />
          </motion.div>
        )}

        {/* ── Elfsight widget (bottom) ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: testimonials.length > 0 ? 0.4 : 0.2 }}
          className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-[#18181b]"
        >
          {/* TOP OVERLAY */}
          <div className="absolute top-0 left-0 right-0 z-20 h-[80px] bg-[#18181b] flex items-center justify-center gap-3 border-b border-gray-800">
            <svg viewBox="0 0 48 48" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-white font-semibold text-base tracking-wide">Google Reviews</span>
          </div>

          {/* Widget */}
          <div
            className="elfsight-app-34faaef9-a751-487c-9779-2697258033ca"
            data-elfsight-app-lazy
          />

          {/* BOTTOM OVERLAY */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[85px] bg-[#18181b] flex items-center justify-center border-t border-gray-800/40">
            <img
              src="/logo-white.png"
              alt="Ravindu Egodawatte Photography"
              className="h-8 object-contain opacity-75 hover:opacity-100 transition-opacity"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
