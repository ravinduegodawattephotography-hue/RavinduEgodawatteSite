/**
 * supabasePublic.ts
 *
 * Read-only helpers used by the public-facing portfolio site.
 * Also handles contact form submissions (unauthenticated insert).
 */

import { supabase } from './supabase';
import type { Category, GalleryImage, Testimonial, ContactMessage } from '@/types';
import { dbMessageToModel } from './supabaseAdmin';

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────

/**
 * Fetch all categories.
 * Each category's imageCount is resolved via a separate count query for accuracy.
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw new Error(`Fetch categories failed: ${error.message}`);
  if (!data?.length) return [];

  // Resolve image counts in parallel
  const categoriesWithCounts: Category[] = await Promise.all(
    data.map(async (row) => {
      const { count } = await supabase
        .from('portfolio_images')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', row.id);

      return {
        id:          String(row.id),
        name:        row.name,
        slug:        row.slug,
        coverImage:  row.cover_image ?? '',
        description: row.description ?? '',
        imageCount:  count ?? 0,
        createdAt:   row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt:   row.updated_at ? new Date(row.updated_at) : new Date(),
      } satisfies Category;
    }),
  );

  return categoriesWithCounts;
}

// ─────────────────────────────────────────────
// PORTFOLIO IMAGES
// ─────────────────────────────────────────────

/** Fetch all portfolio images belonging to a category. */
export async function fetchImagesByCategory(categoryId: string): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at');

  if (error) throw new Error(`Fetch images failed: ${error.message}`);

  return (data ?? []).map((row, index) => ({
    id:         String(row.id),
    categoryId: String(row.category_id),
    url:        row.image_url ?? '',
    order:      index + 1,
    createdAt:  row.created_at ? new Date(row.created_at) : new Date(),
  })) satisfies GalleryImage[];
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────

/**
 * Fetch all testimonials for the public slider.
 * NOTE: Because the `messages` table has no `is_active` column in the
 * current schema, all testimonials are returned as active (isActive=true).
 * Add an `is_active BOOLEAN DEFAULT true` column to filter here.
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch testimonials failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id:          String(row.id),
    clientName:  row.client_name,
    clientImage: row.client_image ?? '',
    review:      row.review_text,
    // `rating` and `isActive` are not in the DB schema.
    // Add those columns to your testimonials table to use them dynamically.
    rating:    5,
    isActive:  true,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  })) satisfies Testimonial[];
}

// ─────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────

/**
 * Insert a visitor's contact message.
 * Returns the saved message (with DB-generated id + timestamp).
 */
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<ContactMessage> {
  const { data: row, error } = await supabase
    .from('messages')
    .insert({
      name:    data.name,
      email:   data.email,
      phone:   data.phone || null,
      message: data.message,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw new Error(`Submit contact form failed: ${error.message}`);

  return dbMessageToModel(row);
}
