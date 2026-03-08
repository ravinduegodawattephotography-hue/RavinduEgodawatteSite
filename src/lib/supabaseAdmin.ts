/**
 * supabaseAdmin.ts
 *
 * Admin-only CRUD helpers for the photography portfolio.
 * Images are uploaded to Cloudinary via unsigned uploads.
 * Supabase is used only for Auth and the PostgreSQL database.
 *
 * Tables: categories · portfolio_images · testimonials · messages
 *
 * Required .env variables:
 *   VITE_CLOUDINARY_CLOUD_NAME   — your Cloudinary cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET — an unsigned upload preset
 */

import { supabase } from './supabase';
import type { Category, GalleryImage, Testimonial, ContactMessage } from '@/types';

// ─────────────────────────────────────────────
// CLOUDINARY CONFIG
// ─────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   as string;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
const CLOUDINARY_UPLOAD_URL   = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// ─────────────────────────────────────────────
// WebP COMPRESSION HELPER
// Uses the browser's HTMLCanvasElement to decode any image
// file and re-encode it as WebP at the given quality (0–1).
// ─────────────────────────────────────────────

export function compressToWebP(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      // Cap at 2400px on the longest edge to avoid oversized uploads
      const MAX = 2400;
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
        else        { w = Math.round((w / h) * MAX); h = MAX; }
      }
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return; }
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob() returned null'));
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

// ─────────────────────────────────────────────
// UPLOAD IMAGE
// Compresses to WebP then uploads to Cloudinary via unsigned upload.
// Returns the secure_url from Cloudinary.
// `folder` — Cloudinary folder, e.g. "categories"
// ─────────────────────────────────────────────

export async function uploadImage(file: File, folder: string): Promise<string> {
  const webpBlob = await compressToWebP(file);

  const formData = new FormData();
  formData.append('file', webpBlob, `${Date.now()}.webp`);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed: ${err.error?.message ?? response.statusText}`);
  }

  const result = await response.json();
  return result.secure_url as string;
}

// ─────────────────────────────────────────────
// CATEGORIES
// DB columns: id · name · slug · cover_image
// ─────────────────────────────────────────────

/** Insert a new category. Pass either a File (preferred) or a pre-existing URL. */
export async function adminAddCategory(data: {
  name: string;
  slug: string;
  description?: string;
  coverImageFile?: File;
  heroImageFile?: File;
  coverImageUrl?: string;
}): Promise<Category> {
  let coverImage = data.coverImageUrl ?? '';
  let heroImage = '';

  if (data.coverImageFile) {
    coverImage = await uploadImage(data.coverImageFile, 'categories/portfolio');
  }
  if (data.heroImageFile) {
    heroImage = await uploadImage(data.heroImageFile, 'categories/hero');
  }

  const { data: row, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      cover_image: coverImage,
      hero_image: heroImage,
    })
    .select()
    .single();

  if (error) throw new Error(`Add category failed: ${error.message}`);

  return dbCategoryToModel(row, 0);
}

/** Update name, slug, description, and/or cover image. */
export async function adminUpdateCategory(
  id: string,
  data: { name?: string; description?: string; coverImageFile?: File; heroImageFile?: File },
): Promise<Category> {
  const updates: Record<string, string> = {};

  if (data.name) {
    updates.name = data.name;
    updates.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (data.coverImageFile) {
    updates.cover_image = await uploadImage(data.coverImageFile, 'categories/portfolio');
  }
  if (data.heroImageFile) {
    updates.hero_image = await uploadImage(data.heroImageFile, 'categories/hero');
  }

  const { data: row, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Update category failed: ${error.message}`);

  const count = await countImagesForCategory(id);
  return dbCategoryToModel(row, count);
}

/** Delete a category and all its portfolio images (DB rows only). */
export async function adminDeleteCategory(id: string): Promise<void> {
  // 1. Delete portfolio_images rows for this category
  await supabase.from('portfolio_images').delete().eq('category_id', id);

  // 2. Delete the category row
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(`Delete category failed: ${error.message}`);
}

// ─────────────────────────────────────────────
// PORTFOLIO IMAGES
// DB columns: id · category_id · image_url
// ─────────────────────────────────────────────

/** Upload a file and add it to the portfolio_images table. */
export async function adminAddPortfolioImage(
  categoryId: string,
  file: File,
  order = 0,
): Promise<GalleryImage> {
  const url = await uploadImage(file, `portfolio/${categoryId}`);

  const { data: row, error } = await supabase
    .from('portfolio_images')
    .insert({ category_id: categoryId, image_url: url })
    .select()
    .single();

  if (error) throw new Error(`Add portfolio image failed: ${error.message}`);

  return dbImageToModel(row, order);
}

/** Delete a portfolio image (DB row only; Cloudinary file is not removed from the frontend). */
export async function adminDeletePortfolioImage(id: string, _imageUrl: string): Promise<void> {
  const { error } = await supabase.from('portfolio_images').delete().eq('id', id);
  if (error) throw new Error(`Delete portfolio image failed: ${error.message}`);
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// DB columns: id · client_name · review_text · client_image
// ─────────────────────────────────────────────

/** Insert a testimonial, optionally uploading a client photo. */
export async function adminAddTestimonial(data: {
  clientName: string;
  review: string;
  rating?: number;
  eventType?: string;
  isActive?: boolean;
  clientImageFile?: File;
  clientImageUrl?: string;
}): Promise<Testimonial> {
  let clientImage = data.clientImageUrl ?? '';
  if (data.clientImageFile) {
    clientImage = await uploadImage(data.clientImageFile, 'testimonials');
  }

  const { data: row, error } = await supabase
    .from('testimonials')
    .insert({
      client_name:  data.clientName,
      review_text:  data.review,
      client_image: clientImage,
    })
    .select()
    .single();

  if (error) throw new Error(`Add testimonial failed: ${error.message}`);

  return dbTestimonialToModel(row, data.rating ?? 5, data.eventType, data.isActive ?? true);
}

/** Update an existing testimonial. Pass `clientImageFile` to replace the photo. */
export async function adminUpdateTestimonial(
  id: string,
  data: {
    clientName?: string;
    review?: string;
    rating?: number;
    eventType?: string;
    isActive?: boolean;
    clientImageFile?: File;
  },
): Promise<Testimonial> {
  const updates: Record<string, string> = {};
  if (data.clientName) updates.client_name  = data.clientName;
  if (data.review)     updates.review_text  = data.review;
  if (data.clientImageFile) {
    updates.client_image = await uploadImage(data.clientImageFile, 'testimonials');
  }

  const { data: row, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Update testimonial failed: ${error.message}`);

  return dbTestimonialToModel(row, data.rating ?? 5, data.eventType, data.isActive ?? true);
}

/** Delete a testimonial (DB row only; Cloudinary file is not removed from the frontend). */
export async function adminDeleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(`Delete testimonial failed: ${error.message}`);
}

// ─────────────────────────────────────────────
// GOOGLE REVIEWS SYNC
// Fetches up to 5 reviews from the Google Places API via
// corsproxy.io (to avoid CORS in the browser), then inserts
// any that don't already exist in the testimonials table.
// Required env vars:
//   VITE_GOOGLE_PLACES_API_KEY  — Google Cloud API key with Places enabled
//   VITE_GOOGLE_PLACE_ID        — Google Place ID for your business
// ─────────────────────────────────────────────

interface GoogleReview {
  author_name: string;
  text: string;
  rating: number;
  profile_photo_url?: string;
  relative_time_description?: string;
}

export interface GoogleSyncResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

export async function syncGoogleReviews(): Promise<GoogleSyncResult> {
  const apiKey  = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string | undefined;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID       as string | undefined;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
    throw new Error('VITE_GOOGLE_PLACES_API_KEY is not set in your .env file.');
  }
  if (!placeId || placeId === 'YOUR_GOOGLE_PLACE_ID') {
    throw new Error('VITE_GOOGLE_PLACE_ID is not set in your .env file.');
  }

  const placesUrl =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=reviews` +
    `&key=${encodeURIComponent(apiKey)}`;

  const proxied = `https://corsproxy.io/?${encodeURIComponent(placesUrl)}`;

  const response = await fetch(proxied);
  if (!response.ok) {
    throw new Error(`Google Places request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.status !== 'OK') {
    throw new Error(`Google Places API error: ${json.status} — ${json.error_message ?? 'unknown'}`);
  }

  const reviews: GoogleReview[] = json.result?.reviews ?? [];
  if (!reviews.length) {
    return { inserted: 0, skipped: 0, errors: [] };
  }

  const result: GoogleSyncResult = { inserted: 0, skipped: 0, errors: [] };

  for (const review of reviews) {
    if (!review.author_name || !review.text) continue;

    // Duplicate check — same author + same review text already in DB
    const { data: existing, error: checkError } = await supabase
      .from('testimonials')
      .select('id')
      .eq('client_name', review.author_name)
      .eq('review_text', review.text)
      .maybeSingle();

    if (checkError) {
      result.errors.push(`Duplicate check failed for "${review.author_name}": ${checkError.message}`);
      continue;
    }

    if (existing) {
      result.skipped++;
      continue;
    }

    const { error: insertError } = await supabase
      .from('testimonials')
      .insert({
        client_name:  review.author_name,
        review_text:  review.text,
        client_image: review.profile_photo_url ?? '',
      });

    if (insertError) {
      result.errors.push(`Insert failed for "${review.author_name}": ${insertError.message}`);
    } else {
      result.inserted++;
    }
  }

  return result;
}

// ─────────────────────────────────────────────
// MESSAGES
// DB columns: id · name · email · message · is_read
// ─────────────────────────────────────────────

/** Fetch all contact messages, newest first. */
export async function adminFetchMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch messages failed: ${error.message}`);
  return (data ?? []).map(dbMessageToModel);
}

/** Mark a single message as read. */
export async function adminMarkMessageRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw new Error(`Mark message read failed: ${error.message}`);
}

/** Permanently delete a message. */
export async function adminDeleteMessage(id: string): Promise<void> {
  const { error } = await supabase.from('messages').delete().eq('id', id);
  if (error) throw new Error(`Delete message failed: ${error.message}`);
}

/** Mark a single message as replied. */
export async function adminMarkMessageReplied(id: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_replied: true })
    .eq('id', id);
  if (error) throw new Error(`Mark message replied failed: ${error.message}`);
}

// ─────────────────────────────────────────────
// ROW → MODEL MAPPERS
// Maps snake_case DB rows to camelCase TypeScript types.
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbCategoryToModel(row: any, imageCount: number): Category {
  return {
    id:          String(row.id),
    name:        row.name,
    slug:        row.slug,
    coverImage:  row.cover_image ?? '',
    heroImage:   row.hero_image ?? '',
    description: row.description ?? '',
    imageCount,
    createdAt:   row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt:   row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbImageToModel(row: any, order: number): GalleryImage {
  return {
    id:         String(row.id),
    categoryId: String(row.category_id),
    url:        row.image_url ?? '',
    order,
    createdAt:  row.created_at ? new Date(row.created_at) : new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbTestimonialToModel(row: any, rating: number, eventType?: string, isActive = true): Testimonial {
  return {
    id:          String(row.id),
    clientName:  row.client_name,
    clientImage: row.client_image ?? '',
    review:      row.review_text,
    rating,
    eventType:   eventType ?? '',
    isActive,
    createdAt:   row.created_at ? new Date(row.created_at) : new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbMessageToModel(row: any): ContactMessage {
  return {
    id:         String(row.id),
    name:       row.name,
    email:      row.email,
    phone:      row.phone ?? undefined,
    message:    row.message,
    isRead:     row.is_read ?? false,
    isReplied:  row.is_replied ?? false,
    createdAt:  row.created_at ? new Date(row.created_at) : new Date(),
  };
}

async function countImagesForCategory(categoryId: string): Promise<number> {
  const { count } = await supabase
    .from('portfolio_images')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);
  return count ?? 0;
}
