
export interface Category {
  id: number;
  name: string;
  parentId?: number | null; // For nested structure
  image?: string; // Optional category image
  showImage?: boolean; // Toggle visibility in catalog
  sortOrder?: number; // Order for display
  status?: boolean; // Enabled/Disabled
}

export interface ProductVariant {
  productId: number;
  values: string[]; // Array of values matching the labels order. e.g. ["Red", "XL"]
}

export interface Sticker {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  specialPrice?: number; // OpenCart 'special'
  image: string; // Main image (OpenCart 'image')
  images: string[]; // Gallery (OpenCart 'oc_product_image')
  sku: string;
  stock: number; // OpenCart 'quantity'
  status: boolean; // OpenCart 'status' (1 enabled, 0 disabled)
  description?: string; 
  attributes?: { name: string; text: string }[]; // OpenCart 'oc_product_attribute'
  options?: { name: string; values: string[] }[]; // Legacy string-only options
  
  // New Variant System (Multi-dimensional)
  variantLabels?: string[]; // e.g. ["Цвет", "Размер"]
  variantValues?: string[]; // The values for THIS product. e.g. ["Белый", "120x60"]
  variants?: ProductVariant[]; // List of related products including self
  
  // Stickers
  stickerIds?: string[];

  // Bundles (Sets)
  isBundle?: boolean;
  bundleItems?: number[]; // Array of Product IDs included in this bundle
}

export enum Screen {
  START = 'START',
  CATALOG = 'CATALOG',
  PRODUCT_DETAILS = 'PRODUCT_DETAILS',
  CONSULTATION = 'CONSULTATION',
  CONFIRMATION = 'CONFIRMATION',
  FAVORITES = 'FAVORITES',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export type Tab = Screen.CATALOG | Screen.CONSULTATION | Screen.FAVORITES;

export enum MessageSender {
  USER = 'USER',
  BOT = 'BOT'
}
