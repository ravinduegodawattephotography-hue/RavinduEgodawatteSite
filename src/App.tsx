import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import HeroAccordion from '@/sections/public/HeroAccordion';

// Components
import LogoPreloader from '@/components/LogoPreloader';
import { Toaster } from '@/components/ui/sonner';
import PortfolioSection from '@/sections/public/PortfolioSection';
import AboutSection from '@/sections/public/AboutSection';
import TestimonialsSection from '@/sections/public/TestimonialsSection';
import ContactSection from '@/sections/public/ContactSection';
import Footer from '@/sections/public/Footer';

// Admin
import AdminLayout from '@/admin/AdminLayout';
import DashboardPage from '@/admin/DashboardPage';
import CategoriesPage from '@/admin/CategoriesPage';
import GalleryPage from '@/admin/GalleryPage';
import TestimonialsPage from '@/admin/TestimonialsPage';
import InboxPage from '@/admin/InboxPage';
import SettingsPage from '@/admin/SettingsPage';
import AboutPage from '@/admin/AboutPage';
import LoginPage from '@/admin/LoginPage';

// Public Layout
function PublicLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const handleComplete = useCallback(() => setIsLoading(false), []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LogoPreloader onComplete={handleComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <main>
            <HeroAccordion />
            <AboutSection />
            <PortfolioSection />
            <TestimonialsSection />
            <ContactSection />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  );
}

// Protected Route Wrapper for Admin
function ProtectedRoute() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

// Main App
function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-black' : 'bg-black'}`}>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<PublicLayout />} />
        
        <Route path="/admin/login" element={<LoginPage />} />
        
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
