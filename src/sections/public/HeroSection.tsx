import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToPortfolio = () => {
    const element = document.querySelector('#portfolio');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark overlay so text is legible */}
      <div className="absolute inset-0 bg-black/55 z-[1]" />

      {/* Subtle left-side gradient for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-[2]" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[3] pointer-events-none" />

      {/* Left-aligned content */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-center px-8 sm:px-14 md:px-20 lg:px-28"
        style={{ opacity, y: textY }}
      >
        {/* Label */}
        <motion.span
          className="text-amber-500 text-xs sm:text-sm tracking-[0.35em] uppercase mb-6 block"
          initial={{ opacity: 0, x: -20 }}
          animate={isLoaded ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Professional Photography
        </motion.span>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight leading-[1.05]">
            <span className="block">Ravindu</span>
            <span className="block text-amber-500 mt-1">Egodawatte</span>
          </h1>
        </motion.div>

        {/* Divider line */}
        <motion.div
          className="mt-8 h-[1px] w-16 bg-amber-500"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isLoaded ? { opacity: 1, scaleX: 1 } : {}}
          style={{ originX: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        />

        {/* Tagline */}
        <motion.p
          className="mt-6 text-sm md:text-base text-neutral-400 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          Capturing moments that last a lifetime — weddings, portraits &amp; events across Sri Lanka.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            onClick={scrollToPortfolio}
            className="px-8 py-3 bg-amber-500 text-black font-medium rounded-full hover:bg-amber-400 transition-colors w-fit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Portfolio
          </motion.button>
          <motion.a
            href="#contact"
            className="px-8 py-3 border border-neutral-600 text-white rounded-full hover:border-amber-500 hover:text-amber-500 transition-colors w-fit"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get in Touch
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-8 sm:left-14 md:left-20 lg:left-28 z-20 flex flex-col items-start gap-2"
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
      >
        <span className="text-xs text-neutral-500 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        </motion.div>
      </motion.div>

      {/* Right-side decorative vertical text */}
      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-4"
        initial={{ opacity: 0, x: 20 }}
        animate={isLoaded ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1.5 }}
      >
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-neutral-600 to-transparent" />
        <span className="text-xs text-neutral-500 tracking-widest uppercase rotate-90 whitespace-nowrap origin-center">
          Sri Lanka
        </span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-neutral-600 to-transparent" />
      </motion.div>
    </section>
  );
}
