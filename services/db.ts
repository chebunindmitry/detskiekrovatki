
import { Product, Category, Sticker } from '../types';

interface Database {
    products: Product[];
    categories: Category[];
    settings?: any;
    stickers?: Sticker[];
    stats?: any;
}

export const loadDatabase = async (): Promise<Database | null> => {
    try {
        // Add timestamp to bypass browser cache
        const response = await fetch('/db.json?t=' + new Date().getTime());
        
        if (!response.ok) {
            // File not found or server error, fallback to local storage/defaults
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Error loading remote database:", e);
        return null;
    }
};
