/**
 * HeroScroll.tsx
 *
 * Apple MacBook-Pro-style scroll-scrubbed video hero.
 *
 * Layout
 * ──────
 * • Outer section  → 400 vh tall (the scroll canvas)
 * • Sticky wrapper → 100 vh, pinned by GSAP for the full 400 vh
 * • <video>        → absolute, covers the full screen, never auto-plays
 * • Text panels    → left side (camera is on the right in the video)
 *
 * Scroll → Video mapping
 * ──────────────────────
 * ScrollTrigger progress (0 → 1) sets video.currentTime directly.
 * scrub: 0.5 damps the text timeline for a cinematic feel.
 *
 * Text sequence
 * ─────────────
 * 0 – 30 %   Panel 1  "Ravindu Egodawatte"
 * 35 – 65 %  Panel 2  "Precision in Every Frame."
 * 70 – 100%  Panel 3  "Let's Tell Your Story."
 */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once at module level
gsap.registerPlugin(ScrollTrigger);

// ── Decorative thin divider ─────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-4 mt-8 mb-2">
      <div className="h-px w-10 bg-amber-400/50" />
      <div className="w-1 h-1 rounded-full bg-amber-400/50" />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function HeroScroll() {
  const outerRef   = useRef<HTMLDivElement>(null);
  const stickyRef  = useRef<HTMLDivElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const logoRef      = useRef<HTMLDivElement>(null);
  const panel1Ref  = useRef<HTMLDivElement>(null);
  const panel2Ref  = useRef<HTMLDivElement>(null);
  const panel3Ref  = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const outer   = outerRef.current!;
      const sticky  = stickyRef.current!;
      const video   = videoRef.current!;
      const logo    = logoRef.current;
      const p1      = panel1Ref.current!;
      const p2      = panel2Ref.current!;
      const p3      = panel3Ref.current!;
      const ind     = indicatorRef.current!;

      // ── Set initial states before first paint ───────────────────────────
      gsap.set([p1, p2, p3], { opacity: 0, y: 60 });
      if (logo) gsap.set(logo, { opacity: 1, scale: 1 });
      gsap.set(ind, { opacity: 1 });

      // ── Video scrubbing ─────────────────────────────────────────────────
      const scrubST = ScrollTrigger.create({
        trigger: outer,
        start:   'top top',
        end:     'bottom top',
        pin:     sticky,
        pinSpacing: false,
        onUpdate: (self) => {
          const dur = video.duration;
          if (dur && !isNaN(dur)) {
            video.currentTime = dur * self.progress;
          }
        },
      });

      // Refresh when video metadata is ready so duration is accurate
      const onMeta = () => ScrollTrigger.refresh();
      video.addEventListener('loadedmetadata', onMeta);

      // ── Text animation timeline ─────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outer,
          start:   'top top',
          end:     'bottom top',
          scrub:   0.5,
        },
        defaults: { ease: 'none' },
      });

      // ── Panel 1 ─ 0 → 30% ──────────────────────────────────────────────
      tl
        .fromTo(p1,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.08 },
          0,
        )
        .to(p1,
          { opacity: 0, y: -40, duration: 0.08 },
          0.22,
        )

      // ── Panel 2 ─ 35 → 65% ─────────────────────────────────────────────
        .fromTo(p2,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.08 },
          0.35,
        )
        .to(p2,
          { opacity: 0, y: -40, duration: 0.08 },
          0.57,
        )

      // ── Panel 3 ─ 70 → 100% ────────────────────────────────────────────
        .fromTo(p3,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.08 },
          0.70,
        )
        .set({}, {}, 1);

      // Fade out scroll indicator and center logo as soon as user starts scrolling
      if (logo) tl.to(logo, { opacity: 0, scale: 0.9, duration: 0.05 }, 0.02);
      tl.to(ind, { opacity: 0, duration: 0.05 }, 0.02);

      return () => {
        scrubST.kill();
        video.removeEventListener('loadedmetadata', onMeta);
      };
    },
    { scope: outerRef },
  );

  return (
    /**
     * Outer section — 400 vh scroll canvas.
     * GSAP pins stickyRef inside this container.
     */
    <section
      id="home"
      ref={outerRef}
      className="relative w-full bg-black"
      style={{ height: '400vh' }}
    >
      {/* ── Sticky wrapper — 100 vh, pinned by GSAP ──────────────────── */}
      <div
        ref={stickyRef}
        className="relative w-full overflow-hidden bg-black"
        style={{ height: '100vh' }}
      >
        {/* ── Full-screen video (scrubs on scroll, never auto-plays) ──── */}
        <video
          ref={videoRef}
          src="/camera-hero.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* ── Gradient overlays ──────────────────────────────────────── */}
        {/* Left-side fade: creates contrast for the text area */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

        {/* ── Text panels — left 46 % of screen ─────────────────────── */}
        <div className="absolute inset-0 flex items-center">
          <div className="relative w-[46vw] ml-14 sm:ml-20 lg:ml-28 xl:ml-36">

            {/* ── Panel 1 ─────────────────────────────────────────────── */}
            <div
              ref={panel1Ref}
              className="absolute left-0 top-1/2 -translate-y-1/2 will-change-transform"
              style={{ opacity: 0 }}
            >
              <p className="text-xs tracking-[0.45em] text-amber-400/70 uppercase">
                Photography Portfolio
              </p>

              <Divider />

              <h1 className="font-display mt-4 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]
                             text-white font-light leading-[1.05] tracking-tight">
                Ravindu<br />
                <span className="text-amber-300 italic">Egodawatte</span>
              </h1>

              <p className="mt-7 text-base lg:text-lg text-neutral-300/90
                            font-light leading-relaxed tracking-wide max-w-xs">
                Transforming ordinary moments into<br />
                extraordinary memories.
              </p>
            </div>

            {/* ── Panel 2 ─────────────────────────────────────────────── */}
            <div
              ref={panel2Ref}
              className="absolute left-0 top-1/2 -translate-y-1/2 will-change-transform"
              style={{ opacity: 0 }}
            >
              <p className="text-xs tracking-[0.45em] text-amber-400/70 uppercase">
                Specialisation
              </p>

              <Divider />

              <h2 className="font-display mt-4 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]
                             text-white font-light leading-[1.05] tracking-tight">
                Precision in<br />
                <span className="text-amber-300 italic">Every Frame.</span>
              </h2>

              <p className="mt-7 text-base lg:text-lg text-neutral-300/90
                            font-light leading-relaxed tracking-wide max-w-xs">
                Specialising in High-End Weddings<br />
                &amp; Fashion Photography.
              </p>
            </div>

            {/* ── Panel 3 ─────────────────────────────────────────────── */}
            <div
              ref={panel3Ref}
              className="absolute left-0 top-1/2 -translate-y-1/2 will-change-transform"
              style={{ opacity: 0 }}
            >
              <p className="text-xs tracking-[0.45em] text-amber-400/70 uppercase">
                Begin Here
              </p>

              <Divider />

              <h2 className="font-display mt-4 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]
                             text-white font-light leading-[1.05] tracking-tight">
                Let's Tell<br />
                <span className="text-amber-300 italic">Your Story.</span>
              </h2>

              {/* Gold / Champagne CTA button */}
              <div className="mt-10">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center gap-3
                             border border-amber-400/50 text-amber-300
                             text-xs tracking-[0.35em] uppercase font-light
                             px-10 py-4
                             transition-all duration-500
                             hover:bg-amber-400/10 hover:border-amber-300
                             hover:tracking-[0.5em]"
                >
                  Book a Session
                  {/* Arrow that slides on hover */}
                  <svg
                    viewBox="0 0 16 8"
                    className="w-4 h-auto opacity-60 transition-transform duration-500 group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <path d="M0 4h14M10 1l4 3-4 3" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── Scroll indicator ─────────────────────────────────────────── */}
        <div
          ref={indicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2
                     flex flex-col items-center gap-3 pointer-events-none"
        >
          <span className="text-[10px] text-neutral-500 tracking-[0.4em] uppercase">
            Scroll
          </span>
          <div className="w-px h-14 bg-gradient-to-b from-neutral-500/60 to-transparent" />
        </div>

        {/* ── Center Initial Logo ──────────────────────────────────────── */}
        <div
          ref={logoRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 bg-black"
        >
          <img 
            src="/logo-white.png" 
            alt="Ravindu Egodawatte Photography" 
            className="w-64 md:w-80 lg:w-96 h-auto opacity-80"
          />
        </div>

        {/* ── Right-side vertical label ─────────────────────────────────── */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2
                        hidden lg:flex flex-col items-center gap-3 opacity-30">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-neutral-400 to-transparent" />
          <span
            className="text-[10px] text-neutral-400 tracking-[0.35em] uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Sri Lanka
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-neutral-400 to-transparent" />
        </div>

      </div>
    </section>
  );
}
