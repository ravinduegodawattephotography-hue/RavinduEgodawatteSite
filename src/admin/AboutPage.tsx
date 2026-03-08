import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, Image as ImageIcon, Loader2, CheckCircle, X, ZoomIn } from 'lucide-react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/supabaseAdmin';

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

export default function AboutPage() {
  const [description, setDescription] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [rawImageSrc, setRawImageSrc] = useState('');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettingsId(data.id);
          setDescription(data.about_description ?? '');
          if (data.about_image_url) {
            setCurrentImageUrl(data.about_image_url);
            setImagePreview(data.about_image_url);
          }
        }
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
    const file = new File([blob], `about-${Date.now()}.webp`, { type: 'image/webp' });
    setCropFile(file);
    setImagePreview(URL.createObjectURL(blob));
    setIsCropperOpen(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      let finalImageUrl = currentImageUrl;
      if (cropFile) {
        finalImageUrl = await uploadImage(cropFile, 'about');
        setCurrentImageUrl(finalImageUrl);
        setCropFile(null);
      }

      if (settingsId) {
        const { error: err } = await supabase
          .from('site_settings')
          .update({
            about_image_url: finalImageUrl || null,
            about_description: description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settingsId);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase
          .from('site_settings')
          .insert({
            about_image_url: finalImageUrl || null,
            about_description: description,
          })
          .select('id')
          .single();
        if (err) throw err;
        if (data) setSettingsId(data.id);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display text-white">About Us</h1>
        <p className="mt-1 text-neutral-400 text-sm">
          Manage the About section content displayed on the public website.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-medium text-white">Profile Image</h2>
          <p className="text-sm text-neutral-500">Square (1:1) — displayed alongside the bio.</p>

          {/* Preview */}
          <div className="aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 relative max-w-sm">
            {imagePreview ? (
              <img src={imagePreview} alt="About preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <ImageIcon className="w-12 h-12 text-neutral-700" />
                <span className="text-neutral-600 text-xs tracking-widest uppercase">No image</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm hover:bg-neutral-800 hover:border-amber-500/50 transition-all"
          >
            <Upload className="w-4 h-4" />
            {imagePreview ? 'Replace Image' : 'Upload Image'}
          </button>
        </motion.div>

        {/* Right: Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-medium text-white">Bio / Description</h2>
          <p className="text-sm text-neutral-500">
            This text appears in the About section of the public website.
          </p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors resize-none text-sm leading-relaxed"
            placeholder="Write a bio about your photography journey..."
          />
        </motion.div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm p-4 rounded-lg bg-red-500/10 border border-red-500/20"
        >
          {error}
        </motion.p>
      )}

      {/* Save */}
      <motion.button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isSaving ? 1 : 1.02 }}
        whileTap={{ scale: isSaving ? 1 : 0.98 }}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : isSaved ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </motion.button>

      {/* Cropper modal */}
      {isCropperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div>
                <h3 className="text-white font-medium">Crop Image</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Square (1:1) — drag to position</p>
              </div>
              <button
                onClick={() => setIsCropperOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crop area */}
            <div className="relative h-80 bg-neutral-900">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom */}
            <div className="p-4 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4 text-neutral-500 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
              </div>
            </div>

            {/* Confirm */}
            <div className="p-4 pt-0">
              <button
                onClick={handleConfirmCrop}
                className="w-full py-2.5 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors text-sm"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
