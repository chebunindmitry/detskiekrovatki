
import { Product, Category, Sticker } from '../types';

export interface Database {
    products: Product[];
    categories: Category[];
    settings?: any;
    stickers?: Sticker[];
    stats?: any;
    _generatedAt?: number; // Timestamp verification
}

export const loadDatabase = async (): Promise<Database | null> => {
    try {
        // Generate a unique timestamp to bust cache
        const timestamp = new Date().getTime();
        
        // Removed custom headers to ensure compatibility with static hosts (GitHub Pages)
        // The query parameter ?v=timestamp is sufficient for cache busting
        const response = await fetch(`db.json?v=${timestamp}`);
        
        if (!response.ok) {
            console.warn(`DB Fetch failed: ${response.status} ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.warn("Could not load remote database (db.json). Using local/demo data.", e);
        return null;
    }
};
