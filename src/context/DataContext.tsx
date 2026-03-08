import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Category, GalleryImage, Testimonial, ContactMessage } from '@/types';
import {
  adminAddCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminAddPortfolioImage,
  adminDeletePortfolioImage,
  adminAddTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  adminFetchMessages,
  adminMarkMessageRead,
  adminMarkMessageReplied,
  adminDeleteMessage,
} from '@/lib/supabaseAdmin';
import {
  fetchCategories,
  fetchImagesByCategory as supaFetchImagesByCategory,
  fetchTestimonials,
  submitContactForm,
} from '@/lib/supabasePublic';

// ─────────────────────────────────────────────
// CONTEXT TYPE
// Kept identical to the original so NO UI component needs to change.
// ─────────────────────────────────────────────

interface DataContextType {
  // Data loading state
  isLoading: boolean;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { coverImageFile?: File; heroImageFile?: File }) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category> & { coverImageFile?: File; heroImageFile?: File }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Gallery
  galleryImages: GalleryImage[];
  setGalleryImages: (images: GalleryImage[]) => void;
  addGalleryImage: (categoryId: string, file: File, order?: number) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  getImagesByCategory: (categoryId: string) => GalleryImage[];
  loadImagesForCategory: (categoryId: string) => Promise<GalleryImage[]>;

  // Testimonials
  testimonials: Testimonial[];
  setTestimonials: (testimonials: Testimonial[]) => void;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'createdAt'> & { clientImageFile?: File }) => Promise<void>;
  updateTestimonial: (id: string, updates: Partial<Testimonial> & { clientImageFile?: File }) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  // Messages
  messages: ContactMessage[];
  setMessages: (messages: ContactMessage[]) => void;
  addMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead' | 'isReplied'>) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  markMessageAsReplied: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategoriesState]   = useState<Category[]>([]);
  const [galleryImages, setGalleryImagesState] = useState<GalleryImage[]>([]);
  const [testimonials, setTestimonialsState]   = useState<Testimonial[]>([]);
  const [messages, setMessagesState]           = useState<ContactMessage[]>([]);

  // ── Bootstrap: load everything from Supabase on first render ──
  useEffect(() => {
    async function loadAll() {
      try {
        const [cats, tests, msgs] = await Promise.all([
          fetchCategories(),
          fetchTestimonials(),
          adminFetchMessages(),
        ]);
        setCategoriesState(cats);
        setTestimonialsState(tests);
        setMessagesState(msgs);
      } catch (err) {
        console.error('[DataContext] Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  // ──────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────

  const setCategories = useCallback((cats: Category[]) => {
    setCategoriesState(cats);
  }, []);

  const addCategory = useCallback(async (
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { coverImageFile?: File; heroImageFile?: File },
  ) => {
    const newCat = await adminAddCategory({
      name:           category.name,
      slug:           category.slug,
      description:    category.description,
      coverImageFile: category.coverImageFile,
      heroImageFile:  category.heroImageFile,
      coverImageUrl:  category.coverImageFile ? undefined : category.coverImage,
    });
    setCategoriesState(prev => [...prev, newCat]);
  }, []);

  const updateCategory = useCallback(async (
    id: string,
    updates: Partial<Category> & { coverImageFile?: File; heroImageFile?: File },
  ) => {
    const updatedCat = await adminUpdateCategory(id, {
      name:           updates.name,
      description:    updates.description,
      coverImageFile: updates.coverImageFile,
      heroImageFile:  updates.heroImageFile,
    });
    setCategoriesState(prev =>
      prev.map(cat => (cat.id === id ? updatedCat : cat)),
    );
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await adminDeleteCategory(id);
    setCategoriesState(prev => prev.filter(cat => cat.id !== id));
    setGalleryImagesState(prev => prev.filter(img => img.categoryId !== id));
  }, []);

  // ──────────────────────────────────────────
  // GALLERY IMAGES
  // ──────────────────────────────────────────

  const setGalleryImages = useCallback((images: GalleryImage[]) => {
    setGalleryImagesState(images);
  }, []);

  // Upload a file and add it to the gallery state
  const addGalleryImage = useCallback(async (
    categoryId: string,
    file: File,
    order = 0,
  ) => {
    const newImage = await adminAddPortfolioImage(categoryId, file, order);
    setGalleryImagesState(prev => [...prev, newImage]);
    // Increment imageCount on the parent category
    setCategoriesState(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, imageCount: cat.imageCount + 1 }
          : cat,
      ),
    );
  }, []);

  const deleteGalleryImage = useCallback(async (id: string) => {
    const image = galleryImages.find(img => img.id === id);
    if (!image) return;
    await adminDeletePortfolioImage(id, image.url);
    setGalleryImagesState(prev => prev.filter(img => img.id !== id));
    setCategoriesState(prev =>
      prev.map(cat =>
        cat.id === image.categoryId && cat.imageCount > 0
          ? { ...cat, imageCount: cat.imageCount - 1 }
          : cat,
      ),
    );
  }, [galleryImages]);

  const getImagesByCategory = useCallback((categoryId: string) => {
    return galleryImages.filter(img => img.categoryId === categoryId);
  }, [galleryImages]);

  // Lazily load images for a specific category from Supabase and return them
  const loadImagesForCategory = useCallback(async (categoryId: string): Promise<GalleryImage[]> => {
    const images = await supaFetchImagesByCategory(categoryId);
    setGalleryImagesState(prev => {
      const withoutOld = prev.filter(img => img.categoryId !== categoryId);
      return [...withoutOld, ...images];
    });
    return images;
  }, []);

  // ──────────────────────────────────────────
  // TESTIMONIALS
  // ──────────────────────────────────────────

  const setTestimonials = useCallback((t: Testimonial[]) => {
    setTestimonialsState(t);
  }, []);

  const addTestimonial = useCallback(async (
    testimonial: Omit<Testimonial, 'id' | 'createdAt'> & { clientImageFile?: File },
  ) => {
    const newT = await adminAddTestimonial({
      clientName:     testimonial.clientName,
      review:         testimonial.review,
      rating:         testimonial.rating,
      eventType:      testimonial.eventType,
      isActive:       testimonial.isActive,
      clientImageFile: testimonial.clientImageFile,
      clientImageUrl: testimonial.clientImageFile ? undefined : testimonial.clientImage,
    });
    setTestimonialsState(prev => [...prev, newT]);
  }, []);

  const updateTestimonial = useCallback(async (
    id: string,
    updates: Partial<Testimonial> & { clientImageFile?: File },
  ) => {
    const updatedT = await adminUpdateTestimonial(id, {
      clientName:      updates.clientName,
      review:          updates.review,
      rating:          updates.rating,
      eventType:       updates.eventType,
      isActive:        updates.isActive,
      clientImageFile: updates.clientImageFile,
    });
    setTestimonialsState(prev =>
      prev.map(t => (t.id === id ? { ...updatedT, rating: updates.rating ?? t.rating, isActive: updates.isActive ?? t.isActive } : t)),
    );
  }, []);

  const deleteTestimonial = useCallback(async (id: string) => {
    await adminDeleteTestimonial(id);
    setTestimonialsState(prev => prev.filter(t => t.id !== id));
  }, []);

  // ──────────────────────────────────────────
  // MESSAGES
  // ──────────────────────────────────────────

  const setMessages = useCallback((m: ContactMessage[]) => {
    setMessagesState(m);
  }, []);

  const addMessage = useCallback(async (
    message: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>,
  ) => {
    const saved = await submitContactForm(message);
    setMessagesState(prev => [saved, ...prev]);
  }, []);

  const markMessageAsRead = useCallback(async (id: string) => {
    await adminMarkMessageRead(id);
    setMessagesState(prev =>
      prev.map(m => (m.id === id ? { ...m, isRead: true } : m)),
    );
  }, []);

  const markMessageAsReplied = useCallback(async (id: string) => {
    await adminMarkMessageReplied(id);
    setMessagesState(prev =>
      prev.map(m => (m.id === id ? { ...m, isReplied: true } : m)),
    );
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    await adminDeleteMessage(id);
    setMessagesState(prev => prev.filter(m => m.id !== id));
  }, []);

  // ──────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────

  return (
    <DataContext.Provider
      value={{
        isLoading,
        categories,
        setCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        galleryImages,
        setGalleryImages,
        addGalleryImage,
        deleteGalleryImage,
        getImagesByCategory,
        loadImagesForCategory,
        testimonials,
        setTestimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        messages,
        setMessages,
        addMessage,
        markMessageAsRead,
        markMessageAsReplied,
        deleteMessage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
