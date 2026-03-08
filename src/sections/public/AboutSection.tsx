import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const DEFAULT_DESCRIPTION =
  'Welcome to Ravindu Egodawatte Photography, where every moment is transformed into a timeless masterpiece. Based in Sri Lanka, I specialize in capturing the beauty and essence of weddings, engagements, fashion, products, graduations, birthdays and events. My work is a blend of creativity, emotion, and technical excellence, honed over years of dedication and passion for the art of photography.';

export default function AboutSection() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('about_image_url, about_description')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.about_image_url) setImageUrl(data.about_image_url);
        if (data?.about_description) setDescription(data.about_description);
      });
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-24 md:py-32 bg-black overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full px-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Section label */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-amber-500 text-sm tracking-[0.3em] uppercase">
              About
            </span>
          </motion.div>

          {/* 1:1 image — centered */}
          <motion.div
            className="relative w-64 md:w-80"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Ravindu Egodawatte Photography"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-neutral-700 text-xs tracking-[0.3em] uppercase text-center px-6">
                    Ravindu Egodawatte Photography
                  </span>
                </div>
              )}
            </div>
            {/* Decorative corner accents */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-2xl border border-amber-500/15 -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl border border-neutral-800 -z-10" />
          </motion.div>

          {/* Text */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-white leading-tight">
              Ravindu{' '}
              <span className="text-neutral-400 font-light italic">Egodawatte</span>
            </h2>
            <p className="mt-1 text-sm tracking-[0.35em] uppercase text-amber-500/80">
              Photography
            </p>
            <div className="mt-6 w-16 h-px bg-amber-500/50 mx-auto" />
            <p className="mt-8 text-neutral-400 text-base md:text-lg leading-relaxed">
              {description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
