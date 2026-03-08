import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LogoPreloaderProps {
  onComplete: () => void;
}

export default function LogoPreloader({ onComplete }: LogoPreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Dimmed Background Logo */}
        <img 
          src="/logo-white.png" 
          alt="Ravindu Egodawatte Photography" 
          className="w-64 md:w-80 lg:w-96 h-auto opacity-20"
        />
        {/* Glowing / Filling Logo */}
        <motion.div
          className="absolute inset-0 overflow-hidden transition-all duration-100 ease-linear"
          style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
        >
          <img 
            src="/logo-white.png" 
            alt="Ravindu Egodawatte Photography" 
            className="w-64 md:w-80 lg:w-96 h-auto max-w-none filter brightness-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
          />
        </motion.div>
      </motion.div>

      {/* Progress Bar (Hidden as requested) */}
      <motion.div
        className="hidden mt-12 w-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="h-[2px] bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
