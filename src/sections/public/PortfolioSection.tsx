import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Grid3X3, Images } from 'lucide-react';
import type { Category, GalleryImage } from '@/types';
import { useData } from '@/context/DataContext';

// Masonry Grid Item
function MasonryItem({ 
  category, 
  index, 
  onClick 
}: { 
  category: Category; 
  index: number; 
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="relative group cursor-pointer overflow-hidden rounded-xl"
      style={{ aspectRatio: '4/3' }}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onClick}
      whileHover={{ scale: 0.98 }}
    >
      <div className="absolute inset-0">
        <img
          src={category.coverImage}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-amber-500 text-xs tracking-widest uppercase mb-2 block">
            {category.imageCount} Photos
          </span>
          <h3 className="text-2xl md:text-3xl font-display text-white group-hover:text-amber-500 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-2 text-sm text-neutral-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {category.description}
            </p>
          )}
        </motion.div>

        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Grid3X3 className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// Gallery Modal
function GalleryModal({
  category,
  images,
  isOpen,
  onClose,
}: {
  category: Category | null;
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsLoading(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  if (!category) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.button
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>

          <motion.div
            className="absolute top-6 left-6 z-10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-2xl font-display text-white">{category.name}</h2>
            <p className="text-sm text-neutral-400">
              {currentIndex + 1} / {images.length}
            </p>
          </motion.div>

          <div className="relative w-full h-full flex items-center justify-center p-20">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]?.url}
                alt={`${category.name} - ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setIsLoading(false)}
              />
            </AnimatePresence>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <motion.button
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={handlePrev}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </motion.button>
                <motion.button
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={handleNext}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-8 h-8" />
                </motion.button>
              </>
            )}
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80%] px-4 py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-amber-500 scale-110'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Portfolio Section
export default function PortfolioSection() {
  const { categories, loadImagesForCategory } = useData();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [, setIsLoadingImages] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const handleCategoryClick = async (category: Category) => {
    setSelectedCategory(category);
    setIsGalleryOpen(true);
    setIsLoadingImages(true);
    try {
      // loadImagesForCategory returns the fetched images directly —
      // we must NOT use getImagesByCategory here because React state
      // from setGalleryImagesState won't be visible until the next render.
      const loaded = await loadImagesForCategory(category.id);
      setGalleryImages(loaded.length > 0 ? loaded : generateMockImages(category));
    } catch {
      setGalleryImages(generateMockImages(category));
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Placeholder images shown while Supabase has no uploads yet
  const generateMockImages = (category: Category): GalleryImage[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `mock-${i}`,
      categoryId: category.id,
      url: `https://picsum.photos/seed/${category.slug}-${i}/1200/800`,
      order: i + 1,
      createdAt: new Date(),
    }));
  };

  return (
    <>
      <section
        id="portfolio"
        ref={sectionRef}
        className="relative w-full py-24 md:py-32 bg-black"
      >
        <div className="w-full px-6 md:px-12 lg:px-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-amber-500 text-sm tracking-[0.3em] uppercase">
              Our Work
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-display text-white">
              Portfolio
            </h2>
            <p className="mt-4 text-neutral-400 max-w-2xl mx-auto">
              Explore our collection of captured moments across various events and occasions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <MasonryItem
                key={category.id}
                category={category}
                index={index}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              className="inline-flex items-center gap-2 px-8 py-3 border border-neutral-700 text-white rounded-full hover:border-amber-500 hover:text-amber-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Images className="w-5 h-5" />
              View All Work
            </motion.button>
          </motion.div>
        </div>
      </section>

      <GalleryModal
        category={selectedCategory}
        images={galleryImages}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </>
  );
}
