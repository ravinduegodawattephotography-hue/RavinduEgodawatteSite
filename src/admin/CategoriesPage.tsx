import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, FolderOpen, Image as ImageIcon, ChevronRight, ChevronLeft, ZoomIn } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import type { Category } from '@/types';
import { useData } from '@/context/DataContext';
import { generateSlug } from '@/services/mockServices';

interface CategoryFormData {
  name: string;
  description: string;
}

// ── Crop helpers ──────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas empty'))),
      'image/webp',
      0.9,
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();

  // ── Form / modal state ────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Crop state ────────────────────────────────────────────────────────────
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const [cropStep, setCropStep] = useState<'hero' | 'portfolio'>('hero');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [heroCropFile, setHeroCropFile] = useState<File | null>(null);
  const [coverCropFile, setCoverCropFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────────

  const resetCropState = () => {
    setHeroCropFile(null);
    setCoverCropFile(null);
    setHeroPreview('');
    setCoverPreview('');
    setRawImageSrc('');
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description ?? '' });
      setHeroPreview(category.heroImage ?? '');
      setCoverPreview(category.coverImage ?? '');
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      resetCropState();
    }
    setHeroCropFile(null);
    setCoverCropFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    resetCropState();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setRawImageSrc(src);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropStep('hero');
    setIsCropperOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleNextStep = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
    const file = new File([blob], `hero-${Date.now()}.webp`, { type: 'image/webp' });
    setHeroCropFile(file);
    setHeroPreview(URL.createObjectURL(blob));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropStep('portfolio');
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
    const file = new File([blob], `cover-${Date.now()}.webp`, { type: 'image/webp' });
    setCoverCropFile(file);
    setCoverPreview(URL.createObjectURL(blob));
    setIsCropperOpen(false);
  };

  const handleBackToCropStep = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropStep('hero');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name:           formData.name,
          description:    formData.description,
          coverImageFile: coverCropFile ?? undefined,
          heroImageFile:  heroCropFile ?? undefined,
        });
      } else {
        await addCategory({
          name:           formData.name,
          description:    formData.description,
          slug:           generateSlug(formData.name),
          coverImage:     '',
          imageCount:     0,
          coverImageFile: coverCropFile ?? undefined,
          heroImageFile:  heroCropFile ?? undefined,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This will also delete all images in this category.`)) {
      return;
    }
    try {
      await deleteCategory(category.id);
    } catch {
      alert('Failed to delete category. Please try again.');
    }
  };

  const CROP_ASPECT = cropStep === 'hero' ? 9 / 16 : 1;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white">Categories</h1>
          <p className="text-neutral-500 mt-1">Manage your photography categories and albums</p>
        </div>
        <motion.button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Category
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            className="group bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={category.coverImage}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x400/1a1a1a/d4af37?text=${encodeURIComponent(category.name)}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />

              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  onClick={() => handleOpenModal(category)}
                  className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-amber-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(category)}
                  className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  <p className="text-neutral-500 text-sm mt-1">{category.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>{category.imageCount} photos</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <FolderOpen className="w-4 h-4" />
                  <span>/{category.slug}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-medium">No categories yet</h3>
          <p className="text-neutral-500 mt-2">Create your first category to get started</p>
          <motion.button
            onClick={() => handleOpenModal()}
            className="mt-6 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Category
          </motion.button>
        </div>
      )}

      {/* ── Crop Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCropperOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex-shrink-0">
              <div>
                <p className="text-xs text-amber-500 uppercase tracking-widest mb-0.5 font-medium">
                  Step {cropStep === 'hero' ? '1' : '2'} of 2
                </p>
                <h3 className="text-lg font-medium text-white">
                  {cropStep === 'hero' ? 'Hero Crop — 9:16 Portrait' : 'Portfolio Crop — 1:1 Square'}
                </h3>
                <p className="text-sm text-neutral-400 mt-0.5">
                  {cropStep === 'hero'
                    ? 'Used for the vertical hero banner strips'
                    : 'Used for the portfolio grid thumbnails'}
                </p>
              </div>
              <button
                onClick={() => setIsCropperOpen(false)}
                className="w-9 h-9 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper canvas */}
            <div className="relative flex-1">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={CROP_ASPECT}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Footer controls */}
            <div className="flex items-center gap-6 px-6 py-5 border-t border-neutral-800 bg-neutral-950 flex-shrink-0">
              {/* Zoom slider */}
              <div className="flex items-center gap-3 flex-1">
                <ZoomIn className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {cropStep === 'portfolio' && (
                  <button
                    onClick={handleBackToCropStep}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-700 text-white rounded-lg hover:bg-neutral-900 transition-colors text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                {cropStep === 'hero' ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmCrop}
                    className="px-5 py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
                  >
                    Confirm Crops
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            <motion.div
              className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                <h2 className="text-xl font-medium text-white">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image upload + crop previews */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Images</label>
                  <div className="flex gap-3 items-end">
                    {/* Upload trigger */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-neutral-700 hover:border-amber-500/60 transition-colors cursor-pointer flex flex-col items-center justify-center text-neutral-500 hover:text-neutral-300 gap-1.5 select-none"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-[11px] text-center leading-tight">Upload<br/>&amp; Crop</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* Hero preview (9:16 portrait) */}
                    {heroPreview ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-[54px] h-24 rounded-md overflow-hidden border border-neutral-700">
                          <img src={heroPreview} alt="Hero" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-neutral-500">Hero 9:16</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-30">
                        <div className="w-[54px] h-24 rounded-md border border-dashed border-neutral-700 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-neutral-600" />
                        </div>
                        <span className="text-[10px] text-neutral-600">Hero 9:16</span>
                      </div>
                    )}

                    {/* Portfolio preview (1:1 square) */}
                    {coverPreview ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-24 h-24 rounded-md overflow-hidden border border-neutral-700">
                          <img src={coverPreview} alt="Portfolio" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-neutral-500">Portfolio 1:1</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 opacity-30">
                        <div className="w-24 h-24 rounded-md border border-dashed border-neutral-700 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-neutral-600" />
                        </div>
                        <span className="text-[10px] text-neutral-600">Portfolio 1:1</span>
                      </div>
                    )}

                    {/* Helper text */}
                    {!heroPreview && !coverPreview && (
                      <p className="text-xs text-neutral-600 flex-1 self-center leading-relaxed">
                        Upload a photo to crop it into the hero strip (9:16) and portfolio thumbnail (1:1).
                      </p>
                    )}
                  </div>
                </div>

                {/* Category name */}
                <div>
                  <label htmlFor="name" className="block text-sm text-neutral-400 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="e.g., Wedding"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm text-neutral-400 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                    placeholder="Brief description of this category..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 border border-neutral-700 text-white rounded-lg hover:bg-neutral-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name}
                    className="flex-1 px-4 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

