import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  Grid3X3,
  List
} from 'lucide-react';
import type { Category } from '@/types';
import { useData } from '@/context/DataContext';
import { validateImageFile } from '@/services/mockServices';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function GalleryPage() {
  const { categories, addGalleryImage, deleteGalleryImage, getImagesByCategory, loadImagesForCategory } = useData();
  // Start as null — categories may not have loaded from Supabase yet
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Auto-select the first category once Supabase data arrives
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Load real images from Supabase whenever the selected category changes
  useEffect(() => {
    if (selectedCategory) {
      loadImagesForCategory(selectedCategory.id);
    }
  }, [selectedCategory, loadImagesForCategory]);

  const images = selectedCategory ? getImagesByCategory(selectedCategory.id) : [];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return {
          file,
          preview: '',
          progress: 0,
          status: 'error',
          error: validation.error,
        };
      }
      return {
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
      };
    });

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
  });

  const handleUpload = async () => {
    if (!selectedCategory || uploadFiles.length === 0) return;

    setIsUploading(true);
    const validFiles = uploadFiles.filter(f => f.status !== 'error');

    for (let i = 0; i < validFiles.length; i++) {
      setUploadFiles(prev => prev.map((f) =>
        f.file === validFiles[i].file ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      try {
        await addGalleryImage(
          selectedCategory.id,
          validFiles[i].file,
          images.length + i + 1,
        );

        setUploadFiles(prev => prev.map((f) =>
          f.file === validFiles[i].file ? { ...f, progress: 100, status: 'completed' } : f
        ));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setUploadFiles(prev => prev.map((f) =>
          f.file === validFiles[i].file ? { ...f, status: 'error', error: message } : f
        ));
      }
    }

    setTimeout(() => setUploadFiles([]), 2000);
    setIsUploading(false);
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteGalleryImage(imageId);
    } catch {
      alert('Failed to delete image. Please try again.');
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedImages.size} images?`)) return;
    try {
      await Promise.all([...selectedImages].map(id => deleteGalleryImage(id)));
      setSelectedImages(new Set());
    } catch {
      alert('Failed to delete some images. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Gallery</h1>
          <p className="text-neutral-500 mt-1">Manage your portfolio images</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory?.id || ''}
            onChange={(e) => {
              const cat = categories.find(c => c.id === e.target.value);
              setSelectedCategory(cat || null);
            }}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="flex bg-neutral-900 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-amber-500 bg-amber-500/5'
            : 'border-neutral-700 hover:border-neutral-600'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
        <p className="text-white font-medium">
          {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
        </p>
        <p className="text-neutral-500 text-sm mt-1">
          or click to select files (JPG, PNG, WebP up to 10MB each)
        </p>
      </div>

      {uploadFiles.length > 0 && (
        <motion.div
          className="bg-neutral-950 border border-neutral-800 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Upload Queue ({uploadFiles.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setUploadFiles([])}
                className="px-3 py-1 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-900">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                  )}
                </div>
                
                {file.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  </div>
                )}
                
                {file.status === 'completed' && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                )}
                
                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                )}

                <button
                  onClick={() => removeUploadFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>

                {file.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {file.error && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-500 text-white text-xs rounded whitespace-nowrap">
                    {file.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">
            {selectedCategory?.name} ({images.length} images)
          </h3>
          {selectedImages.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedImages.size})
            </button>
          )}
        </div>

        {images.length > 0 ? (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className={`group relative ${viewMode === 'list' ? 'flex gap-4 bg-neutral-950 border border-neutral-800 rounded-lg p-4' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`relative overflow-hidden rounded-lg ${viewMode === 'list' ? 'w-24 h-24' : 'aspect-square'}`}>
                  <img
                    src={image.url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute top-2 left-2">
                    <button
                      onClick={() => toggleImageSelection(image.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedImages.has(image.id)
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-white/50 bg-black/30'
                      }`}
                    >
                      {selectedImages.has(image.id) && <Check className="w-4 h-4 text-black" />}
                    </button>
                  </div>
                </div>

                {viewMode === 'list' && (
                  <div className="flex-1">
                    <p className="text-white font-medium">Image {index + 1}</p>
                    <p className="text-neutral-500 text-sm">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl text-white font-medium">No images yet</h3>
            <p className="text-neutral-500 mt-2">Upload your first images to this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
