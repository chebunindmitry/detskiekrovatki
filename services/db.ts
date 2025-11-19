
import { Product, Category, Sticker } from '../types';

export interface Database {
    products: Product[];
    categories: Category[];
    settings?: any;
    stickers?: Sticker[];
    stats?: any;
}

export const loadDatabase = async (): Promise<Database | null> => {
    try {
        // Add timestamp to bypass browser cache explicitly
        const response = await fetch('/db.json?t=' + new Date().getTime(), {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            // File not found or server error
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.warn("Could not load remote database (db.json). Using local storage.", e);
        return null;
    }
};
