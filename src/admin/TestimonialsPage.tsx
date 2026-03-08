import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Star, Quote, Eye, EyeOff } from 'lucide-react';
import type { Testimonial } from '@/types';
import { useData } from '@/context/DataContext';
import { validateImageFile } from '@/services/mockServices';

interface TestimonialFormData {
  clientName: string;
  review: string;
  rating: number;
  eventType: string;
  clientImage: string;
  isActive: boolean;
}

export default function TestimonialsPage() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TestimonialFormData>({
    clientName: '',
    review: '',
    rating: 5,
    eventType: '',
    clientImage: '',
    isActive: true,
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [clientImageFile, setClientImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        clientName: testimonial.clientName,
        review: testimonial.review,
        rating: testimonial.rating,
        eventType: testimonial.eventType || '',
        clientImage: testimonial.clientImage,
        isActive: testimonial.isActive,
      });
      setPreviewImage(testimonial.clientImage);
    } else {
      setEditingTestimonial(null);
      setFormData({
        clientName: '',
        review: '',
        rating: 5,
        eventType: '',
        clientImage: '',
        isActive: true,
      });
      setPreviewImage('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({
      clientName: '',
      review: '',
      rating: 5,
      eventType: '',
      clientImage: '',
      isActive: true,
    });
    if (previewImage.startsWith('blob:')) URL.revokeObjectURL(previewImage);
    setPreviewImage('');
    setClientImageFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (previewImage.startsWith('blob:')) URL.revokeObjectURL(previewImage);

    const objectUrl = URL.createObjectURL(file);
    setClientImageFile(file);
    setPreviewImage(objectUrl);
    setFormData(prev => ({ ...prev, clientImage: objectUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, {
          ...formData,
          clientImageFile: clientImageFile ?? undefined,
        });
      } else {
        await addTestimonial({
          ...formData,
          clientImageFile: clientImageFile ?? undefined,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      alert('Failed to save testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (testimonial: Testimonial) => {
    if (!confirm(`Are you sure you want to delete the testimonial from "${testimonial.clientName}"?`)) {
      return;
    }
    try {
      await deleteTestimonial(testimonial.id);
    } catch {
      alert('Failed to delete testimonial. Please try again.');
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await updateTestimonial(testimonial.id, { isActive: !testimonial.isActive });
    } catch {
      alert('Failed to update testimonial. Please try again.');
    }
  };

  const activeCount = testimonials.filter(t => t.isActive).length;
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white">Testimonials</h1>
          <p className="text-neutral-500 mt-1">Manage client reviews and testimonials</p>
        </div>
        <motion.button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <p className="text-neutral-500 text-sm">Total</p>
          <p className="text-2xl font-display text-white">{testimonials.length}</p>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <p className="text-neutral-500 text-sm">Active</p>
          <p className="text-2xl font-display text-green-500">{activeCount}</p>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <p className="text-neutral-500 text-sm">Hidden</p>
          <p className="text-2xl font-display text-neutral-400">
            {testimonials.filter(t => !t.isActive).length}
          </p>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <p className="text-neutral-500 text-sm">Avg Rating</p>
          <p className="text-2xl font-display text-amber-500">{avgRating}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            className={`group bg-neutral-950 border rounded-xl p-6 ${
              testimonial.isActive ? 'border-neutral-800' : 'border-neutral-800/50 opacity-70'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/30">
                  <img
                    src={testimonial.clientImage}
                    alt={testimonial.clientName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.clientName)}&background=d4af37&color=000`;
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">{testimonial.clientName}</h3>
                  {testimonial.eventType && (
                    <p className="text-amber-500/80 text-sm">{testimonial.eventType}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(testimonial)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    testimonial.isActive
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}
                  title={testimonial.isActive ? 'Hide' : 'Show'}
                >
                  {testimonial.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleOpenModal(testimonial)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < testimonial.rating
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-neutral-700'
                  }`}
                />
              ))}
            </div>

            <p className="text-neutral-300 text-sm line-clamp-3">
              &ldquo;{testimonial.review}&rdquo;
            </p>

            <p className="text-neutral-600 text-xs mt-4">
              {new Date(testimonial.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-20">
          <Quote className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-medium">No testimonials yet</h3>
          <p className="text-neutral-500 mt-2">Add your first client testimonial</p>
          <motion.button
            onClick={() => handleOpenModal()}
            className="mt-6 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Testimonial
          </motion.button>
        </div>
      )}

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
              className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                <h2 className="text-xl font-medium text-white">
                  {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Client Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full border-2 border-dashed border-neutral-700 hover:border-amber-500/50 transition-colors cursor-pointer overflow-hidden"
                    >
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload className="w-6 h-6 text-neutral-500" />
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <p className="text-white text-sm">Click to upload photo</p>
                      <p className="text-neutral-500 text-xs">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="clientName" className="block text-sm text-neutral-400 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="e.g., Sarah & Michael"
                  />
                </div>

                <div>
                  <label htmlFor="eventType" className="block text-sm text-neutral-400 mb-2">
                    Event Type
                  </label>
                  <input
                    type="text"
                    id="eventType"
                    value={formData.eventType}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="e.g., Wedding, Engagement"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                        className="p-2"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i < formData.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="review" className="block text-sm text-neutral-400 mb-2">
                    Review *
                  </label>
                  <textarea
                    id="review"
                    value={formData.review}
                    onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                    placeholder="Write the testimonial here..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.isActive ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.isActive ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-white text-sm">Visible on website</span>
                </div>

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
                    disabled={isSubmitting || !formData.clientName || !formData.review}
                    className="flex-1 px-4 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingTestimonial ? 'Update' : 'Create'}
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
