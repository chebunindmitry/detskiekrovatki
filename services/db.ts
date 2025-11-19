
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
        
        // Use relative path './db.json' to support GitHub Pages subdirectories
        // Added 'cache: no-store' and explicit headers to force network request
        const response = await fetch(`./db.json?ver=${timestamp}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        if (!response.ok) {
            console.warn(`DB Fetch failed: ${response.status} ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.warn("Could not load remote database (db.json). Using local storage.", e);
        return null;
    }
};
