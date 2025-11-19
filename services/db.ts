
import { Product, Category, Sticker } from '../types';

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  settings: any;
  stickers: Sticker[];
  stats: any;
}

export const loadDatabase = async (): Promise<DatabaseSchema | null> => {
  try {
    // Attempt to fetch the db.json file from the root of the server
    // Add a timestamp to prevent browser caching
    const response = await fetch(`/db.json?t=${Date.now()}`);
    
    if (!response.ok) {
      console.warn("db.json not found or not accessible. Using local defaults.");
      return null;
    }

    const data = await response.json();
    return data as DatabaseSchema;
  } catch (error) {
    console.error("Error loading external database:", error);
    return null;
  }
};
