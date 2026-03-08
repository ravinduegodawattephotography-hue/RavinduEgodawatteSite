import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface AperturePreloaderProps {
  onComplete: () => void;
}

export default function AperturePreloader({ onComplete }: AperturePreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const apertureRef = useRef<SVGSVGElement>(null);
  const bladesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsExiting(true), 300);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isExiting && bladesRef.current) {
      // Animate aperture blades opening
      gsap.to(bladesRef.current.querySelectorAll('.aperture-blade'), {
        rotation: (i: number) => 45 + i * 60,
        duration: 1.2,
        ease: 'power3.inOut',
        stagger: 0.02,
      });

      // Fade out and scale up
      gsap.to(apertureRef.current, {
        scale: 3,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.inOut',
        onComplete,
      });
    }
  }, [isExiting, onComplete]);

  // Generate aperture blade paths
  const bladeCount = 6;
  const blades = Array.from({ length: bladeCount }, (_, i) => {
    const angle = (i * 360) / bladeCount;
    return (
      <path
        key={i}
        className="aperture-blade"
        d="M0,0 L60,-20 L100,0 L60,20 Z"
        fill="currentColor"
        style={{
          transformOrigin: '100px 0px',
          transform: `rotate(${angle}deg)`,
        }}
      />
    );
  });

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-neutral-900 via-black to-black" />
      
      {/* Aperture Container */}
      <div className="relative flex flex-col items-center">
        {/* Aperture SVG */}
        <svg
          ref={apertureRef}
          viewBox="0 0 200 200"
          className="w-64 h-64 md:w-80 md:h-80 text-amber-500"
        >
          {/* Outer ring */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.5"
          />
          
          {/* Inner ring */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
          
          {/* Focus ring markings */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = (i * 360) / 24;
            return (
              <line
                key={i}
                x1="100"
                y1="10"
                x2="100"
                y2={i % 4 === 0 ? '18' : '14'}
                stroke="currentColor"
                strokeWidth={i % 4 === 0 ? '2' : '1'}
                opacity="0.4"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
          
          {/* Aperture blades */}
          <g
            ref={bladesRef}
            transform="translate(100, 100)"
            className="origin-center"
          >
            {blades}
          </g>
          
          {/* Center dot */}
          <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.8">
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Brand Name */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-3xl font-display text-white tracking-wider">
            Ravindu Egodawatte
          </h1>
          <p className="mt-2 text-sm text-amber-500/80 tracking-[0.3em] uppercase">
            Photography
          </p>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          className="mt-8 w-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-[2px] bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500 tracking-wider">
            {Math.min(Math.round(progress), 100)}%
          </p>
        </motion.div>

        {/* Focus text animation */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-xs text-neutral-600 tracking-[0.5em] uppercase">
            Focusing
          </p>
        </motion.div>
      </div>

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)'
        }}
      />
    </motion.div>
  );
}
