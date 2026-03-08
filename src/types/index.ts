// Types for Ravindu Egodawatte Photography Portfolio

export interface Category {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  heroImage?: string;
  description?: string;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImage {
  id: string;
  categoryId: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  order: number;
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientImage: string;
  review: string;
  rating: number;
  eventType?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  isReplied: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
