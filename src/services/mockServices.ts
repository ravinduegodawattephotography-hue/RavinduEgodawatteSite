// Mock Services for Ravindu Egodawatte Photography
// These functions simulate backend operations.
// Replace these with actual API calls when connecting to your database.

import type { Category, GalleryImage, Testimonial, ContactMessage } from '@/types';

// Mock Data Store
let mockCategories: Category[] = [
  {
    id: '1',
    name: 'Wedding',
    slug: 'wedding',
    coverImage: '/images/categories/wedding.jpg',
    description: 'Capturing your special day with elegance and emotion',
    imageCount: 24,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Engagement',
    slug: 'engagement',
    coverImage: '/images/categories/engagement.jpg',
    description: 'Beautiful pre-wedding moments',
    imageCount: 18,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Portrait',
    slug: 'portrait',
    coverImage: '/images/categories/portrait.jpg',
    description: 'Professional portrait photography',
    imageCount: 32,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    name: 'Events',
    slug: 'events',
    coverImage: '/images/categories/events.jpg',
    description: 'Corporate and private event coverage',
    imageCount: 15,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
];

let mockGalleryImages: GalleryImage[] = [
  { id: '1', categoryId: '1', url: '/images/gallery/wedding-1.jpg', order: 1, createdAt: new Date() },
  { id: '2', categoryId: '1', url: '/images/gallery/wedding-2.jpg', order: 2, createdAt: new Date() },
  { id: '3', categoryId: '1', url: '/images/gallery/wedding-3.jpg', order: 3, createdAt: new Date() },
  { id: '4', categoryId: '2', url: '/images/gallery/engagement-1.jpg', order: 1, createdAt: new Date() },
  { id: '5', categoryId: '2', url: '/images/gallery/engagement-2.jpg', order: 2, createdAt: new Date() },
];

let mockTestimonials: Testimonial[] = [
  {
    id: '1',
    clientName: 'Sarah & Michael',
    clientImage: '/images/testimonials/client-1.jpg',
    review: 'Ravindu captured our wedding day beautifully. Every photo tells a story and brings back such wonderful memories. Highly recommended!',
    rating: 5,
    eventType: 'Wedding',
    createdAt: new Date('2024-02-01'),
    isActive: true,
  },
  {
    id: '2',
    clientName: 'Emma Johnson',
    clientImage: '/images/testimonials/client-2.jpg',
    review: 'Amazing talent! The engagement photos exceeded our expectations. Ravindu made us feel so comfortable throughout the session.',
    rating: 5,
    eventType: 'Engagement',
    createdAt: new Date('2024-02-15'),
    isActive: true,
  },
  {
    id: '3',
    clientName: 'David Chen',
    clientImage: '/images/testimonials/client-3.jpg',
    review: 'Professional, creative, and incredibly skilled. Our corporate event photos were stunning. Will definitely work with him again.',
    rating: 5,
    eventType: 'Corporate Event',
    createdAt: new Date('2024-03-01'),
    isActive: true,
  },
];

let mockMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'Jessica Williams',
    email: 'jessica@example.com',
    message: 'Hi, I am interested in booking a wedding photography session for next June. Could you please share your packages and availability?',
    createdAt: new Date('2024-03-10'),
    isRead: false,
  },
  {
    id: '2',
    name: 'Robert Brown',
    email: 'robert@example.com',
    message: 'Hello, I would like to schedule a portrait session for my family. We are looking for outdoor photography.',
    createdAt: new Date('2024-03-09'),
    isRead: true,
  },
];

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== CATEGORY SERVICES ====================

export async function getCategories(): Promise<Category[]> {
  await delay();
  return [...mockCategories];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await delay();
  return mockCategories.find(c => c.slug === slug) || null;
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  await delay();
  const newCategory: Category = {
    ...category,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockCategories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  await delay();
  const index = mockCategories.findIndex(c => c.id === id);
  if (index === -1) throw new Error('Category not found');
  mockCategories[index] = { ...mockCategories[index], ...updates, updatedAt: new Date() };
  return mockCategories[index];
}

export async function deleteCategory(id: string): Promise<void> {
  await delay();
  mockCategories = mockCategories.filter(c => c.id !== id);
  mockGalleryImages = mockGalleryImages.filter(img => img.categoryId !== id);
}

// ==================== GALLERY SERVICES ====================

export async function getGalleryImages(categoryId?: string): Promise<GalleryImage[]> {
  await delay();
  if (categoryId) {
    return mockGalleryImages.filter(img => img.categoryId === categoryId);
  }
  return [...mockGalleryImages];
}

export async function uploadImage(file: File, categoryId: string): Promise<GalleryImage> {
  await delay(1500); // Simulate upload time
  
  // In real implementation, upload file to storage and get URL
  // For mock, create object URL
  const url = URL.createObjectURL(file);
  
  const newImage: GalleryImage = {
    id: Math.random().toString(36).substr(2, 9),
    categoryId,
    url,
    title: file.name,
    order: mockGalleryImages.filter(img => img.categoryId === categoryId).length + 1,
    createdAt: new Date(),
  };
  mockGalleryImages.push(newImage);
  
  // Update category image count
  const category = mockCategories.find(c => c.id === categoryId);
  if (category) {
    category.imageCount = (category.imageCount || 0) + 1;
  }
  
  return newImage;
}

export async function uploadMultipleImages(files: File[], categoryId: string): Promise<GalleryImage[]> {
  const uploadedImages: GalleryImage[] = [];
  for (const file of files) {
    const image = await uploadImage(file, categoryId);
    uploadedImages.push(image);
  }
  return uploadedImages;
}

export async function deleteImage(imageId: string): Promise<void> {
  await delay();
  const image = mockGalleryImages.find(img => img.id === imageId);
  if (image) {
    mockGalleryImages = mockGalleryImages.filter(img => img.id !== imageId);
    
    // Update category image count
    const category = mockCategories.find(c => c.id === image.categoryId);
    if (category && category.imageCount > 0) {
      category.imageCount--;
    }
  }
}

export async function reorderImages(_categoryId: string, imageIds: string[]): Promise<void> {
  await delay();
  imageIds.forEach((id, index) => {
    const image = mockGalleryImages.find(img => img.id === id);
    if (image) {
      image.order = index + 1;
    }
  });
}

// ==================== TESTIMONIAL SERVICES ====================

export async function getTestimonials(): Promise<Testimonial[]> {
  await delay();
  return mockTestimonials.filter(t => t.isActive);
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  await delay();
  return [...mockTestimonials];
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt'>): Promise<Testimonial> {
  await delay();
  const newTestimonial: Testimonial = {
    ...testimonial,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  };
  mockTestimonials.push(newTestimonial);
  return newTestimonial;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  await delay();
  const index = mockTestimonials.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Testimonial not found');
  mockTestimonials[index] = { ...mockTestimonials[index], ...updates };
  return mockTestimonials[index];
}

export async function deleteTestimonial(id: string): Promise<void> {
  await delay();
  mockTestimonials = mockTestimonials.filter(t => t.id !== id);
}

// ==================== CONTACT MESSAGE SERVICES ====================

export async function getMessages(): Promise<ContactMessage[]> {
  await delay();
  return [...mockMessages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function sendMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<ContactMessage> {
  await delay();
  const newMessage: ContactMessage = {
    ...message,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    isRead: false,
  };
  mockMessages.push(newMessage);
  return newMessage;
}

export async function markMessageAsRead(id: string): Promise<void> {
  await delay();
  const message = mockMessages.find(m => m.id === id);
  if (message) {
    message.isRead = true;
  }
}

export async function deleteMessage(id: string): Promise<void> {
  await delay();
  mockMessages = mockMessages.filter(m => m.id !== id);
}

// ==================== FILE UPLOAD HELPERS ====================

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit.' };
  }
  
  return { valid: true };
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
